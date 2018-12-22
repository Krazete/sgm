from data_processing import file
from collections import namedtuple
import re

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

def study_sample(monolith, mono_char_keys, hrid=None):
    'Print a monolith object and output more detailed results in study.json.'
    if hrid:
        for key in mono_char_keys:
            mono = monolith[key]
            if hrid == mono['humanReadableGuid']:
                study_dictionary(mono)
                monostudy = compile_mono(mono)
                file.save(monostudy, 'data_processing/study.json')
    else:
        from random import sample
        for key in sample(mono_char_keys, 1):
            mono = monolith[key]
            study_dictionary(mono)
            monostudy = compile_mono(mono)
            file.save(monostudy, 'data_processing/study.json')

# Get Character Keys

def get_monolith_character_keys(monolith):
    'Extract keys of character objects from monolith.'
    character_keys = set()
    for key in monolith:
        mono = monolith[key]
        if 'baseCharacter' in mono:
            character_keys.add(key)
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
        if key in monolith:
            return monolith[key]
        return {'title': None, 'features': []}

    def record(key):
        'Record corpus key and return it.'
        if isinstance(key, dict):
            for subkey in key:
                record(key[subkey])
        else:
            corpus_keys.add(key)
        return key

    def build_subs(m_substitutions):
        'Get keys of substitutions to use in ability description templates.'
        subs = []
        for sub in m_substitutions:
            key, value = sub.split('.')
            key = key.upper()
            value = value[0].lower() + value[1:]
            subs.append((key, value))
        return subs

    def build_tier(m_feature, m_tier, subs):
        'Get substitution values to be used in ability description templates.'
        tier = [None] * len(subs)
        for obj in iter_object(m_tier):
            for i, sub in enumerate(subs):
                if obj['id'].upper() == sub[0]:
                    tier[i] = obj[sub[1]]
        for obj in iter_object(m_feature, ['tiers']):
            for i, sub in enumerate(subs):
                if obj['id'].upper() == sub[0]:
                    tier[i] = obj[sub[1]]
        return tier

    def iter_object(obj, skip_keys=[]):
        'Iterate through all substitution objects nested within an object.'
        if isinstance(obj, dict):
            if 'm_PathID' in obj:
                obj = monoref(obj)
            if 'id' in obj:
                yield obj
            for key in obj:
                if key not in skip_keys:
                    for subobj in iter_object(obj[key], skip_keys):
                        yield subobj
        elif isinstance(obj, list):
            for item in obj:
                for subobj in iter_object(item, skip_keys):
                    yield subobj

    def build_features(obj):
        'Format an ability object.'
        title = record(monoref(obj)['title'])
        features = []
        for feature_ref in monoref(obj)['features']:
            m_feature = monoref(feature_ref)
            subtitle = record(m_feature['title'])
            description = record(m_feature['description'])
            subs = build_subs(m_feature['substitutions'])
            tiers = []
            for tier_ref in m_feature['tiers']:
                m_tier = monoref(tier_ref)
                tier = build_tier(m_feature, m_tier, subs)
                tiers.append(tier)
            if subtitle == '': # signature ability
                features.append({
                    'description': description,
                    'tiers': tiers
                })
            else: # marquee ability
                features.append({
                    'title': subtitle,
                    'description': description,
                    'tiers': tiers
                })
        return {
            'title': title,
            'features': features
        }

    def build_fighter(mono):
        base = monoref(mono['baseCharacter'])
        f_key = base['humanReadableGuid']
        if f_key in fighters: # skip copies
            return
        f_value = {
            # 'dataName': base['dataName'],
            'name': record(base['displayName']),
            # 'role': record(base['roleDescription']),
            'voice': {
                'en': base['englishVoArtist'],
                'ja': base['japaneseVoArtist']
            },
            # 'blockbusters': [monoref(x) for x in base['blockbusters']], # TODO: add this in
            # 'specialmoves': {}, # TODO: add this in
            'ca': record(monoref(base['characterAbility'])),
            'ma': build_features(mono['superAbility'])
        }
        if f_value['ma']['title'] == None:
            return
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
            # 'enabled': v_key == hrid,
            'base': f_key,
            'name': record(mono['displayVariantName']),
            # 'role': record(mono['variantDescription']),
            'quote': record(mono['variantQuote']),
            'tier': mono['initialTier'],
            'element': mono['elementAffiliation'],
            'stats': mono['baseScaledValuesByTier'],
            'sa': build_features(mono['signatureAbility'])
        }
        variants.setdefault(v_key, v_value)

    for key in mono_char_keys:
        mono = monolith[key]
        build_fighter(mono)
        build_variant(mono)

    return fighters, variants, corpus_keys

if __name__ =='__main__':
    monolith = file.load('data_processing/sgm_exports/MonoBehaviour', 'split\d+-(\d+)-Mono')
    corpus = file.load('data_processing/sgm_exports/TextAsset')

    mono_char_keys = get_monolith_character_keys(monolith)

    # study_sample(monolith, mono_char_keys, 'oMai')

    fighters, variants, corpus_keys = build_data(monolith, mono_char_keys)

    for language in corpus:
        primcorpus = {key: corpus[language][key] for key in corpus_keys if key in corpus[language]}
        file.save(primcorpus, 'data/{}.json'.format(language))
    file.save(fighters, 'data/fighters.json')
    file.save(variants, 'data/variants.json')
