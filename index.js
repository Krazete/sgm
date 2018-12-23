var fighters, variants, corpus;

var tiers = ["bronze", "silver", "gold", "diamond"];
var elements = ["neutral", "fire", "water", "wind", "dark", "light"];
var wikiaPaths = { /* from English corpus */
    "nEgrets": "No Egrets",
    "tAFolks": "That's All Folks!",
    "nSense": "Nunsense",
    "meow": "Meow & Furever",
    "tTyrant": "Temple Tyrant",
    "gMatt": "Gray Matter",
    "necroB": "Necrobreaker",
    "dMight": "Dark Might",
    "splash": "Hack n' Splash",
    "hHanded": "Heavy Handed",
    "toad": "Toad Warrior",
    "fEnds": "Frayed Ends",
    "bBath": "Bloodbath",
    "gShift": "Graveyard Shift",
    "gloom": "Tomb & Gloom",
    "mTrial": "Ms. Trial",
    "dHeat": "Dead Heat",
    "hCat": "Hellcat",
    "wBane": "Wulfsbane",
    "rBlight": "Rainbow Blight",
    "polter": "Poltergust",
    "sketch": "Sketchy",
    "bFreeze": "Brain Freeze",
    "rerun": "Rerun",
    "rNerv": "Raw Nerv",
    "xMorph": "Xenomorph",
    "nDepart": "Nearly Departed",
    "dLicious": "Doublicious",
    "nOne": "Number One",
    "sSalt": "Summer Salt",
    "claw": "Claw & Order",
    "bValen": "Bloody Valentine",
    "rCopy": "Robocopy",
    "pTech": "Pyro-Technique",
    "bTop": "Big Top",
    "fFrame": "Freeze Frame",
    "uStudy": "Understudy",
    "iThreat": "Idol Threat",
    "wresX": "Wrestler X",
    "dInterv": "Diva Intervention",
    "pDark": "Purrfect Dark",
    "rBlonde": "Regally Blonde",
    "eSax": "Epic Sax",
    "pDick": "Private Dick",
    "hAppar": "Hair Apparent",
    "fTrap": "Fly Trap",
    "sGeneral": "Surgeon General",
    "aForce": "Armed Forces",
    "pShoot": "Pea Shooter",
    "lHope": "Last Hope",
    "sStiff": "Scared Stiff",
    "hMan": "Hype Man",
    "rusty": "Rusty",
    "oMai": "Oh Mai",
    "sViper": "Scarlet Viper",
    "hReign": "Heavy Reign",
    "hStrong": "Headstrong",
    "rEvil": "Resonant Evil",
    "inDeni": "In Denile",
    "fFly": "Firefly",
    "bMFrosty": "Bad Ms Frosty",
    "jKit": "Just Kitten",
    "hMetal": "Heavy Metal",
    "cStones": "Cold Stones",
    "scrub": "Scrub",
    "dLocks": "Dread Locks",
    "sFright": "Stage Fright",
    "uTouch": "Untouchable",
    "bExor": "Bio-Exorcist",
    "wSwept": "Windswept",
    "dBrawl": "Dragon Brawler",
    "uViolent": "Ultraviolent",
    "bLine": "Bassline",
    "gFan": "Grim Fan",
    "gJazz": "G.I. Jazz",
    "bHDay": "Bad Hair Day",
    "fFury": "Furry Fury",
    "shelt": "Sheltered",
    "fColor": "Myst-Match",
    "lucky": "Feline Lucky",
    "pWeave": "Parasite Weave",
    "bBox": "Beat Box",
    "bDrive": "Blood Drive",
    "jBreaker": "Jawbreaker",
    "lCrafted": "Love Crafted",
    "prime": "Primed",
    "wWarr": "Weekend Warrior",
    "iHot": "Icy Hot",
    "hQuin": "Harlequin",
    "bKill": "Buzzkill",
    "uDog": "Underdog",
    "sSchool": "Sundae School",
    "iFiber": "Immoral Fiber",
    "aGreed": "Assassin's Greed",
    "tMett": "Twisted Mettle",
    "dOWint": "Dead of Winter",
    "rAppr": "Rage Appropriate",
    "mSonic": "Megasonic",
    "cCutter": "Class Cutter",
    "dCrypt": "Decrypted",
    "pPride": "Princess Pride",
    "rVelvet": "Red Velvet",
    "sKill": "Silent Kill",
    "sCross": "Star-Crossed",
    "ink": "Inkling",
    "iLeague": "Ivy League",
    "sOut": "Stand Out"
};

var cards = [];
var filterCards;
var sortBasis;
var updateCards;

function loadJSON(path) {
    function request(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", path, true);
        xhr.onload = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                resolve(JSON.parse(this.response));
    		}
    	};
        xhr.onerror = function() {
            reject(new Error("Could not load \"" + path + "\"."));
        };
        xhr.send();
    }
    return new Promise(request);
}

function toggleLoadingScreen(loading) {
    if (loading) {
        document.body.classList.add("loading");
    }
    else {
        document.body.classList.remove("loading");
    }
}

