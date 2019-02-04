art = dir('Art Capture');
art_n = length(art);
for i = 1:art_n
    if ~startsWith(art(i).name, '.')
        fighter = dir([art(i).folder, '/', art(i).name]);
        fighter_n = length(fighter);
        for j = 1:fighter_n
            if ~fighter(j).isdir && length(regexp(fighter(j).name, '_(Card|PortraitMarquee)_')) < 1 && endsWith(fighter(j).name, '_B.png')
                im = imread([fighter(j).folder, '/', fighter(j).name]);
                imshow(im);
                pause(0.01);
            end
        end
    end
end
