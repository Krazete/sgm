var fighters, variants, corpus;
var userID, userIP, database, now = Date.now();

var tiers = ["bronze", "silver", "gold", "diamond"];
var elements = ["neutral", "fire", "water", "wind", "dark", "light"];
var fighterIDs = ["an", "be", "bb", "bd", "ce", "do", "el", "fi", "fu", "ma", "mf", "pw", "pa", "pe", "rf", "sq", "um", "va"];

var cards = [];
var filterCards;
var sortBasis;
var updateCards;

var redacted = [];

var dormant = true;
var chaos = false;
var useCustom = Math.random() < 0.05;
var portraitDir = useCustom ? "custom_portrait" : "portrait";
var portraitDir2 = useCustom ? "portrait" : "custom_portrait";
var resetPortraits;

function randomInt(a, b) {
    return a + Math.floor(Math.random() * (b - a));
}

function fearTheRainbow() {
    for (var card of cards) {
        for (var tier of tiers) {
            card.classList.remove(tier);
        }
        for (var element of elements) {
            card.classList.remove(element);
        }
        if (chaos) {
            card.classList.add(tiers[variants[card.id].tier]);
            card.classList.add(elements[variants[card.id].element]);
        }
        else {
            card.classList.add(tiers[randomInt(0, tiers.length)]);
            card.classList.add(elements[randomInt(0, elements.length)]);
        }
    }
    chaos = !chaos;
}

function swapPortraits() {
    var portraitDir3 = portraitDir;
    portraitDir = portraitDir2;
    portraitDir2 = portraitDir3;
    resetPortraits();
}

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

function setIP(json) {
    userIP = json.ip;
}

function updateRating(key, subkey, animate) {
    var card = document.getElementById(key);
    var category = card.getElementsByClassName(subkey)[0];
    var stars = category.getElementsByClassName("star");

    try {
        database.ref([key, subkey].join("/")).once("value").then(function (snapshot) {
            var votesByID = snapshot.val();
            var weightedTotal = 0;
            var weightedCount = 0;
            var count = 0;
            var userVote = 0;
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
                    if (id == userID) {
                        userVote = vote;
                    }
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
            if (userVote > 0) {
                for (var star of stars) {
                    if (star.dataset.value == userVote) {
                        if (animate) {
                            star.classList.add("animated");
                            (function (star) {
                                setTimeout(function () {
                                    star.classList.remove("animated")
                                }, 1500);
                            })(star);
                        }
                        star.classList.add("voted");
                    }
                    else {
                        star.classList.remove("animated");
                        star.classList.remove("voted");
                    }
                }
            }
            var passed = count <= 0;
            var ratio = weightedTotal / weightedCount;
            var clipTop = 90 * (ratio % 1);
            var clipBottom = 30 + 30 * (ratio % 1);
            for (var star of stars) {
                if (passed) {
                    star.children[1].style.opacity = 0;
                }
                else if (star.dataset.value == Math.floor(ratio) + 1) {
                    passed = true;
                    if (clipTop <= 0) {
                        star.children[1].style.opacity = 0;
                    }
                    else {
                        star.children[1].style = [
                            "-webkit-clip-path: polygon(0 0, " + clipTop + "% 0, " + clipBottom + "% 100%, 0 100%)",
                            "clip-path: polygon(0 0, " + clipTop + "% 0, " + clipBottom + "% 100%, 0 100%)"
                        ].join(";");
                    }
                }
                else {
                    star.children[1].style = "";
                }
            }
            category.dataset.value = ratio || 0;
            category.dataset.count = count;
            category.classList.remove("pressed");
            /* do not sort cards on update because the rearrangement is obtrusive */
        });
    }
    catch (e) {
        console.log(e);
    }
}