function initCollection(responses) {
    fighters = responses[0];
    variants = responses[1];
    var collection = document.getElementById("collection");

    function openReadMe() {
        open("https://github.com/Krazete/sgm#portraits");
    }

    function handleMissingPortrait() {
        var portrait = this;
        var backdrop = portrait.parentElement;
        var avatar = backdrop.parentElement.parentElement;

        portrait.classList.add("hidden");
        backdrop.addEventListener("click", openReadMe);
        avatar.classList.add("missing-portrait");
    }

    function createAvatar(key) {
        var avatar = document.createElement("div");
            avatar.className = "avatar";
            var frame = document.createElement("div");
                frame.className = "frame";
                var backdrop = document.createElement("div");
                    backdrop.className = "backdrop";
                    var portrait = document.createElement("img");
                        portrait.className = "portrait";
                        var stem = [
                            "image/portrait",
                            variants[key].base,
                            key
                        ].join("/");
                        if (key == "rBlight") {
                            stem += "_" + Math.floor(Math.random() * 7);
                        }
                        portrait.src = stem + ".png";
                        portrait.addEventListener("error", handleMissingPortrait);
                    backdrop.appendChild(portrait);
                frame.appendChild(backdrop);
            avatar.appendChild(frame);
            var nameplate = document.createElement("div");
                nameplate.className = "nameplate cinematic";
                var variantName = document.createElement("div");
                    variantName.className = "variant-name dependent-gradient";
                nameplate.appendChild(variantName);
                var fighterName = document.createElement("div");
                    fighterName.className = "fighter-name";
                nameplate.appendChild(fighterName);
            avatar.appendChild(nameplate);
        return avatar;
    }

    function createQuote() {
        var quote = document.createElement("q");
            quote.className = "quote";
        return quote;
    }

    function createWordBreak() {
        var wbr = document.createElement("wbr");
        return wbr;
    }

    function createStat(type) {
        var stat = document.createElement("div");
            stat.className = [type, "tagged"].join(" ");
            stat.appendChild(createWordBreak());
            var span = document.createElement("span");
                span.className = [
                    type + "-value",
                    "cinematic",
                    "silver-gradient"
                ].join(" ");
            stat.appendChild(span);
        return stat;
    }

    function toggleAbility() {
        var ability = this.parentElement;
        if (ability.classList.contains("collapsed")) {
            ability.classList.remove("collapsed");
        }
        else {
            ability.classList.add("collapsed");
        }
    }

    function createAbility(type, abilityData, collapsed) {
        var ability = document.createElement("div");
            if (collapsed) {
                ability.className = [type, "ability", "collapsed"].join(" ");
            }
            else {
                ability.className = [type, "ability"].join(" ");
            }
            var abilityTitle = document.createElement("div");
                abilityTitle.className = "ability-title cinematic";
                var abilityType = document.createElement("span");
                    abilityType.className = "ability-type gold-gradient";
                abilityTitle.appendChild(abilityType);
                abilityTitle.appendChild(createWordBreak());
                var abilityName = document.createElement("span");
                    abilityName.className = [
                        type + "-name",
                        "silver-gradient"
                    ].join(" ");
                abilityTitle.appendChild(abilityName);
                abilityTitle.addEventListener("click", toggleAbility);
            ability.appendChild(abilityTitle);
            if ('description' in abilityData) { /* character ability */
                var description = document.createElement("div");
                    description.className = "ca-0 description";
                ability.appendChild(description);
            }
            else { /* signature and marquee abilities */
                for (var i = 0; i < abilityData.features.length; i++) {
                    var feature = abilityData.features[i];
                    var description = document.createElement("div");
                        description.className = [
                            type + "-" + i,
                            "description"
                        ].join(" ");
                    ability.appendChild(description);
                }
            }
        return ability;
    }

    function createWikia(key) {
        var wikia = document.createElement("a");
            wikia.className = "wikia icon";
            wikia.target = "_blank";
            wikia.href = [
                "https://skullgirlsmobile.wikia.com/wiki",
                wikiaPaths[key] + "#Tips_and_Tricks"
            ].join("/");
        return wikia;
    }

    function toggleLock() {
        var card = this.parentElement;
        if (card.classList.contains("locked")) {
            card.classList.remove("locked");
        }
        else {
            card.classList.add("locked");
        }
    }

    function createLock() {
        var lock = document.createElement("img");
            lock.className = "lock";
            lock.src = "image/official/Lock.png";
            lock.addEventListener("click", toggleLock);
        return lock;
    }

    function createCard(key) {
        var card = document.createElement("div");
            card.className = [
                "card",
                tiers[variants[key].tier],
                elements[variants[key].element]
            ].join(" ");
            card.id = key;
            card.appendChild(createAvatar(key));
            card.appendChild(createQuote());
            card.appendChild(createStat("atk"));
            card.appendChild(createStat("hp"));
            card.appendChild(createStat("fs"));
            card.appendChild(createAbility("ca", fighters[variants[key].base].ca, true));
            card.appendChild(createAbility("sa", variants[key].sa));
            card.appendChild(createAbility("ma", fighters[variants[key].base].ma, true));
            card.appendChild(createWikia(key));
            card.appendChild(createLock());
        return card;
    }

    for (var key in variants) {
        var card = createCard(key)
        collection.appendChild(card);
        cards.push(card);
    }
}

