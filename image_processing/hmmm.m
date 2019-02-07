clear;
mapp;

resetdir('../image/portrait');

fighters = dir('Art Capture');
for i = 1:length(fighters)
    isFolder = fighters(i).isdir;
    isNested = ~startsWith(fighters(i).name, '.');
    if isFolder && isNested
        fID = fIDs(fighters(i).name);
        resetdir(['../image/portrait/', fID]);
        
        variants = dir([fighters(i).folder, '/', fighters(i).name]);
        for j = 1:length(variants)
            isPng = endsWith(variants(j).name, '.png');
            isBasicPortrait = contains(variants(j).name, '_PortraitMarquee_');
            if isPng && isBasicPortrait
                vString = [fighters(i).name, '_(.+)_PortraitMarquee_'];
                vTokens = regexp(variants(j).name, vString, 'tokens');
                vID = vIDs(vTokens{1}{1});
                
                im = imread([variants(j).folder, '/', variants(j).name]);
                [~, ~, colorMask] = imread(['color_mask/', fighters(i).name, '.png']);
                [~, ~, shadowMask] = imread(['shadow_mask/', fighters(i).name, '.png']);
                
                imColor = imresize(im .* (colorMask / 256), 0.3);
                imShadow = imresize(shadowMask, 0.3);
                imwrite(imColor, ['../image/portrait/', fID, '/', vID, '.png'], 'Alpha', imShadow);
            end
        end
    end
end

function resetdir(dirname)
    if exist(dirname, 'dir')
        rmdir(dirname, 's');
    end
    mkdir(dirname);
end
