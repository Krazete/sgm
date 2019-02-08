% Creates raw mask files.
% The resulting raw_mask folder should be copied as shadow_mask.
% All shadow_mask images should be cropped with the help of circle.png.
% The shadow_mask folder should then be copied as color_mask.
% All color_mask images should have the outermost black edges trimmed down.

clear;

resetdir('raw_mask');

fighters = dir('Art Capture');
for i = 1:length(fighters)
    clear('maxdelta');
    isFolder = fighters(i).isdir;
    isNested = ~startsWith(fighters(i).name, '.');
    if isFolder && isNested
        holder = {};
        variants = dir([fighters(i).folder, '/', fighters(i).name]);
        for j = 1:length(variants)
            isPng = endsWith(variants(j).name, '.png');
            isBasicPortrait = contains(variants(j).name, '_PortraitMarquee_');
            if isPng && isBasicPortrait
                imName = [variants(j).folder, '/', variants(j).name];
                [im, ~, alpha] = imread(imName);
                holder{length(holder) + 1} = im;
                imshow(im);
                pause(0);
            end
        end
        pairs = nchoosek(holder, 2);
        for m = 1:length(pairs)
            im1 = pairs{m, 1};
            im2 = pairs{m, 2};
            deltaR = abs(im2(:, :, 1) - im1(:, :, 1));
            deltaG = abs(im2(:, :, 2) - im1(:, :, 2));
            deltaB = abs(im2(:, :, 3) - im1(:, :, 3));
            delta = deltaR + deltaG + deltaB;
            if exist('maxdelta', 'var')
                maxdelta = max(maxdelta, delta);
            else
                maxdelta = delta;
            end
            imshow(maxdelta);
            pause(0);
        end
        imPath = ['raw_mask/', fighters(i).name, '.png'];
        imwrite(maxdelta, imPath, 'Alpha', alpha);
    end
end
