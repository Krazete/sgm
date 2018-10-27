import os
import json
import re
from collections import namedtuple

# 1. Dump TextAssets into corpus.
# 2. Extract character identifiers from corpus.
# 3. Dump MonoBehaviours into monolith.
# 4. Using character identifiers, extract character info from monolith.

text_root = 'sgm_exports/TextAsset'
mono_root = 'sgm_exports/MonoBehaviour'

corpus = {}
monolith = {}

characters = []
unvisited = []

data = {}

Character = namedtuple('Character', ('fighter', 'tier', 'vid', 'variant', 'vkey'))

def for_each_JSON(directory, function, show_error=False):
    'Open all valid JSON files in a directory and apply a function to each one.'
    for filename in os.listdir(directory):
        with open(os.path.join(directory, filename), encoding='utf-8') as file:
            try:
                content = json.load(file)
                stem = os.path.splitext(filename)[0]
                function(stem, content)
            except json.JSONDecodeError:
                if show_error:
                    print('JSONDecodeError:', filename)

def add_to_corpus(language, content):
    'Dump TextAssets into corpus.'
    corpus.setdefault(language, content)

def get_characters_from_corpus():
    'Extract character identifiers from corpus.'
    for key in corpus['en']:
        matches = re.findall(corpus_name_pattern, key)
        for match in matches:
            fighter, tier, vid = match
            variant = corpus['en'][key]
            character = Character(fighter, tier, vid, variant, key)
            characters.append(character)
            unvisited.append(key)

def get_monolith_name_pattern():
    'Create a pattern based off of character identifiers from the corpus.'
    fighters = set()
    tiers = set()
    for fighter, tier, vid, variant, vkey in characters:
        fighters.add(fighter)
        tiers.add(tier)
    template = '({})_({})_([A-Za-z]+)-sharedassets'
    fighter_pattern = '|'.join(fighters)
    tier_pattern = '|'.join(tiers)
    pattern = template.format(fighter_pattern, tier_pattern)
    return pattern

def add_to_monolith(stem, content):
    'Dump MonoBehaviours into monolith and record keys marking Variant info.'
    keys = re.findall(monolith_key_pattern, stem)
    matches = re.findall(monolith_name_pattern, stem)
    for key in keys: # keys should be atomic
        monolith.setdefault(key, content)
        for match in matches:
            for fighter, tier, vid, variant, vkey in characters:
                if content['displayVariantName'] == vkey:
                    unvisited.remove(vkey)

def study_monolith_char(i):
    'Pretty print a monolith object to study its structure.'
    char_key = monolith_char_keys[i]
    for key in monolith[char_key]:
        print('{:32}{}'.format(key, monolith[char_key][key]))

def build_datum(mono, language):
    corp = corpus[language]
    key = mono['humanReadableGuid']
    value = {
        'name': corp[mono['displayVariantName']],
        'quote': corp[mono['variantQuote']],
        'tier': mono['initialTier'],
        'element': mono['elementAffiliation'],
        'baseStats': mono['baseScaledValuesByTier'],
        'tint': mono['tintColor'],
        'signature': mono['signatureAbility'],
        'super': mono['superAbility'],
        'enabled': 1,
    }
    return key, value

def build_data():
    for char_key in monolith_char_keys:
        mono = monolith[char_key]
        for language in corpus:
            key, value = build_datum(mono, language)
            data.setdefault(language, {})
            data[language].setdefault(key, value)
    data_names = [data['en'][key]['name'] for key in data['en']]
    for key in unvisited:
        for language in data:
            value = {
                'name': corpus[language][key],
                'enabled': 0
            }
            data[language].setdefault(key, value)

if __name__ == '__main__':
    corpus_name_pattern = re.compile('Char_([A-Za-z]+)_(\w)_V(\d+)_Name')
    for_each_JSON(text_root, add_to_corpus)

    get_characters_from_corpus()

    monolith_key_pattern = re.compile('split\d-(\d+)-Mono')
    monolith_name_pattern = create_monolith_name_pattern()
    for_each_JSON(mono_root, add_to_monolith)

    # study_monolith_char(-1)

    build_data()

    # monolith_char_keys
