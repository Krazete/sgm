function bool = isNestedFolder(item)
    bool = item.isdir && ~startsWith(item.name, '.');
end
