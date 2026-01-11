local json = require("json")
local fs = require("fs")

local warn = require("common").warn

local url = require("url")
local querystring = require("querystring")

local function queryparams(u)
    local parsed = url.parse(u)
    return querystring.parse(parsed.query)
end

local f = fs.readFileSync("1-normalised.json")
-- p(f)

local t = json.decode(f)

local constructed = {}
local global_pricing = {}

for _, e in pairs(t) do
    local new = {}

    local name = e.main.name
    new.id = string.lower(name)
    new.name = name

    new.urls = {
        website = e.links.href,
        purchase = e.links.priceHref
    }

    local sunc = {}
    local platforms = e.main.plat
    local uncLinkCount = 0
    for platform, link in pairs(e.links.unclinks) do
        uncLinkCount = uncLinkCount + 1

        local params = queryparams(link)
        sunc[platform] = {
            scrapId = params.scrap,
            key = params.key
        }
    end
    new.sunc = sunc

    if uncLinkCount ~= #platforms then
        warn("%-10s | %5d platforms | %5d sUNC links | %4d", name, #platforms, uncLinkCount,
            math.abs(#platforms - uncLinkCount))
    end

    table.insert(constructed, new)
end

-- p(constructed)

fs.writeFileSync("2-cleaned.json", json.encode(constructed, { indent = true }))
fs.writeFileSync("2-globalpricing.json", json.encode(global_pricing, { indent = true }))
