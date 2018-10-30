import os
import json
import re
from collections import namedtuple

# 1. Dump TextAssets into corpus.
# 2. Extract character identifiers from corpus.
# 3. Dump MonoBehaviours into monolith.
# 4. Using character identifiers, extract character info from monolith.

unvisited = []

monolith_char_keys = []
data = {}

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

def get_corpus_characters(corpus):
    'Extract character identifiers from corpus.'
    name_pattern = re.compile('Char_([A-Za-z]+)_(\w)_V(\d+)_Name')
    characters = {}
    for key in corpus['en']:
        matches = re.findall(name_pattern, key)
        for match in matches: # should loop once
            fighter, tier, variant_id = match
            variant = corpus['en'][key]
            character = Character(fighter, tier, variant_id, variant)
            characters.setdefault(key, character)
    return characters

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

def get_mono_char_keys(characters):
    mono_char_keys = []
    for key in monolith:
        mono = monolith[key]
        if 'displayVariantName' in mono:
            if mono['displayVariantName'] in characters:
                mono_char_keys.append(key)
    return mono_char_keys

# Study Objects

def study_dict(dictionary):
    'Print a nicely formatted dictionary to study its structure.'
    for key in dictionary:
        print('{:32}{}'.format(key, dictionary[key]))

def gather_mono_refs(obj, ignored_keys=set(), is_root=True):
    'Replace references with the objects they point to (for further study).'
    global visited_monolith_keys
    if is_root:
        visited_monolith_keys = set()
    if isinstance(obj, dict):
        if 'm_PathID' in obj:
            key = str(obj['m_PathID'])
            if key not in visited_monolith_keys:
                visited_monolith_keys.add(key)
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

# def monoref(ref, objkey):
#     'Return the monolith object referenced to by the reference object.'
#     key = str(ref['m_PathID'])
#     return monolith[key][objkey]
#
# def build_data():
#     'Generate database to be used on the website.'
#     for char_key in monolith_char_keys:
#         mono = monolith[char_key]
#         for language in corpus:
#             key, value = build_datum(mono, language)
#             data.setdefault(language, {})
#             data[language].setdefault(key, value)
#     data_names = [data['en'][key]['name'] for key in data['en']]
#     for key in unvisited:
#         for language in data:
#             value = {
#                 'name': corpus[language][key],
#                 'enabled': 0
#             }
#             data[language].setdefault(key, value)
#
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
#
# def build_datum(mono, language):
#     'Generate data for the database to be used on the website.'
#     corp = corpus[language]
#     key = mono['humanReadableGuid']
#     value = {
#         'name': corp[mono['displayVariantName']]),
#         'quote': corp[mono['variantQuote']]),
#         'tier': mono['initialTier']),
#         'element': mono['elementAffiliation']),
#         'baseStats': mono['baseScaledValuesByTier']),
#         'tint': mono['tintColor']),
#         'enabled': 1
#     }
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
#     return key, value

if __name__ == '__main__':
    corpus = build_corpus()
    monolith = build_monolith()

    characters = get_corpus_characters(corpus)
    mono_char_keys = get_mono_char_keys(characters)

    # study_dict(monolith[mono_char_keys[59]]) # check 37, 40, ...

    ignored_keys = ['skillTree', 'homeStage', 'blockbusters', 'specialMoves', 'evoCelebration_HitAction']
    bHDay_study = gather_mono_refs(monolith[mono_char_keys[59]], ignored_keys)
    with open('sgm_exports/study.json', 'w') as fp:
        json.dump(bHDay_study, fp, indent=4, separators=(',', ': '))

    # build_data()

    # with open('official_data.js', 'w') as fp:
    #     json.dump(data, fp)

# data['en']['bHDay']
