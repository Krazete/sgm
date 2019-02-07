function resetdir(dirname)
    if exist(dirname, 'dir')
        rmdir(dirname, 's');
    end
    mkdir(dirname);
end
