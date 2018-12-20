clear;

old_fn = 'what.gif';
new_fn = '../image/loading.gif';

[im, map] = imread(old_fn);
n = size(im, 4);
for i = 1:n
    [im_i, map_i] = imapprox(im(:, :, :, i), map, 2);
    map_i(:) = 1;
    map_i = [1,1,1;0,0,0];
    if i == 1
        imwrite(im_i, map_i, new_fn, 'Transparent', 1, 'DisposalMethod', 'restoreBG', 'DelayTime', 0.1, 'LoopCount', inf);
    else
        imwrite(im_i, map_i, new_fn, 'Transparent', 1, 'DisposalMethod', 'restoreBG', 'DelayTime', 0.1, 'WriteMode', 'append');
    end
end
