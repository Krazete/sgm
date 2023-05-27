var moves, corpus;

var types = ["sms", "bbs"];
var tiers = ["bronze", "silver", "gold"];
var fighterIDs = ["an", "be", "bb", "bd", "ce", "do", "el", "fi", "fu", "mf", "pw", "pa", "pe", "rf", "sq", "um", "va"];
var characters = {
    "an": "image/official/Annie_MasteryIcon.png",
    "be": "image/official/Beowulf_MasteryIcon.png",
    "bb": "image/official/BigBand_MasteryIcon.png",
    "bd": "image/official/BlackDahlia_MasteryIcon.png",
    "ce": "image/official/Cerebella_MasteryIcon.png",
    "do": "image/official/Double_MasteryIcon.png",
    "el": "image/official/Eliza_MasteryIcon.png",
    "fi": "image/official/Filia_MasteryIcon.png",
    "fu": "image/official/Fukua_MasteryIcon.png",
    "mf": "image/official/MsFortune_MasteryIcon.png",
    "pw": "image/official/Painwheel_MasteryIcon.png",
    "pa": "image/official/Parasoul_MasteryIcon.png",
    "pe": "image/official/Peacock_MasteryIcon.png",
    "rf": "image/official/RoboFortune_MasteryIcon.png",
    "sq": "image/official/Squigly_MasteryIcon.png",
    "um": "image/official/Umbrella_MasteryIcon.png",
    "va": "image/official/Valentine_MasteryIcon.png"
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
            document.body.classList.add("error");
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
    var sms = responses[0];
    var bbs = responses[1];
    moves = Object.assign(sms, bbs);

    var collection = document.getElementById("collection");

    var lazyList = [];
    function lazyLoadImages() {
        for (var img of lazyList) {
            if (img.dataset.src) {
                var imgBox = img.getBoundingClientRect();
                if (imgBox.bottom > 0 && imgBox.top < innerHeight) {
                    img.src = img.dataset.src;
                    delete img.dataset.src;
                }
            }
        }
        requestAnimationFrame(lazyLoadImages);
    }

    function handleMissingSymbol() {
        var symbol = this;
        var card = symbol.parentElement.parentElement;
        symbol.classList.add("hidden");
        console.warn("Icon not found for move " + card.id + ".");
    }

    function createBadge(key) {
        var badge = document.createElement("div");
            badge.className = "badge";
            var symbol = document.createElement("img");
                symbol.className = "symbol";
                symbol.dataset.src = [
                    "image/move",
                    moves[key].icon
                ].join("/");
                symbol.addEventListener("error", handleMissingSymbol);
                lazyList.push(symbol);
            badge.appendChild(symbol);
        return badge;
    }

    function createTitle(key) {
        var title = document.createElement("div");
            title.className = "title";
            var icon = document.createElement("img");
                icon.className = "icon";
                icon.src = characters[moves[key].base];
            title.appendChild(icon);
            var tag = document.createElement("span");
                tag.className = "tag cinematic dependent-gradient";
            title.appendChild(tag);
        return title;
    }

    function createTable(key) {
        var table = document.createElement("table");
            table.className = "table";
            var row = table.insertRow();
            var cell = row.insertCell();
                cell.className = "damage";
            var cell = row.insertCell();
                var value = document.createElement("span");
                    value.className = "damage-value";
                cell.appendChild(value);
            if (moves[key].type == 0) {
                var row = table.insertRow();
                var cell = row.insertCell();
                    cell.className = "cooldown";
                var cell = row.insertCell();
                    var value = document.createElement("span");
                        value.className = "cooldown-value";
                    cell.appendChild(value);
                    var seconds = document.createElement("span");
                        seconds.className = "seconds";
                    cell.appendChild(seconds);
            }
        return table;
    }

    function createDescription() {
        var description = document.createElement("div");
            description.className = "description";
        return description;
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

    function createGear() {
        var gear = document.createElement("div");
            gear.className = "gear cinematic";
        return gear;
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
                "move card",
                types[moves[key].type],
                "bb" + moves[key].strength,
                tiers[moves[key].tier]
            ].join(" ");
            card.id = key;
            card.appendChild(createBadge(key));
            card.appendChild(createTitle(key));
            card.appendChild(createTable(key));
            card.appendChild(createDescription());
            card.appendChild(createGear());
            card.appendChild(createLock());
        return card;
    }

    for (var key in moves) {
        var card = createCard(key);
        collection.appendChild(card);
        cards.push(card);
    }

    lazyLoadImages();
}

