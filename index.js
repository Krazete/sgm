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









function createIcon(key) {
    var icon = document.createElement("div");
        icon.className = "icon";
        var frame = document.createElement("div");
            frame.className = "frame";
            var backdrop = document.createElement("div");
                backdrop.className = "backdrop";
                var portrait = document.createElement("img");
                    portrait.className = "portrait";
                    var stem = ["character", variants[key].base, key].join("/");
                    if (key == "rBlight") {
                        var r = Math.floor(Math.random() * 7);
                        stem += "_" + r;
                    }
                    portrait.src = stem + ".png";
                backdrop.appendChild(portrait);
            frame.appendChild(backdrop);
        icon.appendChild(frame);
        var nameplate = document.createElement("div");
            nameplate.className = "nameplate";
            var variantName = document.createElement("div");
                variantName.className = "variant-name";
                variantName.innerHTML = corpus[variants[key].name];
            nameplate.appendChild(variantName);
            var fighterName = document.createElement("div");
                fighterName.className = "fighter-name";
                fighterName.innerHTML = corpus[fighters[variants[key].base].name];
            nameplate.appendChild(fighterName);
        icon.appendChild(nameplate);
    return icon;
}

function createQuote(key) {
    var quote = document.createElement("div");
        quote.className = "quote";
        quote.innerHTML = corpus[variants[key].quote];
    return quote;
}

function createStat(type, value) {
    var stat = document.createElement("div");
        stat.className = ["stat", type].join(" ");
        stat.innerHTML = value.toLocaleString();
    return stat;
}

function createAbility(acronym, titleText, descriptionTexts) {
    var ability = document.createElement("div");
        ability.className = ["ability", acronym].join(" ");
        var title = document.createElement("div");
            title.className = "title";
            title.innerHTML = titleText;
        ability.appendChild(title);
        for (var descriptionText of descriptionTexts) {
            var description = document.createElement("div");
                description.className = "description";
                description.innerHTML = descriptionText;
            ability.appendChild(description);
        }
    return ability;
}


function createCA(key) {
    var titleText = corpus[fighters[variants[key].base].characterability.title];
    var descriptionTexts = [
        corpus[fighters[variants[key].base].characterability.description]
    ];
    var ability = createAbility("ca", titleText, descriptionTexts);
    return ability;
}

function createSA(key) {
    var titleText = corpus[variants[key].signature.title];
    var descriptionTexts = [];
    for (var feature of variants[key].signature.features) {
        descriptionTexts.push(corpus[feature.description]);
    }
    var ability = createAbility("sa", titleText, descriptionTexts);
    return ability;
}

function createMA(key) {
    var titleText = corpus[fighters[variants[key].base].marquee.title];
    var descriptionTexts = [];
    for (var feature of fighters[variants[key].base].marquee.features) {
        descriptionTexts.push([
            corpus[feature.title],
            corpus[feature.description]
        ].join(" - "));
    }
    var ability = createAbility("ma", titleText, descriptionTexts);
    return ability;
}

function init(sa, ma, sig_only) {
    for (var key in variants) {
        var atk = variants[key].baseStats[0].attack;
        var hp = variants[key].baseStats[0].lifebar;
        var fs = Math.ceil((atk + hp / 6) * 7 / 10);
        var card = document.createElement("div");
            card.className = [
                "card",
                variants[key].base,
                tiers[variants[key].tier],
                elements[variants[key].element]
            ].join(" ");
            card.id = key;
            card.appendChild(createIcon(key));
            card.appendChild(createQuote(key));
            card.appendChild(createStat("atk", atk));
            card.appendChild(createStat("hp", hp));
            card.appendChild(createStat("fs", fs));
            card.appendChild(createCA(key));
            card.appendChild(createSA(key));
            card.appendChild(createMA(key));
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
