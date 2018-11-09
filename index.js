var corpus, fighters, variants;

var collection, order;

function loadLanguage() {
    return window.localStorage.getItem("language") || "en";
}

function saveLanguage(language) {
    window.localStorage.setItem("language", language);
}

function changeLanguage(language) {
    saveLanguage(language);
    collection.innerHTML = "";
    initialize();
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

function initialize() {
    collection = document.getElementById("collection");
    var language = loadLanguage();
    order = byFS;

    function callback(responses) {
        corpus = responses[0];
        fighters = responses[1];
        variants = responses[2];
        init();
        sort(order);
    }

    Promise.all([
        load("./data/" + language + ".json"),
        load("./data/fighters.json"),
        load("./data/variants.json")
    ]).then(callback);
}

function newString(string, className) {
    var title = document.createElement("div");
    title.className = className;
    title.innerHTML = string;
    return title;
}

function formatDescription(feature) {
    return format(fix(corpus[feature.description]), feature.tiers[0]);
}

function fix(string) {
    var matches = string.match(/\W([A-Z]+)\W/g);
    if (matches) {
        console.log(matches);
    }
    return string;
}

function sort(method) {
    var sorted = Object.keys(variants).sort(method);
    for (var id of sorted) {
        var card = document.getElementById(id);
        collection.appendChild(card);
    }
}

function fs(f) {
    return (f.lifebar / 6 + f.attack) * 7 / 10;
}

function byFS(a, b) {
    var varA = variants[a];
    var varB = variants[b];
    var A = varA.baseStats[varA.baseStats.length - 1];
    var B = varB.baseStats[varB.baseStats.length - 1];
    return fs(B) - fs(A);
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
function byAlpha(a, b) {
    var varA = variants[a];
    var varB = variants[b];
    var A = fighters[varA.base].name + varA.name;
    var B = fighters[varB.base].name + varB.name;
    return A > B ? 1 : A < B ? -1 : 0;
}

function init() {
    for (var key in variants) {
    	var variant = variants[key];
    	var div = document.createElement("div");
        div.id = key;
    	div.style.background = "rgba(" + 256*variant.tint.r + "," + 256*variant.tint.g + "," + 256*variant.tint.b + "," + variant.tint.a + ")";
    	if (variant.name in corpus) {
    		div.innerHTML += "<img src=\"data/image/" + fighters[variant.base].loading + ".png\" width=\"100%\">";
            div.innerHTML += "<br>";
            div.innerHTML += "<br>";
            div.appendChild(newString(corpus[fighters[variant.base].name], "fighter"));
            div.appendChild(newString(corpus[variant.name], "variant"));
            div.appendChild(newString(corpus[variant.quote], "quote"));
            div.appendChild(newString(corpus[fighters[variant.base].characterability.title], "ability"));
            div.appendChild(newString(fix(corpus[fighters[variant.base].characterability.description]), "description"));

            div.appendChild(newString(corpus[variant.signature.title], "ability"));
            for (var feature of variant.signature.features) {
                div.appendChild(newString(formatDescription(feature), "description"));
            }

            div.appendChild(newString(corpus[fighters[variant.base].marquee.title], "ability"));
            for (var feature of fighters[variant.base].marquee.features) {
                div.appendChild(newString([
                    corpus[feature.title], formatDescription(feature)
                ].join(" - "), "description"));
            }

            div.innerHTML += "<br>";
            div.appendChild(newString(["Bronze", "Silver", "Gold", "Diamond"][variant.tier], "ability"));
            div.appendChild(newString(["Neutral", "Fire", "Water", "Wind", "Dark", "Light"][variant.element], "ability"));
            div.innerHTML += "<br>";
            div.appendChild(newString("Base Stats", "ability"));
            var i = variant.tier;
            for (var stat of variant.baseStats) {
                div.appendChild(newString("[" + ["Bronze", "Silver", "Gold", "Diamond"][i] + "] HP: " + stat.lifebar + " / ATK: " + stat.attack, "description"));
                i++;
            }
        }
        if (!variant.enabled) {
            div.style.opacity = 0.5;
        }
    	collection.appendChild(div);
    }
}

document.addEventListener("DOMContentLoaded", initialize);









function format(template, substitutions) {
    var matches = template.match(/{.*?}/g);
    var string = template;
    for (var match of matches) {
        var parts = match.slice(1, -1).split(":");
        var substitute = Math.abs(substitutions[parseInt(parts[0])]);
        if (parts.length > 1) {
            if (parts[1].includes("%")) {
                substitute *= 100;
            }
            substitute = Math.floor(substitute);
            substitute += "%";
        }
        string = string.replace(match, substitute);
    }
    return string;
}
