var catalysts;
var tiers = ["bronze", "silver", "gold"];
var elements = ["neutral", "fire", "water", "wind", "dark", "light"];
var fighterIDs = ["an", "be", "bb", "bd", "ce", "do", "el", "fi", "fu", "mf", "pw", "pa", "pe", "rf", "sq", "um", "va"];

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
    catalysts = response;

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

    function createTitle(tagged) {
        var title = document.createElement("div");
            title.className = "title cinematic dependent-gradient";
            if (tagged) {
                title.classList.add("tagged");
            }
        return title;
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
        var tagged = true;
        var classList = [
            "catalyst card",
            tiers[catalysts[key].tier]
        ];
        if (catalysts[key].constraints.characters) { /* assume only one constraint */
            classList.push(catalysts[key].constraints.characters[0]);
        }
        else if (catalysts[key].constraints.elements) {
            classList.push(elements[catalysts[key].constraints.elements[0]]);
        }
        else if (key.includes("-char-")) { /* character-locked */
            classList.push("xx");
        }
        else {
            tagged = false;
        }
        var card = document.createElement("div");
            card.className = classList.join(" ");
            card.id = key;
            card.appendChild(createTitle(tagged));
            card.appendChild(createDescription());
            card.appendChild(createLock());
        return card;
    }

    for (var key in catalysts) {
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
        var t = corpus[catalysts[key].title];
        if (t.includes("{0}")) {
            t = t.replace(/\{\d+\}/, "(Element)");
        }
        title.innerHTML = t;
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
    var searchCN = document.getElementById("search-an");
    var searchD = document.getElementById("search-d");

    var filterCancel = document.getElementById("filter-cancel");

    var filterCancel = document.getElementById("filter-cancel");
    var filterTiers = tiers.map(function (tier) {
        return document.getElementById("filter-" + tier);
    });
    var filterElements = elements.map(function (element) {
        return document.getElementById("filter-" + element);
    });
    var filterFighters = fighterIDs.map(function (fighter) {
        return document.getElementById("filter-" + fighter);
    });
    var filterXX = document.getElementById("filter-xx")
    var filters = [].concat(filterTiers, filterElements, filterFighters, filterXX);

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
        if (searchCN.checked) {
            return sanitize(key).includes(query) || sanitize(corpus[catalysts[key].title]).includes(query);
        }
        else if (searchD.checked) {
            if ("ability" in catalysts[key] && "features" in catalysts[key].ability) {
                for (var feature of catalysts[key].ability.features) {
                    if (removePlaceholders(sanitize(corpus[feature.description])).includes(query)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function tierCondition(card) {
        if (filterTiers.every(function (filter) {
            return !filter.checked;
        })) {
            return true;
        }
        var key = card.id;
        return filterTiers.some(function (filter, i) {
            return filter.checked && catalysts[key].tier == i;
        });
    }

    function elementCondition(card) {
        if (filterElements.every(function (filter) {
            return !filter.checked
        })) {
            return true;
        }
        var key = card.id;
        return filterElements.some(function (filter, i) {
            return filter.checked && catalysts[key].constraints.elements && catalysts[key].constraints.elements[0] == i
        });
    }

    function fighterCondition(card) {
        if (filterFighters.concat(filterXX).every(function (filter) {
            return !filter.checked;
        })) {
            return true;
        }
        var key = card.id;
        return filterFighters.some(function (filter, i) {
            return filter.checked && catalysts[key].constraints.characters && catalysts[key].constraints.characters[0] == fighterIDs[i]
        }) || (filterXX.checked && key.includes("-char-") && !catalysts[key].constraints.characters);
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
    searchCN.addEventListener("change", filterCards);
    searchD.addEventListener("change", filterCards);

    filterCancel.addEventListener("change", cancelFilters);
    for (var filter of filters) {
        filter.addEventListener("change", filterCards);
    }

    if (location.hash) {
        searchbox.value = decodeURIComponent(location.hash.replace(/#/g, ""));
    }
    searchCN.checked = true;
}

function sortCards() {
    cards.sort(sortBasis);
    for (var card of cards) {
        card.parentElement.appendChild(card);
    }
}

function initSortMenu() {
    var sortAlphabetical = document.getElementById("sort-abc");
    var sortTier = document.getElementById("sort-tier");

    var savedBasis = localStorage.getItem("basis4") || "sort-tier";
    var savedButton = document.getElementById(savedBasis);

    function alphabeticalBasis(a, b) {
        var A = catalysts[a.id].base + corpus[catalysts[a.id].title];
        var B = catalysts[b.id].base + corpus[catalysts[b.id].title];
        return A > B ? 1 : A < B ? -1 : 0;
    }

    function tierBasis(a, b) {
        var A = catalysts[a.id].tier;
        var B = catalysts[b.id].tier;
        var C = B - A;
        if (C == 0) {
            return alphabeticalBasis(a, b);
        }
        return C;
    }

    function sorter(basis) {
        return function () {
            sortBasis = basis;
            sortCards();
            localStorage.setItem("basis4", this.id);
        };
    }

    sortAlphabetical.addEventListener("change", sorter(alphabeticalBasis));
    sortTier.addEventListener("change", sorter(tierBasis));

    if (![
        sortAlphabetical,
        sortTier
    ].includes(savedButton)) {
        savedButton = sortAlphabetical;
    }
    savedButton.checked = false; /* resets radio so change event can be triggered */
    savedButton.click();
}

function updateCards() {
    function getDescriptionTier(feature) {
        var fTierValue = 0;
        for (var fTier of feature.tiers) {
            fTierValue = fTier.values;
        }
        return fTierValue;
    }

    for (var card of cards) {
        var key = card.id;
        var description = card.getElementsByClassName("description")[0];
        description.classList.add("hidden");
        description.innerHTML = "";
        if ("ability" in catalysts[key] && "features" in catalysts[key].ability) {
            for (var feature of catalysts[key].ability.features) {
                if (feature.description && corpus[feature.description]) {
                    var fDescription = document.createElement("div");
                    fDescription.innerHTML = format(corpus[feature.description], getDescriptionTier(feature));
                    description.appendChild(fDescription);
                    description.classList.remove("hidden");
                }
            }
        }
    }
}

function initialize() {
    function initFooter() {
        initDock();
        initFilterMenu();
        initSortMenu();
        updateCards();
    }

    toggleLoadingScreen(true);
    loadJSON("data/artifacts.json").then(initCollection).then(initLanguageMenu).then(initFooter).then(toggleLoadingScreen);

}

document.addEventListener("DOMContentLoaded", initialize);
