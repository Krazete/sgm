var elements = ["fire", "water", "air", "light", "dark", "neutral"];
var tiers = ["bronze", "silver", "gold", "diamond"];
var ratings = ["F", "E", "D", "C", "B", "A", "S"];

var skull = {
    "Filia": {
        "Parasite Weave": {
            "tier": 2,
            "element": 0,
            "signature": {
                "name": "ENTANGLEMENT",
                "1": "50% chance on CRITICAL HIT to STUN opponent for 3 seconds",
                "2": "15% chance on HIT to inflict BLEED if opponent is STUNNED"
            },
            "fs": 9096,
            "hp": 25014,
            "atk": 4731
        },
        "Windswept": {
            "tier": 2,
            "element": 2,
            "signature": {
                "name": "BLOWBACK",
                "1": "Gain a 50% chance to EVADE all projectiles, avoiding damage and hit reaction",
                "2": "After EVADING, gain HASTE and ENRAGE for 10 seconds"
            },
            "fs": 9396,
            "hp": 22500,
            "atk": 5444
        },
        "Bad Ms Frosty": {
            "tier": 1,
            "element": 1,
            "signature": {
                "name": "ICE TO SEE YOU",
                "1": "50% chance on CRITICAL HIT to DISABLE opponent's TAG INS and SPECIAL MOVES for 6 seconds",
                "2": "Also DISABLES opponent's BLOCKBUSTER METER for 6 seconds"
            },
            "fs": 7791,
            "hp": 21434,
            "atk": 4051
        },
        "Hair Apparent": {
            "tier": 1,
            "element": 2,
            "signature": {
                "name": "HAIR TRIGGER",
                "1": "COOLDOWN for TAG INS is reduced by 25% for all teammates",
                "2": "COOLDOWN for SPECIAL MOVES is reduced by 25% for all teammates."
            },
            "fs": 8053,
            "hp": 19279,
            "atk": 4667
        },
        "Dread Locks": {
            "tier": 2,
            "element": 3,
            "signature": {
                "name": "LOCK NEST MONSTER",
                "1": "When HIT, reflect 35% of the incoming damage",
                "2": "If the opponent lands a CRITICAL HIT, the opponent will receive HEAVY BLEED for 10 seconds"
            },
            "fs": 8792,
            "hp": 27509,
            "atk": 4019
        },
        "Bad Hair Day": {
            "tier": 0,
            "element": 4,
            "signature": {
                "name": "RAZOR SHEARS",
                "1": "5% chance on HIT to inflict BLEED for 7 seconds",
                "2": "10% bonus to CRIT RATE if opponent has BLEED."
            },
            "fs": 6673,
            "hp": 18372,
            "atk": 3468
        },
        "Frayed Ends": {
            "tier": 0,
            "element": 0,
            "signature": {
                "name": "CUT IT OUT!",
                "1": "15% chance when HIT to inflict BLEED for 7 seconds",
                "2": "Inflict 50% bonus damage against an opponent with BLEED"
            },
            "fs": 7120,
            "hp": 22260,
            "atk": 3257
        },
        "Idol Threat": {
        	"tier": 2,
        	"element": 1,
        	"signature": {
        		"name": "",
        		"1": "",
        		"2": ""
        	},
        	"fs": -1,
        	"hp": -1,
        	"atk": -1
        }
    },
    "Cerebella": {
        "Harlequin": {
            "tier": 2,
            "element": 0,
            "signature": {
                "name": "SPECIAL ATTRACTION",
                "1": "SPECIAL MOVE damage is increased by 20% for all teammates",
                "2": "COOLDOWN for SPECIAL MOVES is reduced by 35% for all teammates"
            },
            "fs": 11138,
            "hp": 28934,
            "atk": 6075
        },
        "Brain Freeze": {
            "tier": 2,
            "element": 1,
            "signature": {
                "name": "FROZEN OVER",
                "1": "ATTACK damage is increased by 3% of your CURRENT HEALTH",
                "2": "Damage inflicted by the opponent is reduced by 3% of current COMBO HIT"
            },
            "fs": 10900,
            "hp": 32200,
            "atk": 5282
        },
        "Armed Forces": {
            "tier": 2,
            "element": 2,
            "signature": {
                "name": "DIAMOND DEFENCE",
                "1": "Getting HIT has a 5% chance to grant ARMOR for 15 seconds.",
                "2": "Also gain UNFLINCHING for 15 seconds"
            },
            "fs": 10614,
            "hp": 35382,
            "atk": 4488
        },
        "Headstrong": {
            "tier": 0,
            "element": 3,
            "signature": {
                "name": "BIG BREAK",
                "1": "THROWS have a 50% chance to inflict CRIPPLE for 7 seconds",
                "2": "Also inflict ARMOR BREAK for 7 seconds"
            },
            "fs": 9038,
            "hp": 23410,
            "atk": 4942
        },
        "Big Top": {
            "tier": 1,
            "element": 3,
            "signature": {
                "name": "ENCORE",
                "1": "Once per match, RESURRECT with 50% HEALTH when defeated",
                "2": "RESURRECT with INVINCIBLE and UNFLINCHING for 6 seconds"
            },
            "fs": 9107,
            "hp": 30327,
            "atk": 3857
        },
        "Gray Matter": {
            "tier": 1,
            "element": 4,
            "signature": {
                "name": "HAT TRICK",
                "1": "Start every match with 20% meter for all BLOCKBUSTERS",
                "2": "Teammates start every match with 20% meter for all BLOCKBUSTERS"
            },
            "fs": 9314,
            "hp": 27557,
            "atk": 4521
        },
        "Understudy": {
            "tier": 0,
            "element": 1,
            "signature": {
                "name": "THROW DOWN",
                "1": "Gain a 50% bonus to THROW damage",
                "2": "All teammates gain a 50% bonus to THROW damage"
            },
            "fs": 7998,
            "hp": 23621,
            "atk": 3889
        }
    },
    "Peacock": {
        "Untouchable": {
            "tier": 2,
            "element": 1,
            "signature": {
                "name": "BULLETPROOF",
                "1": "15% chance on getting HIT to avoid all damage (also applies while blocking)",
                "2": "Also gain UNFLINCHING for 6 seconds"
            },
            "fs": 9604,
            "hp": 27500,
            "atk": 4812
        },
        "Ultraviolent": {
            "tier": 2,
            "element": 4,
            "signature": {
                "name": "DEATH THROW",
                "1": "Projectiles have a 50% chance to ignore the opponent's DEFENCE and ARMOR",
                "2": "Projectiles inflict 50% more damage against opponents with UNFLINCHING or ARMOR"
            },
            "fs": 10000,
            "hp": 22500,
            "atk": 6075
        },
        "Pea Shooter": {
            "tier": 1,
            "element": 2,
            "signature": {
                "name": "VINTAGE PROJECTOR",
                "1": "Projectiles inflict 35% more damage for all teammates",
                "2": "All projectiles have a 15% chance to inflict ARMOR BREAK for 6 seconds."
            },
            "fs": 8583,
            "hp": 19300,
            "atk": 5185
        },
        "That's All Folks!": {
            "tier": 2,
            "element": 3,
            "signature": {
                "name": "SLAPSTICK",
                "1": "Getting HIT has a 10% chance to gain ENRAGE for 10 seconds",
                "2": "Also inflicts ARMOR BREAK on the opponent for 10 seconds"
            },
            "fs": 9659,
            "hp": 25000,
            "atk": 5282
        },
        "Inkling": {
            "tier": 1,
            "element": 4,
            "signature": {
                "name": "GANGING UP",
                "1": "Inflict 15% bonus damage for each living teammate",
                "2": "All teammates TAG IN with ENRAGE for 6 seconds"
            },
            "fs": 8271,
            "hp": 21400,
            "atk": 4520
        },
        "Sketchy ": {
            "tier": 0,
            "element": 2,
            "signature": {
                "name": "RUNNING GAG",
                "1": "On TAG IN, SLOW opponent's BLOCKBUSTERS for 10 seconds",
                "2": "On TAG IN, gain HASTE for all BLOCKBUSTERS for 7 seconds"
            },
            "fs": 8152,
            "hp": 18200,
            "atk": 4941
        },
        "Rerun": {
            "tier": 0,
            "element": 0,
            "signature": {
                "name": "ENSEMBLE CAST",
                "1": "TAG INS inflict 100% more damage for all teammates",
                "2": "COOLDOWN for TAG INS reduced by 50% for all teammates"
            },
            "fs": 7104,
            "hp": 18400,
            "atk": 3888
        }
    },
    "Parasoul": {
        "Primed": {
            "tier": 2,
            "element": 4,
            "signature": {
                "name": "SCREWED ATTACK",
                "1": "Gain ENRAGE for 10 seconds when spawning a TEAR",
                "2": "On TEAR DETONATION, inflict BLEED on opponent for 5 seconds per active TEAR"
            },
            "fs": 9946,
            "hp": 25700,
            "atk": 5444
        },
        "No Egrets": {
            "tier": 1,
            "element": 1,
            "signature": {
                "name": "MARTIAL LAW",
                "1": "On CRITICAL HIT, DISABLE opponent's BLOCKBUSTERS for 4 seconds",
                "2": "Also DISABLES opponent's SPECIAL MOVES and TAG INS for 4 seconds"
            },
            "fs": 8312,
            "hp": 24500,
            "atk": 4051
        },
        "Regally Blonde": {
            "tier": 2,
            "element": 1,
            "signature": {
                "name": "ON ICE",
                "1": "When an opponent uses a BLOCKBUSTER, there is a 50% chance that their remaining BLOCKBUSTER METERS are reduced by 75%",
                "2": "On TEAR DETONATION, each active tear DISABLES opponent SPECIAL MOVES, BLOCKBUSTERS, or TAG INS for 8 seconds"
            },
            "fs": 9707,
            "hp": 28600,
            "atk": 4731
        },
        "Princess Pride": {
            "tier": 2,
            "element": 3,
            "signature": {
                "name": "TEARS OF JOY",
                "1": "Gain REGEN for 6 seconds when spawning a TEAR",
                "2": "On TEAR DETONATION, immediately recover 6% HEALTH per active TEAR"
            },
            "fs": 9460,
            "hp": 31400,
            "atk": 4018
        },
        "Heavy Reign": {
            "tier": 0,
            "element": 2,
            "signature": {
                "name": "OVERCAST",
                "1": "50% chance on CRITICAL HIT to gain 15% meter for BLOCKBUSTERS",
                "2": "50% chance to gain 15%. meter for all BLOCKBUSTERS when suffering a CRITICAL HIT"
            },
            "fs": 7656,
            "hp": 25400,
            "atk": 3257
        },
        "Ivy League": {
            "tier": 1,
            "element": 2,
            "signature": {
                "name": "FENCED IN",
                "1": "SLOW opponent's BLOCKBUSTERS for 10 seconds when spawning a TEAR",
                "2": "On TEAR DETONATION, drain -20% of the opponent's METER per active TEAR"
            },
            "fs": 8525,
            "hp": 22000,
            "atk": 4667
        },
        "Sheltered": {
            "tier": 0,
            "element": 0,
            "signature": {
                "name": "OVERLY CRITICAL",
                "1": "Increases CRIT RATE by 10%",
                "2": "Increases teammates CRIT RATE by 10%"
            },
            "fs": 7120,
            "hp": 21000,
            "atk": 3468
        },
        "Star Crossed": {
        	"tier": 2,
        	"element": 1,
        	"signature": {
        		"name": "",
        		"1": "",
        		"2": ""
        	},
        	"fs": -1,
        	"hp": -1,
        	"atk": -1
        }
    },
    // "Ms. Fortune": {},
    "Painwheel": {
        "Raw Nerv": {
            "tier": 2,
            "element": 4,
            "signature": {
                "name": "DEATH'S DOOR",
                "1": "Gain permanent ENRAGE when your HEALTH drops below 25%",
                "2": "Attacks quickly build BLOCKBUSTER meter whenever HEALTH is below 50%"
            },
            "fs": 9628,
            "hp": 21400,
            "atk": 5848
        },
        "Buzzkill": {
            "tier": 2,
            "element": 2,
            "signature": {
                "name": "HEMORRHAGE",
                "1": "5% chance on HIT to inflict HEAVY BLEED for 10 seconds",
                "2": "Gain ENRAGE for 10 seconds when an opponent's HEALTH drops below 25%"
            },
            "fs": 10158,
            "hp": 19300,
            "atk": 6723
        },
        "Blood Drive": {
            "tier": 1,
            "element": 0,
            "signature": {
                "name": "TRANSFUSION",
                "1": "5% chance on HIT to inflict BLEED on self and HEAVY BLEED on opponent for 10 seconds",
                "2": "Also gain ENRAGE for 6 seconds for every BLEED effect applied to Painwheel"
            },
            "fs": 8262,
            "hp": 18400,
            "atk": 5022
        },
        "Firefly": {
            "tier": 2,
            "element": 4,
            "signature": {
                "name": "SERENITY",
                "1": "When BLOCKING below 50% HEALTH, gain 8% HEALTH per second",
                "2": "Also gain 8% BLOCKBUSTER METER per second"
            },
            "fs": 9103,
            "hp": 23600,
            "atk": 4974
        },
        "Rusty": {
            "tier": 0,
            "element": 3,
            "signature": {
                "name": "BLEED FOR ME",
                "1": "10% chance on HIT to inflict BLEED for 3 seconds",
                "2": "Also converts 2 of the enemy's beneficial COMBAT EFFECT(S) into BLEED"
            },
            "fs": 7087,
            "hp": 15700,
            "atk": 4309
        },
        "Twisted Mettle": {
            "tier": 0,
            "element": 1,
            "signature": {
                "name": "CUTTING EDGE",
                "1": "When suffering a CRITICAL HIT, inflict BLEED for 5 seconds",
                "2": "50% chance on HIT to inflict BLEED for 3 seconds if opponent has BLEED"
            },
            "fs": 7368,
            "hp": 19000,
            "atk": 4034
        },
        "Rage Appropriate": {
            "tier": 1,
            "element": 1,
            "signature": {
                "name": "THIN SKINNED",
                "1": "Gain ENRAGE for 10 seconds every time an opponent's attack inflicts more than 10% total HEALTH",
                "2": "Once per match, gain HEAVY REGEN for 5 seconds when HEALTH drops below 25%"
            },
            "fs": 7795,
            "hp": 20200,
            "atk": 4261
        },
        "Grim Fan": {
        	"tier": 2,
        	"element": 1,
        	"signature": {
        		"name": "",
        		"1": "",
        		"2": ""
        	},
        	"fs": -1,
        	"hp": -1,
        	"atk": -1
        }
    },
    "Valentine": {
        "Surgeon General": {
            "tier": 2,
            "element": 2,
            "signature": {
                "name": "STIMPAK",
                "1": "While Valentine is alive, she gains a permanent ENRAGE every 30 seconds",
                "2": "While Valentine is alive, teammates gain IMMUNE and HEAVY REGEN for 15 seconds every 30 seconds"
            },
            "fs": 9245,
            "hp": 25700,
            "atk": 4763
        },
        "Silent Kill": {
            "tier": 2,
            "element": 1,
            "signature": {
                "name": "FOGGY MEMORY",
                "1": "20% chance on HIT to REMOVE all negative COMBAT EFFECTS from self",
                "2": "20% chance on HIT to REMOVE all beneficial COMBAT EFFECTS from opponent"
            },
            "fs": 9107,
            "hp": 28578,
            "atk": 4148
        },
        "Last Hope": {
            "tier": 2,
            "element": 3,
            "signature": {
                "name": "URGENT CARE",
                "1": "Once per match while Valentine is alive, teammates gain HEAVY REGEN for 10 seconds when dropping below 25% HEALTH",
                "2": "Once per match when defeated, RESURRECT with 50% health"
            },
            "fs": 8964,
            "hp": 31429,
            "atk": 3533
        },
        "Oh Mai": {
            "tier": 1,
            "element": 0,
            "signature": {
                "name": "DEADLY FURY",
                "1": "Gain ENRAGE for 15 seconds after defeating an opponent",
                "2": "When any teammate is defeated, all remaining teammates gain ENRAGE for 15 seconds"
            },
            "fs": 7929,
            "hp": 22049,
            "atk": 4083
        },
        "Icy Hot": {
            "tier": 0,
            "element": 1,
            "signature": {
                "name": "FIRST RESPONDER",
                "1": "All teammates TAG IN with REGEN for 6 seconds",
                "2": "On TAG IN, all teammates gain 15% meter for ALL BLOCKBUSTERS"
            },
            "fs": 7465,
            "hp": 20786,
            "atk": 3840
        },
        "Graveyard Shift": {
            "tier": 1,
            "element": 4,
            "signature": {
                "name": "FORENSICS",
                "1": "Gain REGEN for 15 seconds after defeating an opponent",
                "2": "When any teammate is defeated, all remaining teammates gain REGEN for 15 seconds"
            },
            "fs": 7686,
            "hp": 26942,
            "atk": 3030
        },
        "Scrub": {
            "tier": 0,
            "element": 2,
            "signature": {
                "name": "OUTPATIENT",
                "1": "Teammates in reserve regenerate SCRATCH DAMAGE 100% faster",
                "2": "Teammates in reserve gain BLOCKBUSTER meter 20% faster"
            },
            "fs": 6690,
            "hp": 20996,
            "atk": 3047
        },
        "Pyro Technique": {
        	"tier": 2,
        	"element": 1,
        	"signature": {
        		"name": "",
        		"1": "",
        		"2": ""
        	},
        	"fs": -1,
        	"hp": -1,
        	"atk": -1
        }
    },
    "Double": {
        "Rainbow Blight": {
            "tier": 2,
            "element": 5,
            "signature": {
                "name": "PENTAGLAM",
                "1": "When TRANSMUTING, gain BUFfs based on the resulting ELEMENT for 10 seconds",
                "2": "When TRANSMUTING, inflict DEBUFfs based on the resulting ELEMENT for 10 seconds"
            },
            "fs": -1,
            "hp": 21400,
            "atk": 5282
        },
        "Doublicious": {
            "tier": 1,
            "element": 3,
            "signature": {
                "name": "STICKY FINGERS",
                "1": "25% chance on HIT to transfer 1 BUFF from the opponent to yourself",
                "2": "25% chance when HIT to transfer 1 DEBUFF from yourself to the opponent"
            },
            "fs": -1,
            "hp": 18300,
            "atk": 4520
        },
        "Xenomorph": {
            "tier": 2,
            "element": 4,
            "signature": {
                "name": "GAME OVER",
                "1": "100% chance when TRANSMUTING to the DARK element to inflict a permanent DOOM effect, killing the enemy after 30 seconds. DOOM will be removed if Double is defeated",
                "2": "On DEATH, inflict 3 stack(s) of permanent BLEED"
            },
            "fs": -1,
            "hp": 19300,
            "atk": 6075
        },
        "Immoral Fiber": {
            "tier": 2,
            "element": 0,
            "signature": {
                "name": "REAP AND SEW",
                "1": "On DEATH, deal damage equivalent to 50% of your MAX HEALTH",
                "2": "On DEATH, heal all teammates by 50% of your MAX HEALTH"
            },
            "fs": -1,
            "hp": 23600,
            "atk": 4812
        },
        "Nunsense": {
            "tier": 0,
            "element": 2,
            "signature": {
                "name": "COUNTERFEIT",
                "1": "When at an ELEMENTAL ADVANTAGE, gain a random BUFF for 15 seconds any time the opponent gains a BUFF",
                "2": "When at an ELEMENTAL ADVANTAGE, inflict a random DEBUFF for 15 seconds after suffering any DEBUFF"
            },
            "fs": -1,
            "hp": 15700,
            "atk": 3888
        },
        "Temple Tyrant": {
            "tier": 1,
            "element": 1,
            "signature": {
                "name": "MORPHA",
                "1": "When TRANSMUTING to an ELEMENTAL ADVANTAGE, heal for 15% HEALTH",
                "2": "Gain a 50% chance to ignore any DEBUFF when at an ELEMENTAL ADVANTAGE"
            },
            "fs": -1,
            "hp": 20200,
            "atk": 3856
        },
        "Sundae School": {
            "tier": 0,
            "element": 1,
            "signature": {
                "name": "MELTING POINT",
                "1": "When any teammate inflicts a DEBUFF (excluding STUN), increase its duration by 3 second(s)",
                "2": "When any teammate suffers a DEBUFF (excluding STUN), reduce its duration by 3 second(s)"
            },
            "fs": -1,
            "hp": 19000,
            "atk": 3628
        }
    },
    "Squigly": {
        "Nearly Departed": {
            "element": 3,
            "tier": 1,
            "signature": {
                "name": "Abracadaver",
                "1": "When using a BLOCKBUSTER with an ODD COMBO COUNT, gain INVINCIBLE for 8 seconds",
                "2": "Also RESSURECT teammates with 25% HEALTH, if Squigly is below 25% HEALTH"
            },
            "fs": -1,
            "hp": -1,
            "atk": -1
        },
        "Dead Heat": {
            "element": 0,
            "tier": 1,
            "signature": {
                "name": "Immolation",
                "1": "BLOCKBUSTERS and SPECIAL MOVES become UNBLOCKABLE while below 25% HEALTH",
                "2": "If your opponent has a fully charged BLOCKBUSTER and you do not, gain 3% BLOCKBUSTER METER per second"
            },
            "fs": -1,
            "hp": -1,
            "atk": -1
        },
        "Scared Stiff": {
            "element": 3,
            "tier": 0,
            "signature": {
                "name": "Rigor Mortis",
                "1": "Gain UNFLINCHING for 5 seconds every 30 seconds",
                "2": "Cannot suffer more than 20% of your MAX HEALTH from a single HIT"
            },
            "fs": -1,
            "hp": -1,
            "atk": -1
        },
        "Stage Fright": {
            "element": 4,
            "tier": 0,
            "signature": {
                "name": "Memento Mori",
                "1": "When the opponent's health frops below 25% HEALTH, they will be afflicted with CURSE and HEX fro 10 seconds",
                "2": "Inflict a 30 seconds DOOM when defeated with a BLOCKBUSTER"
            },
            "fs": -1,
            "hp": -1,
            "atk": -1
        },
        "Necrobreaker": {
        	"tier": 2,
        	"element": 1,
        	"signature": {
        		"name": "",
        		"1": "",
        		"2": ""
        	},
        	"fs": -1,
        	"hp": -1,
        	"atk": -1
        }
    },
    "Big Band": {
        "Epic Sax": {
            "element": 3,
            "tier": 2,
            "signature": {
                "name": "Circular Breathing",
                "1": "Gain 3% bonus damage per COMBO HIT, up to a 50% bonus",
                "2": "Gain a random beneficial COMBAT EFFECT for every 10 COMBO HITS"
            },
            "fs": 10300,
            "hp": 32100,
            "atk": 4700
        },
        "Resonant Evil": {
            "element": 4,
            "tier": 1,
            "signature": {
                "name": "Master of Unblocking",
                "1": "Getting HIT has a 10% chance to grant ARMOR for 10 seconds",
                "2": "Gain a 5% chance when HIT to STUN opponent for 4 seconds if you have ARMOR"
            },
            "fs": 8833,
            "hp": 33700,
            "atk": 3000
        },
        "Private Dick": {
            "element": 0,
            "tier": 2,
            "signature": {
                "name": "Stunning Performance",
                "1": "5% chance on HIT to STUN opponent for 3 seconds",
                "2": "Gain a 100% RESISTANCE to STUN effects"
            },
            "fs": 10300,
            "hp": 35700,
            "atk": 4100
        },
        "Robocopy": {
            "element": 1,
            "tier": 1,
            "signature": {
                "name": "Dead or Alive",
                "1": "Defeating an opponent grants 2 stacks of ARMOR and ENRAGE for 10 seconds",
                "2": "Also gain 50% meter for all BLOCKBUSTERS"
            },
            "fs": 8866,
            "hp": 27500,
            "atk": 4000
        },
        "Beat Box ": {
            "element": 0,
            "tier": 0,
            "signature": {
                "name": "Freestyle",
                "1": "Gain Enrage for 5 seconds when using a special move",
                "2": "Also gain 20% meter for all blockbusters"
            },
            "fs": 8350,
            "hp": 2600,
            "atk": 3800
        },
        "G.I. Jazz": {
            "element": 2,
            "tier": 2,
            "signature": {
                "name": "Reserve Tank",
                "1": "Once per match, gain 5 stacks of REGEN for 10 seconds when falling below 25% HEALTH",
                "2": "Also gain 3 stack(s) of ARMOR"
            },
            "fs": 10300,
            "hp": 39300,
            "atk": 3532
        },
        "Bassline": {
            "element": 2,
            "tier": 0,
            "signature": {
                "name": "Second Wind",
                "1": "On TAG IN, gain REGEN for 10 seconds",
                "2": "Also gain 15% meter for all blockbusters"
            },
            "fs": 7583,
            "hp": 26200,
            "atk": 3000
        },
        "Megasonic": {
        	"tier": 2,
        	"element": 1,
        	"signature": {
        		"name": "",
        		"1": "",
        		"2": ""
        	},
        	"fs": -1,
        	"hp": -1,
        	"atk": -1
        }
    },
    "Eliza": {
        "Diva Intervention": {
            "tier": 2,
            "element": 3,
            "signature": {
                "name": "BLEACHED BONE",
                "1": "50% of the damage inflicted by Sekhmet attacks is regained as HEALTH",
                "2": "Sekhmet attacks drain 8% of the opponent's BLOCKBUSTER METER"
            },
            "fs": 10313,
            "hp": 32158,
            "atk": 4731
        },
        "Bloodbath": {
            "tier": 2,
            "element": 4,
            "signature": {
                "name": "SANGUINE SOLO",
                "1": "If either Fighter uses a BLOCKBUSTER, both fighters are afflicted with BLEED for 10 seconds",
                "2": "100% chance to convert all BLEED effects on self into REGEN"
            },
            "fs": 10492,
            "hp": 28934,
            "atk": 5444
        },
        "In Denile": {
            "tier": 0,
            "element": 1,
            "signature": {
                "name": "BENEATH THE SKIN",
                "1": "Gain ARMOR for 15 seconds when triggering Sekhmet",
                "2": "Remove all negative COMBAT EFFECTS and gain IMMUNE for 15 seconds when triggering Sekhmet"
            },
            "fs": 7567,
            "hp": 23621,
            "atk": 3468
        },
        "Bloody Valentine": {
            "tier": 1,
            "element": 2,
            "signature": {
                "name": "PYRAMID SCHEME",
                "1": "Regain 10% HEALTH when either Fighter uses a SPECIAL MOVE",
                "2": "Regain 15% meter for all BLOCKBUSTERS when either Fighter uses a BLOCKBUSTER"
            },
            "fs": 8834,
            "hp": 27557,
            "atk": 4051
        },
        "Scarlet Viper": {
            "tier": 1,
            "element": 0,
            "signature": {
                "name": "SEEING RED",
                "1": "Inflict BLEED for 15 seconds on both fighters when triggering Sekhmet",
                "2": "Gain ENRAGE for 15 seconds when suffering a DEBUFF"
            },
            "fs": 8991,
            "hp": 24787,
            "atk": 4667
        },
        "Red Velvet": {
            "tier": 2,
            "element": 0,
            "signature": {
                "name": "WITCHING HOUR",
                "1": "Inflict HEX for 15 seconds when triggering Sekhmet, disabling opponent SIGNATURE ABILITIES for the duration of the effect",
                "2": "If an opponent TAGS OUT while suffering from HEX, the next opponent will be inflicted with 3 random DEBUFFS for 15 seconds"
            },
            "fs": 10100,
            "hp": 35400,
            "atk": 4018
        },
        "Decrypted": {
            "tier": 0,
            "element": 4,
            "signature": {
                "name": "ENVY",
                "1": "Inflict 50% bonus damage against an opponent with beneficial COMBAT EFFECTS",
                "2": "Convert 3 enemy BUFF(S) to BLEED when triggering Sekhmet."
            },
            "fs": 8202,
            "hp": 28610,
            "atk": 3257
        }
    },
    "Beowulf": {
        "Wulfsbane": {
            "tier": 2,
            "element": 4,
            "signature": {
                "name": "FORCE CHOKE",
                "1": "THROWS have a 50% chance to inflict CRIPPLE and HEAL BLOCK for 10 seconds",
                "2": "50% bonus damage against enemies suffering from a negative COMBAT EFFECT"
            },
            "fs": 10600,
            "hp": 25700,
            "atk": 6075
        },
        "Dragon Brawler": {
            "tier": 2,
            "element": 0,
            "signature": {
                "name": "WULF FANG FIST",
                "1": "While in HYPE MODE, gain a 35% bonus to CRIT RATE and a 75% bonus to CRIT DAMAGE",
                "2": "Gain 50% meter for all BLOCKBUSTERS when defeating an opponent with a BLOCKBUSTER"
            },
            "fs": 10200,
            "hp": 28600,
            "atk": 5282
        },
        "Weekend Warrior": {
            "tier": 2,
            "element": 3,
            "signature": {
                "name": "LAST CALL",
                "1": "Gain IMMUNITY and HASTE for 10 seconds when activating HYPE MODE.",
                "2": "When activating HYPE MODE, gain FINAL STAND for 15 seconds, preventing death for the duration of the effect."
            },
            "fs": 9940,
            "hp": 31400,
            "atk": 4488
        },
        "Number One": {
            "tier": 1,
            "element": 0,
            "signature": {
                "name": "RED ALERT",
                "1": "Gain HASTE for 10 seconds on opponent TAG IN",
                "2": "25% chance on HIT to gain ENRAGE for 10 seconds if HASTED"
            },
            "fs": 8530,
            "hp": 26900,
            "atk": 3856
        },
        "Cold Stones": {
            "tier": 0,
            "element": 1,
            "signature": {
                "name": "OUT COLD",
                "1": "Throws have a 15% to inflict STUN on the enemy for 6 seconds",
                "2": "50% bonus damage against STUNNED opponents"
            },
            "fs": 8591,
            "hp": 20800,
            "atk": 4941
        },
        "Hype Man": {
            "tier": 1,
            "element": 2,
            "signature": {
                "name": "HYPE TRAIN",
                "1": "While in HYPE MODE, reduce the meter of all opponent BLOCKBUSTERS by 10% per landed HIT",
                "2": "While at max HYPE (before triggering HYPE MODE), teammates in reserve gain METER 100% faster"
            },
            "fs": 8792,
            "hp": 24500,
            "atk": 4520
        },
        "Underdog": {
            "tier": 0,
            "element": 4,
            "signature": {
                "name": "ON THE ROPES",
                "1": "Take 25% less damage when suffering from a negative COMBAT EFFECT",
                "2": "Gain HASTE for 10 seconds when inflicted with a negative COMBAT EFFECT"
            },
            "fs": 7550,
            "hp": 21000,
            "atk": 3888
        }
    } // ,
    // "Robo-Fortune": {},
    // "Fukua": {}
};

