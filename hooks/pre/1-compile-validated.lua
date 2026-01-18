local YELLOW = "\27[33m"
local RED = "\27[31m"
local RESET = "\27[0m"
local function warn(fmt, ...)
    local msg = string.format(fmt, ...)
    print(string.format("[%s!%s] %s", YELLOW, RESET, msg))
end

local __error = error
error = function(fmt, ...)
    local msg = string.format(fmt, ...)
    print(string.format("%sLUA ERROR: %s%s", RED, msg, RESET))
    __error(msg)
end

local tinsert = table.insert

-- local required = ischema.required
local fmt = string.format

local function isEmptyTable(t)
    return next(t) == nil
end

local function isArray(t)
    local n = 0
    for k in pairs(t) do
        if type(k) ~= "number" then return false end
        if k > n then n = k end
    end
    return true
end

local JSON_NULL = {}

local function checkEnum(v, enum)
    for _, e in ipairs(enum) do
        if e == JSON_NULL then
            if v == JSON_NULL then return true end
        else
            if v == e then return true end
        end
    end
    return false
end

local function isValidURI(s)
    -- simple but sufficient for schema usage
    return type(s) == "string" and s:match("^https?://[%w%-%._~:/%?#%[%]@!$&'()%*+,;=]+$")
end

local function checkType(v, t)
    if t == "null" then return v == JSON_NULL end

    if t == "object" then
        return type(v) == "table" and (isEmptyTable(v) or not isArray(v))
    end

    if t == "array" then
        return type(v) == "table" and (isEmptyTable(v) or isArray(v))
    end

    if t == "number" then return type(v) == "number" end
    if t == "integer" then return type(v) == "number" and v % 1 == 0 end
    if t == "string" then return type(v) == "string" end
    if t == "boolean" then return type(v) == "boolean" end

    return false
end

local function matchesType(v, t)
    if type(t) == "table" then
        for _, sub in ipairs(t) do
            if checkType(v, sub) then return true end
        end
        return false
    else
        return checkType(v, t)
    end
end

local validateValue, validate
validateValue = function(v, schema, path)
    -- const
    if schema.const ~= nil then
        if v ~= schema.const then
            return false, fmt("%s must be %s", path, tostring(schema.const))
        end
    end

    -- allOf
    if schema.allOf then
        for _, sub in ipairs(schema.allOf) do
            local ok, err = validateValue(v, sub, path)
            if not ok then return false, err end
        end
    end

    -- if / then
    if schema["if"] then
        local condOk = validateValue(v, schema["if"], path)
        if condOk == true and schema["then"] then
            local ok2, err = validateValue(v, schema["then"], path)
            if not ok2 then return false, err end
        end
    end

    local t = schema.type
    if t then
        if not matchesType(v, t) then
            return false, fmt("%s has invalid type", path)
        end
    end

    if type(v) == "number" and schema.minimum ~= nil then
        if v < schema.minimum then
            return false, fmt("%s must be >= %s", path, schema.minimum)
        end
    end

    if t == "object" then
        if type(v) ~= "table" then
            return false, fmt("%s must be an object", path)
        end

        -- only reject arrays if non-empty
        if not isEmptyTable(v) and isArray(v) then
            return false, fmt("%s must be an object", path)
        end

        return validate(v, schema, path)
    elseif t == "array" then
        if type(v) ~= "table" then
            return false, fmt("%s must be an array", path)
        end

        -- only reject objects if non-empty
        if not isEmptyTable(v) and not isArray(v) then
            return false, fmt("%s must be an array", path)
        end

        if schema.minItems and #v < schema.minItems then
            return false, fmt("%s must have at least %d items", path, schema.minItems)
        end

        if schema.uniqueItems then
            local seen = {}
            for i, item in ipairs(v) do
                if seen[item] then
                    return false, fmt("%s contains duplicate value %s", path, tostring(item))
                end
                seen[item] = true
            end
        end

        if schema.items then
            for i, item in ipairs(v) do
                local ok, err = validateValue(item, schema.items, path .. "[" .. i .. "]")
                if not ok then return false, err end
            end
        end

        return true
    end

    return true
end

