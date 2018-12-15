var corpus, fighters, variants;
var collection, order, sa, ma, red;
var mastery, element;

var tiers = ["bronze", "silver", "gold", "diamond"];
var elements = ["neutral", "fire", "water", "wind", "dark", "light"];

function initialize() {
    collection = document.getElementById("collection");
    sa = document.getElementById("sa");
    ma = document.getElementById("ma");
    red = document.getElementById("red");
    mastery = document.getElementById("mastery");
    element = document.getElementById("element");
    var loading = document.getElementById("loading");
    var language = loadLanguage();
    if (typeof order == "undefined") {
        order = byAlpha;
    }

    function callback(responses) {
        loading.classList.add("hidden");
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

function createPortrait(key) {
    var variant = variants[key];
    var composition = document.createElement("div");
        composition.className = "composition";
        var realframe = document.createElement("div");
            realframe.className = "realframe";
            var frame = document.createElement("div");
                frame.className = "frame";
                var portrait = document.createElement("img");
                    portrait.className = "portrait";
                    var stem = "character/" + variant.base + "/" + key
                    if (key == "rBlight") {
                        var r = Math.floor(Math.random() * 7);
                        stem += "_" + r;
                    }
                    portrait.src = stem + ".png";
                frame.appendChild(portrait);
            realframe.appendChild(frame);
        composition.appendChild(realframe);
        var moniker = document.createElement("div");
            moniker.className = "moniker";
            var m1 = document.createElement("div");
                m1.className = "m1";
                m1.innerHTML = corpus[variant.name];
            moniker.appendChild(m1);
            var m2 = document.createElement("div");
                m2.className = "m2";
                m2.innerHTML = corpus[fighters[variant.base].name];
            moniker.appendChild(m2);
        composition.appendChild(moniker);
    return composition;
}

function createStat1(key, i) {
    var variant = variants[key];
    var fs = document.createElement("div");
        fs.className = "stat fs";
        fs.innerHTML = ["FS", Math.ceil((variant.baseStats[i].attack + variant.baseStats[i].lifebar / 6) * 7 / 10)].join(" ");
    return fs;
}

function createStat2(key, i) {
    var variant = variants[key];
    var attack = document.createElement("div");
        attack.className = "stat attack";
        attack.innerHTML = ["ATK", variant.baseStats[i].attack].join(" ");
    return attack;
}

function createStat3(key, i) {
    var variant = variants[key];
    var lifebar = document.createElement("div");
        lifebar.className = "stat lifebar";
        lifebar.innerHTML = ["HP", variant.baseStats[i].lifebar].join(" ");
    return lifebar;
}

function createQuote(key) {
    var variant = variants[key];
    var quote = document.createElement("div");
        quote.className = "quote";
        quote.innerHTML = corpus[variant.quote];
    return quote;
}

function createCharacter(key) {
    var variant = variants[key];
    var box = document.createElement("div");
        box.className = "ability character";
        var title = document.createElement("div");
            title.className = "title";
            title.innerHTML = corpus[fighters[variant.base].characterability.title];
        box.appendChild(title);
        var description = document.createElement("div");
            description.className = "description";
            description.innerHTML = corpus[fighters[variant.base].characterability.description];
        box.appendChild(description);
    return box;
}

function createSignature(key) {
    var variant = variants[key];
    var box = document.createElement("div");
        box.className = "ability signature";
        var title = document.createElement("div");
            title.className = "title";
            title.innerHTML = corpus[variant.signature.title];
        box.appendChild(title);
        var description = document.createElement("div");
            description.className = "description";
            for (var feature of variant.signature.features) {
                description.innerHTML += corpus[feature.description];
            }
        box.appendChild(description);
    return box;
}

function createMarquee(key) {
    var variant = variants[key];
    var box = document.createElement("div");
        box.className = "ability marquee";
        var title = document.createElement("div");
            title.className = "title";
            title.innerHTML = corpus[fighters[variant.base].marquee.title];
        box.appendChild(title);
        var description = document.createElement("div");
            description.className = "description";
            for (var feature of fighters[variant.base].marquee.features) {
                description.innerHTML += corpus[feature.description];
            }
        box.appendChild(description);
    return box;
}

function init(sa, ma, sig_only) {
    for (var key in variants) {
        var variant = variants[key];
        var card = document.createElement("div");
            card.className = ["card", variant.base, tiers[variant.tier], elements[variant.element]].join(" ");
            card.id = key;
            card.appendChild(createPortrait(key));
            card.appendChild(createQuote(key));
            card.appendChild(createStat1(key, 0));
            card.appendChild(createStat2(key, 0));
            card.appendChild(createStat3(key, 0));
            card.appendChild(createCharacter(key));
            card.appendChild(createSignature(key));
            card.appendChild(createMarquee(key));
        collection.appendChild(card);
    	// if (variant.name in corpus) {
        //     if (!sig_only) {
        //         div.appendChild(newStringDiv(corpus[fighters[variant.base].characterability.title], "ability"));
        //         div.appendChild(newStringDiv(corpus[fighters[variant.base].characterability.description], "description"));
        //     }
        //     div.appendChild(newStringDiv(corpus[variant.signature.title], "ability"));
        //     for (var feature of variant.signature.features) {
        //         div.appendChild(newStringDiv(formatDescription(feature, sa), "description"));
        //     }
        //     if (!sig_only) {
        //         div.appendChild(newStringDiv(corpus[fighters[variant.base].marquee.title], "ability"));
        //         for (var feature of fighters[variant.base].marquee.features) {
        //             div.appendChild(newStringDiv([
        //                 "<b>" + corpus[feature.title] + "</b>", formatDescription(feature, ma)
        //             ].join(" - "), "description"));
        //         }
        //     }
        //     div.innerHTML += "<br>";
        //     div.appendChild(newStringDiv(["Bronze", "Silver", "Gold", "Diamond"][variant.tier], "ability"));
        //     div.appendChild(newStringDiv(["Neutral", "Fire", "Water", "Wind", "Dark", "Light"][variant.element], "ability"));
        //     div.innerHTML += "<br>";
        //     div.appendChild(newStringDiv("Base Stats", "ability"));
        //     var i = variant.tier;
        //     for (var stat of variant.baseStats) {
        //         div.appendChild(newStringDiv("[" + ["Bronze", "Silver", "Gold", "Diamond"][i] + "] HP: " + stat.lifebar + " / ATK: " + stat.attack, "description"));
        //         i++;
        //     }
        // }
        // if (!variant.enabled) {
        //     div.style.opacity = 0.5;
        // }
    	// collection.appendChild(div);
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
