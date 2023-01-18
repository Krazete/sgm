[![Netlify Status](https://api.netlify.com/api/v1/badges/19e38262-723c-4c46-a279-dcb713ed1b64/deploy-status)](https://app.netlify.com/sites/sgm/deploys)

# Skullgirls Mobile Collection Gallery
A collection gallery for Skullgirls Mobile.
View the stats and abilities of every fighter variant, move, and catalyst, translated in any language offered in the game.

<img src="image/sample.png">

The version number seen on the website indicates the version of the game from which data has been gathered.
The website will only be updated for game updates that introduce new units, alter existing units, or fix translations.
If the website version is 3.0.0 but the latest game version is 3.0.2, the website probably still contains accurate information.

## Features

### Language

All of the language options available in the game are available on the website.
All translations are an exact copy of the text used in the corresponding version of the game (except for the words `Gallery`, `Ratings`, `Variant`, `Name`, `Votes`, and `You`, which Google Translate helped with).

*Your chosen language option is saved in your browser's local storage for future visits.*

### Rating System

At the developers' request, I have implemented a rudimentary rating system to show the community's opinion on each fighter variant.
To enable the rating system, just click on the star at bottom right of the website.
This will also reveal two more sorting options based on the two ratings on each card.

The rating system uses Firebase to keep track of votes.
One vote is allowed per browser session, and all votes are weighted by how many votes were made at the same IP address.

*The rating system toggle state is saved in your browser's local storage for future visits.*

### Options (Fighter Settings)

You can modify the tier, level, skill tree, and ability levels of the displayed fighters from this menu.

#### Stats

When the tier, level, or skill tree settings are changed, the attack, health, and fighter score values on each card are recalculated.
The formulas used in these calculations are as follows:

* `ATK_BOOST = {NO_ATK_NODES: 1, ALL_ATK_NODES: 1.5}`
* `HP_BOOST = {NO_HP_NODES: 1, ALL_HP_NODES: 1.5}`
* `TREE_BOOST = {NO_TREE_NODES: 1, ALL_TREE_NODES: 1.46, MAXED_MARQUEE: 1.57}`
* `PA_BOOST_BONUS = {REACH_PA_LVL1: 9, REACH_PA_LVL100: 18}`
* `PA_BOOST = (PA_LVL + PA_BOOST_BONUS) / 1000`
* `FS_BOOST = TREE_BOOST + PA_BOOST`
* `LVL1_ATK = ATK_BOOST * BASE_ATK`
* `LVL1_HP = HP_BOOST * BASE_HP`
* `ATK = CEIL(LVL1_ATK + LVL1_ATK * (LVL - 1) / 5)`
* `HP = CEIL(LVL1_HP + LVL1_HP * (LVL - 1) / 5)`
* `FS = CEIL(FS_BOOST * (ATK + HP / 6) * 7 / 10)`

All `BASE_` values are hard-coded for every tier of every fighter, although they seem to follow the general pattern `EVOLVED_BASE_ = FORMER_BASE_ * 1.8`.
The only variants that deviate from this pattern are Headstrong and Understudy, who appear to swap stats with each other when evolved to the diamond tier.

While I cannot confirm if the game uses these same formulas, the results appear to exactly match the stats of fighters that I have on my own account.
See my [SGM Fighter Score Analysis](https://docs.google.com/spreadsheets/d/1CotgKsKzSIA5siRAMplX7e5k7KRT63a3GSY1XRg-hgc/edit?usp=sharing) spreadsheet for more detailed information.

The [Skullgirls Mobile Fighter Data](https://docs.google.com/spreadsheets/d/1goYXai7QUu4IJp76POP1IWyc2_6fEqEmxt9e74qyIgw) spreadsheet, [created by Raidriar and currently maintained by Takio](https://forum.skullgirlsmobile.com/threads/calculated-fighter-stats.392/), is the origin of the initial version of these formulas.
I then modified them until the results perfectly matched in-game stats.

Thanks to bbp, brdv, and qdd for help figuring out how Prestige Ability affects Fighter Score.

#### Abilities

The Signature Ability and Marquee Ability settings allow you to preview fighters' abilities at each ability level.
These settings do not affect the tier, level, or skill tree settings and are not considered in the calculation of fighters' stats.

#### Preset Buttons
The `X` button sets tier, level, skill tree, signature, and marquee to the minimum level.
The `Home` button sets tier, level, and skill tree to the minimum level and sets signature and marquee to the maximum level.
The `Crown` button sets tier, level, skill tree, signature, and marquee to the maximum level.

*Your fighter settings are not saved and will be reset on every visit.*

### Filter

All of the filter settings in the game are also on the website.
The filters behave just like they do in the game, except for the tier filters.
Filtering by tier filters by natural tier, not by the tier set in the Fighter Settings menu.

#### Search Box

You can also filter characters based on their variant names or their ability descriptions.
The query processing method is very basic, simply searching for an exact match (ignoring capitalization and extra spaces) instead of separating the query into individual terms.

Base fighter names, quotes, stats, and ability names are not included in these searches.

If you include a hash property in the URL, the website will initialize with the hash property in the search box.
For example, opening https://sgm.netlify.com/#Bad%20Hair%20Day will only show Bad Hair Day's card upon page load.

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

#### Locks

The lock on the top left corner of each card prevents filters from hiding that card.
This is to ease the process of searching for and comparing between different fighters.

*Your filter settings are not saved and will be cleared on every visit.*

### Sort

The website allows you to sort fighters by in-game options like alphabetically or based on fighter score, element, or tier.
The game's energy and level sorting options have not been included since they are not useful in this context.
You can additionally sort by attack, health, offense rating, and defense rating.
The rating sort options only appear when the rating system is enabled.

The website's sorting behavior mimics the game's sorting behavior for the most part.
It even follows the game's `[Fire, Wind, Water, Light, Dark, Neutral]` element sort, which oddly differs the game's filter button order of `[Fire, Water, Wind, Light, Dark, Neutral]`.

The only two differences in sorting behavior are: you cannot reverse sorting order, and sorting by tier sorts by natural tier, not by the tier set in the Fighter Settings menu.

*Your chosen sorting option is saved in your browser's local storage for future visits.*

### Zoom

The zoom buttons allow you to increase or decrease card size.
Like the game, there are only three zoom levels.

*Your chosen zoom level is saved in your browser's local storage for future visits.*

### Wikia Links

Every fighter variant has a link on the top right corner of their card which redirects to the Tips and Tricks section of their official [Wikia](https://skullgirlsmobile.wikia.com/) page.

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
Or Persona's.
Not sure.

If you recognize where the art is from, please [let me know](#contact) so I can update this section and properly credit the artist.

## Move Gallery

The [Move Gallery](https://sgm.netlify.com/moves) features all moves available in the game.
It can be filtered, sorted, and searched through much like the fighter gallery and includes one level setting.

This gallery still lacks the following features:

* damage intensity information (none, very low, low, med, high, very high, ultra)
* upgrade and sell costs
* information about whether a move is a throw, grab, or projectile

## Catalyst Gallery

The [Catalyst Gallery](https://sgm.netlify.com/catalysts) features all catalysts available in the game.
It can be filtered, sorted, and searched through much like the fighter gallery and includes one level setting.

This gallery still lacks the following features:

* existence

## Versions

Each branch of this repository contains a different version of this gallery.

* v0 (First Draft): The gallery is initialized with information taken from [the forums](https://forum.skullgirlsmobile.com/) and portraits incompletely processed from screenshots.

* v1 (Second Draft): Information is now mined from version 2.6.1 of the game. There are new language options, filters, and settings. The design has been improved and more portraits have been added.

* v2 (Final Draft): The gallery now resembles what it looks like today. The design has been dramatically improved and all portraits have been added ~~thanks to screenshots from the Rift beta~~. All settings, filters, sorting options, and whatnot have been refined. The gallery is in its first "completed" state, matching up with game version 3.0.0.

* v3 (Move Gallery): A move gallery has been added. Images are missing and some moves are missing entirely. The basic filter, sort, and setting options are included.

* v4 (Rating System): A rating system has been added, along with a rating toggle button to hide ratings and return to the original, more compact design.

* v5 (Asset Upgrade): Portraits are now supplied by HVS and the masks have been refined. The move gallery is also populated with images and previously missing move entries have been added. Game version has been updated to 3.1.0. A new Gallery Ratings page has been added to show all ratings in a more condensed format.

* v6 (Catalysts and Collaboration): Processing files have been moved to Krazete/sgmminer. The CONTRIBUTING.md document has been added detailing how to manually update gallery data files. A rudimentary catalyst gallery has been added.

## Issues

### Compatibility

I spent the entire design process with Google Chrome in mind.
I also briefly tested in Safari and fixed some bugs specific to iOS and MacOS, but I have not thoroughly tested the website in other browsers.

Because the game itself does not run on outdated systems (or at least not on my iPad Mini 1), I do not plan on accommodating to older browsers.
The website's extensive use of the CSS Grid would also make fixing compatibility issues quite difficult.

If you are having trouble using the website on an updated browser, please [contact me about the issue](#contact).

### Contact

Send any messages to krazete@gmail.com or through Discord to @Krazete#7038.