validate = function(t, schema, path)
    path = path or "root"

    if schema.type == "object" or schema.properties or schema.additionalProperties then
        local props = schema.properties or {}
        local required = schema.required or {}
        local additional = schema.additionalProperties

        -- check required
        for _, k in ipairs(required) do
            if t[k] == nil then
                return false, fmt("%s is missing required property '%s'", path, k)
            end
        end

        for k, v in pairs(t) do
            local propSchema = props[k]

            if not propSchema then
                if additional == false then
                    return false, fmt("%s has unexpected property '%s'", path, k)
                elseif type(additional) == "table" then
                    propSchema = additional
                else
                    goto continue
                end
            end

            local ok, err = validateValue(v, propSchema, path .. "." .. k)
            if not ok then return false, err end

            ::continue::
        end

        return true
    end

    return validateValue(t, schema, path)
end

--------------------------------------------------
--------------------------------------------------
--------------------------------------------------

local function loadSchema(name, path)
    local schema, err = fs.read(path)
    if not schema then
        error("failed to read %s schema: %s", name, err)
    end

    schema, err = json.decode(schema)
    if not schema then
        error("failed to parse %s schema: %s", name, err)
    end

    return schema
end

local schemas = {
    info = loadSchema("exploit information", "project:data/schemas/roblox/info.schema.json"),
    prices = loadSchema("market prices", "project:data/schemas/roblox/prices.schema.json"),
    points = loadSchema("summary points", "project:data/schemas/roblox/points.schema.json")
}

-- we will dynamically construct the prices schema based off all exploit info
schemas.prices.required = {}
local baseIndividualPriceSchema = schemas.prices.additionalProperties
schemas.prices.additionalProperties = false
schemas.prices.properties = {}

--------------------------------------------------
--------------------------------------------------
--------------------------------------------------

local function deepCopy(t)
    local out = {}
    for k, v in pairs(t) do
        if type(v) == "table" then
            out[k] = deepCopy(v)
        else
            out[k] = v
        end
    end
    return out
end

local function emptyNil(str)
    if str == "" then
        return nil
    else
        return str
    end
end

--------------------------------------------------
--------------------------------------------------
--------------------------------------------------

local function loadValidate(jsonfile, name, schema)
    local file, err = fs.read(jsonfile)
    if not file then
        return file, fmt("could not read %s: %s", name, err)
    end

    file, err = json.decode(file)
    if not file then
        return file, fmt("could not decode %s: %s", name, err)
    end

    local valid, err = validate(file, schema)
    if not valid then
        return false, fmt("%s does not conform to the schema: %s", name, err)
    end

    return file
end

--------------------------------------------------
--------------------------------------------------
--------------------------------------------------

-- local _exploitIds = {}
local constructed = {}
local hiddenList = {}

local root = "project:data/roblox/"
for _, exploitDir in pairs(fs.scandir(root)) do
    if not exploitDir.isDir then goto continue end

    local exploitName = exploitDir.name

    local dir = root .. exploitName .. "/"

    local content, err = loadValidate(dir .. "info.json", exploitName .. " information", schemas.info)
    if not content then
        error(err)
    end

    if content.keyed == nil then
        content.keyed = true
    end

    content.name = exploitName
    local id = exploitName:gsub(" ", ""):lower()
    content.id = id

    table.sort(content.tags)
    table.sort(content.badges)

    if content.hidden then hiddenList[id] = true end

    tinsert(schemas.prices.required, id)
    local schemaCopy = deepCopy(baseIndividualPriceSchema)
    schemas.prices.properties[id] = schemaCopy

    local platformsSchema = schemaCopy.properties.platforms
    local platformItemSchema = platformsSchema.additionalProperties

    platformsSchema.additionalProperties = false
    platformsSchema.properties = {}
    platformsSchema.required = content.platforms

    for _, p in ipairs(content.platforms) do
        platformsSchema.properties[p] = deepCopy(platformItemSchema)
    end

    -- _exploitIds[id] = content.platforms

    --------------------------------------------------
    --------------------------------------------------
    --------------------------------------------------

    local review, err = fs.read(dir .. "review.md")
    if not review then
        error("failed to read review for %s: %s", exploitName, err)
    end

    content.review = review

    --------------------------------------------------
    --------------------------------------------------
    --------------------------------------------------

    local points, err = loadValidate(dir .. "points.json", "points for " .. exploitName, schemas.points)
    if not points then
        warn("pointsjson does not exist / does not comply for %s; ignoring because it is OPTIONAL: %s", exploitName, err)
    else
        content.summaries = {
            pro = emptyNil(points.pro_summary),
            neutral = emptyNil(points.neutral_summary),
            con = emptyNil(points.con_summary)
        }
    end

    --------------------------------------------------
    --------------------------------------------------
    --------------------------------------------------

    local modals, err = fs.read(dir .. "modals.json")
    if not modals then
        -- warn("modals.json does not exist for %s; ignoring because it is OPTIONAL", exploitName)
    else
        modals, err = json.decode(modals)
        if not modals then
            error("failed to parse modals for %s: %s", exploitName, err)
        end

        content.modals = modals
    end

    tinsert(constructed, content)

    ::continue::
