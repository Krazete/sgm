const VERSION = "5.2.1"; /* update whenever anything changes */

self.addEventListener("install", event => {
    // console.log("PWA Install: " + VERSION);
    event.waitUntil((async () => {
        const assets = [
            "./data/bbs.json",
            "./data/characters.json",
            "./data/de.json",
            "./data/en.json",
            "./data/es.json",
            "./data/fr.json",
            "./data/ja.json",
            "./data/ko.json",
            "./data/pt-br.json",
            "./data/ru.json",
            "./data/sms.json",
            "./data/variants.json",
            "./data/zh-cn.json",
            "./fighter.js",
            "./font/DMFT-chsimp.ttf",
            "./font/RobotoCondensed-Regular.ttf",
            "./font/TBCinemaRGothic-M.ttf",
            "./font/Typo_DodamM.ttf",
            "./font/WashingtonBoldDynamic.otf",
            "./image/huh.gif",
            "./image/kofi.png",
            "./image/official/Annie_MasteryIcon.png",
            "./image/official/BB-Frame1.png",
            "./image/official/Beowulf_MasteryIcon.png",
            "./image/official/BigBand_MasteryIcon.png",
            "./image/official/BlackDahlia_MasteryIcon.png",
            "./image/official/BronzeLevel.png",
            "./image/official/Button_Home.png",
            "./image/official/Button_Settings.png",
            "./image/official/Cerebella_MasteryIcon.png",
            "./image/official/CloseButton.png",
            "./image/official/DiamondLevel.png",
            "./image/official/Double_MasteryIcon.png",
            "./image/official/ElementalDarkBackless.png",
            "./image/official/ElementalFireBackless.png",
            "./image/official/ElementalIconDark.png",
            "./image/official/ElementalIconFire.png",
            "./image/official/ElementalIconLight.png",
            "./image/official/ElementalIconNeutral.png",
            "./image/official/ElementalIconWater.png",
            "./image/official/ElementalIconWind.png",
            "./image/official/ElementalLightBackless.png",
            "./image/official/ElementalNeutralBackless.png",
            "./image/official/ElementalWaterBackless.png",
            "./image/official/ElementalWindBackless.png",
            "./image/official/Eliza_MasteryIcon.png",
            "./image/official/Filia_MasteryIcon.png",
            "./image/official/Fukua_MasteryIcon.png",
            "./image/official/GearIcon.png",
            "./image/official/GoldLevel.png",
            "./image/official/HealthIcon.png",
            "./image/official/IconInfo.png",
            "./image/official/Lock.png",
            "./image/official/MsFortune_MasteryIcon.png",
            "./image/official/Painwheel_MasteryIcon.png",
            "./image/official/Parasoul_MasteryIcon.png",
            "./image/official/Peacock_MasteryIcon.png",
            "./image/official/PowerIcon.png",
            "./image/official/RoboFortune_MasteryIcon.png",
            "./image/official/Robofortune_MasteryIcon.png",
            "./image/official/SilverLevel.png",
            "./image/official/SpecialFrameGold.png",
            "./image/official/SpecialFrameSilver.png",
            "./image/official/Squigly_MasteryIcon.png",
            "./image/official/Umbrella_MasteryIcon.png",
            "./image/official/Valentine_MasteryIcon.png",
            "./image/official/WinsToggleIcon.png",
            "./image/official/ZoomIn.png",
            "./image/official/ZoomOut.png",
            "./image/official/constraints_bronze.png",
            "./image/official/constraints_diamond.png",
            "./image/official/constraints_gold.png",
            "./image/official/constraints_no.png",
            "./image/official/constraints_silver.png",
            "./image/official/flag_ch.png",
            "./image/official/flag_de.png",
            "./image/official/flag_en.png",
            "./image/official/flag_es.png",
            "./image/official/flag_fr.png",
            "./image/official/flag_jp.png",
            "./image/official/flag_ko.png",
            "./image/official/flag_pt.png",
            "./image/official/flag_ru.png",
            "./image/official/icon_externalsite.png",
            "./image/official/icon_filter.png",
            "./image/official/icon_middle.png",
            "./image/official/plus.png",
            "./image/official/skullheart_idle01.png",
            "./image/official/skullheart_idle02.png",
            "./image/official/skullheart_idle03.png",
            "./image/official/skullheart_idle04.png",
            "./image/official/skullheart_idle05.png",
            "./image/official/skullheart_idle06.png",
            "./image/official/star01.png",
            "./image/what.gif",
            "./index.css",
            "./index.html",
            "./move.js",
            "./moves.html",
            "./ratings.html",
            "./ratings.js"
        ];
        const cache = await caches.open(VERSION);
        cache.addAll(assets);
    })());
});

self.addEventListener("activate", event => {
    // console.log("PWA Activate: " + VERSION);
    event.waitUntil((async () => {
        const keys = await caches.keys();
        keys.forEach(async (key) => {
            if (key !== VERSION) {
                // console.log("PWA Delete: " + key);
                await caches.delete(key);
            }
        });
    })());
});

self.addEventListener("fetch", event => {
    // console.log("PWA Fetch: " + VERSION);
    event.respondWith((async () => {
        const cache = await caches.open(VERSION);
        const cacheResponse = await cache.match(event.request);
        if (cacheResponse) {
            return cacheResponse;
        }
        else {
            try {
                const fetchResponse = await fetch(event.request);
                cache.put(event.request, fetchResponse.clone());
                return fetchResponse;
            }
            catch (e) {
                // console.warn(e);
            }
        }
    })());
});
