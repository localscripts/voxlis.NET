local function ptebel(t)
    local data = {}

    for name, val in pairs(t) do
        table.insert(data, string.format("\t%s = %s", name, val))
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

local function checkEnum(v, enum)
    for _, e in ipairs(enum) do
        if v == e then return true end
    end
    return false
end

local function isValidURI(s)
    -- simple but sufficient for schema usage
    return type(s) == "string" and s:match("^https?://[%w%-%._~:/%?#%[%]@!$&'()%*+,;=]+$")
end

local validateValue, validate
validateValue = function(v, schema, path)
    local t = schema.type

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
    elseif t == "string" then
        if type(v) ~= "string" then
            return false, fmt("%s must be a string", path)
        end

        if schema.minLength and #v < schema.minLength then
            return false, fmt("%s must be at least %d characters", path, schema.minLength)
        end

        if schema.pattern and not v:match(schema.pattern) then
            return false, fmt("%s does not match pattern %s", path, schema.pattern)
        end

        if schema.format == "uri" and not isValidURI(v) then
            return false, fmt("%s must be a valid URI", path)
        end

        if schema.enum and not checkEnum(v, schema.enum) then
            return false, fmt("%s must be one of %s", path, table.concat(schema.enum, ", "))
        end

        return true
    elseif t == "boolean" then
        if type(v) ~= "boolean" then
            return false, fmt("%s must be a boolean", path)
        end
        return true
    end

    return true
end

validate = function(t, schema, path)
    path = path or "root"

    if schema.type == "object" then
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
    error(err)
end

info_schema, err = json.decode(info_schema)
if not info_schema then
    error(err)
end

local root = "project:data/roblox/"
for _, file in pairs(fs.scandir(root)) do
    if not file.isDir then goto continue end

    local contents, err = fs.read(root .. file.name .. "/info.json")
    if not contents then
        error(err)
    end

    local decoded, err = json.decode(contents)
    if not decoded then
        error(err)
    end

    local valid, err = validate(decoded, info_schema)
    if not valid then
        error(err)
    end

    ::continue::
end

print("all exploit information is valid according to the information schema!")

print("will check market data schema now...")

local prices, err = fs.read("project:data/roblox/prices.json")
