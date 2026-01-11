local json = require("json")
local fs = require("fs")

local f = fs.readFileSync("../DATA.json")
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

local new = {}

for _, exploit in pairs(t) do
    local name = getFirstIndex(exploit)

    new[name] = exploit[name]
end

fs.writeFileSync("1-normalised.json", json.encode(new))
