local json = require("json")
local fs = require("fs")

local url = require("url")
local querystring = require("querystring")

local f = fs.readFileSync("2-cleaned.json")
-- p(f)

local t = json.decode(f)

local function jencsave(filename, t)
    return fs.writeFileSync(filename, json.encode(t, nil, 4))
end

local function trim(s)
    return (s:gsub("^%s+", ""):gsub("%s+$", ""))
end
local function fixMarkdown(md)
    return (md:gsub("%[(.-)%]%((.-)%)", function(label, url)
        local u = trim(url)

        -- Treat empty, "/" or " / " etc treated as empty and normalised to regular bold
        if u == "" or u == "/" then
            return "**" .. label .. "**"
        end

        -- everything else is accepted and valid markdown
        return "[" .. label .. "](" .. url .. ")"
    end)) -- original markdown was using empty links to change the colour of some words, when they should be bold instead and we can change highlighting with styles on teh site
end

local function count(t)
    local c = 0
    for _ in pairs(t) do
        c = c + 1
    end

    return c
end

for i, v in pairs(t) do
    local base = "./data/roblox/" .. v.name .. "/"
    fs.mkdirpSync(base)

    local info = {
        type = v.type,

        platforms = v.platforms,

        website = v.website,

        sunc = v.sunc,

        tags = v.tags,
        badges = v.badges,

        hidden = v.visibility.hidden,
    }

    local modals = v.modals
    local misc = v.misc_data
    local description_md = (v.description_md and fixMarkdown(v.description_md)) or nil
    --p(description_md)

    jencsave(base .. "info.json", info)
    if count(modals) >= 1 then
        jencsave(base .. "modals.json", modals)
    end

    local anyFeatures = #misc.pros + #misc.cons + #misc.neutrals
    if anyFeatures >= 1 then
        jencsave(base .. "_misc.temp.json", misc)
    end

    if description_md then
        fs.writeFileSync(base .. "description.md", description_md)
    else
        fs.unlinkSync(base .. "description.md")
    end
end
