local function escape_html(s)
    return (s:gsub("&", "&amp;")
        :gsub("<", "&lt;")
        :gsub(">", "&gt;")
        :gsub('"', "&quot;")
        :gsub("'", "&#39;"))
end

local function trim(s)
    return (s:gsub("^%s+", ""):gsub("%s+$", ""))
end

local function split_lines(input)
    local lines = {}
    input = input:gsub("\r\n", "\n"):gsub("\r", "\n")
    for line in (input .. "\n"):gmatch("(.-)\n") do
        table.insert(lines, line)
    end
    return lines
end

local function parse_link_target(target)
    -- accepts: url OR url "title" OR url 'title' OR url (title in parentheses isn't handled)
    target = trim(target)
    local url, title

    -- url "title"
    url, title = target:match('^(%S+)%s+"(.-)"%s*$')
    if url then return url, title end

    -- url 'title'
    url, title = target:match("^(%S+)%s+'(.-)'%s*$")
    if url then return url, title end

    -- bare url
    url = target:match("^(%S+)%s*$")
    return url, nil
end

local function render_inlines(text)
    -- we escape first, then selectively "unescape" via our own tags by working on the escaped string.
    -- this prevents raw HTML injection through the markdown input.
    local s = escape_html(text)

    -- inline code: `code`
    -- do this early so formatting inside code doesn't get parsed
    s = s:gsub("`([^`\n]-)`", function(code)
        return "<code>" .. code .. "</code>"
    end)

    -- images: ![alt](url "title")
    s = s:gsub("!%[([^%]]-)%]%(([^%)]+)%)", function(alt, target)
        local url, title = parse_link_target(target)
        if not url then return "!" .. escape_html(alt) end
        local attrs = ' src="' .. escape_html(url) .. '" alt="' .. escape_html(alt) .. '"'
        if title and title ~= "" then
            attrs = attrs .. ' title="' .. escape_html(title) .. '"'
        end
        return "<img" .. attrs .. " />"
    end)

    -- links: [text](url "title")
    s = s:gsub("%[([^%]]-)%]%(([^%)]+)%)", function(label, target)
        local url, title = parse_link_target(target)
        if not url then return "[" .. label .. "]" end
        local attrs = ' href="' .. escape_html(url) .. '"'
        if title and title ~= "" then
            attrs = attrs .. ' title="' .. escape_html(title) .. '"'
        end
        return "<a" .. attrs .. ">" .. label .. "</a>"
    end)

    -- bold and italic: ***text*** or ___text___
    s = s:gsub("%*%*%*([^%*\n]-)%*%*%*", "<strong><em>%1</em></strong>")
    s = s:gsub("___([^_\n]-)___", "<strong><em>%1</em></strong>")

    -- bold: **text** or __text__
    s = s:gsub("%*%*([^%*\n]-)%*%*", "<strong>%1</strong>")
    s = s:gsub("__([^_\n]-)__", "<strong>%1</strong>")

    -- italic: *text* or _text_
    -- (avoid matching inside words too aggressively; still heuristic)
    s = s:gsub("%f[%*]%*([^%*\n]-)%*%f[^%*]", "<em>%1</em>")
    s = s:gsub("%f[_]_([^_\n]-)_%f[^_]", "<em>%1</em>")

    return s
end

local function is_hr(line)
    local t = trim(line)
    return t:match("^%-%-%-$") or t:match("^%*%*%*$") or t:match("^___$")
end

local M = {}
function M.compile(markdown)
    local lines = split_lines(markdown)

    local out = {}
    local i = 1

    local in_code = false
    local code_lang = nil
    local code_buf = {}

    local function flush_paragraph(parabuf)
        if #parabuf == 0 then return end
        local text = table.concat(parabuf, "\n")
        text = render_inlines(text)
        table.insert(out, "<p>" .. text .. "</p>")
        for j = #parabuf, 1, -1 do parabuf[j] = nil end
    end

    local function flush_codeblock()
        local code = table.concat(code_buf, "\n")
        code = escape_html(code)
        local class_attr = ""
        if code_lang and code_lang ~= "" then
            class_attr = ' class="language-' .. escape_html(code_lang) .. '"'
        end
        table.insert(out, "<pre><code" .. class_attr .. ">" .. code .. "</code></pre>")
        code_buf = {}
        code_lang = nil
    end

    local parabuf = {}

    local function close_open_lists(list_stack)
        while #list_stack > 0 do
            table.insert(out, "</li></" .. table.remove(list_stack) .. ">")
        end
    end

    local list_stack = {} -- contains "ul" or "ol" for currently open list nesting (simple, non-nested items)
    local function end_list_if_open()
        if #list_stack > 0 then
            close_open_lists(list_stack)
        end
    end

    while i <= #lines do
        local line = lines[i]

        -- fenced code blocks
        local fence, lang = line:match("^%s*```%s*([%w%-_]*)%s*$")
        if fence ~= nil then
            -- todo
        end
        local fence_lang = line:match("^%s*```%s*([%w%-_]*)%s*$")
        if fence_lang ~= nil then
            if not in_code then
                -- entering code
                flush_paragraph(parabuf)
                end_list_if_open()
                in_code = true
                code_lang = fence_lang
            else
                -- leaving code
                in_code = false
                flush_codeblock()
            end
            i = i + 1
            goto continue
        end

        if in_code then
            table.insert(code_buf, line)
            i = i + 1
            goto continue
        end

        -- blank line ends paragraph / list item continuation
        if trim(line) == "" then
            flush_paragraph(parabuf)
            end_list_if_open()
            i = i + 1
            goto continue
        end

        -- horizontal rule
        if is_hr(line) then
            flush_paragraph(parabuf)
            end_list_if_open()
            table.insert(out, "<hr />")
            i = i + 1
            goto continue
        end

        -- headings
        local hashes, heading_text = line:match("^(#+)%s+(.*)$")
        if hashes then
            flush_paragraph(parabuf)
            end_list_if_open()
            local level = #hashes
            if level > 6 then level = 6 end
            table.insert(out, ("<h%d>%s</h%d>"):format(level, render_inlines(heading_text), level))
            i = i + 1
            goto continue
        end

        -- block quote (single-line; consecutive lines are grouped)
        local bq = line:match("^%s*>%s?(.*)$")
        if bq then
            flush_paragraph(parabuf)
            end_list_if_open()
            local buf = { bq }
            i = i + 1
            while i <= #lines do
                local more = lines[i]:match("^%s*>%s?(.*)$")
                if not more then break end
                table.insert(buf, more)
                i = i + 1
            end
            local inner = render_inlines(table.concat(buf, "\n"))
            table.insert(out, "<blockquote><p>" .. inner .. "</p></blockquote>")
            goto continue
        end

        -- lists, simple with no nesting detection
        local ul_item = line:match("^%s*[%-%+%*]%s+(.*)$")
        local ol_item = line:match("^%s*%d+%.%s+(.*)$")
        if ul_item or ol_item then
            flush_paragraph(parabuf)
            local list_type = ul_item and "ul" or "ol"
            local item_text = ul_item or ol_item

            if #list_stack == 0 then
                table.insert(out, "<" .. list_type .. "><li>")
                table.insert(list_stack, list_type)
            elseif list_stack[#list_stack] ~= list_type then
                -- close previous list, open new type
                close_open_lists(list_stack)
                table.insert(out, "<" .. list_type .. "><li>")
                table.insert(list_stack, list_type)
            else
                -- same list continues
                table.insert(out, "</li><li>")
            end

            table.insert(out, render_inlines(item_text))
            i = i + 1
            goto continue
        else
            -- if we were in a list and hit a non-list line, close it
            end_list_if_open()
        end

        -- default: paragraph line (join consecutive lines)
        table.insert(parabuf, line)
        i = i + 1

        ::continue::
    end

    if in_code then
        -- unclosed fence: still flush
        in_code = false
        flush_codeblock()
    end

    flush_paragraph(parabuf)
    end_list_if_open()

    return table.concat(out, "\n")
end

--------------------------------------------------
--------------------------------------------------
--------------------------------------------------
--------------------------------------------------
--------------------------------------------------
--------------------------------------------------
--------------------------------------------------
--------------------------------------------------
--------------------------------------------------
--------------------------------------------------
--------------------------------------------------
--------------------------------------------------
--------------------------------------------------
--------------------------------------------------
--------------------------------------------------
--------------------------------------------------
--------------------------------------------------
--------------------------------------------------
--------------------------------------------------
--------------------------------------------------
--------------------------------------------------
--------------------------------------------------
--------------------------------------------------
--------------------------------------------------
--------------------------------------------------

local RED = "\27[31m"
local RESET = "\27[0m"
local __error = error
error = function(fmt, ...)
    local msg = string.format(fmt, ...)
    print(string.format("%sLUA ERROR: %s%s", RED, msg, RESET))
    __error(msg)
end

local root = "project:../data/roblox/"
for _, exploitDir in pairs(fs.scandir(root)) do
    if not exploitDir.isDir then goto continue end

    local id = exploitDir.name:gsub(" ", ""):lower()

    local dir = root .. exploitDir.name .. "/"

    local review, err = fs.read(dir .. "review.md")
    if not review then
        error("failed to read review for %s: %s. Ensure that the review exists, as it is required!", id, err)
    end

    local processed = M.compile(review)

    local success, err = fs.write("temp:roblox_reviews_md/" .. id .. "._html", processed)
    if not success then
        error("failed to write processed markdown for %s: %s", id, err)
    end

    ::continue::
end
