var elements = ["fire", "water", "wind", "light", "dark", "null"];
var tiers = ["bronze", "silver", "gold", "diamond"];

var skull = {
    "Filia": {
        "Bad Hair Day": {
            "tier": 0,
            "element": 4,
            "signature": {
                "name": "Razor Shears",
                "1": "10% chance on HIT to inflict BLEED for 7 seconds",
                "2": "15% bonus to CRIT RATE if opponent has BLEED"
            },
            "fs": 6673,
            "hp": 18372,
            "atk": 3468
        }
    }
};

var marquee = {
    "Filia": {
        "name": "Bloodletting",
        "1": "LEECH - 5% of the DAMAGE Filia inflicts is regained as HEALTH",
        "2": "THE FIRST CUT - Every HIT has a 5% chance to convert all active BLEEDS to permanent BLEEDS"
    }
};

for (var girl in skull) {
    for (var variant in skull[girl]) {
        var card = document.createElement("div");
        card.className = "card";
        var moniker = document.createElement("h1");
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
