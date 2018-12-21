var corpus, fighters, variants;
var collection, order, sa, ma, red;
var mastery, element;
var loading;

var tiers = ["bronze", "silver", "gold", "diamond"];
var elements = ["neutral", "fire", "water", "wind", "dark", "light"];


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
            reject(new Error("Could not load '" + path + "'."));
        };
        xhr.send();
    }
    return new Promise(request);
}

function saveItem(key, item) {
    try {
        var itemJSON = JSON.stringify(item);
        localStorage.setItem(key, itemJSON);
    }
    catch (e) {
        console.log(e);
    }
}

function loadItem(key, defaultItem) {
    try {
        var itemJSON = localStorage.getItem(key);
        var item = JSON.parse(itemJSON);
        if (item != null) {
            return item;
        }
    }
    catch (e) {
        console.log(e);
    }
    return defaultItem;
}

function initialize() {
    initLanguageMenu();
    initDock();
    initOptionsMenu();
    initFilterMenu();
    initSortMenu();

    collection = document.getElementById("collection");
    sa = document.getElementById("sa");
    ma = document.getElementById("ma");
    red = document.getElementById("red");
    mastery = document.getElementById("mastery");
    element = document.getElementById("element");
    loading = document.getElementById("loading");
    if (typeof order == "undefined") {
        order = byAlpha;
    }

    function callback(responses) {
        corpus = responses[0];
        fighters = responses[1];
        variants = responses[2];
        init(sa.value - 1, ma.value - 1);
        // sort(order);
    }

    Promise.all([
        loadJSON("./data/fighters.json"),
        loadJSON("./data/variants.json")
    ]).then(callback);

    addEventListener("beforeunload", e=>document.getElementById("zoom-out").click());
}






function initLanguageMenu() {
    var buttonSet = document.getElementById("language-menu");
    var buttons = buttonSet.getElementsByTagName("input");
    var savedLanguage = loadItem("language", "en");
    var savedButton = document.getElementById(savedLanguage);

    function setLanguage() {
        var language = this.id;
        document.documentElement.lang = language;
        document.body.classList.add("loading");
        saveItem("language", language);
        loadJSON("data/" + language + ".json").then(callback);
    }

    function callback() { /* TODO: figure out what to do about loading language data and loading character data */
        document.body.classList.remove("loading");
        initCards();
    }

    for (var button of buttons) {
        button.addEventListener("change", setLanguage);
    }
    savedButton.click();
}

