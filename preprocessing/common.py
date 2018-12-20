from preprocessing import file

common = [
    'Key_Fighter',
    'MainMenu_Collection', # UNUSED
    'Version_Login',
    'Loading_Status_Loading',

    'Stat_AttackFlat_Label',
    'Stat_HealthFlat_Label',
    'Sort_FS',
    'SkillTree_CharacterAbility_Title',
    'CharacterDetails_SA',
    'SkillTree_SuperAbility_Title',

    'Key_Options',
    'Stat_Lvl',
    'Character_Evolve_Button',
    'Character_Sorting_Level',

    'TeamSelect_Filter',
    'TeamSelect_Sort',
    'Key_Alphabetical',
    'SkillTree_AtkNode_Title',
    'SkillTree_HealthNode_Title',
    'Key_Element',
    'Sort_Tier'
]

corpus = file.load('preprocessing/sgm_exports/TextAsset')
commoncorpus = {key: {language: corpus[language][key] for language in corpus} for key in common}
file.save(commoncorpus, 'preprocessing/common.json')

# REGEX-SEARCH FOR:
# "(.+?)": "(.+?)",?
# REPLACE WITH:
# html[lang='$1'] :before {content: '$2';}
