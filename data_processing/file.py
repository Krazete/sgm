import os
import json
import re
from shutil import copyfile

def iter_json_dir(directory, show_error=False):
    'Generate all valid JSON files in given directory.'
    for filename in os.listdir(directory):
        with open(os.path.join(directory, filename), encoding='utf-8') as file:
            try:
                stem = os.path.splitext(filename)[0]
                content = json.load(file)
                yield stem, content
            except Exception as message:
                if show_error:
                    print('Error opening {}: {}.'.format(filename, message))

def load(directory, key_pattern=None):
    'Build python object from JSON file directory.'
    if isinstance(key_pattern, str):
        key_pattern = re.compile(key_pattern)
    obj = {}
    for stem, content in iter_json_dir(directory):
        if key_pattern == None:
            obj.setdefault(stem, content)
        else:
            keys = re.findall(key_pattern, stem)
            for key in keys:
                obj.setdefault(key, content)
    return obj

def save(obj, path, pretty=True):
    'Save python object to JSON file.'
    with open(path, 'w') as file:
        if pretty:
            json.dump(obj, file, indent=4, separators=(',', ': '), sort_keys=True)
        else:
            json.dump(obj, file, sort_keys=True)

def copy(src, dst, show_error=False):
    'Copy a file.'
    try:
        copyfile(src, dst)
    except FileNotFoundError:
        if show_error:
            print('FileNotFoundError:', src, ' to ', dst)
