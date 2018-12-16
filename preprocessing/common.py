from preprocessing import file

common = [
    # 'Loading_Status_Loading', # useless after corpus loads
    'Version_Login',

    'TeamSelect_Filter',
    'TeamSelect_Sort',
    'Key_Alphabetical',
    'Sort_FS',
    'SkillTree_AtkNode_Title',
    'SkillTree_HealthNode_Title',
    'Key_Element',
    'Sort_Tier',

    'Stat_AttackFlat_Label',
    'Stat_HealthFlat_Label',
    'SkillTree_CharacterAbility_Title',
    'CharacterDetails_SA',
    'SkillTree_SuperAbility_Title',

    'Stat_Lvl',
    'Key_Fighter',
    'MainMenu_Collection'
]

corpus = file.load('preprocessing/sgm_exports/TextAsset')
commoncorpus = {key: {language: corpus[language][key] for language in corpus} for key in common}
file.save(commoncorpus, 'preprocessing/common.json')
