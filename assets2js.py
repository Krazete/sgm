import loader
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

# Get Character Keys

def get_monolith_character_keys(monolith):
    'Extract keys of character objects from monolith.'
    character_keys = set()
    for key in monolith:
        mono = monolith[key]
        if 'humanReadableGuid' in mono and 'baseCharacter' in mono:
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

    def build_datum(mono):
        'Generate data for the database to be used on the website.'
        base = monoref(mono['baseCharacter'])
        f_key = base['humanReadableGuid']
        v_key = mono['humanReadableGuid']
        if f_key == '' or v_key == '': # for bronze parasoul and peacock, dunno why
            return
        f_value = {
            # 'role': record(base['roleDescription']),
            # 'dataName': base['dataName'],
            # 'superDeath': base['superDeathTexture']['resourcePath'],
            # 'portrait': monoref(base['hudPortraitPalettizedImage'])['resourcePath'],
            'name': record(base['displayName']),
            'voice': {
                'en': base['englishVoArtist'],
                'ja': base['japaneseVoArtist']
            },
            'ability': {
                'name': record(monoref(base['characterAbility'])['title']),
                'description': record(monoref(base['characterAbility'])['description'])
                # 'charge': record(monoref(base['characterAbility'])['chargeTimeInFrames'])
            },
            'marquee': mono['superAbility'],
            'blockbusters': [monoref(x) for x in base['blockbusters']],
            'specials': {}
        }
        v_value = {
            'base': f_key,
            'name': record(mono['displayVariantName']),
            'quote': record(mono['variantQuote']),
            'tier': mono['initialTier'],
            'element': mono['elementAffiliation'],
            'baseStats': mono['baseScaledValuesByTier'],
            'tint': mono['tintColor'], # not sure how to use this yet
            'enabled': 1
        }
        fighters.setdefault(f_key, f_value)
        variants.setdefault(v_key, v_value)

    for key in mono_char_keys:
        mono = monolith[key]
        if 'humanReadableGuid' in mono and 'baseCharacter' in mono:
            # print('{:3}{:16}{}'.format(monoref(mono['baseCharacter'])['humanReadableGuid'], mono['humanReadableGuid'], mono['baseScaledValuesByTier']))
            build_datum(mono)
    return fighters, variants, corpus_keys

if __name__ == '__main__':
    monolith = loader.load('sgm_exports/MonoBehaviour', 'split\d+-(\d+)-Mono')
    corpus = loader.load('sgm_exports/TextAsset')

    mono_char_keys = get_monolith_character_keys(monolith)
    corp_char_keys = get_corpus_character_keys(corpus)

    # from random import sample
    # for key in sample(mono_char_keys, 1):
    #     mono = monolith[key]
    #     study_dictionary(mono)
    #     monostudy = compile_mono(mono)
    #     loader.save(monostudy, 'data/study.json')

    fighters, variants, corpus_keys = build_data(monolith, mono_char_keys)

    for language in corpus:
        loader.save(corpus[language], 'data/{}.json'.format(language))
    loader.save(fighters, 'data/fighter_data.json')
    loader.save(variants, 'data/variant_data.json')
