local json = require("json")
local fs = require("fs")

local f = fs.readFileSync("DATA.json")
-- p(f)

local t = json.decode(f)
-- p(t)

local fields = {}

local function getFirstIndex(t)
    for i, _ in pairs(t) do
        return i
    end

    return nil
end

for _, exploit in pairs(t) do
    for fieldName, _ in pairs(exploit[getFirstIndex(exploit)]) do
        fields[fieldName] = (fields[fieldName] or 0) + 1
    end
end

p(fields)
