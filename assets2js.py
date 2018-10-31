import os
import json
import re
from collections import namedtuple

# 1. Dump TextAssets into corpus.
# 2. Extract character identifiers from corpus.
# 3. Dump MonoBehaviours into monolith.
# 4. Using character identifiers, extract character info from monolith.

Character = namedtuple('Character', ('fighter', 'tier', 'variant_id', 'variant',))

# Loader

def iter_json_dir(directory, show_error=False):
    'Open all valid JSON files in a directory and apply a function to each one.'
    for filename in os.listdir(directory):
        with open(os.path.join(directory, filename), encoding='utf-8') as file:
            try:
                stem = os.path.splitext(filename)[0]
                content = json.load(file)
                yield stem, content
            except json.JSONDecodeError:
                if show_error:
                    print('JSONDecodeError:', filename)

# Build Corpus

def build_corpus():
    'Build corpus from TextAssets and return it.'
    json_dir = 'sgm_exports/TextAsset'
    corpus = {}
    for stem, content in iter_json_dir(json_dir):
        corpus.setdefault(stem, content)
    return corpus

def get_corpus_character_keys(corpus):
    'Extract character identifiers {corpus key: Character} from corpus.'
    name_pattern = re.compile('Char_([A-Za-z]+)_(\w)_V(\d+)_Name')
    corp_char_keys = {}
    for key in corpus['en']:
        matches = re.findall(name_pattern, key)
        for match in matches: # should loop once
            fighter, tier, variant_id = match
            variant = corpus['en'][key]
            character = Character(fighter, tier, variant_id, variant)
            corp_char_keys.setdefault(key, character)
    return corp_char_keys

# Build Monolith

def build_monolith():
    'Build monolith from MonoBehaviours and return it.'
    json_dir = 'sgm_exports/MonoBehaviour'
    key_pattern = re.compile('split\d-(\d+)-Mono')
    monolith = {}
    for stem, content in iter_json_dir(json_dir):
        keys = re.findall(key_pattern, stem)
        for key in keys: # should loop once
            monolith.setdefault(key, content)
    return monolith

def get_monolith_character_keys(corp_char_keys):
    'Extract character objects {monolith key: corpus key} from monolith.'
    mono_char_keys = {}
    for key in monolith:
        mono = monolith[key]
        if 'displayVariantName' in mono:
            if mono['displayVariantName'] in corp_char_keys:
                corp_char_key = mono['displayVariantName']
                mono_char_keys.setdefault(key, corp_char_key)
    return mono_char_keys

# Study Objects

def study_dict(dictionary):
    'Print a nicely formatted dictionary to study its structure.'
    for key in dictionary:
        print('{:32}{}'.format(key, dictionary[key]))

def gather_mono_refs(obj, ignored_keys=set(), is_root=True):
    'Replace references with the objects they point to (for further study).'
    global visited_mono_keys
    if is_root:
        visited_mono_keys = set()
    if isinstance(obj, dict):
        if 'm_PathID' in obj:
            key = str(obj['m_PathID'])
            if key not in visited_mono_keys:
                visited_mono_keys.add(key)
                try:
                    value = gather_mono_refs(monolith[key], ignored_keys, False)
                except KeyError:
                    value = 'UNDEFINED'
                return {key: value}
            return {key: 'REPEATED'}
        subdict = {}
        for key in obj:
            if key not in ignored_keys:
                value = gather_mono_refs(obj[key], ignored_keys, False)
                subdict.setdefault(key, value)
            else:
                subdict.setdefault(key, 'IGNORED')
        return subdict
    elif isinstance(obj, list):
        sublist = []
        for item in obj:
            value = gather_mono_refs(item, ignored_keys, False)
            sublist.append(value)
        return sublist
    else:
        return obj

# Build Data

def monoref(ref):
    'Return the monolith object referenced to by the reference object.'
    key = str(ref['m_PathID'])
    return monolith[key]

def build_datum(corp, mono):
    'Generate data for the database to be used on the website.'
    base = monoref(mono['baseCharacter'], )
    f_key = base['humanReadableGuid']
    v_key = mono['humanReadableGuid']
    if f_key == '' or v_key == '': # for bronze parasoul and peacock, dunno why
        return None, None, None, None
    f_value = {
        'dataName': base['dataName'],
        'name': corp[base['displayName']],
        'marquee': mono['superAbility'],
        'superDeath': base['superDeathTexture']['resourcePath']
    }
    v_value = {
        'base': f_key,
        'name': corp[mono['displayVariantName']],
        'quote': corp[mono['variantQuote']],
        'tier': mono['initialTier'],
        'element': mono['elementAffiliation'],
        'baseStats': mono['baseScaledValuesByTier'],
        'signature': {},
        'tint': mono['tintColor'],
        'enabled': 1
    }
    return f_key, f_value, v_key, v_value
