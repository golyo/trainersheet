import { useEffect, useState, ReactNode, useContext } from 'react'
import LanguageContext, { Country, IPData, LanguageContextType } from './LanguageContext.ts'
import { useTranslation } from 'react-i18next'

const getCountriesUrl = (language: string) => `https://cdn.jsdelivr.net/npm/world_countries_lists@latest/data/countries/${language}/countries.json`

const getIpApiUrl = 'http://ip-api.com/json'

const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [context, setContext] = useState<LanguageContextType>({} as LanguageContextType)

  const { i18n } = useTranslation()
  useEffect(() => {
    console.log('++++Language changed', i18n.language)
    fetch(getCountriesUrl(i18n.language)).then(res => res.json()).then((result: Country[]) => setContext((prev) => ({
      ...prev,
      countries: result,
    })))
  }, [i18n.language])

  useEffect(() => {
    fetch(getIpApiUrl).then((res) => res.json()).then((result: IPData) => setContext((prev) => ({
      ...prev,
      ipData: result,
    })))
  }, []);

  console.log('+++++++++Countries', context)
  return <LanguageContext.Provider value={context}>{ children}</LanguageContext.Provider>
}

export default LanguageProvider
export const useLanguages = () => useContext(LanguageContext)
