var moves, corpus;

var tiers = ["bronze", "silver", "gold", "diamond"];
var elements = ["neutral", "fire", "water", "wind", "dark", "light"];
var fighterIDs = ["br", "mi"];

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

function initCollection(response) {
    moves = response;

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

    function createTitle() {
        var title = document.createElement("div");
            title.className = "title tagged cinematic dependent-gradient";
        return title;
    }

    function createTable(key) {
        var table = document.createElement("table");
            table.className = "table";
            var row = table.insertRow();
            var cell = row.insertCell();
                cell.className = "bonus-damage";
            var cell = row.insertCell();
                var value = document.createElement("span");
                    value.className = "damage-value";
                cell.appendChild(value);
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
        var classList = [
            "move card gss",
            elements[moves[key].element],
            moves[key].base
        ];
        var card = document.createElement("div");
            card.className = classList.join(" ");
            card.id = key;
            card.appendChild(createBadge(key));
            card.appendChild(createTitle());
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
        var title = card.getElementsByClassName("title")[0];
        title.innerHTML = corpus[moves[key].title];
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

    var filterCancel = document.getElementById("filter-cancel");
    var filterFighters = fighterIDs.map(function (fighter) {
        return document.getElementById("filter-" + fighter);
    });
    var filters = [].concat(filterFighters);

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
        if (searchMN.checked) {
            return sanitize(key).includes(query) || sanitize(corpus[moves[key].title]).includes(query);
        }
        else if (searchD.checked) {
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
    searchMN.addEventListener("change", filterCards);
    searchD.addEventListener("change", filterCards);

    filterCancel.addEventListener("change", cancelFilters);
    for (var filter of filters) {
        filter.addEventListener("change", filterCards);
    }

    if (location.hash) {
        searchbox.value = decodeURIComponent(location.hash.replace(/#/g, ""));
    }
    searchMN.checked = true;
}

function sortCards() {
    cards.sort(sortBasis);
    for (var card of cards) {
        card.parentElement.appendChild(card);
    }
}

function initSortMenu() {
    var sortAlphabetical = document.getElementById("sort-abc");

    var savedBasis = localStorage.getItem("basis2") || "sort-abc";
    var savedButton = document.getElementById(savedBasis);

    function alphabeticalBasis(a, b) {
        var A = moves[a.id].base + corpus[moves[a.id].title];
        var B = moves[b.id].base + corpus[moves[b.id].title];
        return A > B ? 1 : A < B ? -1 : 0;
    }

    function sorter(basis) {
        return function () {
            sortBasis = basis;
            sortCards();
            localStorage.setItem("basis2", this.id);
        };
    }

    sortAlphabetical.addEventListener("change", sorter(alphabeticalBasis));

    if (![
        sortAlphabetical
    ].includes(savedButton)) {
        savedButton = sortAlphabetical;
    }
    savedButton.checked = false; /* resets radio so change event can be triggered */
    savedButton.click();
}

function initOptionsMenu() {
    var levelRange = document.getElementById("level-range");
    var levelGold = document.getElementById("level-gold");
    var levelTiers = [levelGold];

    function updateCardStats() {
        for (var card of cards) {
            var key = card.id;
            var damage = card.getElementsByClassName("damage-value")[0];
            damage.innerHTML = "";
            // for (var i = 0; i < 6; i++) {
            //     var plus = document.createElement("img");
            //     plus.className = "plus";
            //     plus.src = "image/official/plus.png";
            //     damage.appendChild(plus);
            // }
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
        setValidInput(levelGold, this.value);
        updateCards();
    }

    function focusSelect() {
        this.select();
    }

    function setLevelViaNumber() {
        setValidInput(this, this.value);
        setValidInput(levelRange, Math.max(
            levelGold.value
        ));
        updateCards();
    }

    levelRange.addEventListener("change", setLevelViaRange);
    levelGold.addEventListener("focus", focusSelect);
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
    loadJSON("data/gss.json").then(initCollection).then(initLanguageMenu).then(initFooter).then(toggleLoadingScreen);

}

document.addEventListener("DOMContentLoaded", initialize);
