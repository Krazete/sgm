var moves;

var fighterIDs = ["be", "bb", "ce", "do", "el", "fi", "mf", "pw", "pa", "pe", "rf", "sq", "va"];
var types = ["sms", "bbs"];
var tiers = ["bronze", "silver", "gold"];
var characters = {
    "be": "image/official/Beowulf_MasteryIcon.png",
    "bb": "image/official/BigBand_MasteryIcon.png",
    "ce": "image/official/Cerebella_MasteryIcon.png",
    "do": "image/official/Double_MasteryIcon.png",
    "el": "image/official/Eliza_MasteryIcon.png",
    "fi": "image/official/Filia_MasteryIcon.png",
    "mf": "image/official/MsFortune_MasteryIcon.png",
    "pw": "image/official/Painwheel_MasteryIcon.png",
    "pa": "image/official/Parasoul_MasteryIcon.png",
    "pe": "image/official/Peacock_MasteryIcon.png",
    "rf": "image/official/RoboFortune_MasteryIcon.png",
    "sq": "image/official/Squigly_MasteryIcon.png",
    "va": "image/official/Valentine_MasteryIcon.png",
};

function initCollection(responses) {
    var sms = responses[0];
    var bbs = responses[1];
    moves = Object.assign(sms, bbs);

    var collection = document.getElementById("collection");

    function createBadge(key) {
        var badge = document.createElement("div");
            badge.className = "badge";
            var medal = document.createElement("img");
                medal.className = "medal";
                medal.src = "image/official/BB-Frame1.png";
            badge.appendChild(medal);
            var symbol = document.createElement("img");
                symbol.className = "symbol";
                symbol.src = [
                    "image/move",
                    moves[key].icon
                ].join("/");
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
                types[moves[key].type],
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

function updateCardConstant(card) {
    var key = card.id;
    var tag = card.getElementsByClassName("tag")[0];
    var quote = card.getElementsByClassName("quote")[0];
    var gear = card.getElementsByClassName("gear")[0];
    tag.innerHTML = corpus[moves[key].title];
    if (corpus[moves[key].description]) {
        quote.innerHTML = corpus[moves[key].description];
    }
    gear.dataset.value = moves[key].cost;
}

function initDock() {
    var settings = document.getElementById("settings");

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

    settings.addEventListener("click", toggleMenu);
}

function initFilterMenu() {
    var searchMN = document.getElementById("search-mn");
    var searchD = document.getElementById("search-d");

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

    searchMN.addEventListener("change", filterCards);
    searchD.addEventListener("change", filterCards);

    searchMN.checked = true;
    filterTiers[2].click();
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
        var fTiers = feature.tiers;
        if (feature.description == "SA_Valentine_BB4") {
            var fTiers = [ /* apk doesn't have this data for some reason */
                {"level": 1, "values": [0.15]},
                {"level": 9, "values": [0.2]},
                {"level": 15, "values": [0.25]}
            ];
        }
        var fTierValue = 0;
        for (var fTier of fTiers) {
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
            if ("ability" in moves[key]) {
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
