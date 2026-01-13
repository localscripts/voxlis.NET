local YELLOW = "\27[33m"
local RED = "\27[31m"
local RESET = "\27[0m"
local function warn(fmt, ...)
    local msg = string.format(fmt, ...)
    print(string.format("[%sLUA WARNING%s] %s", YELLOW, RESET, msg))
end

local __error = error
error = function(fmt, ...)
    local msg = string.format(fmt, ...)
    print(string.format("%sLUA ERROR: %s%s", RED, msg, RESET))
    __error(msg)
end

local tinsert = table.insert

local function ptebel(t)
    local data = {}

    for name, val in pairs(t) do
        tinsert(data, string.format("\t%s = %s", name, val))
    end

    print(string.format("{\n%s\n}", table.concat(data, "\n")))
end

-- ischema is an abbreviation for info schema
-- local ischema = fs.read("project:data/schemas/roblox/info.schema.json")
-- ischema = json.decode(ischema)

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

local info_schema, err = fs.read("project:data/schemas/roblox/info.schema.json")
if not info_schema then
    print("failed to read information schema")
    error(err)
end

info_schema, err = json.decode(info_schema)
if not info_schema then
    print("failed to parse information schema")
    error(err)
end

local prices_schema, err = fs.read("project:data/schemas/roblox/prices.schema.json")
if not prices_schema then
    print("failed to read market prices schema")
    error(err)
end

prices_schema, err = json.decode(prices_schema)
if not prices_schema then
    print("failed to parse market prices schema")
    error(err)
end

--------------------------------------------------
--------------------------------------------------
--------------------------------------------------

local _exploitIds = {}
local constructed = {}

local root = "project:data/roblox/"
for _, exploitDir in pairs(fs.scandir(root)) do
    if not exploitDir.isDir then goto continue end

    local exploitName = exploitDir.name

    local dir = root .. exploitName .. "/"

    local content, err = fs.read(dir .. "info.json")
    if not content then
        error("failed to read information for %s: %s", exploitName, err)
    end

    content, err = json.decode(content)
    if not content then
        error("failed to parse information for %s: %s", exploitName, err)
    end

    -- print(decoded.website)

    local valid, err = validate(content, info_schema)
    if not valid then
        error("exploit information for %s is invalid (doesnt conform to schema): %s", exploitName, err)
    end

    content.name = exploitName
    local id = exploitName:gsub(" ", ""):lower()
    content.id = id

    _exploitIds[id] = content.platforms

    --------------------------------------------------
    --------------------------------------------------
    --------------------------------------------------

    local modals, err = fs.read(dir .. "modals.json")
    if not modals then
        warn("modals.json does not exist for %s; ignoring because it is optional", exploitName)
    else
        modals, err = json.decode(modals)
        if not modals then
            error("failed to parse modals for %s: %s", exploitName, err)
        end

        content.modals = modals
    end

    local review, err = fs.read(dir .. "review.md")
    if not review then
        error("failed to read review for %s: %s", exploitName, err)
    end

    content.review = review

    tinsert(constructed, content)

    ::continue::
end

-- ptebel(constructed)

print(fmt("validated information for %d exploits", #constructed))

print("will check market data against the schema now...")

local prices, err = fs.read("project:data/roblox/prices.json")
if not prices then
    error("failed to read prices: %s", err)
end

prices, err = json.decode(prices)
if not prices then
    error("failed to parse prices: %s", err)
end

local validPrices, err = validate(prices, prices_schema)
if not validPrices then
    error("market prices file does not conform to the schema: %s", err)
end

local _seenPrices = {}
for i, v in pairs(prices) do
    _seenPrices[i] = true
end

for id, expectedPlatforms in pairs(_exploitIds) do
    if not _seenPrices[id] then
        error("pricing data for '%s' does not exist", id)
    else
        for _, platform in pairs(expectedPlatforms) do
            if not prices[id].platforms[platform] then
                error("expected platform '%s' to be present in pricing data for '%s' but it doesnt exist", platform, id)
            end
        end
    end
end



--------------------------------------------------
--------------------------------------------------
--------------------------------------------------

local merged = {}

for _, exploit in ipairs(constructed) do
    local id = exploit.id
    local priceblock = prices[id]

    if not priceblock then
        -- this error should NEVER happen, because we already validated everything above
        -- but JUST in case, its a good idea to just stop processing and avoid wasting time
        error("internal error (bit flipping??): market prices missing for %s", id)
    end


    exploit.pricing = priceblock

    tinsert(merged, exploit)
end

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
