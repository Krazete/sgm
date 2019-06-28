from data_processing import file

oldcorpus = file.load('data')
rawnewcorpus = file.load('data_processing/sgm_exports/TextAsset')

newcorpus = {}

for key in oldcorpus['en']:
    if key == 'Char_Double_SA_ShapeOfSlaughter_Desc':
        key = key + '_Alt'
    for language in ['en', 'ja', 'fr', 'de', 'es', 'ko', 'zh-cn', 'ru', 'pt-br']:
        newcorpus.setdefault(language, {})
        try:
            newcorpus[language].setdefault(key, rawnewcorpus[language][key])
        except:
            pass

for language in newcorpus:
    file.save(newcorpus[language], 'data/{}.json'.format(language))
