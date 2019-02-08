% Created move icon files.

clear;
portrait_ids;

bronzes = {'Underdog', 'Bassline', 'Understudy', 'Nunsense', 'In Denile', 'Bad Hair Day', 'Just Kitten', 'Rusty', 'Sheltered', 'Rerun', 'Stage Fright', 'Scrub'};
silvers = {'Hype Man', 'Robocopy', 'Gray Matter', 'Doublicious', 'Scarlet Viper', 'Hair Apparent', 'Feline Lucky', 'Rage Appropriate', 'Ivy League', 'Pea Shooter', 'Nearly Departed', 'Graveyard Shift'};
golds = {'Wulfsbane', 'Epic Sax', 'Harlequin', 'Immoral Fiber', 'Diva Intervention', 'Parasite Weave', 'Claw _ Order', 'Raw Nerv', 'Primed', 'Untouchable', 'Poltergust', 'Silent Kill'};

resetdir('../image/move');

fighters = dir('Art Capture');
for i = 1:length(fighters)
    if isNestedFolder(fighters(i))
        fID = fIDs(fighters(i).name);
        resetdir(['../image/move/', fID]);
        resetdir(['../image/move/', fID, '/b']);
        resetdir(['../image/move/', fID, '/s']);
        resetdir(['../image/move/', fID, '/g']);
        
        variants = dir([fighters(i).folder, '/', fighters(i).name]);
        for j = 1:length(variants)
            if isNestedFolder(variants(j))
                gen_specified_moves(variants(j), bronzes, fID, 'b');
                gen_specified_moves(variants(j), silvers, fID, 's');
                gen_specified_moves(variants(j), golds, fID, 'g');
            end
        end
    end
end

function gen_specified_moves(variantdir, tierselection, fID, letter)
    move_ids;
    for i = 1:length(tierselection)
        if contains(variantdir.name, tierselection{i})
            moves = dir([variantdir.folder, '/', variantdir.name]);
            for j = 1:length(moves)
                if endsWith(moves(j).name, '.png')
                    mIDs = eval([fID, 'IDs']);
                    mID = mIDs(moves(j).name(1:end - 6));

                    [im, ~, alpha] = imread([moves(j).folder, '/', moves(j).name]);
                    imScaled = imresize(im, 0.3);
                    alphaScaled = imresize(alpha, 0.3);
                    
                    imPath = ['../image/move/', fID, '/', letter, '/', mID, '.png'];
                    imwrite(imScaled, imPath, 'Alpha', alphaScaled);
                    
                    imshow(imScaled);
                    pause(0);
                end
            end
        end
    end
end