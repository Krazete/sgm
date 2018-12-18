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
        init(sa.value, ma.value);
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
    var lang = window.localStorage.getItem("language") || "en";
    document.body.parentElement.lang = lang;
    return lang;
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

function createAvatar(key) {
    var avatar = document.createElement("div");
        avatar.className = "avatar";
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
        avatar.appendChild(frame);
        var nameplate = document.createElement("div");
            nameplate.className = "nameplate cinema";
            var variantName = document.createElement("div");
                variantName.className = "variant-name";
                variantName.innerHTML = corpus[variants[key].name];
            nameplate.appendChild(variantName);
            var fighterName = document.createElement("div");
                fighterName.className = "fighter-name";
                fighterName.innerHTML = corpus[fighters[variants[key].base].name];
            nameplate.appendChild(fighterName);
        avatar.appendChild(nameplate);
    return avatar;
}

function createQuote(key) {
    var quote = document.createElement("q");
        quote.className = "quote";
        quote.innerHTML = corpus[variants[key].quote];
    return quote;
}

function createStat(type, value) {
    var stat = document.createElement("div");
        stat.className = ["tagged", "stat", type].join(" ");
        var span = document.createElement("span");
            span.className = "cinema fancy silver-tint";
            span.innerHTML = value.toLocaleString();
        stat.appendChild(span);
    return stat;
}

function createAbility(type, titleText, descriptionTexts) {
    var ability = document.createElement("div");
        ability.className = ["ability", type].join(" ");
        var abilityName = document.createElement("div");
            abilityName.className = "ability-name cinema";
            var label = document.createElement("span");
                label.className = "label fancy gold-tint";
            abilityName.appendChild(label);
            var span = document.createElement("span");
                span.className = "fancy silver-tint";
                span.innerHTML = titleText;
            abilityName.appendChild(span);
            abilityName.addEventListener("click", collapse);
        ability.appendChild(abilityName);
        for (var descriptionText of descriptionTexts) {
            var description = document.createElement("div");
                description.className = "description";
                description.innerHTML = descriptionText;
            ability.appendChild(description);
        }
    return ability;
}

function collapse() {
    if (this.parentElement.classList.contains("collapsed")) {
        this.parentElement.classList.remove("collapsed");
    }
    else {
        this.parentElement.classList.add("collapsed");
    }
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
    var type = "ca collapsed";
    var titleText = corpus[fighters[variants[key].base].characterability.title];
    var descriptionTexts = [
        markedNumbers(corpus[fighters[variants[key].base].characterability.description])
    ];
    return createAbility(type, titleText, descriptionTexts);
}

function createSA(key, n) {
    var type = "sa";
    var titleText = corpus[variants[key].signature.title];
    var descriptionTexts = [];
    for (var feature of variants[key].signature.features) {
        var template = corpus[feature.description];
        var substitutions = feature.tiers.slice(n)[0];
        var descriptionText = format(template, substitutions);
        descriptionTexts.push(descriptionText);
    }
    return createAbility(type, titleText, descriptionTexts);
}

function createMA(key, n) {
    var type = "ma collapsed";
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
    return createAbility(type, titleText, descriptionTexts);
}

function createWikia(key) {
    var wikia = document.createElement("a");
        wikia.className = "wikia";
        wikia.target = "_blank";
        wikia.href = [
            "https://skullgirlsmobile.wikia.com/wiki",
            wikia_paths[key]
        ].join("/");
    return wikia;
}

