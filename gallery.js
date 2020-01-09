var corpus;

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
            document.body.classList.add("error"); /* todo: make this functional */
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

// function formatNumbers(text) {
//     return text.replace(/(\d+(?:\.\d+)?%?)/g, "<span class=\"number\">$1</span>");
// }
function formatNumbers(text) { /* todo: find a better way to signal null values */
    return text.replace(/NaN/g, "???").replace(/((?:\?\?\?|\d+(?:\.\d+)?)%?)/g, "<span class=\"number\">$1</span>");
}

function format(template, substitutions) {
    var matches = template.match(/{\d+(?::P?\d+)?%?}%?/g); /* forbidden procedure has {0:P0} */
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
    var panel = document.getElementById("panel");

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
            panel.classList.add("hidden");
        }
        else {
            for (var bid in menuMap) {
                var button = document.getElementById(bid);
                for (var mid of menuMap[bid]) {
                    var menu = document.getElementById(mid);
                    if (bid == this.id) {
                        button.classList.add("glowing");
                        menu.classList.remove("hidden");
                        menu.scrollTo(0, 0);
                    }
                    else {
                        button.classList.remove("glowing");
                        menu.classList.add("hidden")
                    }
                }
            }
            panel.classList.remove("hidden");
        }
    }

    zoomOut.addEventListener("click", decreaseZoom);
    zoomIn.addEventListener("click", increaseZoom);
    for (var bid in menuMap) {
        var button = document.getElementById(bid);
        button.addEventListener("click", toggleMenu);
    }

    if (savedButton == zoomOut || savedButton == zoomIn) {
        savedButton.click();
    }
}

function initSearchbox() {
    var searchbox = document.getElementById("searchbox");

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
        var queries = searchbox.value.split(",");
        for (var rawQuery of queries) {
            var query = sanitize(rawQuery);
            if (searchVN.checked) {
                if (sanitize(key).includes(query) || sanitize(corpus[variants[key].name]).includes(query)) {
                    return true;
                }
            }
            else if (searchCA.checked) {
                if (removePlaceholders(sanitize(corpus[fighters[variants[key].base].ca.description])).includes(query)) {
                    return true;
                };
            }
            else if (searchSA.checked) {
                for (var feature of variants[key].sa.features) {
                    if (removePlaceholders(sanitize(corpus[feature.description])).includes(query)) {
                        return true;
                    }
                }
            }
            else if (searchMA.checked) {
                for (var feature of fighters[variants[key].base].ma.features) {
                    if (removePlaceholders(sanitize(corpus[feature.description])).includes(query)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function filterCards2() {
        for (var card of cards) {
            if (searchCondition(card)) {
                card.classList.remove("hidden2");
            }
            else {
                card.classList.add("hidden2");
            }
        }
    }

    function pressEnter(e) {
        if (e.keyCode == 13 || e.key == "Enter" || e.code == "Enter") {
            searchbox.blur();
        }
    }

    searchbox.addEventListener("input", filterCards);
    searchbox.addEventListener("keydown", pressEnter);

    if (location.hash) {
        searchbox.value = decodeURIComponent(location.hash.replace(/#/g, ""));
    }
}

function initFilterMenu() {
    var filterCancel = document.getElementById("filter-cancel");
    var filters = [];
    for (var filterSet of filterSets) {
        for (var id of filterSet.buttons) {
            filters.push(document.getElementById(id));
        }
    }

    function checked(filter) {
        return filter.checked;
    }

    function updateFilterCancel() {
        if (filters.some(checked)) {
            filterCancel.checked = false;
        }
        else {
            filterCancel.checked = true;
        }
    }

    function unchecked(filter) {
        return !filter.checked;
    }
    function uncheckedAll(filterSet) {
        return filterSet.every(unchecked);
    }
    function satisfies(filterSet, key) {
        for (var i of filterSet) {
            if (!filterSet.method(key)) {
                return false;
            }
        }
        return true;
    }
    function condition(card, filterSet) {
        if (uncheckedAll(filterSet.buttons)) {
            return true;
        }
        var key = card.id;
        return satisfies(filterSet, key);
    }



    function filterCards() {
        for (var card of cards) {
            if (filterSets.every(x => condition(card, x))) {
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

    filterCancel.addEventListener("change", cancelFilters);
    for (var filter of filters) {
        filter.addEventListener("change", filterCards);
    }
}

function sortCards() {
    cards.sort(sortBasis);
    for (var card of cards) {
        card.parentElement.appendChild(card);
    }
}

function initSortMenu() {
}