function formatNumbers(text) {
    return text.replace(/(\d+(?:\.\d+)?%?)/g, "<span class=\"number\">$1</span>");
}

function format(template, substitutions) {
    var matches = template.match(/{\d+(?::\d+)?%?}%?/g);
    var formatted = template;
    if (matches) {
        for (var match of matches) {
            var index = parseInt(match.replace(/{(\d+)(?::\d+)?%?}%?/, "$1"));
            var substitute = Math.abs(substitutions[index]);
            if (match.includes("%}")) {
                substitute *= 100;
            }
            substitute = Math.round(substitute * 100) / 100; /* round to nearest 100th */
            if (match.includes("%")) {
                substitute += "%";
            }
            formatted = formatted.replace(match, substitute);
        }
    }
    else {
        console.log("Error: Could not format \"" + template + "\" with [" + substitutions + "].");
    }
    return formatNumbers(formatted);
}

function initLanguageMenu() {
    var buttonSet = document.getElementById("language-menu");
    var buttons = buttonSet.getElementsByTagName("input");

    var savedLanguage = localStorage.getItem("language") || "en";
    var savedButton = document.getElementById(savedLanguage);

    function updateCardConstant(card) {
        var key = card.id;
        var variantName = card.getElementsByClassName("variant-name")[0];
        var fighterName = card.getElementsByClassName("fighter-name")[0];
        var quote = card.getElementsByClassName("quote")[0];
        var caName = card.getElementsByClassName("ca-name")[0];
        var ca0 = card.getElementsByClassName("ca-0")[0];
        var saName = card.getElementsByClassName("sa-name")[0];
        var maName = card.getElementsByClassName("ma-name")[0];
        variantName.innerHTML = corpus[variants[key].name];
        fighterName.innerHTML = corpus[fighters[variants[key].base].name];
        quote.innerHTML = corpus[variants[key].quote];
        caName.innerHTML = corpus[fighters[variants[key].base].ca.title];
        ca0.innerHTML = formatNumbers(corpus[fighters[variants[key].base].ca.description]);
        saName.innerHTML = corpus[variants[key].sa.title];
        maName.innerHTML = corpus[fighters[variants[key].base].ma.title];
    }

    function updateCardConstants(response) {
        corpus = response;

        for (var card of cards) {
            updateCardConstant(card);
        }
    }

    function setLanguage() {
        var language = this.id;
        document.documentElement.lang = language;
        toggleLoadingScreen(true);
        loadJSON("data/" + language + ".json").then(updateCardConstants).then(updateCards).then(toggleLoadingScreen);
        localStorage.setItem("language", language);
    }

    document.documentElement.lang = savedLanguage;
    if (!savedButton) {
        savedLanguage = "en";
        savedButton = document.getElementById("en");
    }
    savedButton.checked = true;

    for (var button of buttons) {
        button.addEventListener("change", setLanguage);
    }

    return loadJSON("data/" + savedLanguage + ".json").then(updateCardConstants);
}

function initDock() {
    var zoomIn = document.getElementById("zoom-in");
    var zoomOut = document.getElementById("zoom-out");
    var fighterOptions = document.getElementById("fighter-options");
    var filterSort = document.getElementById("filter-sort");

    var menu = document.getElementById("menu");
    var optionsMenu = document.getElementById("options-menu");
    var filterMenu = document.getElementById("filter-menu");
    var sortMenu = document.getElementById("sort-menu");

    var savedZoom = localStorage.getItem("zoom") || "dock";
    var savedButton = document.getElementById(savedZoom);

    function getScrollRatio() {
        var scrollHeight = document.documentElement.scrollHeight - innerHeight;
        return scrollY / scrollHeight;
    }

    function setScrollRatio(scrollRatio) {
        var scrollHeight = document.documentElement.scrollHeight - innerHeight;
        scrollTo(0, scrollHeight * scrollRatio);
    }

    function decreaseZoom() {
        var scrollRatio = getScrollRatio();
        if (document.body.classList.contains("zoomed-in")) {
            document.body.classList.remove("zoomed-in");
            zoomIn.classList.remove("pressed");
            localStorage.setItem("zoom", "dock");
        }
        else {
            document.body.classList.add("zoomed-out");
            zoomOut.classList.add("pressed");
            localStorage.setItem("zoom", this.id);
        }
        setScrollRatio(scrollRatio);
    }

    function increaseZoom() {
        var scrollRatio = getScrollRatio();
        if (document.body.classList.contains("zoomed-out")) {
            document.body.classList.remove("zoomed-out");
            zoomOut.classList.remove("pressed");
            localStorage.setItem("zoom", "dock");
        }
        else {
            document.body.classList.add("zoomed-in");
            zoomIn.classList.add("pressed");
            localStorage.setItem("zoom", this.id);
        }
        setScrollRatio(scrollRatio);
    }

    function toggleFighterOptions() {
        if (this.classList.contains("glowing")) {
            this.classList.remove("glowing");
            menu.classList.add("hidden");
        }
        else {
            this.classList.add("glowing");
            filterSort.classList.remove("glowing");
            menu.classList.remove("hidden");
            optionsMenu.classList.remove("hidden");
            filterMenu.classList.add("hidden");
            sortMenu.classList.add("hidden");
            optionsMenu.scrollTo(0, 0);
        }
    }

    function toggleFilterSort() {
        if (this.classList.contains("glowing")) {
            this.classList.remove("glowing");
            menu.classList.add("hidden");
        }
        else {
            fighterOptions.classList.remove("glowing");
            this.classList.add("glowing");
            menu.classList.remove("hidden");
            optionsMenu.classList.add("hidden");
            filterMenu.classList.remove("hidden");
            sortMenu.classList.remove("hidden");
            filterMenu.scrollTo(0, 0);
            sortMenu.scrollTo(0, 0);
        }
    }

    zoomOut.addEventListener("click", decreaseZoom);
    zoomIn.addEventListener("click", increaseZoom);

    fighterOptions.addEventListener("click", toggleFighterOptions);
    filterSort.addEventListener("click", toggleFilterSort);

    savedButton.click();
}

