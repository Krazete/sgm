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
        // document.body.classList.add("loading");
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
                        unblockable.className = "cinematic dependent-gradient";
                        unblockable.innerHTML = "UNBLOCKABLE";
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
            else {
                var row = table.insertRow();
                var cell = row.insertCell();
                    cell.className = "damage";
                var cell = row.insertCell();
                    var value = document.createElement("span");
                        value.className = "damage-value";
                    cell.appendChild(value);
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
        var description = card.getElementsByClassName("description")[0];
        tag.innerHTML = corpus[moves[key].title];
        if (corpus[moves[key].description]) {
            quote.innerHTML = corpus[moves[key].description];
        }
        description.classList.add("hidden");
        for (var feature of moves[key].ability.features) {
            if (feature.description && corpus[feature.description]) {
                var tiers = feature.tiers;
                if (feature.description == "SA_Valentine_BB4") {
                    console.log(feature);
                    var tiers = [[0.15], [0.2], [0.25]];
                    console.log(corpus[feature.description]);
                }
                description.innerHTML = format(corpus[feature.description], tiers[tiers.length - 1]);
                description.classList.remove("hidden");
            }
        }
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
            optionsMenu.scrollTo(0, 0);
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
    var searchVN = document.getElementById("search-vn");
    var searchCA = document.getElementById("search-ca");
    var searchSA = document.getElementById("search-sa");
    var searchMA = document.getElementById("search-ma");

    var filterCancel = document.getElementById("filter-cancel");

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
        return text.toLocaleLowerCase(document.documentElement.lang).replace(/\s+/g, " ").trim();
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
            return sanitize(key).includes(query) || sanitize(corpus[moves[key].name]).includes(query);
        }
        else if (searchCA.checked) {
            return removePlaceholders(sanitize(corpus[moves[moves[key].base].ca.description])).includes(query);
        }
        else if (searchSA.checked) {
            for (var feature of moves[key].sa.features) {
                if (removePlaceholders(sanitize(corpus[feature.description])).includes(query)) {
                    return true;
                }
            }
        }
        else if (searchMA.checked) {
            for (var feature of moves[moves[key].base].ma.features) {
                if (removePlaceholders(sanitize(corpus[feature.description])).includes(query)) {
                    return true;
                }
            }
        }
        return false;
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
    searchVN.addEventListener("change", filterCards);
    searchCA.addEventListener("change", filterCards);
    searchSA.addEventListener("change", filterCards);
    searchMA.addEventListener("change", filterCards);

    filterCancel.addEventListener("change", cancelFilters);
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
    var sortTier = document.getElementById("sort-tier");

    var savedBasis = localStorage.getItem("basis") || "sort-fs";
    var savedButton = document.getElementById(savedBasis);

    function alphabeticalBasis(a, b) {
        var A = corpus[moves[bbs[a.id].base].name] + corpus[bbs[a.id].name];
        var B = corpus[moves[bbs[b.id].base].name] + corpus[bbs[b.id].name];
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

    function tierBasis(a, b) {
        var A = bbs[a.id].tier;
        var B = bbs[b.id].tier;
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
        };
    }

    sortFighterScore.addEventListener("change", sorter(fighterScoreBasis));
    sortAttack.addEventListener("change", sorter(attackBasis));
    sortHealth.addEventListener("change", sorter(healthBasis));
    sortAlphabetical.addEventListener("change", sorter(alphabeticalBasis));
    sortTier.addEventListener("change", sorter(tierBasis));

    if (![
        sortFighterScore,
        sortAttack,
        sortHealth,
        sortAlphabetical,
        sortTier
    ].includes(savedButton)) {
        savedButton = sortFighterScore;
    }
    savedButton.checked = false; /* resets radio so change event can be triggered */
    savedButton.click();
}