function formatNumbers(text) {
    return text.replace(/(\d+(?:\.\d+)?%?)/g, "<span class=\"number\">$1</span>");
}

function format(template, substitutions) {
    var matches = template.match(/{\d+(?::P?\d+)?%?}%?/g);
    var formatted = template;
    if (matches) {
        for (var match of matches) {
            var index = parseInt(match.replace(/{(\d+)(?::P?\d+)?%?}%?/, "$1"));
            var substitute = substitutions ? Math.abs(substitutions[index]) : NaN;
            if (match.includes("%}") || match.includes(":P")) {
                substitute *= 100;
            }
            substitute = Math.round(substitute * 100) / 100; /* round to nearest 100th */
            if (match.includes("%") || match.includes(":P")) {
                substitute += "%";
            }
            formatted = formatted.replace(match, substitute);
        }
    }
    else {
        if (substitutions.length > 0) {
            console.log("Error: Could not format \"" + template + "\" with [" + substitutions + "].");
        }
    }
    return formatNumbers(formatted);
}

function initLanguageMenu() {
    var buttonSet = document.getElementById("language-menu");
    var buttons = Array.from(buttonSet.getElementsByTagName("input"));

    var savedLanguage = localStorage.getItem("language") || "en";
    var savedButton = document.getElementById(savedLanguage);

    function updateCardConstant(card) {
        var key = card.id;
        var tag = card.getElementsByClassName("tag")[0];
        var gear = card.getElementsByClassName("gear")[0];
        tag.innerHTML = corpus[moves[key].title];
        gear.dataset.value = moves[key].cost;
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

    if (!buttons.includes(savedButton)) {
        savedLanguage = "en";
        savedButton = document.getElementById("en");
    }
    document.documentElement.lang = savedLanguage;
    savedButton.checked = true;

    for (var button of buttons) {
        button.addEventListener("change", setLanguage);
    }

    return loadJSON("data/" + savedLanguage + ".json").then(updateCardConstants);
}

function initDock() {
    var zoomIn = document.getElementById("zoom-in");
    var zoomOut = document.getElementById("zoom-out");
    var settings = document.getElementById("settings");

    var menu = document.getElementById("menu");
    var optionsMenu = document.getElementById("options-menu");
    var filterMenu = document.getElementById("filter-menu");
    var sortMenu = document.getElementById("sort-menu");

    var savedZoom = localStorage.getItem("zoom");
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
            localStorage.removeItem("zoom");
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
            localStorage.removeItem("zoom");
        }
        else {
            document.body.classList.add("zoomed-in");
            zoomIn.classList.add("pressed");
            localStorage.setItem("zoom", this.id);
        }
        setScrollRatio(scrollRatio);
    }

    function toggleMenu() {
        if (this.classList.contains("glowing")) {
            this.classList.remove("glowing");
            menu.classList.add("hidden");
        }
        else {
            this.classList.add("glowing");
            menu.classList.remove("hidden");
            filterMenu.scrollTo(0, 0);
            sortMenu.scrollTo(0, 0);
        }
    }

    zoomOut.addEventListener("click", decreaseZoom);
    zoomIn.addEventListener("click", increaseZoom);

    settings.addEventListener("click", toggleMenu);

    if (savedButton == zoomOut || savedButton == zoomIn) {
        savedButton.click();
    }
}