function initCards() {
    init();
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

    function getScrollRatio() {
        var scrollHeight = document.documentElement.scrollHeight - innerHeight;
        return scrollY / scrollHeight;
    }

    function setScrollRatio(scrollRatio) {
        var scrollHeight = document.documentElement.scrollHeight - innerHeight;
        scrollTo(0, scrollHeight * scrollRatio);
    }

    function decreaseZoom() { /* TODO: save zoom settings */
        var scrollRatio = getScrollRatio();
        if (document.body.classList.contains("zoomed-in")) {
            document.body.classList.remove("zoomed-in");
            zoomIn.classList.remove("pressed");
        }
        else {
            document.body.classList.add("zoomed-out");
            zoomOut.classList.add("pressed");
        }
        setScrollRatio(scrollRatio);
    }

    function increaseZoom() {
        var scrollRatio = getScrollRatio();
        if (document.body.classList.contains("zoomed-out")) {
            document.body.classList.remove("zoomed-out");
            zoomOut.classList.remove("pressed");
        }
        else {
            document.body.classList.add("zoomed-in");
            zoomIn.classList.add("pressed");
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
            optionsMenu.scrollTo(0, 0); /* TODO: check if this scroll method is okay */
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

    function setAllToBase() {
        this.classList.add("pressed");
        optionDefault.classList.remove("pressed");
        optionMaximum.classList.remove("pressed");
        setValidInput(evolveRange, evolveRange.min);
        evolveBronze.classList.add("glowing");
        evolveSilver.classList.remove("glowing");
        evolveGold.classList.remove("glowing");
        evolveDiamond.classList.remove("glowing");
        setEvolve();
        setValidInput(levelRange, levelRange.min);
        setValidInput(levelBronze, levelBronze.min);
        setValidInput(levelSilver, levelSilver.min);
        setValidInput(levelGold, levelGold.min);
        setValidInput(levelDiamond, levelDiamond.min);
        setValidInput(saNumber, saNumber.min);
        setValidInput(saRange, saRange.min);
        setValidInput(maNumber, maNumber.min);
        setValidInput(maRange, maRange.min);
    }

    function setAllToDefault() {
        optionBase.classList.remove("pressed");
        this.classList.add("pressed");
        optionMaximum.classList.remove("pressed");
        setValidInput(evolveRange, evolveRange.min);
        evolveBronze.classList.add("glowing");
        evolveSilver.classList.remove("glowing");
        evolveGold.classList.remove("glowing");
        evolveDiamond.classList.remove("glowing");
        setEvolve();
        setValidInput(levelRange, levelRange.min);
        setValidInput(levelBronze, levelBronze.min);
        setValidInput(levelSilver, levelSilver.min);
        setValidInput(levelGold, levelGold.min);
        setValidInput(levelDiamond, levelDiamond.min);
        setValidInput(saNumber, saNumber.max);
        setValidInput(saRange, saRange.max);
        setValidInput(maNumber, maNumber.max);
        setValidInput(maRange, maRange.max);
    }

    function setAllToMaximum() {
        optionBase.classList.remove("pressed");
        optionDefault.classList.remove("pressed");
        this.classList.add("pressed");
        setValidInput(evolveRange, evolveRange.max);
        evolveBronze.classList.add("glowing");
        evolveSilver.classList.add("glowing");
        evolveGold.classList.add("glowing");
        evolveDiamond.classList.add("glowing");
        setEvolve();
        setValidInput(levelRange, levelRange.max);
        setValidInput(levelBronze, levelBronze.max);
        setValidInput(levelSilver, levelSilver.max);
        setValidInput(levelGold, levelGold.max);
        setValidInput(levelDiamond, levelDiamond.max);
        setValidInput(saNumber, saNumber.max);
        setValidInput(saRange, saRange.max);
        setValidInput(maNumber, maNumber.max);
        setValidInput(maRange, maRange.max);
    }

    function setEvolve() {
        for (var i = 0; i < 4; i++) {
            if (i == evolveRange.value) {
                document.body.classList.add(tiers[i]);
            }
            else {
                document.body.classList.remove(tiers[i]);
            }
            if (i < evolveRange.value) {
                levelTiers[i].classList.add("hidden");
            }
            else {
                levelTiers[i].classList.remove("hidden");
            }
        }
        setValidInput(levelRange, getMaxLevelNumber());
    }

    function setEvolveViaRange() {
        var value = parseInt(this.value);
        for (var i = 0; i < value + 1; i++) {
            evolveTiers[i].classList.add("glowing");
        }
        for (var i = value + 1; i < 4; i++) {
            evolveTiers[i].classList.remove("glowing");
        }
        updateBatchButtons();
        setEvolve();
    }

    function setEvolveViaIcon() {
        var value = evolveTiers.indexOf(this);
        evolveRange.value = value;
        for (var i = 0; i < value + 1; i++) {
            evolveTiers[i].classList.add("glowing");
        }
        for (var i = value + 1; i < 4; i++) {
            evolveTiers[i].classList.remove("glowing");
        }
        updateBatchButtons();
        setEvolve();
    }

    function setValidInput(input, value) {
        input.value = Math.max(input.min, Math.min(value, input.max));
        if (input.value == input.max) {
            input.classList.add("maxed");
        }
        else {
            input.classList.remove("maxed");
        }
    }

    function setLevelViaRange() {
        setValidInput(levelBronze, this.value);
        setValidInput(levelSilver, this.value);
        setValidInput(levelGold, this.value);
        setValidInput(levelDiamond, this.value);
        updateBatchButtons();
    }

    function getMaxLevelNumber() {
        var max = 1;
        if (evolveRange.value < 1 && max < parseInt(levelBronze.value)) {
            max = levelBronze.value;
        }
        if (evolveRange.value < 2 && max < parseInt(levelSilver.value)) {
            max = levelSilver.value;
        }
        if (evolveRange.value < 3 && max < parseInt(levelGold.value)) {
            max = levelGold.value;
        }
        if (evolveRange.value < 4 && max < parseInt(levelDiamond.value)) {
            max = levelDiamond.value;
        }
        return max;
    }

    function setLevelViaNumber() {
        setValidInput(this, this.value);
        setValidInput(levelRange, getMaxLevelNumber());
        updateBatchButtons();
    }

    function setSAViaNumber() {
        setValidInput(this, this.value);
        setValidInput(saRange, this.value);
        updateBatchButtons();
    }

    function setSAViaRange() {
        setValidInput(saNumber, this.value);
        updateBatchButtons();
    }

    function setMAViaNumber() {
        setValidInput(this, this.value);
        setValidInput(maRange, this.value);
        updateBatchButtons();
    }

    function setMAViaRange() {
        setValidInput(maNumber, this.value);
        updateBatchButtons();
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
    levelBronze.addEventListener("change", setLevelViaNumber);
    levelSilver.addEventListener("change", setLevelViaNumber);
    levelGold.addEventListener("change", setLevelViaNumber);
    levelDiamond.addEventListener("change", setLevelViaNumber);

    saNumber.addEventListener("change", setSAViaNumber);
    saRange.addEventListener("change", setSAViaRange);

    maNumber.addEventListener("change", setMAViaNumber);
    maRange.addEventListener("change", setMAViaRange);

    optionDefault.click();
}

function initFilterMenu() {
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

    function idk() {
        console.log(this);
        updateFilterCancel();
    }

    filterCancel.addEventListener("change", idk);
    filterBronze.addEventListener("change", idk);
    filterSilver.addEventListener("change", idk);
    filterGold.addEventListener("change", idk);
    filterDiamond.addEventListener("change", idk);
    filterFire.addEventListener("change", idk);
    filterWater.addEventListener("change", idk);
    filterWind.addEventListener("change", idk);
    filterLight.addEventListener("change", idk);
    filterDark.addEventListener("change", idk);
    filterNeutral.addEventListener("change", idk);
    filterBE.addEventListener("change", idk);
    filterBB.addEventListener("change", idk);
    filterCE.addEventListener("change", idk);
    filterDO.addEventListener("change", idk);
    filterEL.addEventListener("change", idk);
    filterFI.addEventListener("change", idk);
    filterPW.addEventListener("change", idk);
    filterPA.addEventListener("change", idk);
    filterPE.addEventListener("change", idk);
    filterMF.addEventListener("change", idk);
    filterSQ.addEventListener("change", idk);
    filterVA.addEventListener("change", idk);

    filterCancel.click();
}

function initSortMenu() {
    var sortAlphabetical = document.getElementById("sort-abc");
    var sortFighterScore = document.getElementById("sort-fs");
    var sortAttack = document.getElementById("sort-atk");
    var sortHealth = document.getElementById("sort-hp");
    var sortElement = document.getElementById("sort-element");
    var sortTier = document.getElementById("sort-tier");

    function idk() {
        console.log(this);
    }

    sortAlphabetical.addEventListener("change", idk);
    sortFighterScore.addEventListener("change", idk);
    sortAttack.addEventListener("change", idk);
    sortHealth.addEventListener("change", idk);
    sortElement.addEventListener("change", idk);
    sortTier.addEventListener("change", idk);

    sortAlphabetical.click();
}










function changeLanguage(language) {
    saveLanguage(language);
    resetCollection();
    initialize();
}

function saveLanguage(language) {
    localStorage.setItem("language", language);
}

function resetCollection() {
    // collection.innerHTML = "";
    collection.appendChild(loading);
}









/* COMPLETE */

function handleUnknownPortrait() {
    this.classList.add("hidden");
    this.parentElement.addEventListener("click", function () {
        open("https://github.com/Krazete/sgm#readme"); /* TODO: add a image section to the readme */
    });
    this.parentElement.parentElement.parentElement.classList.add("unknown");
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
                    var stem = ["image/portrait", variants[key].base, key].join("/");
                    if (key == "rBlight") {
                        var r = Math.floor(Math.random() * 7);
                        stem += "_" + r;
                    }
                    portrait.src = stem + ".png";
                    portrait.addEventListener("error", handleUnknownPortrait);
                backdrop.appendChild(portrait);
            frame.appendChild(backdrop);
        avatar.appendChild(frame);
        var nameplate = document.createElement("div");
            nameplate.className = "nameplate cinematic";
            var variantName = document.createElement("div");
                variantName.className = "dependent-gradient";
                variantName.innerHTML = corpus[variants[key].name];
            nameplate.appendChild(variantName);
            var fighterName = document.createElement("div");
                fighterName.className = "smaller";
                fighterName.innerHTML = corpus[fighters[variants[key].base].name];
            nameplate.appendChild(fighterName);
        avatar.appendChild(nameplate);
    return avatar;
}

function createQuote(key) {
    var quote = document.createElement("q");
        quote.className = "quote";
        quote.innerHTML = corpus[variants[key].quote];
    return quote;
}

function createWordBreak() {
    var wbr = document.createElement("wbr");
    return wbr;
}

function createStat(type, value) {
    var stat = document.createElement("div");
        stat.className = ["tagged", type].join(" ");
        stat.appendChild(createWordBreak());
        var span = document.createElement("span");
            span.className = "cinematic numeric silver-gradient";
            span.innerHTML = value.toLocaleString();
        stat.appendChild(span);
    return stat;
}

function filterCards(condition) {
    var cards = document.getElementsByClassName("card");
    for (var card of cards) {
        if (condition(card.id)) {
            card.classList.remove("hidden");
        }
        else {
            card.classList.add("hidden");
        }
    }
}

function createAbility(type, titleText, descriptionTexts) {
    var ability = document.createElement("div");
        ability.className = ["ability", type].join(" ");
        var abilityName = document.createElement("div");
            abilityName.className = "ability-name cinematic";
            var label = document.createElement("span");
                label.className = "ability-label gold-gradient";
            abilityName.appendChild(label);
            abilityName.appendChild(createWordBreak());
            var span = document.createElement("span");
                span.className = "silver-gradient";
                span.innerHTML = titleText;
            abilityName.appendChild(span);
            abilityName.addEventListener("click", collapse);
        ability.appendChild(abilityName);
        for (var descriptionText of descriptionTexts) {
            var description = document.createElement("div");
                description.className = "description smaller";
                description.innerHTML = descriptionText;
            ability.appendChild(description);
        }
    return ability;
}

function collapse() {
    if (this.parentElement.classList.contains("collapsed")) {
        this.parentElement.classList.remove("collapsed");
    }
    else {
        this.parentElement.classList.add("collapsed");
    }
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
            substitute = Math.round(substitute * 10) / 10;
            if (match.includes("%")) {
                substitute += "%";
            }
            formatted = formatted.replace(match, substitute);
        }
    }
    else {
        console.log(template, substitutions);
    }
    return markedNumbers(formatted);
}

function markedNumbers(text) {
    return text.replace(/(\d+(?:\.\d+)?%?)/g, "<span class=\"number\">$1</span>");
}

/* UNDER CONSTRUCTION */

function createCA(key) {
    var type = "ca collapsed";
    var titleText = corpus[fighters[variants[key].base].characterability.title];
    var descriptionTexts = [
        markedNumbers(corpus[fighters[variants[key].base].characterability.description])
    ];
    return createAbility(type, titleText, descriptionTexts);
}

function createSA(key, n) {
    var type = "sa";
    var titleText = corpus[variants[key].signature.title];
    var descriptionTexts = [];
    for (var feature of variants[key].signature.features) {
        var template = corpus[feature.description];
        var substitutions = feature.tiers.slice(n)[0];
        var descriptionText = format(template, substitutions);
        descriptionTexts.push(descriptionText);
    }
    return createAbility(type, titleText, descriptionTexts);
}

function createMA(key, n) {
    var type = "ma collapsed";
    var titleText = corpus[fighters[variants[key].base].marquee.title];
    var descriptionTexts = [];
    for (var feature of fighters[variants[key].base].marquee.features) {
        var template = corpus[feature.description];
        var substitutions = feature.tiers.slice(n)[0];
        var descriptionText = [
            corpus[feature.title],
            format(template, substitutions)
        ].join(" - ");
        descriptionTexts.push(descriptionText);
    }
    return createAbility(type, titleText, descriptionTexts);
}

function createWikia(key) {
    var wikia = document.createElement("a");
        wikia.className = "wikia icon";
        wikia.target = "_blank";
        wikia.href = [
            "https://skullgirlsmobile.wikia.com/wiki",
            wikia_paths[key]
        ].join("/");
    return wikia;
}

function createLock() {
    var lock = document.createElement("img");
        lock.className = "lock";
        lock.src = "image/official/Lock.png";
        lock.addEventListener("click", lockCard);
    return lock;
}

function lockCard() {
    var card = this.parentElement;
    if (card.classList.contains("locked")) {
        card.classList.remove("locked");
    }
    else {
        card.classList.add("locked");
    }
}

/* TODO: review all these links */
var wikia_paths = { /* from English corpus */
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

function init(sa, ma) {
    for (var key in variants) {
        var atk = variants[key].baseStats[0].attack;
        var hp = variants[key].baseStats[0].lifebar;
        var fs = Math.ceil((atk + hp / 6) * 7 / 10);
        var card = document.createElement("div");
            card.className = [
                "card",
                variants[key].base,
                tiers[variants[key].tier],
                elements[variants[key].element]
            ].join(" ");
            card.id = key;
            card.appendChild(createAvatar(key));
            card.appendChild(createQuote(key));
            card.appendChild(createStat("atk", atk));
            card.appendChild(createStat("hp", hp));
            card.appendChild(createStat("fs", fs));
            card.appendChild(createCA(key));
            card.appendChild(createSA(key, sa));
            card.appendChild(createMA(key, ma));
            card.appendChild(createWikia(key));
            card.appendChild(createLock());
        collection.appendChild(card);
    }
}
























function sort(method) {
    var sorted = Object.keys(variants).sort(method);
    for (var id of sorted) {
        var card = document.getElementById(id);
        collection.appendChild(card);
    }
    order = method;
}

function byAlpha(a, b) {
    var varA = variants[a];
    var varB = variants[b];
    var A = fighters[varA.base].name + varA.name;
    var B = fighters[varB.base].name + varB.name;
    return A > B ? 1 : A < B ? -1 : 0;
}
function byHP(a, b) {
    var varA = variants[a];
    var varB = variants[b];
    var A = varA.baseStats[varA.baseStats.length - 1];
    var B = varB.baseStats[varB.baseStats.length - 1];
    return B.lifebar - A.lifebar;
}
function byAttack(a, b) {
    var varA = variants[a];
    var varB = variants[b];
    var A = varA.baseStats[varA.baseStats.length - 1];
    var B = varB.baseStats[varB.baseStats.length - 1];
    return B.attack - A.attack;
}
function byFS(a, b) {
    var varA = variants[a];
    var varB = variants[b];
    var A = varA.baseStats[varA.baseStats.length - 1];
    var B = varB.baseStats[varB.baseStats.length - 1];
    return fightScore(B) - fightScore(A);
}

function fightScore(f) {
    return (f.lifebar / 6 + f.attack) * 7 / 10;
}

function toggle(e, blah) {
    var noneChecked = true;
    var hideList = new Set();
    var option = e.id;
    var labels = e.children;
    var cards = document.getElementsByClassName("card");

    for (var label of labels) {
        var input = label.children[0];
        if (input.checked) {
            noneChecked = false;
        }
        else {
            hideList.add(input.value);
        }
    }
    if (noneChecked) {
        hideList.clear();
    }

    for (var card of cards) {
        var hid = false;
        for (var fid of hideList) {
            if (card.classList.contains(fid)) {
                card.classList.add("hidden");
                hid = true;
                break;
            }
        }
        if (!hid && typeof blah == "undefined") {
            card.classList.remove("hidden");
        }
    }
}

document.addEventListener("DOMContentLoaded", initialize);