var marquee = {
    "Filia": {
        "name": "Bloodletting",
        "1": "Leech - 5% of the DAMAGE Filia inflicts is regained as HEALTH",
        "2": "The First Cut - Every HIT has a 5% chance to convert all active BLEEDS to permanent BLEEDS"
    },
    "Cerebella": {
        "name": "Center Stage",
        "1": "Upper Hand - THROWS drain 20% meter from the opponents BLOCKBUSTERS",
        "2": "Ring Leader - THROWS DISABLE the opponent's TAG INS for 5 seconds"
    },
    "Peacock": {
        "name": "Toon Time",
        "1": "Special Feature - When Peacock uses a SPECIAL MOVE, there is a 10% chance that the COOLDOWN will immediately reset",
        "2": "Cast Party - When Peacock or any teammate uses TAG IN, there is a 30% chance that the attack will be UNBLOCKABLE"
    },
    "Parasoul": {
        "name": "Hyper-Critical",
        "1": "Critical Thinking - Parasoul gains a 5% bonus to CRIT RATE per ACTIVE TEAR",
        "2": "Critical Mass - Parasoul gains a 20% bonus to CRIT DAMAGE per ACTIVE TEAR"
    },
    // "Ms. Fortune": {},
    "Painwheel": {
        "name": "Tortured Soul",
        "1": "Tainted Blood - When an opponent lands a CHRITICAL HIT, 50% of the damage will be reflected back",
        "2": "Grudge - When the opponent lands a CRITICAL HIT, gain ENRAGE for 10 seconds"
    },
    "Valentine": {
        "name": "Combat Clinic",
        "1": "Trauma Center - While Valentine is alive, teammates gain FINAL STAND for 5 seconds when suffering an attack that deals more than 10% HEALTH",
        "2": "ICU - Valentine gains HEAVY REGEN for for 10 seconds when suffering a DEBUFF"
    },
    "Double": {
        "name": "Entropy",
        "1": "Chaos - When at an ELEMENTAL ADVANTAGE, inflict a random DEBUFF for 10 seconds when landing a CRITICAL HIT",
        "2": "Volatility - Every 30 seconds, gain a random BUFF for 10 seconds"
    },
    "Squigly": {
        "name": "Fright Night",
        "1": "Evil Dead - While enemies are nearby Squigly's dead body, teammate's HITS inflict CURSE and WITHER for 5 seconds",
        "2": "Dead Alive - While teammates are near Squigly's dead body, suffering a hit will grant them FINAL STAND for 5 seconds"
    },
    "Big Band": {
        "name": "Maestro",
        "1": "Soloist - Take 5% less damage when Big Band has NO living teammates",
        "2": "Frontman - Take 5% less damage when Big Band has living teammates"
    },
    "Eliza": {
        "name": "Bloodline",
        "1": "Blood Oath - Whenever a teammate is defeated, Eliza regains 30% health",
        "2": "Ritual Sacrifice - Whenever a teammate is defeated, Eliza gains 50% METER for all BLOCKBUSTERS"
    },
    "Beowulf": {
        "name": "Title Fight",
        "1": "Challenger - Beowulf inflicts 5% Bonus damage anytime his health percentage is LOWER than his opponent",
        "2": "Defending Champ - Beowulf inflicts 5% bonus damage anytime his health percentage is HIGHER than his opponent"
    } // ,
    // "Robo-Fortune": {},
    // "Fukua": {}
};

