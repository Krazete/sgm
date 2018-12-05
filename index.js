var corpus, fighters, variants;
var collection, order, sa, ma, red;
var mastery, element;

function initialize() {
    collection = document.getElementById("collection");
    sa = document.getElementById("sa");
    ma = document.getElementById("ma");
    red = document.getElementById("red");
    mastery = document.getElementById("mastery");
    element = document.getElementById("element");
    var language = loadLanguage();
    if (typeof order == "undefined") {
        order = byAlpha;
    }

    function callback(responses) {
        corpus = responses[0];
        fighters = responses[1];
        variants = responses[2];
        init(sa.value, ma.value, red.checked);
        sort(order);
        toggle(mastery, "blah");
        toggle(element, "blah");
    }

    Promise.all([
        load("./data/" + language + ".json"),
        load("./data/fighters.json"),
        load("./data/variants.json")
    ]).then(callback);
}

function changeLanguage(language) {
    saveLanguage(language);
    resetCollection();
    initialize();
}

function loadLanguage() {
    return window.localStorage.getItem("language") || "en";
}

function saveLanguage(language) {
    window.localStorage.setItem("language", language);
}

function resetCollection() {
    collection.innerHTML = "";
}

function load(path) {
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

function init(sa, ma, sig_only) {
    for (var key in variants) {
    	var variant = variants[key];
    	var div = document.createElement("div");
        div.className = "card " + variant.base + " " + variant.element;
        div.id = key;
    	div.style.background = "rgba(" +
            Math.floor(256 * variant.tint.r) + "," +
            Math.floor(256 * variant.tint.g) + "," +
            Math.floor(256 * variant.tint.b) + "," +
            variant.tint.a +
        ")";
    	if (variant.name in corpus) {
            var loadingBack = div.appendChild(document.createElement("div"));
            loadingBack.className = "loadingBack";
            var loading = loadingBack.appendChild(document.createElement("img"));
            loading.className = "loading";
            loading.src = "data/image/" + fighters[variant.base].loading + ".png";
            var portrait = loadingBack.appendChild(document.createElement("img"));
            portrait.className = "portrait";
            portrait.src = "character/" + variant.base + "/" + key + (key == "rBlight" ? ("_" + Math.floor(Math.random() * 7)) : "") + ".png";
            portrait.style.background = "radial-gradient(circle at bottom, " + [
                "white",
                "orangered",
                "aqua",
                "lime",
                "fuchsia",
                "khaki"
            ][variant.element] + ", transparent 64px)";
            div.appendChild(newStringDiv(corpus[fighters[variant.base].name], "fighter"));
            div.appendChild(newStringDiv(corpus[variant.name], "variant"));
            div.appendChild(newStringDiv(corpus[variant.quote], "quote"));
            if (!sig_only) {
                div.appendChild(newStringDiv(corpus[fighters[variant.base].characterability.title], "ability"));
                div.appendChild(newStringDiv(corpus[fighters[variant.base].characterability.description], "description"));
            }
            div.appendChild(newStringDiv(corpus[variant.signature.title], "ability"));
            for (var feature of variant.signature.features) {
                div.appendChild(newStringDiv(formatDescription(feature, sa), "description"));
            }
            if (!sig_only) {
                div.appendChild(newStringDiv(corpus[fighters[variant.base].marquee.title], "ability"));
                for (var feature of fighters[variant.base].marquee.features) {
                    div.appendChild(newStringDiv([
                        "<b>" + corpus[feature.title] + "</b>", formatDescription(feature, ma)
                    ].join(" - "), "description"));
                }
            }
            div.innerHTML += "<br>";
            div.appendChild(newStringDiv(["Bronze", "Silver", "Gold", "Diamond"][variant.tier], "ability"));
            div.appendChild(newStringDiv(["Neutral", "Fire", "Water", "Wind", "Dark", "Light"][variant.element], "ability"));
            div.innerHTML += "<br>";
            div.appendChild(newStringDiv("Base Stats", "ability"));
            var i = variant.tier;
            for (var stat of variant.baseStats) {
                div.appendChild(newStringDiv("[" + ["Bronze", "Silver", "Gold", "Diamond"][i] + "] HP: " + stat.lifebar + " / ATK: " + stat.attack, "description"));
                i++;
            }
        }
        if (!variant.enabled) {
            div.style.opacity = 0.5;
        }
    	collection.appendChild(div);
    }
}

function newStringDiv(string, className) {
    var div = document.createElement("div");
    div.className = className;
    div.innerHTML = string;
    return div;
}

function formatDescription(feature, i) {
    return format(corpus[feature.description], feature.tiers.slice(i)[0]);
}

function format(template, substitutions) { // a bit hacky
    var matches = template.match(/{.*?}/g);
    var string = template;
    for (var match of matches) {
        var parts = match.slice(1, -1).split(":");
        var substitute = Math.abs(substitutions[Math.round(parts[0])]);
        if (parts.length > 1) {
            if (parts[1].includes("%")) {
                substitute *= 100;
            }
            substitute = Math.round(substitute);
            substitute += "%";
        }
        string = string.replace(match, "<span class=\"number\">" + substitute + "</span>");
    }
    return string;
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
