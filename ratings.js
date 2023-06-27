var variants, database, now = Date.now();

function toggleLoadingScreen(loading) {
    if (loading) {
        document.body.classList.add("loading");
    }
    else {
        document.body.classList.remove("loading");
    }
}

function loadJSON(path) {
    function request(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", path, true);
        xhr.onload = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                resolve(JSON.parse(this.response));
    		}
    	};
        xhr.onerror = function() {
            reject(new Error("Could not load \"" + path + "\"."));
        };
        xhr.send();
    }
    return new Promise(request);
}

function loadScript(path) {
    function request(resolve, reject) {
        var script = document.createElement("script");
            script.src = path;
            script.addEventListener("load", resolve);
            script.addEventListener("error", reject);
        document.head.appendChild(script);
    }
    return new Promise(request);
}

function getRating(key, subkey) {
    if (subkey in variants[key]) {
        return new Promise(function (resolve, reject) {resolve()});
    }
    return database.ref([key, subkey].join("/")).once("value").then(function (snapshot) {
        var votesByID = snapshot.val();
        var weightedTotal = 0;
        var weightedCount = 0;
        var count = 0;
        var votesByIP = {};
        for (var id in votesByID) {
            var ip = votesByID[id].ip;
            var vote = votesByID[id].vote;
            if (votesByID[id].timestamp) {
                var timestamp = votesByID[id].timestamp;
                var age = Math.max(0, Math.floor((now - timestamp) / 86400000)); /* age in days */
                var subweight = 100 - 99 * Math.min(Math.max(0, age - 30) / 335, 1); /* depreciate after a month, down to 1% after a year */
            }
            else {
                var subweight = 1;
            }
            if ([1, 2, 3, 4, 5].includes(vote)) {
                if (ip in votesByIP) {
                    votesByIP[ip].subtotal += vote * subweight;
                    votesByIP[ip].subcount += subweight;
                }
                else {
                    votesByIP[ip] = {
                        "subtotal": vote * subweight,
                        "subcount": subweight
                    }
                }
                count++;
            }
        }
        for (var ip in votesByIP) {
            var subtotal = votesByIP[ip].subtotal;
            var subcount = votesByIP[ip].subcount;
            var subvote = subtotal / subcount;
            var weight = subcount <= 100 ? subcount / 100 : Math.log(Math.E * subcount / 100);
            weightedTotal += subvote * weight;
            weightedCount += weight;
        }
        variants[key][subkey] = {
            "count": count, /* unused */
            "rating": weightedTotal / weightedCount
        };
    });
}

function getRatings(subkey) {
    var promises = [];
    for (var key in variants) {
        promises.push(getRating(key, subkey));
    }
    return Promise.all(promises);
}

function handleMissingPortrait() {
    var portrait = this;
    var backdrop = portrait.parentElement;
    var avatar = backdrop.parentElement.parentElement;

    portrait.classList.add("hidden");
    avatar.classList.add("unloaded");
}

var tiers = ["bronze", "silver", "gold", "diamond"];
var elements = ["neutral", "fire", "water", "wind", "dark", "light"];

function createAvatar(key) {
    var avatar = document.createElement("a");
        avatar.target = "_blank";
        avatar.href = "./#" + key;
        avatar.className = [
            "avatar",
            tiers[variants[key].tier],
            elements[variants[key].element]
        ].join(" ");
        avatar.id = key;
        var frame = document.createElement("div");
            frame.className = "frame";
            var backdrop = document.createElement("div");
                backdrop.className = "backdrop";
                var portrait = document.createElement("img");
                    portrait.className = "portrait";
                    portrait.src = [
                        "image/portrait",
                        variants[key].base,
                        key + ".png"
                    ].join("/");
                    portrait.addEventListener("error", handleMissingPortrait);
                backdrop.appendChild(portrait);
            frame.appendChild(backdrop);
        avatar.appendChild(frame);
    return avatar;
}

function setRatings(subkey) {
    var nonFirst = [false, false];
    for (var row of document.getElementById("ratings-table").rows) {
        if (nonFirst[0]) {
            nonFirst[1] = false;
            for (var cell of row.cells) {
                if (nonFirst[1]) {
                    cell.innerHTML = "";
                }
                nonFirst[1] = true;
            }
        }
        nonFirst[0] = true;
    }
    function byRating(a, b) {
        var aRating = variants[a][subkey].rating;
        var bRating = variants[b][subkey].rating;
        return aRating - bRating;
    }
    return getRatings(subkey).then(function () {
        var sortedKeys = Object.keys(variants).sort(byRating);
        for (var key of sortedKeys) {
            var grade = Math.round(variants[key][subkey].rating) || 0;
            if (grade < 0 || grade > 5) {
                console.warn("Invalid", subkey, "rating for", key + ":", grade);
            }
            else {
                var row = document.getElementsByClassName(variants[key].base)[0];
                var cell = row.cells[grade + 1];
                var avatar = createAvatar(key);
                cell.appendChild(avatar);
            }
        }
    });
}

function initLanguageMenu() {
    var buttonSet = document.getElementById("language-menu");
    var buttons = Array.from(buttonSet.getElementsByTagName("input"));

    var savedLanguage = localStorage.getItem("language") || "en";
    var savedButton = document.getElementById(savedLanguage);

    function setLanguage() {
        var language = this.id;
        document.documentElement.lang = language;
        localStorage.setItem("language", language);
    }

    if (!buttons.includes(savedButton)) {
        savedLanguage = "en";
        savedButton = document.getElementById("en");
    }
    document.documentElement.lang = savedLanguage;
    savedButton.checked = true;

    for (var button of buttons) {
        button.addEventListener("change", setLanguage);
    }
}

function initialize() {
    var instructions = document.getElementById("instructions");
    var offenseRatings = document.getElementById("offense-ratings");
    var defenseRatings = document.getElementById("defense-ratings");

    function setOffense() {
        instructions.classList.add("hidden");
        offenseRatings.classList.add("gold-gradient");
        defenseRatings.classList.remove("gold-gradient");
        toggleLoadingScreen(true);
        setRatings("offense").then(toggleLoadingScreen);
    }

    function setDefense() {
        instructions.classList.add("hidden");
        offenseRatings.classList.remove("gold-gradient");
        defenseRatings.classList.add("gold-gradient");
        toggleLoadingScreen(true);
        setRatings("defense").then(toggleLoadingScreen);
    }

    offenseRatings.addEventListener("click", setOffense);
    defenseRatings.addEventListener("click", setDefense);

    toggleLoadingScreen(true);

    loadScript("https://www.gstatic.com/firebasejs/5.7.2/firebase-app.js").then(function () {
        return Promise.all([
            loadScript("https://www.gstatic.com/firebasejs/5.7.2/firebase-database.js"),
            loadJSON("data/variants.json")
        ]);
    }).then(function (responses) {
        var config = {
            apiKey: "AIzaSyCHj7h6q2cG8h3yRDvofHiDP3Y4H4wY6t4",
            authDomain: "sgmobilegallery.firebaseapp.com",
            databaseURL: "https://sgmobilegallery.firebaseio.com",
            projectId: "sgmobilegallery",
            storageBucket: "sgmobilegallery.appspot.com",
            messagingSenderId: "65927600297"
        };
        firebase.initializeApp(config);

        variants = responses[1];
        database = firebase.database();
    }).then(toggleLoadingScreen);

    initLanguageMenu();
}

document.addEventListener("DOMContentLoaded", initialize);