/* TODO: review all these links */
var wikia_paths = { /* from English corpus */
    "nEgrets": "No Egrets",
    "tAFolks": "That's All Folks!",
    "nSense": "Nunsense",
    "meow": "Meow & Furever",
    "tTyrant": "Temple Tyrant",
    "gMatt": "Gray Matter",
    "necroB": "Necrobreaker",
    "dMight": "Dark Might",
    "splash": "Hack n' Splash",
    "hHanded": "Heavy Handed",
    "toad": "Toad Warrior",
    "fEnds": "Frayed Ends",
    "bBath": "Bloodbath",
    "gShift": "Graveyard Shift",
    "gloom": "Tomb & Gloom",
    "mTrial": "Ms. Trial",
    "dHeat": "Dead Heat",
    "hCat": "Hellcat",
    "wBane": "Wulfsbane",
    "rBlight": "Rainbow Blight",
    "polter": "Poltergust",
    "sketch": "Sketchy",
    "bFreeze": "Brain Freeze",
    "rerun": "Rerun",
    "rNerv": "Raw Nerv",
    "xMorph": "Xenomorph",
    "nDepart": "Nearly Departed",
    "dLicious": "Doublicious",
    "nOne": "Number One",
    "sSalt": "Summer Salt",
    "claw": "Claw & Order",
    "bValen": "Bloody Valentine",
    "rCopy": "Robocopy",
    "pTech": "Pyro-Technique",
    "bTop": "Big Top",
    "fFrame": "Freeze Frame",
    "uStudy": "Understudy",
    "iThreat": "Idol Threat",
    "wresX": "Wrestler X",
    "dInterv": "Diva Intervention",
    "pDark": "Purrfect Dark",
    "rBlonde": "Regally Blonde",
    "eSax": "Epic Sax",
    "pDick": "Private Dick",
    "hAppar": "Hair Apparent",
    "fTrap": "Fly Trap",
    "sGeneral": "Surgeon General",
    "aForce": "Armed Forces",
    "pShoot": "Pea Shooter",
    "lHope": "Last Hope",
    "sStiff": "Scared Stiff",
    "hMan": "Hype Man",
    "rusty": "Rusty",
    "oMai": "Oh Mai",
    "sViper": "Scarlet Viper",
    "hReign": "Heavy Reign",
    "hStrong": "Headstrong",
    "rEvil": "Resonant Evil",
    "inDeni": "In Denile",
    "fFly": "Firefly",
    "bMFrosty": "Bad Ms Frosty",
    "jKit": "Just Kitten",
    "hMetal": "Heavy Metal",
    "cStones": "Cold Stones",
    "scrub": "Scrub",
    "dLocks": "Dread Locks",
    "sFright": "Stage Fright",
    "uTouch": "Untouchable",
    "bExor": "Bio-Exorcist",
    "wSwept": "Windswept",
    "dBrawl": "Dragon Brawler",
    "uViolent": "Ultraviolent",
    "bLine": "Bassline",
    "gFan": "Grim Fan",
    "gJazz": "G.I. Jazz",
    "bHDay": "Bad Hair Day",
    "fFury": "Furry Fury",
    "shelt": "Sheltered",
    "fColor": "Myst-Match",
    "lucky": "Feline Lucky",
    "pWeave": "Parasite Weave",
    "bBox": "Beat Box",
    "bDrive": "Blood Drive",
    "jBreaker": "Jawbreaker",
    "lCrafted": "Love Crafted",
    "prime": "Primed",
    "wWarr": "Weekend Warrior",
    "iHot": "Icy Hot",
    "hQuin": "Harlequin",
    "bKill": "Buzzkill",
    "uDog": "Underdog",
    "sSchool": "Sundae School",
    "iFiber": "Immoral Fiber",
    "aGreed": "Assassin's Greed",
    "tMett": "Twisted Mettle",
    "dOWint": "Dead of Winter",
    "rAppr": "Rage Appropriate",
    "mSonic": "Megasonic",
    "cCutter": "Class Cutter",
    "dCrypt": "Decrypted",
    "pPride": "Princess Pride",
    "rVelvet": "Red Velvet",
    "sKill": "Silent Kill",
    "sCross": "Star-Crossed",
    "ink": "Inkling",
    "iLeague": "Ivy League",
    "sOut": "Stand Out"
};

function init(sa, ma) {
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
            card.appendChild(createAvatar(key));
            card.appendChild(createQuote(key));
            card.appendChild(createStat("atk", atk));
            card.appendChild(createStat("hp", hp));
            card.appendChild(createStat("fs", fs));
            card.appendChild(createCA(key));
            card.appendChild(createSA(key, sa));
            card.appendChild(createMA(key, ma));
            card.appendChild(createWikia(key));
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
