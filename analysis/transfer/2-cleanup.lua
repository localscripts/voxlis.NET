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
-- local global_pricing = {}

local null = json.null

local tinsert = table.insert
for _, e in pairs(t) do
    local new = {}

    local name = e.main.name
    new.id = string.lower(name)
    new.name = name

    new.website = e.links.href

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
    new.platforms = platforms

    if uncLinkCount ~= #platforms then
        warn("%-10s | %5d platforms | %5d sUNC links | %4d", name, #platforms, uncLinkCount,
            math.abs(#platforms - uncLinkCount))
    end


    local tags = {}
    if e.flags.hasKeySystem then
        tinsert(tags, "key-system")
    end
    new.tags = tags

    local badges = {}
    if e.flags.verified then
        tinsert(badges, "verified")
    end
    if e.flags.premium then
        tinsert(badges, "premium")
    end
    new.badges = badges

    new.type = e.flags.external and "external" or "internal"

    new.visibility = {
        hidden = e.flags.hide
    }

    -- THESE ARE ENTIRELYT SEPARATE FILES
    -- theyre only aggregated into the cleaned up file for later processing
    new.description_md = e.modals.info or null
    local modals = {}
    if e.modals.warning then
        local w = e.modals.warning
        w.icon = nil
        w.continue = nil
        modals.warning = w
    else
        modals.warning = null
    end
    new.modals = modals

    new.misc_data = {
        pros = e.main.pros,
        cons = e.main.cons,
        neutrals = e.main.neutral
    }

    table.insert(constructed, new)
end

-- p(constructed)

fs.writeFileSync("2-cleaned.json", json.encode(constructed, { indent = true }))
-- fs.writeFileSync("2-globalpricing.json", json.encode(global_pricing, { indent = true }))
