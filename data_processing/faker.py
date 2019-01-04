from data_processing import file
from collections import namedtuple, OrderedDict
import re

fakes = file.load('data_processing/__FAKE_Variant_MonoBehaviour')

important_keys = [
    "guid", # maybe delete this
    "humanReadableGuid",
    "displayVariantName",
    "variantDescription",
    "variantQuote",
    "paletteIndex", # maybe delete this
    "initialTier",
    "elementAffiliation",
    "baseCharacter",
    "signatureAbility",
    "superAbility",
    "baseScaledValuesByTier"
]

fighters = {
    'beowulf':   {'baseCharacter': 16863, 'superAbility': 27171},
    'bigband':   {'baseCharacter': 16937, 'superAbility': 26908},
    'cerebella': {'baseCharacter': 17043, 'superAbility': 26928},
    'double':    {'baseCharacter': 17123, 'superAbility': 26947},
    'eliza':     {'baseCharacter': 17203, 'superAbility': 26969},
    'filia':     {'baseCharacter': 17285, 'superAbility': 26991},
    'msfortune': {'baseCharacter': 17361, 'superAbility': 27011},
    'painwheel': {'baseCharacter': 17430, 'superAbility': 27024},
    'parasoul':  {'baseCharacter': 17503, 'superAbility': 27042},
    'peacock':   {'baseCharacter': 17585, 'superAbility': 27064},
    'squigly':   {'baseCharacter': 17691, 'superAbility': 27080},
    'valentine': {'baseCharacter': 17780, 'superAbility': 27094}
}

