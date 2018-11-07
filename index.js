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
    }

    Promise.all([
        load("data/" + language + ".json"),
        load("data/fighters.json"),
        load("data/variants.json")
    ]).then(callback);
}

function hypertext(text) {
    var span = document.createElement("span");
}

function init() {
    for (var girl in skull) {
        for (var variant in skull[girl]) {
            var lowerElement = elements[skull[girl][variant].element];
            var properElement = lowerElement[0].toUpperCase() + lowerElement.slice(1);
            var card = document.createElement("div");
                card.className = "card";
                var element = document.createElement("img");
                    element.className = "element";
                    element.src = "official/element/" + properElement + ".png";
                card.appendChild(element);
                var portraitFrame = document.createElement("div");
                    portraitFrame.className = "portrait-frame " + tiers[skull[girl][variant].tier];
                    var portraitMount = document.createElement("div");
                        portraitMount.className = "portrait-mount " + lowerElement;
                        var portrait = document.createElement("img");
                            portrait.className = "portrait";
                            portrait.src = "characters/" + girl.toLowerCase().replace(/\W/g, "") + "/" + variant.toLowerCase().replace(/\W/g, "") + ".png";
                        portraitMount.appendChild(portrait);
                    portraitFrame.appendChild(portraitMount);
                card.appendChild(portraitFrame);
                var moniker = document.createElement("div");
                    moniker.className = "moniker";
                    moniker.innerHTML = girl + " - " + variant;
                card.appendChild(moniker);
                var signatures = document.createElement("signatures");
                    signatures.className = "signatures";
                    signatures.innerHTML = skull[girl][variant].signature.name;
                    signatures.innerHTML += "<br>" + skull[girl][variant].signature[1];
                    signatures.innerHTML += "<br>" + skull[girl][variant].signature[2];
                card.appendChild(signatures);
            document.body.appendChild(card);
        }
    }
}

document.addEventListener("DOMContentLoaded", initialize);
