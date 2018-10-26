
On Mac
Download Windows 10
Install VirtualBox
Create new Windows VM
Create a shared folder in VM settings

On Windows
Install Windows
https://ibotpeaches.github.io/Apktool/
Download APKTool
https://github.com/Perfare/AssetStudio
Download AssetStudio and its requirements
https://github.com/Perfare/Il2CppDumper
Download Il2CppDumper
https://github.com/DerPopo/UABE
Download Visual C++ 2010
Download UnityAssetBundleExtractor


After Setup
https://apkpure.com/skullgirls/com.autumn.skullgirls
Download Skullgirls Mobile APK
Use APKTool to decode APK into SGM
Run "apktool d Skullgirls_v2.6.1_apkpure.com.apk -f -o SGM" in command prompt

Run AssetStudio with SGM
Filter Sprite, TextAsset, and Texture2D
Export filtered assets into new SGMAS folder

Run Il2CppDumper with SGM/lib/x86/libil2cpp.so and SGM/assets/din/Data/Managed/Metadata/global-metadata
Run UnityAssetBundleExtractor with SGM/assets/bin/data/sharedassets0.assets.split0
In UABE, run Tools->Get script information using Il2CppDumper-generated files
In UABE, run Search->Search by name for "*0_Dum*"
Selected relevant MonoBehaviour files and Export Dump into new SGMUABE folder

TODO
search for *palet*
find PalettizedImages
