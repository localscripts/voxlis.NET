local YELLOW = "\27[33m"
local RESET = "\27[0m"
function warn(fmt, ...)
    local msg = string.format(fmt, ...)
    print(string.format("[%sWARN%s] %s", YELLOW, RESET, msg))
end

return { warn = warn }
