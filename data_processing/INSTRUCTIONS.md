# How to Mine the APK

## (For Mac Users) Install Windows
1. Get a [Windows 10 ISO](https://www.microsoft.com/en-us/software-download/windows10ISO).
2. Install [VirtualBox](https://www.virtualbox.org/wiki/Downloads).
3. Create a new Windows 10 Virtual Machine (VM) in VirtualBox.
4. Create a Shared Folder in the Settings window for the new VM.
5. Start the VM and select `Insert Guest Additions CD Image...` under the `Devices` menu in the Mac menu bar.

## (Within Windows) Install APK Mining Tools
1. Download [APKTool](https://ibotpeaches.github.io/Apktool/install/).
2. Download [AssetStudio](https://github.com/Perfare/AssetStudio) and its [Requirements](https://github.com/Perfare/AssetStudio#requirements).
3. Open Notepad and enter `apktool d sgm.apk -f -o sgm_decoded`. Save the file as `decode_sgm.bat`.
4. Download [UnityAssetBundleExtractor](https://github.com/DerPopo/UABE) (UABE).
5. Download [Visual C++ 2010](https://www.microsoft.com/en-us/download/details.aspx?id=14632) (required for UABE).
6. Download [Il2CppDumper](https://github.com/Perfare/Il2CppDumper) (required for UABE).

## Decompile the APK
1. Download the latest [APK](https://apkpure.com/skullgirls/com.autumn.skullgirls).
2. Rename the APK to `sgm.apk` and move it into the folder where `decode_sgm.bat` is located.
3. Run `decode_sgm.bat`.

## Extract the Game's Entire Corpus and Other Files
1. Run AssetStudio and load the folder `sgm_decoded`.
2. For corpus files, select `TextAsset` in the `Filter Type` menu.
3. For image files, select `Sprite` and `Texture2D` in the `Filter Type` menu.
4. Select `Group by type` in the dropdown list under the `Options` menu.
5. Click `Filtered assets` in the `Export` menu. Save to a new folder named `sgm_exports`.

## Extract Scripts
1. Run Il2CppDumper and open `sgm_decoded/lib/x86/libil2cpp.so` and then `sgm_decoded/assets/bin/Data/Managed/Metadata/global-metadata.dat` when prompted. Select mode 4 and note the new `DummyDll` folder, created in the same directory as the Il2CppDumper program.
2. Run UABE and open `sgm_decoded/assets/bin/data/sharedassets0.assets.split0`.
3. Click `Get script information` in the `Tools` menu. Several windows will appear sequentially.
4. Navigate to the `DummyDll` folder and select the file that appears (if no file appears, click Cancel). Repeat. Afterwards, there will be a window detailing errors; click OK.
5. Sort by Type. Select all MonoBehaviour files and click `Export Dump` in the right panel. Choose the `Unity JsonUtility file` format and save to a new folder named `MonoBehaviour` within `sgm_exports`.

## (For Mac Users) Transfer Data from Windows VM to Mac
1. Move `sgm_exports` to the shared folder.
2. Shut down Windows.

## Repeat
1. Repeat the decompiling and extracting steps whenever a new version of the APK is released.

# ~~Advanced (Extracting MonoBehaviour:VariantData)~~ This isn't needed anymore, as of version 3.1.0.

For some reason, the UABE cannot extract `MonoBehaviour:VariantData` files in APK versions after 2.6.1. Extra steps are needed to get these files.

Note for the following that Variant files are the ones that have `_B_`, `_S_`, `_G_`, or `_D_` in the filename.

## Get the Format from APK 2.6.1
1. Follow the process above using the latest APK.
2. Download [APK 2.6.1](https://apkpure.com/skullgirls/com.autumn.skullgirls/download/31-APK).
3. Using the same process, extract scripts from APK 2.6.1.
4. Copy all of the old Variant files into `MonoBehaviour` within `sgm_exports` (created from the latest APK).

## Get the Data from the Latest APK
1. Download the [DevX Unity Unpacker](http://devxdevelopment.com/UnityUnpacker).
2. Open the latest APK in DevX Unity Unpacker.
3. Search for all Variant files.
4. Manually update all Variant files, including the path ID embedded in the filename.
5. Use old Variant files to create new files for new Variants that didn't exist in 2.6.1.

The directory `__FAKE_Variant_MonoBehaviour` and the script `faker.py` within this folder were created to ease this process, recreating only the data which is necessary for the website. The `sgm_exports` folder must be within this folder to run `faker.py`.

This removes the APK 2.6.1 steps, but still requires the DevX steps to manually update the `faker.py` reference data.

The scripts within this folder must have this folder's parent directory set as the working directory in order to run. The `data` folder located in this folder's parent directory must also be created before running `main.py`.

#### Notes
- AssetStudio is used for extracting most files because it's easier to use and exports assets in a nicely structured way.
- UABE is used for extracting scripts because AssetStudio exports scripts with missing data.
- The palletized portraits don't appear to be within the APK.
- As of version 2.7.0, MonoBehaviour:VariantData files cannot be properly extracted.
- As of version 3.1.0, MonoBehaviour:VariantData files can be accessed again, but Ability files cannot be accessed.
