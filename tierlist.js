var variants, database;

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
            if (votesByID[id].ip in votesByIP) {
                votesByIP[votesByID[id].ip].subtotal += votesByID[id].vote;
                votesByIP[votesByID[id].ip].subcount++;
            }
            else {
                votesByIP[votesByID[id].ip] = {
                    "subtotal": votesByID[id].vote,
                    "subcount": 1
                }
            }
            count++;
        }
        for (var ip in votesByIP) {
            var weight = Math.log(Math.E * votesByIP[ip].subcount);
            var subvote = votesByIP[ip].subtotal / votesByIP[ip].subcount;
            weightedTotal += subvote * weight;
            weightedCount += weight;
        }
        variants[key][subkey] = {
            "count": count,
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

function setRatings(subkey) {
    var nonFirst = [false, false];
    for (var row of document.getElementById("tier-table").rows) {
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
    return getRatings(subkey).then(function () {
        for (var key in variants) {
            var tier = Math.max(0, Math.floor((variants[key][subkey].rating - 1) / 4 * 11));
            var row = document.getElementsByClassName(variants[key].base)[0];
            var cell = row.cells[tier];
            var img = new Image();
            img.src = [
                "image/portrait",
                variants[key].base,
                key + ".png"
            ].join("/");
            cell.appendChild(img);
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
    var offenseTiers = document.getElementById("offense-tiers");
    var defenseTiers = document.getElementById("defense-tiers");

    function setOffense() {
        offenseTiers.classList.add("gold-gradient");
        defenseTiers.classList.remove("gold-gradient");
        toggleLoadingScreen(true);
        setRatings("offense").then(toggleLoadingScreen);
    }

    function setDefense() {
        offenseTiers.classList.remove("gold-gradient");
        defenseTiers.classList.add("gold-gradient");
        toggleLoadingScreen(true);
        setRatings("defense").then(toggleLoadingScreen);
    }

    offenseTiers.addEventListener("click", setOffense);
    defenseTiers.addEventListener("click", setDefense);

    toggleLoadingScreen(true);
    Promise.all([
        loadJSON("data/variants.json"),
        loadScript("https://www.gstatic.com/firebasejs/5.7.2/firebase-app.js"),
        loadScript("https://www.gstatic.com/firebasejs/5.7.2/firebase-database.js")
    ]).then(function (responses) {
        var config = {
            apiKey: "AIzaSyCHj7h6q2cG8h3yRDvofHiDP3Y4H4wY6t4",
            authDomain: "sgmobilegallery.firebaseapp.com",
            databaseURL: "https://sgmobilegallery.firebaseio.com",
            projectId: "sgmobilegallery",
            storageBucket: "sgmobilegallery.appspot.com",
            messagingSenderId: "65927600297"
        };
        firebase.initializeApp(config);

        variants = responses[0];
        database = firebase.database();
    }).then(toggleLoadingScreen);

    initLanguageMenu();
}

document.addEventListener("DOMContentLoaded", initialize);