function initFilterMenu() {
    var searchbox = document.getElementById("searchbox");
    var searchVN = document.getElementById("search-vn");
    var searchCA = document.getElementById("search-ca");
    var searchSA = document.getElementById("search-sa");
    var searchMA = document.getElementById("search-ma");

    var filterCancel = document.getElementById("filter-cancel");

    var filterBronze = document.getElementById("filter-bronze");
    var filterSilver = document.getElementById("filter-silver");
    var filterGold = document.getElementById("filter-gold");
    var filterDiamond = document.getElementById("filter-diamond");

    var filterFire = document.getElementById("filter-fire");
    var filterWater = document.getElementById("filter-water");
    var filterWind = document.getElementById("filter-wind");
    var filterLight = document.getElementById("filter-light");
    var filterDark = document.getElementById("filter-dark");
    var filterNeutral = document.getElementById("filter-neutral");

    var filterBE = document.getElementById("filter-be");
    var filterBB = document.getElementById("filter-bb");
    var filterCE = document.getElementById("filter-ce");
    var filterDO = document.getElementById("filter-do");
    var filterEL = document.getElementById("filter-el");
    var filterFI = document.getElementById("filter-fi");
    var filterPW = document.getElementById("filter-pw");
    var filterPA = document.getElementById("filter-pa");
    var filterPE = document.getElementById("filter-pe");
    var filterMF = document.getElementById("filter-mf");
    var filterSQ = document.getElementById("filter-sq");
    var filterVA = document.getElementById("filter-va");

    function updateFilterCancel() {
        if (
            filterBronze.checked ||
            filterSilver.checked ||
            filterGold.checked ||
            filterDiamond.checked ||
            filterFire.checked ||
            filterWater.checked ||
            filterWind.checked ||
            filterLight.checked ||
            filterDark.checked ||
            filterNeutral.checked ||
            filterBE.checked ||
            filterBB.checked ||
            filterCE.checked ||
            filterDO.checked ||
            filterEL.checked ||
            filterFI.checked ||
            filterPW.checked ||
            filterPA.checked ||
            filterPE.checked ||
            filterMF.checked ||
            filterSQ.checked ||
            filterVA.checked
        ) {
            filterCancel.checked = false;
        }
        else {
            filterCancel.checked = true;
        }
    }

    function sanitize(text) {
        return text.toLocaleLowerCase(document.documentElement.lang).replace(/\s+/, " ");
    }

    function removePlaceholders(template) {
        return template.replace(/{\d+(?::\d+)?%?}%?/g, "");
    }

    function searchCondition(card) {
        if (!searchbox.value) {
            return true;
        }
        var key = card.id;
        var query = sanitize(searchbox.value);
        if (searchVN.checked) {
            return sanitize(corpus[variants[key].name]).includes(query);
        }
        else if (searchCA.checked) {
            return removePlaceholders(sanitize(corpus[fighters[variants[key].base].ca.description])).includes(query);
        }
        else if (searchSA.checked) {
            var satisfiedSA = false;
            for (var feature of variants[key].sa.features) {
                satisfiedSA |= removePlaceholders(sanitize(corpus[feature.description])).includes(query);
            }
            return satisfiedSA;
        }
        else if (searchMA.checked) {
            var satisfiedMA = false;
            for (var feature of fighters[variants[key].base].ma.features) {
                satisfiedMA |= removePlaceholders(sanitize(corpus[feature.description])).includes(query);
            }
            return satisfiedMA;
        }
        return false;
    }

    function tierCondition(card) {
        if (
            !filterBronze.checked &&
            !filterSilver.checked &&
            !filterGold.checked &&
            !filterDiamond.checked
        ) {
            return true;
        }
        var key = card.id;
        return (
            (filterBronze.checked && variants[key].tier == 0) ||
            (filterSilver.checked && variants[key].tier == 1) ||
            (filterGold.checked && variants[key].tier == 2) ||
            (filterDiamond.checked && variants[key].tier == 3)
        );
    }

    function elementCondition(card) {
        if (
            !filterFire.checked &&
            !filterWater.checked &&
            !filterWind.checked &&
            !filterLight.checked &&
            !filterDark.checked &&
            !filterNeutral.checked
        ) {
            return true;
        }
        var key = card.id;
        return (
            (filterFire.checked && variants[key].element == 1) ||
            (filterWater.checked && variants[key].element == 2) ||
            (filterWind.checked && variants[key].element == 3) ||
            (filterLight.checked && variants[key].element == 5) ||
            (filterDark.checked && variants[key].element == 4) ||
            (filterNeutral.checked && variants[key].element == 0)
        );
    }

    function fighterCondition(card) {
        if (
            !filterBE.checked &&
            !filterBB.checked &&
            !filterCE.checked &&
            !filterDO.checked &&
            !filterEL.checked &&
            !filterFI.checked &&
            !filterPW.checked &&
            !filterPA.checked &&
            !filterPE.checked &&
            !filterMF.checked &&
            !filterSQ.checked &&
            !filterVA.checked
        ) {
            return true;
        }
        var key = card.id;
        return (
            (filterBE.checked && variants[key].base == "be") ||
            (filterBB.checked && variants[key].base == "bb") ||
            (filterCE.checked && variants[key].base == "ce") ||
            (filterDO.checked && variants[key].base == "do") ||
            (filterEL.checked && variants[key].base == "el") ||
            (filterFI.checked && variants[key].base == "fi") ||
            (filterPW.checked && variants[key].base == "pw") ||
            (filterPA.checked && variants[key].base == "pa") ||
            (filterPE.checked && variants[key].base == "pe") ||
            (filterMF.checked && variants[key].base == "mf") ||
            (filterSQ.checked && variants[key].base == "sq") ||
            (filterVA.checked && variants[key].base == "va")
        );
    }

    filterCards = function () {
        for (var card of cards) {
            if (
                searchCondition(card) &&
                tierCondition(card) &&
                elementCondition(card) &&
                fighterCondition(card)
            ) {
                card.classList.remove("hidden");
            }
            else {
                card.classList.add("hidden");
            }
        }
        updateFilterCancel();
    }

    function cancelFilters() {
        filterBronze.checked = false;
        filterSilver.checked = false;
        filterGold.checked = false;
        filterDiamond.checked = false;
        filterFire.checked = false;
        filterWater.checked = false;
        filterWind.checked = false;
        filterLight.checked = false;
        filterDark.checked = false;
        filterNeutral.checked = false;
        filterBE.checked = false;
        filterBB.checked = false;
        filterCE.checked = false;
        filterDO.checked = false;
        filterEL.checked = false;
        filterFI.checked = false;
        filterPW.checked = false;
        filterPA.checked = false;
        filterPE.checked = false;
        filterMF.checked = false;
        filterSQ.checked = false;
        filterVA.checked = false;
        filterCards();
    }

    searchbox.addEventListener("input", filterCards);
    searchVN.addEventListener("change", filterCards);
    searchCA.addEventListener("change", filterCards);
    searchSA.addEventListener("change", filterCards);
    searchMA.addEventListener("change", filterCards);

    filterCancel.addEventListener("change", cancelFilters);
    filterBronze.addEventListener("change", filterCards);
    filterSilver.addEventListener("change", filterCards);
    filterGold.addEventListener("change", filterCards);
    filterDiamond.addEventListener("change", filterCards);
    filterFire.addEventListener("change", filterCards);
    filterWater.addEventListener("change", filterCards);
    filterWind.addEventListener("change", filterCards);
    filterLight.addEventListener("change", filterCards);
    filterDark.addEventListener("change", filterCards);
    filterNeutral.addEventListener("change", filterCards);
    filterBE.addEventListener("change", filterCards);
    filterBB.addEventListener("change", filterCards);
    filterCE.addEventListener("change", filterCards);
    filterDO.addEventListener("change", filterCards);
    filterEL.addEventListener("change", filterCards);
    filterFI.addEventListener("change", filterCards);
    filterPW.addEventListener("change", filterCards);
    filterPA.addEventListener("change", filterCards);
    filterPE.addEventListener("change", filterCards);
    filterMF.addEventListener("change", filterCards);
    filterSQ.addEventListener("change", filterCards);
    filterVA.addEventListener("change", filterCards);

    searchVN.checked = true;
    filterCancel.click();
}

