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







/* COMPLETE */

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
    var quote = document.createElement("q");
        quote.className = "quote";
        quote.innerHTML = corpus[variants[key].quote];
    return quote;
}

function createStat(type, label, value) {
    var stat = document.createElement("div");
        stat.className = ["stat", type].join(" ");
        stat.innerHTML = corpus[label];
        var span = document.createElement("span");
            span.className = "fancy silver-tint";
            span.innerHTML = value.toLocaleString();
        stat.appendChild(span);span
    return stat;
}

function createAbility(type, categoryText, titleText, descriptionTexts) {
    var ability = document.createElement("div");
        ability.className = ["ability", type].join(" ");
        var title = document.createElement("div");
            title.className = "title";
            var span1 = document.createElement("span");
                span1.className = "fancy gold-tint";
                span1.innerHTML = corpus[categoryText];
            title.appendChild(span1);
            var span2 = document.createElement("span");
                span2.className = "fancy silver-tint";
                span2.innerHTML = titleText;
            title.appendChild(span2);
        ability.appendChild(title);
        for (var descriptionText of descriptionTexts) {
            var description = document.createElement("div");
                description.className = "description";
                description.innerHTML = descriptionText;
            ability.appendChild(description);
        }
    return ability;
}

function format(template, substitutions) {
    var matches = template.match(/{\d+(?::\d+)?%?}%?/g);
    var formatted = template;
    for (var match of matches) {
        var index = parseInt(match.replace(/{(\d+)(?::\d+)?%?}%?/, "$1"));
        var substitute = Math.abs(substitutions[index]);
        if (match.includes("%}")) {
            substitute *= 100;
        }
        substitute = Math.round(substitute * 10) / 10;
        if (match.includes("%")) {
            substitute += "%";
        }
        formatted = formatted.replace(match, substitute);
    }
    return markedNumbers(formatted);
}

function markedNumbers(text) {
    return text.replace(/(\d+(?:\.\d+)?%?)/g, "<span class=\"number\">$1</span>");
}

/* UNDER CONSTRUCTION */

function createCA(key) {
    var titleText = corpus[fighters[variants[key].base].characterability.title];
    var descriptionTexts = [
        markedNumbers(corpus[fighters[variants[key].base].characterability.description])
    ];
    return createAbility("ca", "SkillTree_CharacterAbility_Title", titleText, descriptionTexts);
}

function createSA(key, n) {
    var titleText = corpus[variants[key].signature.title];
    var descriptionTexts = [];
    for (var feature of variants[key].signature.features) {
        var template = corpus[feature.description];
        var substitutions = feature.tiers.slice(n)[0];
        var descriptionText = format(template, substitutions);
        descriptionTexts.push(descriptionText);
    }
    return createAbility("sa", "CharacterDetails_SA", titleText, descriptionTexts);
}

function createMA(key, n) {
    var titleText = corpus[fighters[variants[key].base].marquee.title];
    var descriptionTexts = [];
    for (var feature of fighters[variants[key].base].marquee.features) {
        var template = corpus[feature.description];
        var substitutions = feature.tiers.slice(n)[0];
        var descriptionText = [
            corpus[feature.title],
            format(template, substitutions)
        ].join(" - ");
        descriptionTexts.push(descriptionText);
    }
    return createAbility("ma", "SkillTree_SuperAbility_Title", titleText, descriptionTexts);
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
            card.appendChild(createStat("atk", "Stat_AttackFlat_Label", atk));
            card.appendChild(createStat("hp", "Stat_HealthFlat_Label", hp));
            card.appendChild(createStat("fs", "Sort_FS", fs));
            card.appendChild(createCA(key));
            card.appendChild(createSA(key, sa));
            card.appendChild(createMA(key, ma));
        collection.appendChild(card);
    }
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
