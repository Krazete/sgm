import os
import json
import re

text_root = 'Extracted/TextAsset'
mono_root = 'Extracted/MonoBehaviour'

corpus_name_pattern = re.compile('[A-Za-z]+_[BSGD]_V\d+')
monolith_key_pattern = re.compile('split\d-(\d+)-Mono')
monolith_name_pattern = re.compile('[A-Za-z]+_[BSGD]_[A-Za-z]+')

corpus = {} # all valid TextAsset files
corpus_char_keys = [] # character names captured from corpus keys

monolith = {} # all valid MonoBehaviour files
monolith_char_keys = [] # monolith keys of files matching char_name_pattern

data = {}

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
    'Dump TextAssets into corpus and record keys containing Variant names.'
    corpus.setdefault(language, content)
    if language == 'en': # avoid needless repetition
        for key in corpus[language]:
            names = re.findall(corpus_name_pattern, key)
            if names:
                corpus_char_keys.append(key)

def add_to_monolith(stem, content):
    'Dump MonoBehaviours into monolith and record keys marking Variant info.'
    keys = re.findall(monolith_key_pattern, stem)
    names = re.findall(monolith_name_pattern, stem)
    for key in keys: # keys should be atomic
        monolith.setdefault(key, content)
        if names:
            monolith_char_keys.append(key)

def study_monolith_char(i):
    'Pretty print a monolith object to study its structure.'
    char_key = monolith_char_keys[i]
    for base in monolith[char_key]:
        for key in monolith[char_key][base]:
            print('{:64}{}'.format(key, monolith[char_key][base][key]))

def process_monolith_keys(raw_mono, is_root=True):
    'Format keys of an monolith object to remove number and type.'
    if isinstance(raw_mono, dict):
        mono = {}
        for raw_key in raw_mono:
            key = raw_key.split()[-1]
            value = process_monolith_keys(raw_mono[raw_key], False)
            mono.setdefault(key, value)
    elif isinstance(raw_mono, list):
        mono = []
        for item in raw_mono:
            value = process_monolith_keys(item, False)
            mono.append(value)
    else:
        mono = raw_mono
    if is_root:
        return mono['Base']
    return mono

def build_datum(mono, language):
    corp = corpus[language]
    key = mono['humanReadableGuid']
    value = {
        'name': corp[mono['displayVariantName']],
        'quote': corp[mono['variantQuote']],
        'tier': mono['initialTier'],
        'baseStats': mono['baseScaledValuesByTier'],
        'signature': mono['signatureAbility'],
        'super': mono['superAbility'],
        'enabled': mono['m_Enabled'],
        'tintColor': mono['tintColor']
    }
    return key, value

def build_data():
    for char_key in monolith_char_keys:
        raw_mono = monolith[char_key]
        mono = process_monolith_keys(raw_mono)
        for language in corpus:
            key, value = build_datum(mono, language)
            data.setdefault(language, {})
            data[language].setdefault(key, value)
    data_names = [data['en'][key]['name'] for key in data['en']]
    for char_key in corpus_char_keys:
        name = corpus['en'][char_key]
        if name not in data_names:
            value = {'enabled': 0}
            for language in data:
                data[language].setdefault(key, value)

for_each_JSON(text_root, add_to_corpus)
for_each_JSON(mono_root, add_to_monolith)

# study_monolith_char(-1)

build_data()

# corpus['en']['25029']