function initCollection(responses) {
    fighters = responses[0];
    variants = responses[1];
    var collection = document.getElementById("collection");

    var date = new Date();
    var month = date.getMonth() + 1;
    var weekday = date.getDay();
    var day = date.getDate();

    var lazyList = [];
    function lazyLoadImages() {
        for (var img of lazyList) {
            if (img.dataset.src) {
                var imgBox = img.getBoundingClientRect();
                if (imgBox.bottom > 0 && imgBox.top < innerHeight) {
                    img.src = img.dataset.src;
                    delete img.dataset.src;
                }
            }
        }
        requestAnimationFrame(lazyLoadImages);
    }

    function removePortraitPlaceholder() {
        var portrait = this;
        var avatar = portrait.parentElement.parentElement.parentElement;
        avatar.classList.remove("unloaded");
    }

    function handleMissingPortrait() {
        var portrait = this;
        var card = portrait.parentElement.parentElement.parentElement.parentElement;
        portrait.classList.add("hidden");
        console.warn("Portrait not found for variant " + card.id + ".");
    }

    function tryBackupPortrait() {
        var portrait = this;
        portrait.removeEventListener("error", tryBackupPortrait);
        portrait.addEventListener("error", handleMissingPortrait);
        portrait.dataset.src = portrait.src.replace("/" + portraitDir + "/", "/" + portraitDir2 + "/");
    }

    resetPortraits = function () { /* for swapPortraits */
        for (var card of cards) {
            var key = card.id;

            var avatar = card.getElementsByClassName("avatar")[0];
            avatar.classList.add("unloaded");

            var portrait = card.getElementsByClassName("portrait")[0];
            portrait.classList.remove("hidden");
            portrait.removeEventListener("error", handleMissingPortrait);
            portrait.removeEventListener("error", tryBackupPortrait);
            portrait.addEventListener("error", tryBackupPortrait);
            portrait.dataset.src = [
                "image",
                portraitDir,
                variants[key].base,
                key + ".png"
            ].join("/");
        }
    }

    function createAvatar(key) {
        var avatar = document.createElement("div");
            avatar.className = "avatar unloaded";
            var frame = document.createElement("div");
                frame.className = "frame";
                var backdrop = document.createElement("div");
                    backdrop.className = "backdrop";
                    if (month == 4 && day == 1) {
                        backdrop.style.transform = [
                            "rotate(" + randomInt(0, 360) + "deg)",
                            randomInt(0, 2) ? "" : "scaleX(-1)"
                        ].join(" ");
                    }
                    if (month == 10 && day == 31 || weekday == 5 && day == 13) {
                        backdrop.classList.add("hallow" + randomInt(1, 4));
                    }
                    var portrait = document.createElement("img");
                        portrait.className = "portrait";
                        portrait.dataset.src = [
                            "image",
                            portraitDir,
                            variants[key].base,
                            key + ".png"
                        ].join("/");
                        portrait.addEventListener("load", removePortraitPlaceholder);
                        portrait.addEventListener("error", tryBackupPortrait);
                        lazyList.push(portrait);
                    backdrop.appendChild(portrait);
                    if (key == "heat") {
                        var afterimage = document.createElement("div");
                        afterimage.className = "afterimage";
                        backdrop.appendChild(afterimage);
                    }
                frame.appendChild(backdrop);
            avatar.appendChild(frame);
            var nameplate = document.createElement("div");
                nameplate.className = "nameplate cinematic";
                var variantName = document.createElement("div");
                    variantName.className = "variant-name dependent-gradient";
                nameplate.appendChild(variantName);
                var fighterName = document.createElement("div");
                    fighterName.className = "fighter-name";
                nameplate.appendChild(fighterName);
            avatar.appendChild(nameplate);
        return avatar;
    }

    function createQuote() {
        var quote = document.createElement("q");
            quote.className = "quote";
        return quote;
    }

    function rate() {
        var category = this.parentElement;
        var card = category.parentElement.parentElement;
        var key = card.id;
        var subkey = category.className;
        var value = parseInt(this.dataset.value);
        category.classList.add("pressed");
        database.ref([key, subkey, userID].join("/")).set({
            "ip": userIP,
            "vote": value,
            "timestamp": firebase.database.ServerValue.TIMESTAMP
        }).then(function () {
            updateRating(key, subkey, true);
        });
    }

    function previewRate() {
        var category = this.parentElement;
        var stars = category.getElementsByClassName("star");
        var passed = false;
        for (var star of stars) {
            if (passed) {
                star.classList.remove("voting");
                star.classList.add("not-voting");
            }
            else {
                star.classList.add("voting");
                star.classList.remove("not-voting");
                passed = star == this;
            }
        }
    }

    function deviewRate() {
        var category = this.parentElement;
        var stars = category.getElementsByClassName("star");
        for (var star of stars) {
            star.classList.remove("voting");
            star.classList.remove("not-voting");
        }
    }

    function createRating(key, type) {
        var categories = ["offense", "defense"];
        var ratings = document.createElement("div");
            ratings.className = "rating fill-row hidden";
            for (var category of categories) {
                var rating = document.createElement("div");
                    rating.className = [category, "pressed"].join(" ");
                    for (var i = 0; i < 5; i++) {
                        var star = document.createElement("div");
                            star.className = "star";
                            star.dataset.value = i + 1;
                            var shadow = document.createElement("img");
                                shadow.src = "image/official/star01.png";
                            star.appendChild(shadow);
                            var light = document.createElement("img");
                                light.src = "image/official/star01.png";
                            star.appendChild(light);
                            star.addEventListener("click", rate);
                            star.addEventListener("mouseover", previewRate);
                            star.addEventListener("mouseout", deviewRate);
                            star.addEventListener("click", deviewRate);
                        rating.appendChild(star);
                    }
                ratings.appendChild(rating);
            }
        return ratings;
    }

    function createWordBreak() {
        var wbr = document.createElement("wbr");
        return wbr;
    }

    function createStat(type) {
        var stat = document.createElement("div");
            stat.className = [type, "tagged"].join(" ");
            stat.appendChild(createWordBreak());
            var span = document.createElement("span");
                span.className = [
                    type + "-value",
                    "cinematic",
                    "silver-gradient"
                ].join(" ");
            stat.appendChild(span);
        return stat;
    }

    function toggleAbility() {
        var ability = this.parentElement;
        if (ability.classList.contains("collapsed")) {
            ability.classList.remove("collapsed");
        }
        else {
            ability.classList.add("collapsed");
        }
    }

    function createAbility(type, abilityData, collapsed) {
        var ability = document.createElement("div");
            if (collapsed) {
                ability.className = [type, "ability", "collapsed"].join(" ");
            }
            else {
                ability.className = [type, "ability"].join(" ");
            }
            var abilityTitle = document.createElement("div");
                abilityTitle.className = "ability-title cinematic";
                var abilityType = document.createElement("span");
                    abilityType.className = "ability-type gold-gradient";
                abilityTitle.appendChild(abilityType);
                abilityTitle.appendChild(createWordBreak());
                var abilityName = document.createElement("span");
                    abilityName.className = [
                        type + "-name",
                        "silver-gradient"
                    ].join(" ");
                abilityTitle.appendChild(abilityName);
                abilityTitle.addEventListener("click", toggleAbility);
            ability.appendChild(abilityTitle);
            if ("description" in abilityData) { /* character ability */
                var description = document.createElement("div");
                    description.className = "ca-0 description";
                ability.appendChild(description);
            }
            else if (abilityData.features) { /* signature and marquee abilities */
                for (var i = 0; i < abilityData.features.length; i++) {
                    if (abilityData.features[i].description) { /* skip if empty */
                        var description = document.createElement("div");
                            description.className = [
                                type + "-" + i,
                                "description"
                            ].join(" ");
                        ability.appendChild(description);
                    }
                }
            }
            else { /* prestige abilities */
                var description = document.createElement("div");
                    description.className = [
                        type + "-" + i,
                        "description"
                    ].join(" ");
                ability.appendChild(description);
            }
        return ability;
    }

    function createWikia(key) {
        var wikia = document.createElement("a");
            wikia.className = "wikia icon";
            wikia.target = "_blank";
            wikia.href = [
                "https://skullgirlsmobile.wikia.com/wiki",
                variants[key].fandom /* + "#Tips_and_Tricks" */
            ].join("/");
        return wikia;
    }

    function toggleLock() {
        var card = this.parentElement;
        if (card.classList.contains("locked")) {
            card.classList.remove("locked");
        }
        else {
            card.classList.add("locked");
        }
    }

    function createLock() {
        var lock = document.createElement("img");
            lock.className = "lock";
            lock.src = "image/official/Lock.png";
            lock.addEventListener("click", toggleLock);
        return lock;
    }

    function createCard(key) {
        var card = document.createElement("div");
            card.className = [
                "fighter card",
                tiers[variants[key].tier],
                elements[variants[key].element],
                variants[key].base
            ].join(" ");
            if (redacted.includes(key)) {
                card.classList.add("redacted");
            }
            card.id = key;
            card.appendChild(createAvatar(key));
            card.appendChild(createQuote());
            card.appendChild(createStat("atk"));
            card.appendChild(createStat("hp"));
            card.appendChild(createStat("fs"));
            card.appendChild(createAbility("ca", fighters[variants[key].base].ca, true));
            card.appendChild(createAbility("sa", variants[key].sa));
            card.appendChild(createAbility("ma", fighters[variants[key].base].ma, true));
            card.appendChild(createAbility("pa", fighters[variants[key].base].pa, true));
            card.appendChild(createRating(key));
            card.appendChild(createWikia(key));
            card.appendChild(createLock());
        return card;
    }

    for (var key in variants) {
        if (!("base" in variants[key])) variants[key].base = "be";
        var card = createCard(key);
        collection.appendChild(card);
        cards.push(card);
    }
    if (month == 4 && day == 1) {
        fearTheRainbow();
    }
    if (month == 11 && day == 3) {
        document.body.classList.add("birthday");
    }

    lazyLoadImages();
}

