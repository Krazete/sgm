from preprocessing import file
from collections import namedtuple
import re

Character = namedtuple('Character', ('fighter', 'tier', 'variant_id', 'variant')) # TODO: eliminate unnecessary attributes

# Study Monolith Structure

def study_dictionary(dictionary):
    'Print a nicely formatted dictionary to study its structure.'
    longest_key = max(dictionary, key=len)
    max_length = len(longest_key)
    template = '{{:{}}}{{}}'.format(max_length + 1)
    for key in dictionary:
        print(template.format(key, dictionary[key]))

def compile_mono(obj, is_root=True):
    'Replace monolith references with the objects they point to.'
    global visited_monos
    if is_root:
        visited_monos = set()
    if isinstance(obj, dict):
        if 'm_PathID' in obj:
            key = str(obj['m_PathID'])
            if key not in visited_monos:
                visited_monos.add(key)
                try:
                    value = compile_mono(monolith[key], False)
                except KeyError:
                    value = 'UNDEFINED'
                return {key: value}
            return {key: 'REPEATED'}
        subdict = {}
        for key in obj:
            value = compile_mono(obj[key], False)
            subdict.setdefault(key, value)
        return subdict
    elif isinstance(obj, list):
        sublist = []
        for item in obj:
            value = compile_mono(item, False)
            sublist.append(value)
        return sublist
    else:
        return obj

def study_sample(monolith, mono_char_keys):
    from random import sample
    for key in sample(mono_char_keys, 1):
        mono = monolith[key]
        study_dictionary(mono)
        monostudy = compile_mono(mono)
        file.save(monostudy, 'preprocessing/study.json')

# Get Character Keys

def get_monolith_character_keys(monolith):
    'Extract keys of character objects from monolith.'
    character_keys = set()
    for key in monolith:
        mono = monolith[key]
        if 'baseCharacter' in mono:
            character_keys.add(key)
    return character_keys

def get_corpus_character_keys(corpus): # TODO: change dict to set if Character is unnecessary
    'Extract character identifiers {corpus key: Character} from corpus.'
    name_pattern = re.compile('Char_([A-Za-z]+)_(\w)_V(\d+)_Name')
    character_keys = {}
    for key in corpus['en']:
        matches = re.findall(name_pattern, key)
        for match in matches:
            fighter, tier, variant_id = match
            variant = corpus['en'][key]
            character = Character(fighter, tier, variant_id, variant)
            character_keys.setdefault(key, character)
    return character_keys

# Build Data from Monolith

def build_data(monolith, mono_char_keys):
    'Generate database to be used on the website.'
    fighters = {}
    variants = {}
    corpus_keys = set()

    def monoref(ref):
        'Return the monolith object referenced to by the reference object.'
        key = str(ref['m_PathID'])
        return monolith[key]

    def record(key):
        'Record corpus key and return it.'
        corpus_keys.add(key)
        return key

    def build_fighter(mono):
        base = monoref(mono['baseCharacter'])
        f_key = base['humanReadableGuid']
        if f_key in fighters: # skip copies
            return
        f_value = {
            'dataName': base['dataName'], # TODO: maybe delete
            'name': record(base['displayName']),
            'role': record(base['roleDescription']), # TODO: maybe delete
            # 'loading': monoref(base['characterAbility'])['resourcePath'], # TODO: maybe delete
            'death': base['superDeathTexture']['resourcePath'], # TODO: maybe delete
            # 'portrait': monoref(base['hudPortraitPalettizedImage'])['resourcePath'], # TODO: maybe delete
            'voice': {
                'en': base['englishVoArtist'],
                'ja': base['japaneseVoArtist']
            },
            # 'blockbusters': [monoref(x) for x in base['blockbusters']], # TODO: add this in
            # 'specialmoves': {}, # TODO: add this in
            'characterability': monoref(base['characterAbility']),
            # 'marquee': {
            #     'title': monoref(mono['superAbility'])['title'],
            #     'features': [monoref(feature) for feature in monoref(mono['superAbility'])['features']] # TODO: fix this
            # }
        }
        fighters.setdefault(f_key, f_value)

    def build_variant(mono):
        base = monoref(mono['baseCharacter'])
        f_key = base['humanReadableGuid']
        hrid = mono['humanReadableGuid']
        if hrid == '':
            v_key = mono['guid']
        elif hrid == 'dummy':
            v_key = f_key + '_dummy'
        else:
            v_key = hrid
        if v_key in variants: # skip copies (except '' or 'dummy')
            return
        v_value = {
            'base': f_key,
            'name': record(mono['displayVariantName']),
            'role': record(mono['variantDescription']), # TODO: maybe delete
            'quote': record(mono['variantQuote']),
            'tier': mono['initialTier'],
            'element': mono['elementAffiliation'],
            'baseStats': mono['baseScaledValuesByTier'],
            'palette': mono['paletteIndex'], # TODO: maybe delete
            'paletteURL': monoref(mono['cardPortraitPalettizedImage'])['dynamicSprite']['resourcePath'], # TODO: maybe delete
            'tint': mono['tintColor'], # TODO: maybe delete
            # 'signature': {
            #     'title': monoref(mono['signatureAbility'])['title'],
            #     'features': [monoref(feature) for feature in monoref(mono['signatureAbility'])['features']] # TODO: fix this
            # },
            'enabled': v_key == hrid
        }
        variants.setdefault(v_key, v_value)

    for key in mono_char_keys:
        mono = monolith[key]
        build_fighter(mono)
        build_variant(mono)

    return fighters, variants, corpus_keys

if __name__ == '__main__':
    monolith = file.load('preprocessing/sgm_exports/MonoBehaviour', 'split\d+-(\d+)-Mono')
    corpus = file.load('preprocessing/sgm_exports/TextAsset')

    mono_char_keys = get_monolith_character_keys(monolith)
    corp_char_keys = get_corpus_character_keys(corpus)

    study_sample(monolith, mono_char_keys)

    fighters, variants, corpus_keys = build_data(monolith, mono_char_keys)

    for language in corpus:
        primcorpus = {key: corpus[language][key] for key in corpus_keys if key in corpus[language]}
        file.save(primcorpus, 'data/{}.json'.format(language))
    file.save(fighters, 'data/fighter_data.json')
    file.save(variants, 'data/variant_data.json')
