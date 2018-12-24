# Skullgirls Mobile Fighter Gallery
A character gallery for Skullgirls Mobile.
View the stats and abilities of every fighter variant, translated in any language offered in the game.

<img src="image/sample.png">

The version number seen on the website indicates the version of the game from which data has been gathered.
The website will only be updated for game updates that introduce new characters, alter existing characters, or fix translations.
If the website version is 3.0.0 but the latest game version is 3.0.2, the website probably still contains accurate information.

## Features

### Language

All of the language options available in the game are available on the website.
The translations are an exact copy of the text used in the corresponding version of the game.

*Your chosen language option is saved in your browser's local storage for future visits.*

### Options (Fighter Settings)

You can modify the tier, level, still tree, and ability levels of the displayed fighters from this menu.

#### Stats

When the tier, level, or skill tree settings are changed, the attack, health, and fighter score values on each card are recalculated.
The formulas used in these calculations are as follows:

* `ATK_BOOST = {NO_ATK_NODES: 1, ALL_ATK_NODES: 1.5}`
* `HP_BOOST = {NO_HP_NODES: 1, ALL_HP_NODES: 1.5}`
* `FS_BOOST = {NO_ABILITY_NODES: 0, ALL_ABILITY_NODES: 1.46, MAXED_MARQUEE: 1.57}`
* `LVL1_ATK = ATK_BOOST * BASE_ATK`
* `LVL1_HP = HP_BOOST * BASE_HP`
* `ATK = CEIL(LVL1_ATK + LVL1_ATK * (LVL - 1) / 5)`
* `HP = CEIL(LVL1_HP + LVL1_HP * (LVL - 1) / 5)`
* `FS = CEIL(FS_BOOST * (ATK + HP / 6) * 7 / 10)`

All `BASE_` values are hard-coded for every tier of every fighter.
While I cannot confirm if the game uses these same formulas, the results appear to exactly match the stats of fighters that I have on my own account.

The [Skullgirls Mobile Fighter Data](https://docs.google.com/spreadsheets/d/1goYXai7QUu4IJp76POP1IWyc2_6fEqEmxt9e74qyIgw) spreadsheet, [created by Raidriar and currently maintained by Takio](https://forum.skullgirlsmobile.com/threads/calculated-fighter-stats.392/), is the origin of the initial version of these formulas.
I then modified them until the results perfectly matched in-game stats.

#### Abilities

The Signature Ability and Marquee Ability settings allow you to preview fighters' abilities at each ability level.
These settings do not affect the tier, level, or skill tree settings and are not considered in the calculation of fighters' stats.

#### Preset Buttons
The `X` button sets tier, level, signature, and marquee to the minimum level.  
The `Home` button sets tier and level to the minimum level and sets signature and marquee to the maximum level.  
The `Crown` button sets tier, level, signature, and marquee to the maximum level.

*Your fighter settings are not saved and will be reset on every visit.*

### Filter

All of the filter settings in the game are also on the website.
The filters behave just like they do in the game, except for the tier filters.
Filtering by tier filters by natural tier, not by the tier set in the Fighter Settings menu.

#### Search Box

You can also filter characters based on their variant names or their ability descriptions.
The query processing method is very basic, simply searching for an exact match (ignoring capitalization and extra spaces) instead of separating the query into individual terms.

Base fighter names, quotes, stats, and ability names are not included in these searches.

##### Shorthand

The variant data object keys are included in variant name searches because keys often include common shorthand.
For example, the abbreviation BHD refers to Bad Hair Day Filia, whose data is stored with the key `bHDay`.
The exceptions to this rule are as follows:

* `wresX`: Wrestler X
* `gJazz`: G.I. Jazz
* `toad`: Toad Warrior
* `fColor`: Myst-Match
* `inDeni`: In Denile
* `gloom`: Tomb & Gloom
* `claw`: Claw & Order
* `lucky`: Feline Lucky
* `splash`: Hack n' Splash
* `meow`: Meow & Furever
* `rerun`: Rerun
* `necroB`: Necrobreaker
* `polter`: Poltergust

Moreover, the natural diamonds do not have any officially defined IDs.
I made up my own keys to use for them, consistent in format with most other official variant IDs.
I have considered renaming the exceptions listed above to make searching easier, but I want to keep the data close to the original as possible.

#### Locks

The lock on the top left corner of each card prevents filters from hiding that card.
This is to ease the process of searching for and comparing between different fighters.

*Your filter settings are not saved and will be cleared on every visit.*

### Sort

The website allows you to sort fighters alphabetically or based on fighter score, attack, health, element, or tier.
The game's energy and level sorting options have not been included since they are not useful in this context.

The website's sorting behavior mimics the game's sorting behavior for the most part.
It even follows the game's `[Fire, Wind, Water, Light, Dark, Neutral]` element sort, which oddly differs the game's filter button order of `[Fire, Water, Wind, Light, Dark, Neutral]`.

The only two differences in sorting behavior are: you cannot reverse sorting order, and sorting by tier sorts by natural tier, not by the tier set in the Fighter Settings menu.

*Your chosen sorting option is saved in your browser's local storage for future visits.*

### Zoom

The zoom buttons allow you to increase or decrease card size.
Like the game, there are only three zoom levels.

*Your chosen zoom level is saved in your browser's local storage for future visits.*

### Wikia Links

Every fighter variant has has a link on the top right corner of their card which redirects to the Tips and Tricks section of their official [Wikia](https://skullgirlsmobile.wikia.com/) page.

This is possible because the Wikia contributors nearly always name the variant pages consistent with the official capitalization and punctuation.
The only exception was the [Hack n' Splash](https://skullgirlsmobile.wikia.com/wiki/Hack_N%27_Splash) page, which had an erroneous uppercase "N" until I renamed it.

If you notice a link is redirecting to a nonexistent Wikia page, please try to fix the page title or [notify me about it](#contact).

### Loading

The [loading animation featuring Squigly](image_processing/what.gif) appears whenever a JSON file is being loaded.

I think this was taken from a live stream a few years ago.
I don't quite remember, and I can't find the image anywhere else online.
I know that the artist is one of the members of [Mecha Fetus](http://www.mechafetus.com/) and worked as an artist on Skullgirls.
I think.
It's probably Mariel "Kinuko" Cartwright's artwork.
Probably.

If you recognize where the art is from, please [let me know](#contact) so I can update this section and properly credit the artist.

## Issues

### Portraits

Unlike most of the data and assets used on the website, fighter variant portrait images are not in the APK.
The portraits are instead taken from in-game screenshots, cropped and masked with the help of MATLAB.

Due to this dependence on screenshots, new fighters and variants introduced in future versions of Skullgirls Mobile will not initially have their portrait displayed on the website.
Instead, it will display a [placeholder image](image/official/RandomBackground.png) which redirects to this page.

If you have a fighter whose portrait is missing, please [send me a screenshot](#contact).
The screenshot must be taken from the `Select an Avatar Fighter` menu (see the example below).

<img src="image_processing/raw/fi/bHDay.png">

### Compatibility

I spent the entire design process with Google Chrome in mind.
I also briefly tested in Safari and fixed some bugs specific to iOS and MacOS, but I have not thoroughly tested the website in other browsers.

Because the game itself does not run on outdated systems (or at least not on my iPad Mini 1), I do not plan on accommodating to older browsers.
The website's extensive use of the CSS Grid would also make fixing compatibility issues quite difficult.

If you are having trouble using the website on an updated browser, please [contact me about the issue](#contact).

### Contact

Send any messages to krazete@gmail.com or through Discord to @Krazete#7038.