variants = {
    'coldstones':       {'signatureAbility': 22846, 'm_PathID': 16883},
    'underdog':         {'signatureAbility': 22845, 'm_PathID': 16884},
    'darkmight':        {'signatureAbility': 22842, 'm_PathID': 16885},
    'dragonbrawler':    {'signatureAbility': 22848, 'm_PathID': 16886},
    'weekendwarrior':   {'signatureAbility': 22844, 'm_PathID': 16887},
    'wulfsbane':        {'signatureAbility': 22841, 'm_PathID': 16888},
    'hypeman':          {'signatureAbility': 22843, 'm_PathID': 16889},
    'numberone':        {'signatureAbility': 22847, 'm_PathID': 16890},
    'wrestlerx':        {'signatureAbility': 22849, 'm_PathID': 16891},

    'bassline':         {'signatureAbility': 22852, 'm_PathID': 16957},
    'beatbox':          {'signatureAbility': 22850, 'm_PathID': 16958},
    'heavymetal':       {'signatureAbility': 22851, 'm_PathID': 16959},
    'epicsax':          {'signatureAbility': 26910, 'm_PathID': 16960},
    'gijazz':           {'signatureAbility': 26913, 'm_PathID': 16961},
    'megasonic':        {'signatureAbility': 26909, 'm_PathID': 16962},
    'privatedick':      {'signatureAbility': 26914, 'm_PathID': 16963},
    'resonantevil':     {'signatureAbility': 26912, 'm_PathID': 16964},
    'robocopy':         {'signatureAbility': 26911, 'm_PathID': 16965},

    'headstrong':       {'signatureAbility': 26929, 'm_PathID': 17034},
    'understudy':       {'signatureAbility': 26935, 'm_PathID': 17035},
    'heavyhanded':      {'signatureAbility': 27173, 'm_PathID': 17036},
    'armedforces':      {'signatureAbility': 26930, 'm_PathID': 17037},
    'brainfreeze':      {'signatureAbility': 26932, 'm_PathID': 17038},
    'harlequin':        {'signatureAbility': 26934, 'm_PathID': 17039},
    'bigtop':           {'signatureAbility': 26931, 'm_PathID': 17040},
    'graymatter':       {'signatureAbility': 26933, 'm_PathID': 17041},
    'toadwarrior':      {'signatureAbility': 27174, 'm_PathID': 17042},

    'nunsense':         {'signatureAbility': 26948, 'm_PathID': 17114},
    'sundaeschool':     {'signatureAbility': 26950, 'm_PathID': 17115},
    'jawbreaker':       {'signatureAbility': 22855, 'm_PathID': 17116},
    'immoralfiber':     {'signatureAbility': 26953, 'm_PathID': 17117},
    'rainbowblight':    {'signatureAbility': 26952, 'm_PathID': 17118},
    'xenomorph':        {'signatureAbility': 26949, 'm_PathID': 17119},
    'doublicious':      {'signatureAbility': 26955, 'm_PathID': 17120},
    'mystmatch':        {'signatureAbility': 26954, 'm_PathID': 17121},
    'templetyrant':     {'signatureAbility': 26951, 'm_PathID': 17122},

    'decrypted':        {'signatureAbility': 26973, 'm_PathID': 17194},
    'indenile':         {'signatureAbility': 26971, 'm_PathID': 17195},
    'revamped':         {'signatureAbility': 22856, 'm_PathID': 17196},
    'bloodbath':        {'signatureAbility': 26975, 'm_PathID': 17197},
    'divaintervention': {'signatureAbility': 26972, 'm_PathID': 17198},
    'redvelvet':        {'signatureAbility': 26977, 'm_PathID': 17199},
    'bloodyvalentine':  {'signatureAbility': 26974, 'm_PathID': 17200},
    'scarletviper':     {'signatureAbility': 26976, 'm_PathID': 17201},
    'tombandgloom':     {'signatureAbility': 26970, 'm_PathID': 17202},

    'badhairday':       {'signatureAbility': 26998, 'm_PathID': 17276},
    'frayedends':       {'signatureAbility': 26993, 'm_PathID': 17277},
    'classcutter':      {'signatureAbility': 22857, 'm_PathID': 17278},
    'dreadlocks':       {'signatureAbility': 26997, 'm_PathID': 17279},
    'idolthreat':       {'signatureAbility': 26999, 'm_PathID': 17280},
    'parasiteweave':    {'signatureAbility': 26994, 'm_PathID': 17281},
    'windswept':        {'signatureAbility': 26992, 'm_PathID': 17282},
    'badmsfrosty':      {'signatureAbility': 26996, 'm_PathID': 17283},
    'hairapparent':     {'signatureAbility': 26995, 'm_PathID': 17284},

    'hellcat':          {'signatureAbility': 22862, 'm_PathID': 17352},
    'justkitten':       {'signatureAbility': 22859, 'm_PathID': 17353},
    'furryfury':        {'signatureAbility': 22864, 'm_PathID': 17354},
    'clawandorder':     {'signatureAbility': 22860, 'm_PathID': 17355},
    'hacknsplash':      {'signatureAbility': 22865, 'm_PathID': 17356},
    'meowandfurever':   {'signatureAbility': 22858, 'm_PathID': 17357},
    'felinelucky':      {'signatureAbility': 22861, 'm_PathID': 17358},
    'mstrial':          {'signatureAbility': 27177, 'm_PathID': 17359},
    'purrfectdark':     {'signatureAbility': 22863, 'm_PathID': 17360},

    'rusty':            {'signatureAbility': 27025, 'm_PathID': 17421},
    'twistedmettle':    {'signatureAbility': 27026, 'm_PathID': 17422},
    'flytrap':          {'signatureAbility': 22866, 'm_PathID': 17423},
    'buzzkill':         {'signatureAbility': 27028, 'm_PathID': 17424},
    'firefly':          {'signatureAbility': 27029, 'm_PathID': 17425},
    'grimfan':          {'signatureAbility': 27030, 'm_PathID': 17426},
    'rawnerv':          {'signatureAbility': 27027, 'm_PathID': 17427},
    'blooddrive':       {'signatureAbility': 27032, 'm_PathID': 17428},
    'rageappropriate':  {'signatureAbility': 27031, 'm_PathID': 17429},

    'heavyreign':       {'signatureAbility': 27046, 'm_PathID': 17494},
    'sheltered':        {'signatureAbility': 27047, 'm_PathID': 17495},
    'summersalt':       {'signatureAbility': 22868, 'm_PathID': 17496},
    'primed':           {'signatureAbility': 27049, 'm_PathID': 17497},
    'princesspride':    {'signatureAbility': 27050, 'm_PathID': 17498},
    'regallyblonde':    {'signatureAbility': 27045, 'm_PathID': 17499},
    'starcrossed':      {'signatureAbility': 27048, 'm_PathID': 17500},
    'ivyleague':        {'signatureAbility': 27043, 'm_PathID': 17501},
    'noegrets':         {'signatureAbility': 27044, 'm_PathID': 17502},

    'rerun':            {'signatureAbility': 27179, 'm_PathID': 17576},
    'sketchy':          {'signatureAbility': 27183, 'm_PathID': 17577},
    'freezeframe':      {'signatureAbility': 27180, 'm_PathID': 17578},
    'thatsallfolks':    {'signatureAbility': 27184, 'm_PathID': 17579},
    'ultraviolent':     {'signatureAbility': 27178, 'm_PathID': 17580},
    'untouchable':      {'signatureAbility': 27065, 'm_PathID': 17581},
    'inkling':          {'signatureAbility': 27181, 'm_PathID': 17582},
    'peashooter':       {'signatureAbility': 27185, 'm_PathID': 17583},
    'wildcard':         {'signatureAbility': 27182, 'm_PathID': 17584},

    'scaredstiff':      {'signatureAbility': 22876, 'm_PathID': 17658},
    'stagefright':      {'signatureAbility': 22875, 'm_PathID': 17659},
    'lovecrafted':      {'signatureAbility': 22877, 'm_PathID': 17660},
    'bioexorcist':      {'signatureAbility': 27186, 'm_PathID': 17661},
    'deadofwinter':     {'signatureAbility': 22878, 'm_PathID': 17662},
    'poltergust':       {'signatureAbility': 22872, 'm_PathID': 17663},
    'deadheat':         {'signatureAbility': 22873, 'm_PathID': 17664},
    'nearlydeparted':   {'signatureAbility': 22871, 'm_PathID': 17665},
    'necrobreaker':     {'signatureAbility': 22874, 'm_PathID': 17666},

    'icyhot':           {'signatureAbility': 22883, 'm_PathID': 17747},
    'scrub':            {'signatureAbility': 22886, 'm_PathID': 17748},
    'pettyinpink':      {'signatureAbility': 22881, 'm_PathID': 17749},
    'lasthope':         {'signatureAbility': 22889, 'm_PathID': 17750},
    'pyrotechnique':    {'signatureAbility': 22887, 'm_PathID': 17751},
    'silentkill':       {'signatureAbility': 22884, 'm_PathID': 17752},
    'surgeongeneral':   {'signatureAbility': 22888, 'm_PathID': 17753},
    'graveyardshift':   {'signatureAbility': 22885, 'm_PathID': 17754},
    'ohmai':            {'signatureAbility': 22882, 'm_PathID': 17755}
}

for key in fakes:
    forgery = OrderedDict()
    for subkey in important_keys:
        forgery.setdefault(subkey, fakes[key][subkey])

    split_key = re.split('_|-', key)
    base = split_key[3].lower()
    name = split_key[5].lower()
    forgery['baseCharacter'] = {
        'm_PathID': fighters[base]['baseCharacter']
    }
    forgery['superAbility'] = {
        'm_PathID': fighters[base]['superAbility']
    }
    forgery['signatureAbility'] = {
        'm_PathID': variants[name]['signatureAbility']
    }

    new_key = re.sub(
        r'(split\d)-(\d+)-(Mono)',
        r'\1-{:05d}-\3'.format(variants[name]['m_PathID']),
        key
    )
    file.save(forgery, 'data_processing/sgm_exports/MonoBehaviour/' + new_key + '.json')