function initFilterMenu() {
    var searchbox = document.getElementById("searchbox");
    var searchN = document.getElementById("search-n");
    var searchA = document.getElementById("search-a");

    var filterCancel = document.getElementById("filter-cancel");

    var filterCancel = document.getElementById("filter-cancel");
    var filterTypes = types.map(function (type) {
        return document.getElementById("filter-" + type);
    });
    var filterTiers = tiers.map(function (tier) {
        return document.getElementById("filter-" + tier);
    });
    var filterFighters = fighterIDs.map(function (fighter) {
        return document.getElementById("filter-" + fighter);
    });
    var filters = [].concat(filterTypes, filterTiers, filterFighters);

    function updateFilterCancel() {
        if (filters.some(function (filter) {
            return filter.checked;
        })) {
            filterCancel.checked = false;
        }
        else {
            filterCancel.checked = true;
        }
    }

    function sanitize(text) {
        if (text) {
            return text.toLocaleLowerCase(document.documentElement.lang).replace(/\s+/g, " ").trim();
        }
        return "";
    }

    function removePlaceholders(template) {
        if (template) {
            return template.replace(/{\d+(?::\d+)?%?}%?/g, "");
        }
        return "";
    }

    function searchCondition(card) {
        if (!searchbox.value) {
            return true;
        }
        var key = card.id;
        var query = sanitize(searchbox.value);
        if (searchN.checked) {
            return sanitize(key).includes(query) || sanitize(corpus[moves[key].title]).includes(query);
        }
        else if (searchA.checked) {
            if ("ability" in moves[key] && "features" in moves[key].ability) {
                for (var feature of moves[key].ability.features) {
                    if (removePlaceholders(sanitize(corpus[feature.description])).includes(query)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function typeCondition(card) {
        if (filterTypes.every(function (filter) {
            return !filter.checked;
        })) {
            return true;
        }
        var key = card.id;
        return filterTypes.some(function (filter, i) {
            return filter.checked && moves[key].type == i;
        });
    }

    function tierCondition(card) {
        if (filterTiers.every(function (filter) {
            return !filter.checked;
        })) {
            return true;
        }
        var key = card.id;
        return filterTiers.some(function (filter, i) {
            return filter.checked && moves[key].tier == i;
        });
    }

    function fighterCondition(card) {
        if (filterFighters.every(function (filter) {
            return !filter.checked;
        })) {
            return true;
        }
        var key = card.id;
        return filterFighters.some(function (filter, i) {
            return filter.checked && moves[key].base == fighterIDs[i];
        });
    }

    filterCards = function () {
        for (var card of cards) {
            if (
                searchCondition(card) &&
                typeCondition(card) &&
                tierCondition(card) &&
                fighterCondition(card)
            ) {
                card.classList.remove("hidden");
            }
            else {
                card.classList.add("hidden");
            }
        }
        updateFilterCancel();
    };

    function cancelFilters() {
        for (var filter of filters) {
            filter.checked = false;
        }
        filterCards();
    }

    function pressEnter(e) {
        if (e.keyCode == 13 || e.key == "Enter" || e.code == "Enter") {
            searchbox.blur();
        }
    }

    searchbox.addEventListener("keydown", pressEnter);
    searchbox.addEventListener("input", filterCards);
    searchN.addEventListener("change", filterCards);
    searchA.addEventListener("change", filterCards);

    filterCancel.addEventListener("change", cancelFilters);
    for (var filter of filters) {
        filter.addEventListener("change", filterCards);
    }

    if (location.hash) {
        searchbox.value = decodeURIComponent(location.hash.replace(/#/g, ""));
    }
    searchN.checked = true;
    filterTiers[2].click();
}

function sortCards() {
    cards.sort(sortBasis);
    for (var card of cards) {
        card.parentElement.appendChild(card);
    }
}

function initSortMenu() {
    var sortDamage = document.getElementById("sort-damage");
    var sortAlphabetical = document.getElementById("sort-abc");
    var sortTier = document.getElementById("sort-tier");
    var sortType = document.getElementById("sort-type");

    var savedBasis = localStorage.getItem("basis2") || "sort-tier";
    var savedButton = document.getElementById(savedBasis);

    function alphabeticalBasis(a, b) {
        var A = moves[a.id].base + corpus[moves[a.id].title];
        var B = moves[b.id].base + corpus[moves[b.id].title];
        return A > B ? 1 : A < B ? -1 : 0;
    }

    function damageBasis(a, b) {
        var A = moves[a.id].damage[0];
        var B = moves[b.id].damage[0];
        var C = B - A;
        if (C == 0) {
            return alphabeticalBasis(a, b);
        }
        return C;
    }

    function tierBasis(a, b) {
        var A = moves[a.id].tier;
        var B = moves[b.id].tier;
        var C = B - A;
        if (C == 0) {
            return alphabeticalBasis(a, b);
        }
        return C;
    }

    function typeBasis(a, b) {
        var A = moves[a.id].type;
        var B = moves[b.id].type;
        var C = A - B;
        if (C == 0) {
            return tierBasis(a, b);
        }
        return C;
    }

    function sorter(basis) {
        return function () {
            sortBasis = basis;
            sortCards();
            localStorage.setItem("basis2", this.id);
        };
    }

    sortDamage.addEventListener("change", sorter(damageBasis));
    sortAlphabetical.addEventListener("change", sorter(alphabeticalBasis));
    sortTier.addEventListener("change", sorter(tierBasis));
    sortType.addEventListener("change", sorter(typeBasis));

    if (![
        sortDamage,
        sortAlphabetical,
        sortTier,
        sortType
    ].includes(savedButton)) {
        savedButton = sortAlphabetical;
    }
    savedButton.checked = false; /* resets radio so change event can be triggered */
    savedButton.click();
}

function initOptionsMenu() {
    var levelRange = document.getElementById("level-range");
    var levelBronze = document.getElementById("level-bronze");
    var levelSilver = document.getElementById("level-silver");
    var levelGold = document.getElementById("level-gold");
    var levelTiers = [levelBronze, levelSilver, levelGold];

    function updateCardStats() {
        for (var card of cards) {
            var key = card.id;
            var damage = card.getElementsByClassName("damage-value")[0];
            var cooldown = card.getElementsByClassName("cooldown-value")[0];
            // var bar = moves[key].superbar;
            // damage.className = "damage-value " + (
            //     typeof bar == "undefined" || bar <= 0 ? "none" :
            //     bar <= 100 ? "very-low" :
            //     bar <= 200 ? "low" :
            //     bar <= 300 ? "medium" :
            //     bar <= 400 ? "high" :
            //     bar <= 500 ? "very-high" :
            //     "ultra"
            // );
            damage.innerHTML = "";
            for (var i = 0; i < moves[key].damage[levelTiers[moves[key].tier].value - 1]; i++) {
                var plus = document.createElement("img");
                plus.className = "plus";
                plus.src = "image/official/plus.png";
                damage.appendChild(plus);
            }
            if (moves[key].type == 0) {
                cooldown.innerHTML = moves[key].cooldown[levelTiers[moves[key].tier].value - 1] + " ";
            }
        }
        filterCards(); /* for the searchbox filter when language changes*/
        sortCards();
    }

    function getDescriptionTier(key, feature) {
        var fTierValue = 0;
        for (var fTier of feature.tiers) {
            if (fTier.level > levelTiers[moves[key].tier].value) {
                break;
            }
            fTierValue = fTier.values;
        }
        return fTierValue;
    }

    function updateCardDescriptions() {
        for (var card of cards) {
            var key = card.id;
            var description = card.getElementsByClassName("description")[0];
            description.classList.add("hidden");
            description.innerHTML = "";
            if ("ability" in moves[key] && "features" in moves[key].ability) {
                for (var feature of moves[key].ability.features) {
                    if (feature.description && corpus[feature.description]) {
                        var fDescription = document.createElement("div");
                        fDescription.innerHTML = format(corpus[feature.description], getDescriptionTier(key, feature));
                        description.appendChild(fDescription);
                        description.classList.remove("hidden");
                    }
                }
            }
        }
    }

    updateCards = function () {
        updateCardStats();
        updateCardDescriptions();
    };

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

    function setLevelViaRange() {
        setValidInput(levelBronze, this.value);
        setValidInput(levelSilver, this.value);
        setValidInput(levelGold, this.value);
        updateCards();
    }

    function focusSelect() {
        this.select();
    }

    function setLevelViaNumber() {
        setValidInput(this, this.value);
        setValidInput(levelRange, Math.max(
            levelBronze.value,
            levelSilver.value,
            levelGold.value
        ));
        updateCards();
    }

    levelRange.addEventListener("change", setLevelViaRange);
    levelBronze.addEventListener("focus", focusSelect);
    levelSilver.addEventListener("focus", focusSelect);
    levelGold.addEventListener("focus", focusSelect);
    levelBronze.addEventListener("change", setLevelViaNumber);
    levelSilver.addEventListener("change", setLevelViaNumber);
    levelGold.addEventListener("change", setLevelViaNumber);

    updateCards();
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
        loadJSON("data/sms.json"),
        loadJSON("data/bbs.json")
    ]).then(initCollection).then(initLanguageMenu).then(initFooter).then(toggleLoadingScreen);

}

document.addEventListener("DOMContentLoaded", initialize);