function formatNumbers(text) { /* TODO: gray these out at level 0 */
    /* special cases for umbrella */
    text = text.replace(/<color=#00d7f9>(.+?)<\/color>/gi, "<span class=\"overstuffed\">$1</span>");
    text = text.replace(/<color=#ff1a1a>(.+?)<\/color>/gi, "<span class=\"ravenous\">$1</span>");
    /* special cases for marie */
    text = text.replace(/<color=#40eff4>(.+?)<\/color>/gi, "<span class=\"revive\">$1</span>");
    text = text.replace(/<color=#ff9d01>(.+?)<\/color>/gi, "<span class=\"incinerate\">$1</span>");

    return text.replace(/NaN/g, "???").replace(/((?:\?\?\?|\d+(?:\.\d+)?)%?)/g, "<span class=\"number\">$1</span>");
}

function format(template, substitutions) {
    var matches = template.match(/{\s*\d+(?::\d+)?%?\s*}%?/g);
    var formatted = template;
    if (matches) {
        for (var match of matches) {
            var index = parseInt(match.replace(/{\s*(\d+)(?::\d+)?%?\s*}%?/, "$1"));
            var substitute = Math.abs(substitutions[index]);
            if (match.includes("%}")) {
                substitute *= 100;
            }
            substitute = Math.round(substitute * 100) / 100; /* round to nearest 100th */
            if (match.includes("%")) {
                substitute += "%";
            }
            formatted = formatted.replace(match, substitute);
        }
    }
    else {
        if (substitutions.length > 0) {
            console.warn("Could not format \"" + template + "\" with [" + substitutions + "].");
        }
    }
    return formatNumbers(formatted);
}

function initLanguageMenu() {
    var buttonSet = document.getElementById("language-menu");
    var buttons = Array.from(buttonSet.getElementsByTagName("input"));

    var savedLanguage = localStorage.getItem("language") || "en";
    var savedButton = document.getElementById(savedLanguage);

    function updateCardConstant(card) {
        var key = card.id;
        var variantName = card.getElementsByClassName("variant-name")[0];
        var fighterName = card.getElementsByClassName("fighter-name")[0];
        var quote = card.getElementsByClassName("quote")[0];
        var caName = card.getElementsByClassName("ca-name")[0];
        var ca0 = card.getElementsByClassName("ca-0")[0];
        var saName = card.getElementsByClassName("sa-name")[0];
        var maName = card.getElementsByClassName("ma-name")[0];
        var paName = card.getElementsByClassName("pa-name")[0];
        variantName.innerHTML = corpus[variants[key].name];
        fighterName.innerHTML = corpus[fighters[variants[key].base].name];
        quote.innerHTML = (corpus[variants[key].quote] || " ").replace(/\s*\n\s*/, "<br>");
        caName.innerHTML = corpus[fighters[variants[key].base].ca.title];
        ca0.innerHTML = formatNumbers(corpus[fighters[variants[key].base].ca.description]);
        saName.innerHTML = corpus[variants[key].sa.title];
        maName.innerHTML = corpus[fighters[variants[key].base].ma.title];
        paName.innerHTML = corpus[fighters[variants[key].base].pa.title];
    }

    function updateCardConstants(response) {
        corpus = response;
        for (var card of cards) {
            updateCardConstant(card);
        }
    }

    function setLanguage() {
        var language = this.id;
        document.documentElement.lang = language;
        toggleLoadingScreen(true);
        loadJSON("data/" + language + ".json").then(updateCardConstants).then(updateCards).then(toggleLoadingScreen);
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

    return loadJSON("data/" + savedLanguage + ".json").then(updateCardConstants);
}

function initDock() {
    var zoomIn = document.getElementById("zoom-in");
    var zoomOut = document.getElementById("zoom-out");
    var fighterOptions = document.getElementById("fighter-options");
    var filterSort = document.getElementById("filter-sort");

    var menu = document.getElementById("menu");
    var optionsMenu = document.getElementById("options-menu");
    var filterMenu = document.getElementById("filter-menu");
    var sortMenu = document.getElementById("sort-menu");

    var savedZoom = localStorage.getItem("zoom");
    var savedButton = document.getElementById(savedZoom);

    var ratings = document.getElementById("ratings");
    var cardRatings = document.getElementsByClassName("rating");
    var sortFighterScore = document.getElementById("sort-fs");
    var sortOffense = document.getElementById("sort-offense");
    var sortDefense = document.getElementById("sort-defense");

    /* set default to "off" to stay within quota */
    var savedStar = localStorage.getItem("star") || "on";

    function getScrollRatio() {
        var scrollHeight = document.documentElement.scrollHeight - innerHeight;
        return scrollY / scrollHeight;
    }

    function setScrollRatio(scrollRatio) {
        var scrollHeight = document.documentElement.scrollHeight - innerHeight;
        scrollTo(0, scrollHeight * scrollRatio);
    }

    function decreaseZoom() {
        var scrollRatio = getScrollRatio();
        if (document.body.classList.contains("zoomed-in")) {
            document.body.classList.remove("zoomed-in");
            zoomIn.classList.remove("pressed");
            localStorage.removeItem("zoom");
        }
        else {
            document.body.classList.add("zoomed-out");
            zoomOut.classList.add("pressed");
            localStorage.setItem("zoom", this.id);
        }
        setScrollRatio(scrollRatio);
    }

    function increaseZoom() {
        var scrollRatio = getScrollRatio();
        if (document.body.classList.contains("zoomed-out")) {
            document.body.classList.remove("zoomed-out");
            zoomOut.classList.remove("pressed");
            localStorage.removeItem("zoom");
        }
        else {
            document.body.classList.add("zoomed-in");
            zoomIn.classList.add("pressed");
            localStorage.setItem("zoom", this.id);
        }
        setScrollRatio(scrollRatio);
    }

    function toggleFighterOptions() {
        if (this.classList.contains("glowing")) {
            this.classList.remove("glowing");
            menu.classList.add("hidden");
        }
        else {
            this.classList.add("glowing");
            filterSort.classList.remove("glowing");
            menu.classList.remove("hidden");
            optionsMenu.classList.remove("hidden");
            filterMenu.classList.add("hidden");
            sortMenu.classList.add("hidden");
            optionsMenu.scrollTo(0, 0);
        }
    }

    function toggleFilterSort() {
        if (this.classList.contains("glowing")) {
            this.classList.remove("glowing");
            menu.classList.add("hidden");
        }
        else {
            fighterOptions.classList.remove("glowing");
            this.classList.add("glowing");
            menu.classList.remove("hidden");
            optionsMenu.classList.add("hidden");
            filterMenu.classList.remove("hidden");
            sortMenu.classList.remove("hidden");
            filterMenu.scrollTo(0, 0);
            sortMenu.scrollTo(0, 0);
        }
    }

    function initRating() {
        loadScript("https://www.gstatic.com/firebasejs/5.7.2/firebase-app.js").then(function () {
            return Promise.all([
                loadScript("https://www.gstatic.com/firebasejs/5.7.2/firebase-auth.js"),
                loadScript("https://www.gstatic.com/firebasejs/5.7.2/firebase-database.js"),
                loadScript("https://api.ipify.org?format=jsonp&callback=setIP")
            ]);
        }).then(function () {
            var config = {
                apiKey: "AIzaSyCHj7h6q2cG8h3yRDvofHiDP3Y4H4wY6t4",
                authDomain: "sgmobilegallery.firebaseapp.com",
                databaseURL: "https://sgmobilegallery.firebaseio.com",
                projectId: "sgmobilegallery",
                storageBucket: "sgmobilegallery.appspot.com",
                messagingSenderId: "65927600297"
            };
            firebase.initializeApp(config);

            database = firebase.database();

            firebase.auth().onAuthStateChanged(function (user) {
                if (user) {
                    // var isAnonymous = user.isAnonymous;
                    userID = user.uid;
                    console.log("Authentication issued.");
                }
                else {
                    console.log("Authentication revoked.");
                }
            });
            firebase.auth().signInAnonymously().catch(function (error) {
                console.error(error.code, error.message);
            });

            for (var card of cards) {
                updateRating(card.id, "offense");
                updateRating(card.id, "defense");
            }
        });
    }

    function toggleRatings() {
        if (this.classList.contains("glowing")) {
            this.classList.remove("glowing");
            for (var cardRating of cardRatings) {
                cardRating.classList.add("hidden");
            }
            sortOffense.classList.add("hidden");
            sortDefense.classList.add("hidden");
            if (sortOffense.checked || sortDefense.checked) {
                sortFighterScore.click();
            }
            localStorage.setItem("star", "off");
        }
        else {
            this.classList.add("glowing");
            for (var cardRating of cardRatings) {
                cardRating.classList.remove("hidden");
            }
            sortOffense.classList.remove("hidden");
            sortDefense.classList.remove("hidden");
            if (dormant) {
                initRating();
                dormant = false;
            }
            localStorage.setItem("star", "on");
        }
    }

    zoomOut.addEventListener("click", decreaseZoom);
    zoomIn.addEventListener("click", increaseZoom);

    if (savedButton == zoomOut || savedButton == zoomIn) {
        savedButton.click();
    }

    fighterOptions.addEventListener("click", toggleFighterOptions);
    filterSort.addEventListener("click", toggleFilterSort);

    ratings.addEventListener("click", toggleRatings);

    /* disable this auto-toggle to stay within quota */
    if (savedStar == "on") {
        ratings.click();
    }
}

function initFilterMenu() {
    var searchbox = document.getElementById("searchbox");
    var searchVN = document.getElementById("search-vn");
    var searchCA = document.getElementById("search-ca");
    var searchSA = document.getElementById("search-sa");
    var searchMA = document.getElementById("search-ma");

    var filterCancel = document.getElementById("filter-cancel");
    var filterTiers = tiers.map(function (tier) {
        return document.getElementById("filter-" + tier);
    });
    var filterElements = elements.map(function (element) {
        return document.getElementById("filter-" + element);
    });
    var filterFighters = fighterIDs.map(function (fighter) {
        return document.getElementById("filter-" + fighter);
    });
    var filters = [].concat(filterTiers, filterElements, filterFighters);

    function updateFilterCancel() {
        if (filters.some(function (filter) {
            return filter.checked;
        })) {
            filterCancel.checked = false;
        }
        else {
            filterCancel.checked = true;
        }
    }

    function sanitize(text) {
        return text.toLocaleLowerCase(document.documentElement.lang).replace(/\s+/g, " ").trim();
    }

    function removePlaceholders(template) {
        return template.replace(/{\d+(?::\d+)?%?}%?/g, "");
    }

    function searchCondition(card) {
        if (!searchbox.value) {
            return true;
        }
        var key = card.id;
        var queries = searchbox.value.split(",");
        for (var rawQuery of queries) {
            var query = sanitize(rawQuery);
            if (query.includes("fear the rainbow")) {
                searchbox.value = "";
                fearTheRainbow();
                return true;
            }
            else if (query.includes("swap()") || query.includes("swap portraits")) {
                searchbox.value = "";
                swapPortraits();
                return true;
            }
            else if (query.includes("fel()")) {
                searchbox.value = "";
                felExport();
                return true;
            }
            else if (searchVN.checked) {
                if (sanitize(key).includes(query) || sanitize(corpus[variants[key].name]).includes(query)) {
                    return true;
                }
            }
            else if (searchCA.checked) {
                if (removePlaceholders(sanitize(corpus[fighters[variants[key].base].ca.description])).includes(query)) {
                    return true;
                };
            }
            else if (searchSA.checked) {
                for (var feature of variants[key].sa.features) {
                    if (removePlaceholders(sanitize(corpus[feature.description])).includes(query)) {
                        return true;
                    }
                }
            }
            else if (searchMA.checked) {
                for (var feature of fighters[variants[key].base].ma.features) {
                    if (removePlaceholders(sanitize(corpus[feature.description])).includes(query)) {
                        return true;
                    }
                }
            }
            /* TODO: implement searchPA? or make a smarter search altogether? */
        }
        return false;
    }

    function tierCondition(card) {
        if (filterTiers.every(function (filter) {
            return !filter.checked;
        })) {
            return true;
        }
        var key = card.id;
        return filterTiers.some(function (filter, i) {return filter.checked && variants[key].tier == i});
    }

    function elementCondition(card) {
        if (filterElements.every(function (filter) {
            return !filter.checked
        })) {
            return true;
        }
        var key = card.id;
        return filterElements.some(function (filter, i) {return filter.checked && variants[key].element == i});
    }

    function fighterCondition(card) {
        if (filterFighters.every(function (filter) {
            return !filter.checked;
        })) {
            return true;
        }
        var key = card.id;
        return filterFighters.some(function (filter, i) {return filter.checked && variants[key].base == fighterIDs[i]});
    }

    filterCards = function () {
        for (var card of cards) {
            if (
                searchCondition(card) &&
                tierCondition(card) &&
                elementCondition(card) &&
                fighterCondition(card)
            ) {
                card.classList.remove("hidden");
            }
            else {
                card.classList.add("hidden");
            }
        }
        updateFilterCancel();
    };

    function cancelFilters() {
        for (var filter of filters) {
            filter.checked = false;
        }
        filterCards();
    }

    function pressEnter(e) {
        if (e.keyCode == 13 || e.key == "Enter" || e.code == "Enter") {
            searchbox.blur();
        }
    }

    searchbox.addEventListener("keydown", pressEnter);
    searchbox.addEventListener("input", filterCards);
    searchVN.addEventListener("change", filterCards);
    searchCA.addEventListener("change", filterCards);
    searchSA.addEventListener("change", filterCards);
    searchMA.addEventListener("change", filterCards);

    filterCancel.addEventListener("change", cancelFilters);
    for (var filter of filters) {
        filter.addEventListener("change", filterCards);
    }

    if (location.hash) { /* TODO: make this smarter; replace "+" and "_" with " " */
        searchbox.value = decodeURIComponent(location.hash.replace(/#/g, ""));
    }
    searchVN.checked = true;
    filterCancel.click();
}

function sortCards() {
    cards.sort(sortBasis);
    for (var card of cards) {
        card.parentElement.appendChild(card);
    }
}

function initSortMenu() {
    var sortFighterScore = document.getElementById("sort-fs");
    var sortAttack = document.getElementById("sort-atk");
    var sortHealth = document.getElementById("sort-hp");
    var sortAlphabetical = document.getElementById("sort-abc");
    var sortElement = document.getElementById("sort-element");
    var sortTier = document.getElementById("sort-tier");
    var sortOffense = document.getElementById("sort-offense");
    var sortDefense = document.getElementById("sort-defense");

    var savedBasis = localStorage.getItem("basis") || "sort-fs";
    var savedButton = document.getElementById(savedBasis);

    function alphabeticalBasis(a, b) {
        var A = corpus[fighters[variants[a.id].base].name] + corpus[variants[a.id].name];
        var B = corpus[fighters[variants[b.id].base].name] + corpus[variants[b.id].name];
        return A > B ? 1 : A < B ? -1 : 0;
    }

    function getStatValue(card, type) {
        var statValue = card.getElementsByClassName(type)[0];
        return statValue.dataset.value;
    }

    function fighterScoreBasis(a, b) {
        var A = getStatValue(a, "fs-value");
        var B = getStatValue(b, "fs-value");
        var C = B - A;
        if (C == 0) {
            return alphabeticalBasis(a, b);
        }
        return C;
    }

    function attackBasis(a, b) {
        var A = getStatValue(a, "atk-value");
        var B = getStatValue(b, "atk-value");
        var C = B - A;
        if (C == 0) {
            return fighterScoreBasis(a, b);
        }
        return C;
    }

    function healthBasis(a, b) {
        var A = getStatValue(a, "hp-value");
        var B = getStatValue(b, "hp-value");
        var C = B - A;
        if (C == 0) {
            return fighterScoreBasis(a, b);
        }
        return C;
    }

    function elementBasis(a, b) {
        var elementMap = [0, 5, 3, 4, 1, 2];
        var A = elementMap[variants[a.id].element];
        var B = elementMap[variants[b.id].element];
        var C = B - A;
        if (C == 0) {
            return fighterScoreBasis(a, b);
        }
        return C;
    }

    function tierBasis(a, b) {
        var A = variants[a.id].tier;
        var B = variants[b.id].tier;
        var C = B - A;
        if (C == 0) {
            return fighterScoreBasis(a, b);
        }
        return C;
    }

    function getStarValue(card, type) {
        var starValue = getStatValue(card, type);
        if (starValue <= 0) {
            return 6;
        }
        return starValue;
    }

    function offenseBasis(a, b) {
        var A = getStarValue(a, "offense");
        var B = getStarValue(b, "offense");
        var C = B - A;
        if (C == 0) {
            return attackBasis(a, b);
        }
        return C;
    }

    function defenseBasis(a, b) {
        var A = getStarValue(a, "defense");
        var B = getStarValue(b, "defense");
        var C = B - A;
        if (C == 0) {
            return healthBasis(a, b);
        }
        return C;
    }

    function sorter(basis) {
        return function () {
            sortBasis = basis;
            sortCards();
            localStorage.setItem("basis", this.id);
        };
    }

    sortFighterScore.addEventListener("change", sorter(fighterScoreBasis));
    sortAttack.addEventListener("change", sorter(attackBasis));
    sortHealth.addEventListener("change", sorter(healthBasis));
    sortAlphabetical.addEventListener("change", sorter(alphabeticalBasis));
    sortElement.addEventListener("change", sorter(elementBasis));
    sortTier.addEventListener("change", sorter(tierBasis));
    sortOffense.addEventListener("change", sorter(offenseBasis));
    sortDefense.addEventListener("change", sorter(defenseBasis));

    if (![
        sortFighterScore,
        sortAttack,
        sortHealth,
        sortAlphabetical,
        sortElement,
        sortTier
        /* cannot initialize with rating sort because firebase is asyncronous */
    ].includes(savedButton)) {
        savedButton = sortFighterScore;
    }
    savedButton.checked = false; /* resets radio so change event can be triggered */
    savedButton.click();
}

function initOptionsMenu() {
    var optionBase = document.getElementById("option-base");
    var optionDefault = document.getElementById("option-default");
    var optionMaximum = document.getElementById("option-maximum");

    var evolveRange = document.getElementById("evolve-range");
    var evolveBronze = document.getElementById("evolve-bronze");
    var evolveSilver = document.getElementById("evolve-silver");
    var evolveGold = document.getElementById("evolve-gold");
    var evolveDiamond = document.getElementById("evolve-diamond");
    var evolveTiers = [evolveBronze, evolveSilver, evolveGold, evolveDiamond];

    var levelRange = document.getElementById("level-range");
    var levelBronze = document.getElementById("level-bronze");
    var levelSilver = document.getElementById("level-silver");
    var levelGold = document.getElementById("level-gold");
    var levelDiamond = document.getElementById("level-diamond");
    var levelTiers = [levelBronze, levelSilver, levelGold, levelDiamond];

    var treeNone = document.getElementById("tree-none");
    var treeAll = document.getElementById("tree-all");

    var saNumber = document.getElementById("sa-number");
    var saRange = document.getElementById("sa-range");

    var maNumber = document.getElementById("ma-number");
    var maRange = document.getElementById("ma-range");

    var paNumber = document.getElementById("pa-number");
    var paRange = document.getElementById("pa-range");

    function updateCardStats() {
        var baseBoost = treeNone.checked ? 10 : 15; /* 10ths */

        var treeBoost = treeNone.checked ? 1000 : 1460;
        var maBoost = maRange.value * 10;
        var paBoost = parseInt(paRange.value) + (paRange.value > 0 ? 9 : 0) + (paRange.value > 99 ? 9 : 0);
        var fsBoost = treeBoost + maBoost + paBoost; /* 1000ths */

        for (var card of cards) {
            var key = card.id;
            var atkValue = card.getElementsByClassName("atk-value")[0];
            var hpValue = card.getElementsByClassName("hp-value")[0];
            var fsValue = card.getElementsByClassName("fs-value")[0];

            var i = Math.max(0, evolveRange.value - variants[key].tier);
            var baseATK = variants[key].stats[i].attack * baseBoost;
            var baseHP = variants[key].stats[i].lifebar * baseBoost;

            var j = Math.max(evolveRange.value, variants[key].tier);
            var atk = Math.ceil(baseATK * (parseInt(levelTiers[j].value) + 4) / 50);
            var hp = Math.ceil(baseHP * (parseInt(levelTiers[j].value) + 4) / 50);
            var fs = Math.ceil(Math.round((6 * atk + hp) * 700 / 6) * fsBoost / 1000000);

            atkValue.dataset.value = atk;
            hpValue.dataset.value = hp;
            fsValue.dataset.value = fs;

            atkValue.innerHTML = atk.toLocaleString("en-US");
            hpValue.innerHTML = hp.toLocaleString("en-US");
            fsValue.innerHTML = fs.toLocaleString("en-US");
        }
        filterCards(); /* for the searchbox filter when language changes*/
        sortCards();
    }

    function updateCardSAs() {
        for (var card of cards) {
            var key = card.id;
            var sa = card.getElementsByClassName("sa")[0];
            var saDescriptions = sa.getElementsByClassName("description");
            for (var i = 0; i < saDescriptions.length; i++) {
                var saDescription = saDescriptions[i];
                var template = corpus[variants[key].sa.features[i].description] || "";
                for (var j = saRange.value - 1; j >= 0; j--) {
                    var tier = variants[key].sa.features[i].tiers[j];
                    if (tier && "values" in tier) {
                        var substitutions = tier.values;
                        if (redacted.includes(key)) {
                            template = template.replace(/\p{Lu}/gu, "█").replace(/[\p{Ll},.、。]/gu, "▄").replace(/['\-]/g, "▀").replace(/[^█▄▀\s{\d:%}]/g, "█");
                        }
                        saDescription.innerHTML = format(template, substitutions);
                        if (redacted.includes(key)) {
                            saDescription.innerHTML = saDescription.innerHTML.replace(/[\d%]/g, "█").replace(/[,.]/g, "▄");
                        }
                        break;
                    }
                }
            }
        }
    }

    function updateCardMAs() {
        for (var card of cards) {
            var key = card.id;
            var ma = card.getElementsByClassName("ma")[0];
            var maDescriptions = ma.getElementsByClassName("description");
            for (var i = 0; i < maDescriptions.length; i++) {
                var maDescription = maDescriptions[i];
                var template = [
                    corpus[fighters[variants[key].base].ma.features[i].title].toUpperCase(),
                    corpus[fighters[variants[key].base].ma.features[i].description]
                ].join(" - ");
                var substitutions = fighters[variants[key].base].ma.features[i].tiers[(maRange.value + 10) % 11].values;
                maDescription.innerHTML = format(template, substitutions);
            }
        }
        updateCardStats();
    }

    function updateCardPAs() {
        for (var card of cards) {
            var key = card.id;
            var pa = card.getElementsByClassName("pa")[0];
            var paDescription = pa.getElementsByClassName("description")[0];
            var rate = fighters[variants[key].base].pa.chargeRate;
            var value = fighters[variants[key].base].pa.base;
            if (paRange.value >= 2) {
                value += (Math.min(paRange.value, 99) - 1) * fighters[variants[key].base].pa.lvlBonus;
            }
            if (paRange.value >= 100) {
                value += fighters[variants[key].base].pa.maxBonus;
                value = Math.round(value); /* todo: fix if they ever make a fractional max value */
            }
            var template = corpus[fighters[variants[key].base].pa.description];
            var substitutions = [rate, value];
            switch (variants[key].base) {
                case "an": substitutions = [
                    rate,
                    fighters[variants[key].base].pa.starPower,
                    value
                ]; break;
                case "bb": substitutions = [
                    rate,
                    fighters[variants[key].base].pa.comboCount,
                    value
                ]; break;
                case "be": substitutions = [
                    rate,
                    value,
                    fighters[variants[key].base].pa.secondsElapsed
                ]; break;
                case "mf": substitutions = [
                    rate,
                    fighters[variants[key].base].pa.evasion,
                    value
                ]; break;
                case "um": substitutions = [
                    rate,
                    fighters[variants[key].base].pa.hungerDifference,
                    fighters[variants[key].base].pa.regen,
                    value
                ]; break;
                case "va": substitutions = [
                    rate,
                    fighters[variants[key].base].pa.healthRecovered,
                    fighters[variants[key].base].pa.resurrection,
                    value
                ]; break;
            }
            paDescription.innerHTML = format(template, substitutions);
        }
        updateCardStats();
    }

    updateCards = function () {
        updateCardStats();
        updateCardSAs();
        updateCardMAs();
        updateCardPAs();
    };

    function updatePresetButtons() {
        if (
            evolveRange.value == evolveRange.min &&
            levelBronze.value == levelBronze.min &&
            levelSilver.value == levelSilver.min &&
            levelGold.value == levelGold.min &&
            levelDiamond.value == levelDiamond.min &&
            treeNone.checked &&
            saRange.value == saRange.min &&
            maRange.value == maRange.min
        ) {
            optionBase.classList.add("pressed");
            optionDefault.classList.remove("pressed");
            optionMaximum.classList.remove("pressed");
        }
        else if (
            evolveRange.value == evolveRange.min &&
            levelBronze.value == levelBronze.min &&
            levelSilver.value == levelSilver.min &&
            levelGold.value == levelGold.min &&
            levelDiamond.value == levelDiamond.min &&
            treeNone.checked &&
            saRange.value == saRange.max &&
            maRange.value == maRange.max
        ) {
            optionBase.classList.remove("pressed");
            optionDefault.classList.add("pressed");
            optionMaximum.classList.remove("pressed");
        }
        else if (
            evolveRange.value == evolveRange.max &&
            levelDiamond.value == levelDiamond.max &&
            saRange.value == saRange.max &&
            maRange.value == maRange.max
        ) {
            optionBase.classList.remove("pressed");
            optionDefault.classList.remove("pressed");
            optionMaximum.classList.add("pressed");
        }
        else {
            optionBase.classList.remove("pressed");
            optionDefault.classList.remove("pressed");
            optionMaximum.classList.remove("pressed");
        }
    }

    function setValidInput(input, value) {
        if (isNaN(value)) {
            input.value = input.min;
        }
        else {
            input.value = Math.max(input.min, Math.min(value, input.max));
        }
        if (input.id == "sa-number" && input.value > 3) {
            input.classList.remove("maxed");
            input.classList.add("overmaxed");
        }
        else if (input.value == input.max || input.id == "sa-number" && input.value == 3) {
            input.classList.remove("overmaxed");
            input.classList.add("maxed");
        }
        else {
            input.classList.remove("overmaxed");
            input.classList.remove("maxed");
        }
    }

    function setAllToBase() {
        this.classList.add("pressed");
        optionDefault.classList.remove("pressed");
        optionMaximum.classList.remove("pressed");
        setValidInput(evolveRange, evolveRange.min);
        updateEvolve();
        setValidInput(levelRange, levelRange.min);
        setValidInput(levelBronze, levelBronze.min);
        setValidInput(levelSilver, levelSilver.min);
        setValidInput(levelGold, levelGold.min);
        setValidInput(levelDiamond, levelDiamond.min);
        treeNone.checked = true;
        setValidInput(saNumber, saNumber.min);
        setValidInput(saRange, saRange.min);
        setValidInput(maNumber, maNumber.min);
        setValidInput(maRange, maRange.min);
        setValidInput(paNumber, paNumber.min);
        setValidInput(paRange, paRange.min);
        updateCards();
    }

    function setAllToDefault() { /* TODO: make SA like MA and PA and display max values at level 0, but grayed out */
        optionBase.classList.remove("pressed");
        this.classList.add("pressed");
        optionMaximum.classList.remove("pressed");
        setValidInput(evolveRange, evolveRange.min);
        updateEvolve();
        setValidInput(levelRange, levelRange.min);
        setValidInput(levelBronze, levelBronze.min);
        setValidInput(levelSilver, levelSilver.min);
        setValidInput(levelGold, levelGold.min);
        setValidInput(levelDiamond, levelDiamond.min);
        treeNone.checked = true;
        setValidInput(saNumber, saNumber.max);
        setValidInput(saRange, saRange.max);
        setValidInput(maNumber, maNumber.min);
        setValidInput(maRange, maRange.min);
        setValidInput(paNumber, paNumber.min);
        setValidInput(paRange, paRange.min);
        updateCards();
    }

    function setAllToMaximum() {
        optionBase.classList.remove("pressed");
        optionDefault.classList.remove("pressed");
        this.classList.add("pressed");
        setValidInput(evolveRange, evolveRange.max);
        updateEvolve();
        setValidInput(levelRange, levelRange.max);
        setValidInput(levelBronze, levelBronze.max);
        setValidInput(levelSilver, levelSilver.max);
        setValidInput(levelGold, levelGold.max);
        setValidInput(levelDiamond, levelDiamond.max);
        treeAll.checked = true;
        setValidInput(saNumber, saNumber.max);
        setValidInput(saRange, saRange.max);
        setValidInput(maNumber, maNumber.max);
        setValidInput(maRange, maRange.max);
        setValidInput(paNumber, paNumber.max);
        setValidInput(paRange, paRange.max);
        updateCards();
    }

    function getMaximumLevel() {
        var max = 1;
        if (evolveRange.value < 1 && max < levelBronze.value) {
            max = parseInt(levelBronze.value);
        }
        if (evolveRange.value < 2 && max < levelSilver.value) {
            max = parseInt(levelSilver.value);
        }
        if (evolveRange.value < 3 && max < levelGold.value) {
            max = parseInt(levelGold.value);
        }
        if (evolveRange.value < 4 && max < levelDiamond.value) {
            max = parseInt(levelDiamond.value);
        }
        return max;
    }

    function updateEvolve() {
        for (var i = 0; i < 4; i++) {
            if (i == evolveRange.value) {
                document.body.classList.add(tiers[i]);
            }
            else {
                document.body.classList.remove(tiers[i]);
            }
            if (i == parseInt(evolveRange.value)) {
                evolveTiers[i].classList.add("underlined");
            }
            else {
                evolveTiers[i].classList.remove("underlined");
            }
            if (i < evolveRange.value) {
                levelTiers[i].classList.add("hidden");
            }
            else {
                levelTiers[i].classList.remove("hidden");
            }
        }
        setValidInput(levelRange, getMaximumLevel());
    }

    function setEvolveViaRange() {
        updateEvolve();
        updatePresetButtons();
        updateCardStats();
    }

    function setEvolveViaIcon() {
        evolveRange.value = evolveTiers.indexOf(this);
        updateEvolve();
        updatePresetButtons();
        updateCardStats();
    }

    function setLevelViaRange() {
        setValidInput(levelBronze, this.value);
        setValidInput(levelSilver, this.value);
        setValidInput(levelGold, this.value);
        setValidInput(levelDiamond, this.value);
        updatePresetButtons();
        updateCardStats();
    }

    function focusSelect() {
        this.select();
    }

    function setLevelViaNumber() {
        setValidInput(this, this.value);
        setValidInput(levelRange, getMaximumLevel());
        updatePresetButtons();
        updateCardStats();
    }

    function setTree() {
        updatePresetButtons();
        updateCardStats();
    }

    function setSAViaNumber() {
        setValidInput(this, this.value);
        setValidInput(saRange, this.value);
        updatePresetButtons();
        updateCardSAs();
    }

    function setSAViaRange() {
        setValidInput(saNumber, this.value);
        updatePresetButtons();
        updateCardSAs();
    }

    function setMAViaNumber() {
        setValidInput(this, this.value);
        setValidInput(maRange, this.value);
        updatePresetButtons();
        updateCardMAs();
    }

    function setMAViaRange() {
        setValidInput(maNumber, this.value);
        updatePresetButtons();
        updateCardMAs();
    }

    function setPAViaNumber() {
        setValidInput(this, this.value);
        setValidInput(paRange, this.value);
        updatePresetButtons();
        updateCardPAs();
    }

    function setPAViaRange() {
        setValidInput(paNumber, this.value);
        updatePresetButtons();
        updateCardPAs();
    }

    optionBase.addEventListener("click", setAllToBase);
    optionDefault.addEventListener("click", setAllToDefault);
    optionMaximum.addEventListener("click", setAllToMaximum);

    evolveRange.addEventListener("change", setEvolveViaRange);
    evolveBronze.addEventListener("click", setEvolveViaIcon);
    evolveSilver.addEventListener("click", setEvolveViaIcon);
    evolveGold.addEventListener("click", setEvolveViaIcon);
    evolveDiamond.addEventListener("click", setEvolveViaIcon);

    levelRange.addEventListener("change", setLevelViaRange);
    levelBronze.addEventListener("focus", focusSelect);
    levelSilver.addEventListener("focus", focusSelect);
    levelGold.addEventListener("focus", focusSelect);
    levelDiamond.addEventListener("focus", focusSelect);
    levelBronze.addEventListener("change", setLevelViaNumber);
    levelSilver.addEventListener("change", setLevelViaNumber);
    levelGold.addEventListener("change", setLevelViaNumber);
    levelDiamond.addEventListener("change", setLevelViaNumber);

    treeNone.addEventListener("change", setTree);
    treeAll.addEventListener("change", setTree);

    saNumber.addEventListener("focus", focusSelect);
    saNumber.addEventListener("change", setSAViaNumber);
    saRange.addEventListener("change", setSAViaRange);

    maNumber.addEventListener("focus", focusSelect);
    maNumber.addEventListener("change", setMAViaNumber);
    maRange.addEventListener("change", setMAViaRange);

    paNumber.addEventListener("focus", focusSelect);
    paNumber.addEventListener("change", setPAViaNumber);
    paRange.addEventListener("change", setPAViaRange);

    optionDefault.click();
}

function initCat() {
    function spawn() {
        var motion = document.createElement("div");
            motion.className = "cat-dolly";
            var cat = document.createElement("div");
                cat.className = "cat";
            motion.appendChild(cat);
        document.body.appendChild(motion);
        despawn(motion);
    }

    function despawn(e) {
        var box = e.getBoundingClientRect();
        if (box.right <= 0) {
            e.remove();
        }
        else {
            requestAnimationFrame(function () {
                despawn(e);
            });
        }
    }

    function throttleSpawn() {
        if (Math.random() < 0.001) {
            spawn();
        }
    }

    window.addEventListener("click", throttleSpawn);
}

function felExport() {
    function felFormat(feature) {
        var template = corpus[feature.description];
        var matches = template.match(/{\s*\d+(?::\d+)?%?\s*}%?/g);
        var formatted = template.replace(/<.*?>/g, "");
        if (matches) {
            for (var match of matches) {
                var index = parseInt(match.replace(/{\s*(\d+)(?::\d+)?%?\s*}%?/, "$1"));
                var subs = [];
                for (var i = 0; i < feature.tiers.length; i++) {
                    var subi = Math.abs(feature.tiers[i].values[index]);
                    if (match.includes("%}")) {
                        subi *= 100;
                    }
                    subi = Math.round(subi * 100) / 100; /* round to nearest 100th */
                    if (subs.length <= 0 || subs[subs.length - 1] != subi) {
                        subs.push(subi);
                    }
                }
                var substitute = subs.join("/") + (match.includes("%") ? "%" : "");
                formatted = formatted.replace(match, substitute);
            }
        }
        else {
            console.warn("No placeholders found in \"" + template + "\".");
        }
        if (formatted.match(/NaN/g)) {
            console.warn("NaN detected within \"" + template + "\.");
        }
        return formatted;
    }

    function felStats(stats) { /* unused */
        var baseBoost = 15;
        var fsBoost = 1688;
        
        var i = stats.length - 1;
        var baseATK = stats[i].attack * baseBoost;
        var baseHP = stats[i].lifebar * baseBoost;

        var atk = Math.ceil(baseATK * 64 / 50);
        var hp = Math.ceil(baseHP * 64 / 50);
        var fs = Math.ceil(Math.round((6 * atk + hp) * 700 / 6) * fsBoost / 1000000);

        return {
            "atk": stats[0].attack.toLocaleString("en-US"),
            "hp": stats[0].lifebar.toLocaleString("en-US"),
            "fs": Math.ceil((6 * stats[0].attack + stats[0].lifebar) * 7 / 60).toLocaleString("en-US"),
            "maxatk": atk.toLocaleString("en-US"),
            "maxhp": hp.toLocaleString("en-US"),
            "maxfs": fs.toLocaleString("en-US")
        };
    }

    var emojiID = {
        "an": "<:sp_an:767922687204524032>",
        "bb": "<:sp_bb:684054646528147500>",
        "bd": "<:sp_bd:1115123780705063043>",
        "be": "<:sp_beo:684771548414083107>",
        "ce": "<:sp_cb:685401170495537152>",
        "do": "<:sp_db:692275933536845884>",
        "el": "<:sp_el:692287012450992219>",
        "fi": "<:sp_fi:698821373698637894>",
        "fu": "<:sp_fu:698919709336141886>",
        "ma": "<:sp_ma:1247164362528133210>",
        "mf": "<:sp_mf:698837829467242496>",
        "pa": "<:sp_pa:698884548678910043>",
        "pe": "<:sp_pe:698879915713626142>",
        "pw": "<:sp_pw:698904045389348914>",
        "rf": "<:sp_rf:698919676612313168>",
        "sq": "<:sp_sq:698909665077231776>",
        "um": "<:sp_um:969082448082268241>",
        "va": "<:sp_va:698852651617746974>"
    };

    var fel = {
        "heatsynced": { /* legacy Fire Branded */
            "name": "Heat Synced",
            "rarity": "diamond",
            "element": "fire",
            "character": "<:sp_an:767922687204524032> Annie",
            "image": "https://raw.githubusercontent.com/Krazete/sgm/main/image/stanley/an/hSync.png",
            "stats": {
                "atk": "706",
                "hp": "3335",
                "fs": "884"
            },
            "ability": "SEARING STARS",
            "SA1": "Gain ENRAGE for 10/12/15 seconds when using a SPECIAL MOVE or BLOCKBUSTER while in STAR POWER mode.",
            "SA2": "CHARGE ATTACKS consume all stacks of ENRAGE, inflicting STUN and HEAVY BLEED for 1/1.5/2 second(s) per stack consumed."
        }
    };
    for (var vid in variants) {
        var variant = variants[vid];
        var id = variant.fandom.replace(/\W+/g, "").toLowerCase();
        var value = {
            "name": corpus[variant.name],
            "rarity": tiers[variant.tier],
            "element": elements[variant.element].replace(/wind/g, "air"),
            "character": emojiID[variant.base] + " " + corpus[fighters[variant.base].name],
            "image": "https://raw.githubusercontent.com/Krazete/sgm/main/image/stanley/" + variant.base + "/" + vid + ".png",
            "stats": {
                "atk": variant.stats[0].attack.toString(),
                "hp": variant.stats[0].lifebar.toString(),
                "fs": Math.ceil((6 * variant.stats[0].attack + variant.stats[0].lifebar) * 7 / 60).toString()
            },
            "ability": corpus[variant.sa.title],
            "SA1": felFormat(variant.sa.features[0]),
            "SA2": felFormat(variant.sa.features[1])
        };
        for (var i = 2; i < variant.sa.features.length; i++) { /* raid bosses */
            var feature = variant.sa.features[i];
            if (feature.description) {
                value["SA" + (i + 1)] = felFormat(feature);
            }
        }
        fel[id] = value;
    }

    var a = document.createElement("a");
    var blob = new Blob([JSON.stringify(fel, null, 4)], {"type": "application/json"});
    a.href = URL.createObjectURL(blob);
    a.download = "stanleyDB.json";
    a.click();
}

function initialize() {
    function initFooter() {
        initDock();
        initFilterMenu();
        initSortMenu();
        initOptionsMenu();
        initCat();
    }

    toggleLoadingScreen(true);
    Promise.all([
        loadJSON("data/characters.json"),
        loadJSON("data/variants.json")
    ]).then(initCollection).then(initLanguageMenu).then(initFooter).then(function () {
            /* variant id search helper
            cards.forEach(e => e.innerHTML = e.id + "<br>" + corpus[variants[e.id].name]);
            */
            var patchnotes = "https://hub.skullgirlsmobile.com/updates/game-update-83-patch-notes-aroo-you-ready-occult-overload";
            var vids = {
                new: {
                    _url: patchnotes,
                    _class: "frame",
                    LLure: "Lucky Lure Umbrella,-Element",
                    NBrakes: "Grand Mother Double,-Element",
                },
                guilds: {
                    _url: patchnotes,
                    _class: "frame",
                    crittyKitty: "Critty Kitty",
                },
            };

            function addLabel(id, type, url, classname) {
                var text = type.toUpperCase();
                var element = document.getElementById(id).getElementsByClassName(classname)[0];
                var textFragment = vids[type][id] == "" ? "" : (
                    "#:~:text=" + encodeURI(vids[type][id]).replace(/,/g, "%2C").replace(/-/g, "%2D").replace(/%2C%2D/g, ",-")
                );
                var label = document.createElement("a");
                label.className = "patch";
                label.innerHTML = text;
                label.target = "_blank";
                label.href = url + textFragment;
                element.appendChild(label);
            }

            var j = 0;
            for (var type in vids) {
                for (var vid in vids[type]) {
                    if (!vid.startsWith("_")) {
                        try {
                            addLabel(vid, type, vids[type]._url, vids[type]._class);
                            document.getElementById("collection").insertBefore(document.getElementById(vid), document.getElementsByClassName("card")[j++]);
                        } catch (e) {}
                    }
                }
            }
    }).then(toggleLoadingScreen);
}

document.addEventListener("DOMContentLoaded", initialize);
