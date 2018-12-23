# Skullgirls Mobile Fighter Gallery
A character gallery for Skullgirls Mobile.



## Features

#### Language

You can set the language to any of the in-game optinos.

#### Wikia

While the cards offer basic info, the wikia can be useful for strategizing.

#### Options (Fighter Settings)

The stats shown are only base levels, as if the Attack Damage and Health sides of the skill tree are completely empty and the Marquee Ability isn't activate.
For more detailed stats, see the [Skullgirls Mobile Fighter Data](https://docs.google.com/spreadsheets/d/1goYXai7QUu4IJp76POP1IWyc2_6fEqEmxt9e74qyIgw) spreadsheet currently maintained by Takio_Mx. My website should have more accurate stats, but his is good enough.

#### Filter

Like the game, you can sort with in-game sorting methods.
Tiers are sorted by natural tiers, not by tiers set in the Options menu.

#### Sort

Sorting Fighter Score, Attack, or Health is based on the Options menu settings.

## Faults

#### Portraits

Unlike most of the data and assets used on the website, fighter variant portrait images are not in the APK. The portraits are instead taken from in-game screenshots, cropped and masked with the help of MATLAB.

Due to this dependence on screenshots, new fighters and variants introduced in future versions of Skullgirls Mobile will not initially have their portrait displayed on the website. Instead, it will display a [placeholder image](image/official/RandomBackground.png) which redirects to this page.

If you have a fighter whose portrait is missing, please send a screenshot to krazete@gmail.com or through Discord to @Krazete#7038. The screenshot must be taken from the `Select an Avatar Fighter` menu (see the example below).

<img src="image_processing/raw/fi/bHDay.png">

#### Compatibility

I designed with Chrome in mind. Safari and and mobile browsers were somewhat tested, but not prioritized. I don't plan on fixing things for outdated browsers.

#### Known Bugs

###### iPad
* Zoom is slow.
* Content is slow to load when scrolling fast.
* Input range thumbs are difficult to interact with.
* Drop-shadow glitches out.
* Zoom isn't reset before unload.

###### General
* Title isn't multilingual.
