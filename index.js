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
            if (xhr.readyState == 4 && xhr.status == 200) { // xhr.onload
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
    		div.innerHTML += "<img src=\"data/images/" + fighters[variant.base].super + ".png\" width=\"100%\">";
    		div.innerHTML += "<br>";
            var moniker = document.createElement("div");
                moniker.className = "moniker";
                moniker.innerHTML = corpus[fighters[variant.base].name] + "<br>" + corpus[variant.name];
            div.appendChild(moniker);
    		div.innerHTML += "<br>";
    		div.innerHTML += corpus[variant.quote];
            div.innerHTML += "<br>";
            div.innerHTML += "<br>";
            div.innerHTML += corpus[fighters[variant.base].characterability.title];
            div.innerHTML += "<br>";
            div.innerHTML += corpus[fighters[variant.base].characterability.description];
            div.innerHTML += "<br>";
            div.innerHTML += "<br>";
            div.innerHTML += ["Neutral", "Fire", "Water", "Wind", "Dark", "Light"][variant.element];
            div.innerHTML += "<br>";
            div.innerHTML += ["Bronze", "Silver", "Gold", "Diamond"][variant.tier];
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