#     if fighter not in fighterdata:
#         build_fighter_datum(fighter)
#     signature_ref = mono['signatureAbility']
#     value.setdefault('signature', {})
#     value['signature'].setdefault('name', corpus[language][monoref(signature_ref, 'title')])
#     value['signature'].setdefault('ability', [])
#     for iteration in monoref(signature_ref, 'tiers'):
#         ability =
#         value['signature']['ability'].append()
#             'ability': [
#                 {
#                     'name': corpus[language][monoref(signature_ref, 'description')],
#                     'iterations': [monolith[str(iteration['m_PathID'])]['modifierSets']
#                         for iteration in monoref(signature_ref, 'tiers')
#                     ]
#                 }
#             ]
#         } for signature in monoref(signature_ref, 'features')
#     ])
#
#     value.setdefault('super', mono['superAbility'])
#

def build_disabled_datum(corp):
    return 0, 0, 0, 0

def build_data(corpus, monolith, corp_char_keys, mono_char_keys):
    'Generate database to be used on the website.'
    fighters = {}
    variants = {}
    for mono_char_key in mono_char_keys:
        corp_char_key = mono_char_keys[mono_char_key]
        mono = monolith[mono_char_key]
        for language in corpus:
            corp = corpus[language]
            f_key, f_value, v_key, v_value = build_datum(corp, mono)
            fighters.setdefault(language, {})
            fighters[language].setdefault(f_key, f_value)
            variants.setdefault(language, {})
            variants[language].setdefault(v_key, v_value)
    for corp_char_key in corp_char_keys:
        corp = corp_char_keys[corp_char_key]
        for language in corpus:
            f_key, f_value, v_key, v_value = build_disabled_datum(corp)
            fighters.setdefault(language, {})
            fighters[language].setdefault(f_key, f_value)
            variants.setdefault(language, {})
            variants[language].setdefault(v_key, v_value)
    return fighters, variants

# fighterdata = {
#     'filia': {
#         'name': 'Filia',
#         '': '',
#         'variants': {
#             'bHDay': {
#                 'name': 'Bad Hair Day',
#                 'tier': 'B',
#                 'element': 'Dark',
#                 'stats': {},
#                 'signature': {},
#                 'enabled': True
#             },
#             'bMFrosty': {}
#         }
#     }
# }
#
# fighters = {
#     'filia': {
#         'name': 'Filia',
#         'variants': ['bHDay', 'frosty'],
#         'super': {}
#     },
#     'bigband': {
#         'name': 'Big Band',
#         'variants': ['hMetal'],
#         'super': {}
#     }
# }
#
# variants = {
#     'bHDay': {
#         'name': 'Bad Hair Day',
#         'tier': 'B',
#         'element': 'Dark',
#         'stats': {},
#         'signature': {},
#         'enabled': True
#     },
#     'frosty': {},
#     'hMetal': {
#         'name': 'Heavy Metal'
#     }
# }

if __name__ == '__main__':
    corpus = build_corpus()
    monolith = build_monolith()

    corp_char_keys = get_corpus_character_keys(corpus)
    mono_char_keys = get_monolith_character_keys(corp_char_keys)

    {key for key in mono_char_keys if 'Filia_B' in mono_char_keys[key]}
    study_dict(monolith['15576'])

    ignored_keys = ['skillTree', 'homeStage', 'blockbusters', 'specialMoves', 'evoCelebration_HitAction', 'signatureAbility']
    bHDay_study = gather_mono_refs(monolith['15576'], ignored_keys)
    with open('sgm_exports/study.json', 'w') as fp:
        json.dump(bHDay_study, fp, indent=4, separators=(',', ': '))

    fighters, variants = build_data(corpus, monolith, corp_char_keys, mono_char_keys)

    with open('fighter_data.json', 'w') as fp:
        json.dump(fighters, fp)
    with open('variant_data.json', 'w') as fp:
        json.dump(variants, fp)

# data['en']['bHDay']
