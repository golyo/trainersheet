import { createContext } from 'react'

export interface Country {
  alpha2: string
  alpha3: string
  name: string
}

export interface IPData {
  status: string
  country: string
  countryCode: string
  region: string
  regionName: string
  city: string
  zip: string
  lat: string
  lon: string
  timezone: string
  query: string
}

export type LanguageContextType = {
  countries: Country[]
  ipData: IPData
}

const AuthContext = createContext<LanguageContextType>({} as LanguageContextType)

export default AuthContext