function sortCards() {
    cards.sort(sortBasis);
    for (var card of cards) {
        card.parentElement.appendChild(card);
    }
}

function initSortMenu() {
    var sortFighterScore = document.getElementById("sort-fs");
    var sortAttack = document.getElementById("sort-atk");
    var sortHealth = document.getElementById("sort-hp");
    var sortAlphabetical = document.getElementById("sort-abc");
    var sortElement = document.getElementById("sort-element");
    var sortTier = document.getElementById("sort-tier");

    var savedBasis = localStorage.getItem("basis") || "sort-fs";
    var savedButton = document.getElementById(savedBasis);

    function alphabeticalBasis(a, b) {
        var A = corpus[fighters[variants[a.id].base].name] + corpus[variants[a.id].name];
        var B = corpus[fighters[variants[b.id].base].name] + corpus[variants[b.id].name];
        return A > B ? 1 : A < B ? -1 : 0;
    }

    function getStatValue(card, type) {
        var statValue = card.getElementsByClassName(type + "-value")[0];
        return statValue.dataset.value;
    }

    function fighterScoreBasis(a, b) {
        var A = getStatValue(a, "fs");
        var B = getStatValue(b, "fs");
        var C = B - A;
        if (C == 0) {
            return alphabeticalBasis(a, b);
        }
        return C;
    }

    function attackBasis(a, b) {
        var A = getStatValue(a, "atk");
        var B = getStatValue(b, "atk");
        var C = B - A;
        if (C == 0) {
            return fighterScoreBasis(a, b);
        }
        return C;
    }

    function healthBasis(a, b) {
        var A = getStatValue(a, "hp");
        var B = getStatValue(b, "hp");
        var C = B - A;
        if (C == 0) {
            return fighterScoreBasis(a, b);
        }
        return C;
    }

    function elementBasis(a, b) {
        var elementMap = [0, 5, 3, 4, 1, 2];
        var A = elementMap[variants[a.id].element];
        var B = elementMap[variants[b.id].element];
        var C = B - A;
        if (C == 0) {
            return fighterScoreBasis(a, b);
        }
        return C;
    }

    function tierBasis(a, b) {
        var A = variants[a.id].tier;
        var B = variants[b.id].tier;
        var C = B - A;
        if (C == 0) {
            return fighterScoreBasis(a, b);
        }
        return C;
    }

    function sorter(basis) {
        return function () {
            sortBasis = basis;
            sortCards();
            localStorage.setItem("basis", this.id);
        }
    }

    sortFighterScore.addEventListener("change", sorter(fighterScoreBasis));
    sortAttack.addEventListener("change", sorter(attackBasis));
    sortHealth.addEventListener("change", sorter(healthBasis));
    sortAlphabetical.addEventListener("change", sorter(alphabeticalBasis));
    sortElement.addEventListener("change", sorter(elementBasis));
    sortTier.addEventListener("change", sorter(tierBasis));

    savedButton.checked = false; /* resets radio so change event can be triggered */
    savedButton.click();
}

