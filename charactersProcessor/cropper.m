% requires a 'characters' directory
% with subdirectories for each character
% with images for each character variant

% copy raw directory
if exist('crop', 'dir')
    rmdir('crop', 's');
end
copyfile('raw', 'crop');

% make mask directories
if exist('shadowRaw', 'dir')
    rmdir('shadowRaw', 's');
end
mkdir('shadowRaw');
if exist('maskRaw', 'dir')
    rmdir('maskRaw', 's');
end
mkdir('maskRaw');

% for each character folder
cd('crop');
characters = dir();
N = length(characters);
for n = 1:N
    character = characters(n);
    if character.isdir && character.name(1) ~= '.'
        % clean slate
        variantNames = cell(0);
        clear('backgrounds');
        clear('deltas');
        
        % for each variant image
        cd(character.name);
        variants = dir();
        M = length(variants);
        for m = 1:M
            variant = variants(m);
            if contains(variant.name, '.png')
                % crop image
                im = imread(variant.name);
                crop = im(1:195, 483:654, :);
                % overwrite image
                imwrite(crop, variant.name);
                
                % keep track of valid variant names
                variantNames(length(variantNames) + 1) = {variant.name};
                % make mask for all background color
                tol = 20;
                backgroundR = crop(:, :, 1) >= 24 - tol & crop(:, :, 1) <= 24;
                backgroundG = crop(:, :, 2) >= 42 - tol & crop(:, :, 2) <= 42;
                backgroundB = crop(:, :, 3) >= 67 - tol & crop(:, :, 3) <= 67;
                background = 1 - uint8(backgroundR & backgroundG & backgroundB);
                % add mask to collection
                if exist('backgrounds', 'var')
                    backgrounds = backgrounds + background;
                else
                    backgrounds = background;
                end
            end
        end
        
        % for each pair of variants
        combos = nchoosek(variantNames, 2);
        M = length(combos);
        for m = 1:M
            variantName1 = char(combos(m, 1));
            variantName2 = char(combos(m, 2));
            im1 = imread(variantName1);
            im2 = imread(variantName2);
            % add differences
            deltaR = abs(im2(:, :, 1) - im1(:, :, 1));
            deltaG = abs(im2(:, :, 2) - im1(:, :, 2));
            deltaB = abs(im2(:, :, 3) - im1(:, :, 3));
            delta = (deltaR + deltaG + deltaB) / 3;
            if exist('deltas', 'var')
                maxdelta = max(maxdelta, delta);
                deltas = deltas + delta;
            else
                maxdelta = delta;
                deltas = delta;
            end
        end
%         deltas = max(deltas, maxdelta);
        maskShadowRaw = 255 * backgrounds - deltas;
        imwrite(maskShadowRaw, ['../../shadowRaw/', character.name, '.png']);
        maskColorRaw = maxdelta .^ 2;
        imwrite(maskColorRaw, ['../../maskRaw/', character.name, '.png']);
        cd('..');
    end
end
cd('..');
