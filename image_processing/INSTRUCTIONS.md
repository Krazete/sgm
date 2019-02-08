# How to Generate Portraits

## Get the Art Capture Folder

You'll first need Hidden Variable Studios to share the `Art Capture` folder with you on Google Drive.

## Generate Fighter Variant Portraits

Use MATLAB and an Image Editor

1. Run `gen_masks.m`.
2. Rename the resulting `raw_mask` folder as `shadow_mask`.
3. Manually alter each image into a proper mask for each portrait. Colors do not matter; only the alpha layer will be used in `gen_portraits.m`.
4. Use `circle.png` to neatly trim the outer circle of each mask.
5. Copy the finalized `shadow_mask` folder as `color_mask`.
6. Manually trim the black edges of each portrait. Try not to touch the outer circle edges.
7. Run `gen_portraits.m`.

## Generate Move Icons

1. Run `gen_portraits.m`.
2. That's it.

For both portraits and moves, [pngquant](https://pngquant.org/) should be used to reduce file size.
I recommend using the simple [Pngyu](https://nukesaq88.github.io/Pngyu/) GUI version.

## How the Portrait Scripts Work

### `gen_masks.m`

This script reads all `Art Capture` variant portraits of each fighters.
For each fighters, it takes each pair of variant portraits and checks the differences.
The maximum difference at each pixel among all pairs is stored and saved as a raw mask.

### `gen_portraits.m`

This script uses `color_mask` alpha values to crop each `Art Capture` portrait.
The result is placed on a black background.
Then, the `shadow_mask` alpha values are used to crop this result.
This double-cropping process is used to prevent colors from bleeding in at the outermost edges while also preserving line width.
