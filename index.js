var corpus, fighters, variants;

function loadLanguage() {
    return window.localStorage.getItem("language") || "en";
}

function saveLanguage(language) {
    window.localStorage.setItem("language", language);
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
    var language = loadLanguage();

    function callback(responses) {
        corpus = responses[0];
        fighters = responses[1];
        variants = responses[2];
        init();
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
    return format(corpus[feature.description], feature.tiers[0]);
}

function init() {
    var keys = Object.keys(variants);
    function fs(f) {
        return (f.lifebar / 6 + f.attack) * 7 / 10;
    }
    keys.sort(function sortByHP(a, b) {
        var varA = variants[a];
        var varB = variants[b];
        var A = varA.baseStats[varA.baseStats.length - 1];
        var B = varB.baseStats[varB.baseStats.length - 1];
        return fs(B) - fs(A);
    });
    for (var key of keys) {
    	var variant = variants[key];
    	var div = document.createElement("div");
    	div.style.background = "rgba(" + 256*variant.tint.r + "," + 256*variant.tint.g + "," + 256*variant.tint.b + "," + variant.tint.a + ")";
    	if (variant.name in corpus) {
    		div.innerHTML += "<img src=\"data/image/" + fighters[variant.base].loading + ".png\" width=\"100%\">";
            div.innerHTML += "<br>";
            div.innerHTML += "<br>";
            div.appendChild(newString(corpus[fighters[variant.base].name], "fighter"));
            div.appendChild(newString(corpus[variant.name], "variant"));
            div.appendChild(newString(corpus[variant.quote], "quote"));
            div.appendChild(newString(corpus[fighters[variant.base].characterability.title], "ability"));
            div.appendChild(newString(corpus[fighters[variant.base].characterability.description], "description"));

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
            for (var stat of variant.baseStats) {
                div.innerHTML += "<br>";
                div.innerHTML += "HP: " + stat.lifebar + " / ATK: " + stat.attack;
            }
        }
        if (!variant.enabled) {
            div.style.opacity = 0.5;
        }
    	document.body.appendChild(div);
    }
}

document.addEventListener("DOMContentLoaded", initialize);









function format(template, substitutions) {
    var matches = template.match(/{.*?}/g);
    console.log(matches);
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
        console.log(match, parts);
        string = string.replace(match, substitute);
    }
    return string;
}
