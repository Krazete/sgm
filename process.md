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
4. Download [UnityAssetBundleExtractor](https://github.com/DerPopo/UABE) (UABE). Version 2.2 is probably best.
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
4. For audio files, select `AudioClip` in the `Filter Type` menu.
5. Click `Filtered assets` in the `Export` menu. Save to a new folder called `sgm_exports`.

## Extract Scripts
1. Run Il2CppDumper and open `sgm_decoded/lib/x86/libil2cpp.so` and then `sgm_decoded/assets/bin/Data/Managed/Metadata/global-metadata.dat` when prompted. Select mode 3 and note the new `DummyDll` folder created in the same directory as the Il2CppDumper program.
2. Run UABE and open `sgm_decoded/assets/bin/data/sharedassets0.assets.split0`.
3. Click `Get script information` in the `Tools` menu. Several windows will appear sequentially.
4. Navigate to the `DummyDll` folder and select the file that appears (if no file appears, click Cancel). Repeat. Afterwards, there will be a window detailing errors; click OK.
5. Sort by Type. Select all MonoBehaviour files and click `Export Dump` in the right panel. Choose the `Unity JsonUtility file` format and save to a new folder named `MonoBehaviour` within `sgm_exports`.

## (For Mac Users) Transfer Data from Windows VM to Mac
1. Move `sgm_exports` to the shared folder.
2. Shut down Windows.

## Repeat
1. Repeat the decompiling and extracting steps whenever a new version of the APK is released.

#### Notes
- AssetStudio is used for extracting most files because it's easier to use and exports assets in a nicely structured way.
- UABE is used for extracting scripts because it rebuilds scripts; AssetStudio pretty much only exports reference pointers.
- The palletized portraits don't appear to be within the APK.