function initOptionsMenu() {
    var optionBase = document.getElementById("option-base");
    var optionDefault = document.getElementById("option-default");
    var optionMaximum = document.getElementById("option-maximum");

    var levelRange = document.getElementById("level-range");
    var levelBronze = document.getElementById("level-bronze");
    var levelSilver = document.getElementById("level-silver");
    var levelGold = document.getElementById("level-gold");
    var levelTiers = [levelBronze, levelSilver, levelGold];

    var treeNone = document.getElementById("tree-none");
    var treeAll = document.getElementById("tree-all");
    var treeMarquee = document.getElementById("tree-marquee");

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

            var baseBoost = treeNone.checked ? 1 : 1.5;
            var abilityBoost = treeNone.checked ? 1 : treeAll.checked ? 1.46 : treeMarquee.checked ? 1.57 : NaN;
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
                var template = corpus[moves[key].sa.features[i].description];
                var substitutions = moves[key].sa.features[i].tiers[saRange.value - 1];
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
                    corpus[moves[moves[key].base].ma.features[i].title],
                    corpus[moves[moves[key].base].ma.features[i].description]
                ].join(" - ");
                var substitutions = moves[moves[key].base].ma.features[i].tiers[maRange.value - 1];
                maDescription.innerHTML = format(template, substitutions);
            }
        }
    }

    updateCards = function () {
        updateCardStats();
        updateCardSAs();
        updateCardMAs();
    };

    function updatePresetButtons() {
        if (
            levelBronze.value == levelBronze.min &&
            levelSilver.value == levelSilver.min &&
            levelGold.value == levelGold.min &&
            treeNone.checked &&
            saRange.value == saRange.min &&
            maRange.value == maRange.min
        ) {
            optionBase.classList.add("pressed");
            optionDefault.classList.remove("pressed");
            optionMaximum.classList.remove("pressed");
        }
        else if (
            levelBronze.value == levelBronze.min &&
            levelSilver.value == levelSilver.min &&
            levelGold.value == levelGold.min &&
            treeNone.checked &&
            saRange.value == saRange.max &&
            maRange.value == maRange.max
        ) {
            optionBase.classList.remove("pressed");
            optionDefault.classList.add("pressed");
            optionMaximum.classList.remove("pressed");
        }
        else if (
            treeMarquee.checked &&
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
        setValidInput(levelRange, levelRange.min);
        setValidInput(levelBronze, levelBronze.min);
        setValidInput(levelSilver, levelSilver.min);
        setValidInput(levelGold, levelGold.min);
        treeNone.checked = true;
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
        setValidInput(levelRange, levelRange.min);
        setValidInput(levelBronze, levelBronze.min);
        setValidInput(levelSilver, levelSilver.min);
        setValidInput(levelGold, levelGold.min);
        treeNone.checked = true;
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
        setValidInput(levelRange, levelRange.max);
        setValidInput(levelBronze, levelBronze.max);
        setValidInput(levelSilver, levelSilver.max);
        setValidInput(levelGold, levelGold.max);
        treeMarquee.checked = true;
        setValidInput(saNumber, saNumber.max);
        setValidInput(saRange, saRange.max);
        setValidInput(maNumber, maNumber.max);
        setValidInput(maRange, maRange.max);
        updateCards();
    }

    function getMaximumLevel() {
        var max = 1;
        return max;
    }

    function setLevelViaRange() {
        setValidInput(levelBronze, this.value);
        setValidInput(levelSilver, this.value);
        setValidInput(levelGold, this.value);
        updatePresetButtons();
        updateCardStats();
    }

    function focusSelect() {
        this.select();
    }

    function setLevelViaNumber() {
        setValidInput(this, this.value);
        setValidInput(levelRange, getMaximumLevel());
        updatePresetButtons();
        updateCardStats();
    }

    function setTree() {
        updatePresetButtons();
        updateCardStats();
    }

    function setSAViaNumber() {
        setValidInput(this, this.value);
        setValidInput(saRange, this.value);
        updatePresetButtons();
        updateCardSAs();
    }

    function setSAViaRange() {
        setValidInput(saNumber, this.value);
        updatePresetButtons();
        updateCardSAs();
    }

    function setMAViaNumber() {
        setValidInput(this, this.value);
        setValidInput(maRange, this.value);
        updatePresetButtons();
        updateCardMAs();
    }

    function setMAViaRange() {
        setValidInput(maNumber, this.value);
        updatePresetButtons();
        updateCardMAs();
    }

    optionBase.addEventListener("click", setAllToBase);
    optionDefault.addEventListener("click", setAllToDefault);
    optionMaximum.addEventListener("click", setAllToMaximum);

    levelRange.addEventListener("change", setLevelViaRange);
    levelBronze.addEventListener("focus", focusSelect);
    levelSilver.addEventListener("focus", focusSelect);
    levelGold.addEventListener("focus", focusSelect);
    levelBronze.addEventListener("change", setLevelViaNumber);
    levelSilver.addEventListener("change", setLevelViaNumber);
    levelGold.addEventListener("change", setLevelViaNumber);

    treeNone.addEventListener("change", setTree);
    treeAll.addEventListener("change", setTree);
    treeMarquee.addEventListener("change", setTree);

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
        loadJSON("data/sms.json"),
        loadJSON("data/bbs.json")
    ]).then(initCollection).then(initLanguageMenu).then(initFooter).then(toggleLoadingScreen);

}

document.addEventListener("DOMContentLoaded", initialize);
