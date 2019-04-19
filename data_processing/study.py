from data_processing.main import *

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

def study_sample(monolith, variant_keys, hrid=None):
    'Print a monolith object and output more detailed results in study.json.'
    if hrid:
        for key in variant_keys:
            mono = monolith[key]
            if hrid == mono['humanReadableGuid']:
                study_dictionary(mono)
                monostudy = compile_mono(mono)
                file.save(monostudy, 'data_processing/study.json')
    else:
        from random import sample
        for key in sample(variant_keys, 1):
            mono = monolith[key]
            study_dictionary(mono)
            monostudy = compile_mono(mono)
            file.save(monostudy, 'data_processing/study.json')

if __name__ == '__main__':
    variant_keys = get_keys(variant_traits)

    study_sample(monolith, variant_keys, 'oMai')

    for key in monolith:
        if 'SA_Valentine_VAR_DeadlyFury'.lower() in str(monolith[key]).lower():
            print(key)
    # monolith['16683']