function initOptionsMenu() {
    var optionBase = document.getElementById("option-base");
    var optionDefault = document.getElementById("option-default");
    var optionMaximum = document.getElementById("option-maximum");

    var evolveRange = document.getElementById("evolve-range");
    var evolveBronze = document.getElementById("evolve-bronze");
    var evolveSilver = document.getElementById("evolve-silver");
    var evolveGold = document.getElementById("evolve-gold");
    var evolveDiamond = document.getElementById("evolve-diamond");
    var evolveTiers = [evolveBronze, evolveSilver, evolveGold, evolveDiamond];

    var levelRange = document.getElementById("level-range");
    var levelBronze = document.getElementById("level-bronze");
    var levelSilver = document.getElementById("level-silver");
    var levelGold = document.getElementById("level-gold");
    var levelDiamond = document.getElementById("level-diamond");
    var levelTiers = [levelBronze, levelSilver, levelGold, levelDiamond];

    var saNumber = document.getElementById("sa-number");
    var saRange = document.getElementById("sa-range");

    var maNumber = document.getElementById("ma-number");
    var maRange = document.getElementById("ma-range");

    function updateCardStats() {
        for (var card of cards) {
            var key = card.id;
            var atkValue = card.getElementsByClassName("atk-value")[0];
            var hpValue = card.getElementsByClassName("hp-value")[0];
            var fsValue = card.getElementsByClassName("fs-value")[0];

            var i = Math.max(0, evolveRange.value - variants[key].tier);
            var baseATK = variants[key].stats[i].attack;
            var baseHP = variants[key].stats[i].lifebar;

            var j = Math.max(evolveRange.value, variants[key].tier);
            var atk = Math.ceil(baseATK + baseATK * (levelTiers[j].value - 1) / 5);
            var hp = Math.ceil(baseHP + baseHP * (levelTiers[j].value - 1) / 5);
            var fs = Math.ceil((atk + hp / 6) * 7 / 10);

            atkValue.dataset.value = atk;
            hpValue.dataset.value = hp;
            fsValue.dataset.value = fs;

            atkValue.innerHTML = atk.toLocaleString("en-US");
            hpValue.innerHTML = hp.toLocaleString("en-US");
            fsValue.innerHTML = fs.toLocaleString("en-US");
        }
        filterCards(); /* for the searchbox filter when language changes*/
        sortCards();
    }

    function updateCardSAs() {
        for (var card of cards) {
            var key = card.id;
            var sa = card.getElementsByClassName("sa")[0];
            var saDescriptions = sa.getElementsByClassName("description");
            for (var i = 0; i < saDescriptions.length; i++) {
                var saDescription = saDescriptions[i];
                var template = corpus[variants[key].sa.features[i].description];
                var substitutions = variants[key].sa.features[i].tiers[saRange.value - 1];
                saDescription.innerHTML = format(template, substitutions);
            }
        }
    }

    function updateCardMAs() {
        for (var card of cards) {
            var key = card.id;
            var ma = card.getElementsByClassName("ma")[0];
            var maDescriptions = ma.getElementsByClassName("description");
            for (var i = 0; i < maDescriptions.length; i++) {
                var maDescription = maDescriptions[i];
                var template = [
                    corpus[fighters[variants[key].base].ma.features[i].title],
                    corpus[fighters[variants[key].base].ma.features[i].description]
                ].join(" - ");
                var substitutions = fighters[variants[key].base].ma.features[i].tiers[maRange.value - 1];
                maDescription.innerHTML = format(template, substitutions);
            }
        }
    }

    updateCards = function () {
        updateCardStats();
        updateCardSAs();
        updateCardMAs();
    }

    function updateBatchButtons() {
        if (
            evolveRange.value == evolveRange.min &&
            levelBronze.value == levelBronze.min &&
            levelSilver.value == levelSilver.min &&
            levelGold.value == levelGold.min &&
            levelDiamond.value == levelDiamond.min &&
            saRange.value == saRange.min &&
            maRange.value == maRange.min
        ) {
            optionBase.classList.add("pressed");
            optionDefault.classList.remove("pressed");
            optionMaximum.classList.remove("pressed");
        }
        else if (
            evolveRange.value == evolveRange.min &&
            levelBronze.value == levelBronze.min &&
            levelSilver.value == levelSilver.min &&
            levelGold.value == levelGold.min &&
            levelDiamond.value == levelDiamond.min &&
            saRange.value == saRange.max &&
            maRange.value == maRange.max
        ) {
            optionBase.classList.remove("pressed");
            optionDefault.classList.add("pressed");
            optionMaximum.classList.remove("pressed");
        }
        else if (
            evolveRange.value == evolveRange.max &&
            levelDiamond.value == levelDiamond.max &&
            saRange.value == saRange.max &&
            maRange.value == maRange.max
        ) {
            optionBase.classList.remove("pressed");
            optionDefault.classList.remove("pressed");
            optionMaximum.classList.add("pressed");
        }
        else {
            optionBase.classList.remove("pressed");
            optionDefault.classList.remove("pressed");
            optionMaximum.classList.remove("pressed");
        }
    }

    function setValidInput(input, value) {
        if (isNaN(value)) {
            input.value = input.min;
        }
        else {
            input.value = Math.max(input.min, Math.min(value, input.max));
        }
        if (input.value == input.max) {
            input.classList.add("maxed");
        }
        else {
            input.classList.remove("maxed");
        }
    }

    function setAllToBase() {
        this.classList.add("pressed");
        optionDefault.classList.remove("pressed");
        optionMaximum.classList.remove("pressed");
        setValidInput(evolveRange, evolveRange.min);
        updateEvolve();
        setValidInput(levelRange, levelRange.min);
        setValidInput(levelBronze, levelBronze.min);
        setValidInput(levelSilver, levelSilver.min);
        setValidInput(levelGold, levelGold.min);
        setValidInput(levelDiamond, levelDiamond.min);
        setValidInput(saNumber, saNumber.min);
        setValidInput(saRange, saRange.min);
        setValidInput(maNumber, maNumber.min);
        setValidInput(maRange, maRange.min);
        updateCards();
    }

    function setAllToDefault() {
        optionBase.classList.remove("pressed");
        this.classList.add("pressed");
        optionMaximum.classList.remove("pressed");
        setValidInput(evolveRange, evolveRange.min);
        updateEvolve();
        setValidInput(levelRange, levelRange.min);
        setValidInput(levelBronze, levelBronze.min);
        setValidInput(levelSilver, levelSilver.min);
        setValidInput(levelGold, levelGold.min);
        setValidInput(levelDiamond, levelDiamond.min);
        setValidInput(saNumber, saNumber.max);
        setValidInput(saRange, saRange.max);
        setValidInput(maNumber, maNumber.max);
        setValidInput(maRange, maRange.max);
        updateCards();
    }

    function setAllToMaximum() {
        optionBase.classList.remove("pressed");
        optionDefault.classList.remove("pressed");
        this.classList.add("pressed");
        setValidInput(evolveRange, evolveRange.max);
        updateEvolve();
        setValidInput(levelRange, levelRange.max);
        setValidInput(levelBronze, levelBronze.max);
        setValidInput(levelSilver, levelSilver.max);
        setValidInput(levelGold, levelGold.max);
        setValidInput(levelDiamond, levelDiamond.max);
        setValidInput(saNumber, saNumber.max);
        setValidInput(saRange, saRange.max);
        setValidInput(maNumber, maNumber.max);
        setValidInput(maRange, maRange.max);
        updateCards();
    }

    function getMaximumLevel() {
        var max = 1;
        Math.max()
        if (evolveRange.value < 1 && max < levelBronze.value) {
            max = parseInt(levelBronze.value);
        }
        if (evolveRange.value < 2 && max < levelSilver.value) {
            max = parseInt(levelSilver.value);
        }
        if (evolveRange.value < 3 && max < levelGold.value) {
            max = parseInt(levelGold.value);
        }
        if (evolveRange.value < 4 && max < levelDiamond.value) {
            max = parseInt(levelDiamond.value);
        }
        return max;
    }

    function updateEvolve() {
        for (var i = 0; i < 4; i++) {
            if (i == evolveRange.value) {
                document.body.classList.add(tiers[i]);
            }
            else {
                document.body.classList.remove(tiers[i]);
            }
            if (i < parseInt(evolveRange.value) + 1) {
                evolveTiers[i].classList.add("underlined");
            }
            else {
                evolveTiers[i].classList.remove("underlined");
            }
            if (i < evolveRange.value) {
                levelTiers[i].classList.add("hidden");
            }
            else {
                levelTiers[i].classList.remove("hidden");
            }
        }
        setValidInput(levelRange, getMaximumLevel());
    }

    function setEvolveViaRange() {
        updateEvolve();
        updateBatchButtons();
        updateCardStats();
    }

    function setEvolveViaIcon() {
        evolveRange.value = evolveTiers.indexOf(this);
        updateEvolve();
        updateBatchButtons();
        updateCardStats();
    }

    function setLevelViaRange() {
        setValidInput(levelBronze, this.value);
        setValidInput(levelSilver, this.value);
        setValidInput(levelGold, this.value);
        setValidInput(levelDiamond, this.value);
        updateBatchButtons();
        updateCardStats();
    }

    function focusSelect() {
        this.select();
    }

    function setLevelViaNumber() {
        setValidInput(this, this.value);
        setValidInput(levelRange, getMaximumLevel());
        updateBatchButtons();
        updateCardStats();
    }

    function setSAViaNumber() {
        setValidInput(this, this.value);
        setValidInput(saRange, this.value);
        updateBatchButtons();
        updateCardSAs();
    }

    function setSAViaRange() {
        setValidInput(saNumber, this.value);
        updateBatchButtons();
        updateCardSAs();
    }

    function setMAViaNumber() {
        setValidInput(this, this.value);
        setValidInput(maRange, this.value);
        updateBatchButtons();
        updateCardMAs();
    }

    function setMAViaRange() {
        setValidInput(maNumber, this.value);
        updateBatchButtons();
        updateCardMAs();
    }

    optionBase.addEventListener("click", setAllToBase);
    optionDefault.addEventListener("click", setAllToDefault);
    optionMaximum.addEventListener("click", setAllToMaximum);

    evolveRange.addEventListener("change", setEvolveViaRange);
    evolveBronze.addEventListener("click", setEvolveViaIcon);
    evolveSilver.addEventListener("click", setEvolveViaIcon);
    evolveGold.addEventListener("click", setEvolveViaIcon);
    evolveDiamond.addEventListener("click", setEvolveViaIcon);

    levelRange.addEventListener("change", setLevelViaRange);
    levelBronze.addEventListener("focus", focusSelect);
    levelSilver.addEventListener("focus", focusSelect);
    levelGold.addEventListener("focus", focusSelect);
    levelDiamond.addEventListener("focus", focusSelect);
    levelBronze.addEventListener("change", setLevelViaNumber);
    levelSilver.addEventListener("change", setLevelViaNumber);
    levelGold.addEventListener("change", setLevelViaNumber);
    levelDiamond.addEventListener("change", setLevelViaNumber);

    saNumber.addEventListener("focus", focusSelect);
    saNumber.addEventListener("change", setSAViaNumber);
    saRange.addEventListener("change", setSAViaRange);

    maNumber.addEventListener("focus", focusSelect);
    maNumber.addEventListener("change", setMAViaNumber);
    maRange.addEventListener("change", setMAViaRange);

    optionDefault.click();
}

function initialize() {
    function initFooter() {
        initDock();
        initFilterMenu();
        initSortMenu();
        initOptionsMenu();
    }

    toggleLoadingScreen(true);
    Promise.all([
        loadJSON("data/fighters.json"),
        loadJSON("data/variants.json")
    ]).then(initCollection).then(initLanguageMenu).then(initFooter).then(toggleLoadingScreen);

}

document.addEventListener("DOMContentLoaded", initialize);