end

-- ptebel(constructed)

print(fmt("validated information for %d exploits", #constructed))

print("will check market data against the schema now...")

local prices, err = loadValidate("project:data/roblox/prices.json", "prices", schemas.prices)
if not prices then
    error(err)
end

--------------------------------------------------
--------------------------------------------------
--------------------------------------------------

local function skuInfo(pricing)
    local hasFree = false
    local hasPaid = false
    local paidCount = 0

    local cheapest = nil

    for _, skus in pairs(pricing.platforms or {}) do
        for _, sku in ipairs(skus) do
            local price = sku.price or 0

            if price == 0 then
                hasFree = true
            else
                hasPaid = true
                paidCount = paidCount + 1

                if not cheapest then
                    cheapest = sku
                else
                    if price < cheapest.price then
                        cheapest = sku
                    elseif price == cheapest.price then
                        local d1 = cheapest.days or math.huge
                        local d2 = sku.days or math.huge

                        -- prefer shorter duration over lifetime
                        if d2 ~= -1 and (d1 == -1 or d2 < d1) then
                            cheapest = sku
                        end
                    end
                end
            end
        end
    end

    pricing.hasFree = hasFree
    pricing.hasPaid = hasPaid
    pricing.paidSkuCount = paidCount

    if cheapest then
        pricing.cheapestPaid = {
            price = cheapest.price,
            currency = cheapest.currency,
            days = cheapest.days
        }
    end

    return pricing
end

local function isKeyEmpire(url)
    if type(url) ~= "string" then
        return false
    end
    local host = url:match("^%a+://([^/%?#]+)") or url:match("^([^/%?#]+)")

    if not host then
        return false
    end

    host = host:lower()

    return host == "key-empire.com" or host == "www.key-empire.com"
end

local merged = {}

for _, exploit in ipairs(constructed) do
    local id = exploit.id
    if hiddenList[id] then goto continue end
    local priceblock = prices[id]

    if not priceblock then
        -- this error should NEVER happen, because we already validated everything above
        -- but JUST in case, its a good idea to just stop processing and avoid wasting time
        error("internal error (bit flipping??): market prices missing for %s", id)
    end

    exploit.pricing = skuInfo(priceblock)
    exploit.pricing.keyempire = isKeyEmpire(priceblock.purchase_url) -- determines whether a button lights up as green etc

    tinsert(merged, exploit)

    ::continue::
end

local function contains(t, x)
    for _, v in pairs(t) do if v == x then return true end end
    return false
end

local function rank(u)
    if contains(u.badges, "premium") then return 1 end
    if contains(u.badges, "verified") then return 2 end
    return 3
end

table.sort(merged, function(a, b)
    local ra, rb = rank(a), rank(b)
    if ra ~= rb then
        return ra < rb
    end
    return a.name:lower() < b.name:lower()
end)

local out = {
    generatedAt = os.time(),
    exploits = merged
}

local encoded, err = json.encode(out)
if not encoded then
    error("failed to encode final data: %s", err)
end

local success, err = fs.write("generated:roblox_generated.json", encoded)
if not success then
    error("failed to write generated data to disk: %s", err)
end