var character = {
    "Filia": {
        "name": "FLASH BACK",
        "1": "Back-dashing just before being HIT will allow Filia to EVADE an opponent's attack, avoiding all damage"
    },
    "Cerebella": {
        "name": "BALANCING ACT",
        "1": "THROW BREAKS cause enemies to be STAGGERED"
    },
    "Peacock": {
        "name": "THE HOLE IDEA",
        "1": "Swiping down twice will cause Peacock to drop into a HOLE, DODGING some attacks. After 2 seconds, she emerges with a bang!"
    },
    "Parasoul": {
        "name": "TEARFUL",
        "1": "Certain attacks will now spawn a TEAR. Using a CHARGE ATTACK will detonate all active TEARS, damaging opponents caught in the blast."
    },
    // "Ms. Fortune": {},
    "Painwheel": {
        "name": "FLIGHT RISK",
        "1": "Swipe up twice and Painwheel will take flight! While flying, Painwheel will EVADE some attacks and can rain death from above"
    },
    "Valentine": {
        "name": "TARGET VITALS",
        "1": "All of Valentine's attacks inflict damage that cannot be recovered when tagged out"
    },
    "Double": {
        "name": "TRANSMUTATION",
        "1": "After BLOCKING without being hit for 1 second, Double will switch to a new element. When at an ELEMENTAL ADVANTAGE, Double’s damage increases by 10%. When at an ELEMENTAL DISADVANTAGE, opponent damage decreases by 10%"
    },
    "Squigly": {
        "name": "WYRM'S TAIL",
        "1": "Holding down the WYRM'S TAIL button will store up to 2 DRAGON CHARGES. DRAGON CHARGES are consumed to make certain attacks more powerful!"
    },
    "Big Band": {
        "name": "Can't Stop the Beat",
        "1": "While dashing, Big Band cannot be interrupted (but will take damage normally)"
    },
    "Eliza": {
        "name": "WARRIOR GODDESS",
        "1": "BLOCKBUSTERS involving Sekhmet will now leave Eliza in Sekhmet Mode for a short duration. All damage taken by Sekhmet is recoverable"
    },
    "Beowulf": {
        "name": "HYPE MODE",
        "1": "Use 3x THROWS and/or JUGGLE FINISHERS to enable HYPE MODE. During HYPE MODE, THROWS cannot be broken, and many attacks feature surprising upgrades!"
    } // ,
    // "Robo-Fortune": {},
    // "Fukua": {}
};
