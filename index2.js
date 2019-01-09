var moves, corpus;

var tiers = ["bronze", "silver", "gold"];
var characters = {
    "be": "image/official/Beowulf_MasteryIcon.png",
    "bb": "image/official/BigBand_MasteryIcon.png",
    "ce": "image/official/Cerebella_MasteryIcon.png",
    "do": "image/official/Double_MasteryIcon.png",
    "el": "image/official/Eliza_MasteryIcon.png",
    "fi": "image/official/Filia_MasteryIcon.png",
    "pw": "image/official/Painwheel_MasteryIcon.png",
    "pa": "image/official/Parasoul_MasteryIcon.png",
    "pe": "image/official/Peacock_MasteryIcon.png",
    "mf": "image/official/MsFortune_MasteryIcon.png",
    "sq": "image/official/Squigly_MasteryIcon.png",
    "va": "image/official/Valentine_MasteryIcon.png",
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

    function createBadge(key) {
        var badge = document.createElement("div");
            badge.className = "badge";
            var symbol = document.createElement("img");
                symbol.className = "symbol";
                symbol.src = "image/official/random_question.png";
            badge.appendChild(symbol);
            if (moves[key].type == 0) {
                var shellSrc = [
                    "image/official/SpecialFrame",
                    ["Bronze", "Silver", "Gold"][moves[key].tier],
                    ".png"
                ].join("");
                var shell = document.createElement("div");
                    shell.className = "shell";
                    var shell0 = document.createElement("img");
                        shell0.src = shellSrc;
                    shell.appendChild(shell0);
                    var shell1 = document.createElement("img");
                        shell1.src = shellSrc;
                    shell.appendChild(shell1);
                badge.appendChild(shell);
            }
            else {
                var shell = document.createElement("img");
                    shell.className = "shell";
                    shell.src = [
                        "image/official/BB-Frame",
                        Math.max(1, moves[key].strength),
                        ".png"
                    ].join("");
                    if (moves[key].tier == 0) {
                        shell.style.filter = "sepia(1) saturate(2.5) brightness(0.4) hue-rotate(315deg)";
                    }
                    else if (moves[key].tier == 2) {
                        shell.style.filter = "sepia(1) saturate(2)";
                    }
                badge.appendChild(shell);
                if (moves[key].strength == 3) {
                    var unblockable = document.createElement("div");
                        unblockable.className = "unblockable cinematic dependent-gradient";
                    badge.appendChild(unblockable);
                }
            }
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

    function createFlavor() {
        var quote = document.createElement("i");
            quote.className = "quote";
        return quote;
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
                ["sm", "bb"][moves[key].type],
                tiers[moves[key].tier]
            ].join(" ");
            card.id = key;
            card.appendChild(createBadge(key));
            card.appendChild(createTitle(key));
            card.appendChild(createFlavor());
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
            var substitute = Math.abs(substitutions[index]);
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
        console.log("Error: Could not format \"" + template + "\" with [" + substitutions + "].");
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
        var quote = card.getElementsByClassName("quote")[0];
        var gear = card.getElementsByClassName("gear")[0];
        tag.innerHTML = corpus[moves[key].title];
        if (corpus[moves[key].description]) {
            quote.innerHTML = corpus[moves[key].description];
        }
        gear.dataset.value = moves[key].gear;
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
    var searchMN = document.getElementById("search-mn");
    var searchD = document.getElementById("search-d");

    var filterCancel = document.getElementById("filter-cancel");

    var filterSMs = document.getElementById("filter-sms");
    var filterBBs = document.getElementById("filter-bbs");

    var filterBronze = document.getElementById("filter-bronze");
    var filterSilver = document.getElementById("filter-silver");
    var filterGold = document.getElementById("filter-gold");

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
            filterSMs.checked ||
            filterBBs.checked ||
            filterBronze.checked ||
            filterSilver.checked ||
            filterGold.checked ||
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
        if (searchMN.checked) {
            return sanitize(key).includes(query) || sanitize(corpus[moves[key].title]).includes(query);
        }
        else if (searchD.checked) {
            for (var feature of moves[key].ability.features) {
                if (removePlaceholders(sanitize(corpus[feature.description])).includes(query)) {
                    return true;
                }
            }
        }
        return false;
    }

    function typeCondition(card) {
        if (
            !filterSMs.checked &&
            !filterBBs.checked
        ) {
            return true;
        }
        var key = card.id;
        return (
            (filterSMs.checked && moves[key].type == 0) ||
            (filterBBs.checked && moves[key].type == 1)
        );
    }

    function tierCondition(card) {
        if (
            !filterBronze.checked &&
            !filterSilver.checked &&
            !filterGold.checked
        ) {
            return true;
        }
        var key = card.id;
        return (
            (filterBronze.checked && moves[key].tier == 0) ||
            (filterSilver.checked && moves[key].tier == 1) ||
            (filterGold.checked && moves[key].tier == 2)
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
            (filterBE.checked && moves[key].base == "be") ||
            (filterBB.checked && moves[key].base == "bb") ||
            (filterCE.checked && moves[key].base == "ce") ||
            (filterDO.checked && moves[key].base == "do") ||
            (filterEL.checked && moves[key].base == "el") ||
            (filterFI.checked && moves[key].base == "fi") ||
            (filterPW.checked && moves[key].base == "pw") ||
            (filterPA.checked && moves[key].base == "pa") ||
            (filterPE.checked && moves[key].base == "pe") ||
            (filterMF.checked && moves[key].base == "mf") ||
            (filterSQ.checked && moves[key].base == "sq") ||
            (filterVA.checked && moves[key].base == "va")
        );
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
        filterSMs.checked = false;
        filterBBs.checked = false;
        filterBronze.checked = false;
        filterSilver.checked = false;
        filterGold.checked = false;
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
    searchMN.addEventListener("change", filterCards);
    searchD.addEventListener("change", filterCards);

    filterCancel.addEventListener("change", cancelFilters);
    filterSMs.addEventListener("change", filterCards);
    filterBBs.addEventListener("change", filterCards);
    filterBronze.addEventListener("change", filterCards);
    filterSilver.addEventListener("change", filterCards);
    filterGold.addEventListener("change", filterCards);
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

    if (location.hash) {
        searchbox.value = decodeURIComponent(location.hash.replace(/#/g, ""));
    }
    searchMN.checked = true;
    filterCancel.click();
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
        savedButton = sortTier;
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
            damage.innerHTML = moves[key].damage[levelTiers[moves[key].tier].value - 1];
            if (moves[key].type == 0) {
                cooldown.innerHTML = moves[key].cooldown[levelTiers[moves[key].tier].value - 1] + " ";
            }
        }
        filterCards(); /* for the searchbox filter when language changes*/
        sortCards();
    }

    function getDescriptionTier(key, feature) {
        var fTiers = feature.tiers;
        if (feature.description == "SA_Valentine_BB4") {
            var fTiers = [ /* apk doesn't have this data for some reason */
                {"unlock": 1, "value": [0.15]},
                {"unlock": 9, "value": [0.2]},
                {"unlock": 15, "value": [0.25]}
            ];
        }
        var fTierValue = 0;
        for (var fTier of fTiers) {
            if (fTier.unlock > levelTiers[moves[key].tier].value) {
                break;
            }
            fTierValue = fTier.value;
        }
        return fTierValue;
    }

    function updateCardDescriptions() {
        for (var card of cards) {
            var key = card.id;
            var description = card.getElementsByClassName("description")[0];
            description.classList.add("hidden");
            for (var feature of moves[key].ability.features) {
                if (feature.description && corpus[feature.description]) {
                    description.innerHTML = format(corpus[feature.description], getDescriptionTier(key, feature));
                    description.classList.remove("hidden");
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
