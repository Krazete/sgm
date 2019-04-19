from data_processing import file
import re

monolith = file.load('data_processing/sgm_exports/MonoBehaviour', 'split\d+-(\d+)-Mono')
corpus = file.load('data_processing/sgm_exports/TextAsset')

character_traits = ['characterAbility', 'englishVoArtist']
variant_traits = ['baseCharacter', 'displayVariantName', 'variantQuote']
sm_traits = ['gearPointsCost', 'cooldownTimes']
bb_traits = ['gearPointsCost', 'strengthLevel']
catalyst_traits = ['randomCharacter', 'randomElement']
# ability_traits = ['features']

def get_keys(traits):
    'Get keys of objects with certain attributes from the monolith.'
    keys = set()
    for key in monolith:
        mono = monolith[key]
        is_key = True
        for trait in traits:
            if trait not in mono:
                is_key = False
                break
        if is_key:
            keys.add(key)
    return keys

def get_characters(character_keys, variant_keys):
    characters = {}
    for character_key in character_keys:
        character = monolith[character_key]
        id = character['humanReadableGuid']
        data = {}
        data['name'] = character['displayName']
        data['ca'] = character['characterAbility']
        for variant_key in variant_keys:
            variant = monolith[variant_key]
            if variant['baseCharacter']['m_PathID'] == character_key:
                data['ma'] = variant['superAbility']
                break
        characters.setdefault(id, data)
    return characters

def get_variants(variant_keys):
    variants = {}
    for variant_key in variant_keys:
        variant = monolith[variant_key]
        id = variant['humanReadableGuid']
        character_key = str(variant['baseCharacter']['m_PathID'])
        if character_key not in monolith:
            print('Character', character_key, 'for Variant', id, 'not found in monolith.')
            continue
        character = monolith[character_key]
        data = {}
        data['base'] = character['humanReadableGuid']
        data['name'] = variant['displayVariantName']
        data['quote'] = variant['variantQuote']
        data['tier'] = variant['initialTier']
        data['element'] = variant['elementAffiliation']
        data['stats'] = variant['baseScaledValuesByTier']['Array']
        data['sa'] = variant['signatureAbility'] # reference object
        variants[id] = data
    return variants

def get_sms(character_keys, sm_keys):
    sms = {}
    for character_key in character_keys:
        character = monolith[character_key]
        for sm_ref in character['specialMoves']['Array']:
            sm_key = str(sm_ref['m_PathID'])
            sm = monolith[sm_key]
            id = sm['humanReadableGuid']
            data = {}
            data['base'] = character['humanReadableGuid']
            data['name'] = sm['title']
            data['type'] = 0
            data['tier'] = sm['tier']
            data['gear'] = sm['gearDamageTier']
            data['cost'] = sm['gearPointsCost']
            data['attack'] = sm['attackDamageMultipliers']
            data['damage'] = sm['damageIndicatorLevels']
            data['cooldown'] = sm['cooldownTimes']
            data['ability'] = sm['signatureAbility'] # reference object
            sms[id] = data
    for sm_key in sm_keys:
        if sm_key not in sms:
            print(sm_key)
    for id in sms:
        if id not in sm_keys:
            print(id)
    return sms

def get_bbs(character_keys, bb_keys):
    bbs = {}
    for character_key in character_keys:
        character = monolith[character_key]
        for bb_ref in character['blockbusters']['Array']:
            bb_key = str(bb_ref['m_PathID'])
            bb = monolith[bb_key]
            id = bb['humanReadableGuid']
            data = {}
            data['base'] = character['humanReadableGuid']
            data['name'] = bb['title']
            data['type'] = 0
            data['tier'] = bb['tier']
            data['gear'] = bb['gearDamageTier']
            data['cost'] = bb['gearPointsCost']
            data['attack'] = bb['attackDamageMultipliers']
            data['damage'] = bb['damageIndicatorLevels']
            data['cooldown'] = bb['strengthLevel']
            data['ability'] = bb['signatureAbility'] # reference object
            bbs[id] = data
    for bb_key in bb_keys:
        if bb_key not in bbs:
            print(bb_key)
    for id in bbs:
        if id not in bb_keys:
            print(id)
    return bbs

def get_catalysts(catalyst_keys):
    catalysts = {}
    for catalyst_key in catalyst_keys:
        catalyst = monolith[catalyst_key]
        id = catalyst['humanReadableGuid']
        data = {}
        data['name'] = catalyst['title']
        data['tier'] = catalyst['tier']
        data['icon'] = catalyst['icon']['resourcePath']
        data['characterLock'] = catalyst['randomCharacter']
        data['elementLock'] = catalyst['randomElement']
        data['constraint'] = catalyst['abilityConstraint'] # reference object
        data['ability'] = catalyst['signatureAbility'] # reference object
        catalysts[id] = data
    return catalysts

# def get_abilities(ability_keys):
#     pass

def get_corpus_keys(object):
    keys = set()
    for key in object:
        subobj = object[key]
        if isinstance(subobj, str):
            keys.add(subobj)
        elif isinstance(subobj, dict):
            keys.extend(get_corpus_keys(subobj))
    return keys

if __name__ =='__main__':
    character_keys = get_keys(character_traits)
    variant_keys = get_keys(variant_traits)
    sm_keys = get_keys(sm_traits)
    bb_keys = get_keys(bb_traits)
    catalyst_keys = get_keys(catalyst_traits)
    # ability_keys = get_keys(ability_traits)

    characters = get_characters(character_keys, variant_keys)
    variants = get_variants(variant_keys)
    sms = get_sms(character_keys, sm_keys)
    bbs = get_bbs(character_keys, bb_keys)
    catalysts = get_catalysts(catalyst_keys)
    # abilities = get_abilities(ability_keys)

    file.save(characters, 'data/characters.json')
    file.save(variants, 'data/variants.json')
    file.save(sms, 'data/sms.json')
    file.save(bbs, 'data/bbs.json')
    file.save(catalysts, 'data/catalysts.json')

    corpus_keys = get_corpus_keys(characters, variants, sms, bbs, catalysts)
    for language in corpus:
        primcorpus = {key: corpus[language][key] for key in corpus_keys if key in corpus[language]}
        file.save(primcorpus, 'data/{}.json'.format(language))
