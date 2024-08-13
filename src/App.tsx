import { ChangeEvent, useCallback, useMemo, useState } from 'react'
import DateFnsUtils from '@date-io/date-fns'
import { enUS, hu } from 'date-fns/locale'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'

import { DAY_LENGTH } from './view/calendar/const.ts'
import RandomEventProvider from './view/calendar/event/RandomEventProvider'
import FixEventProvider from './view/calendar/event/FixEventProvider'
import events from './events.json'
import CalendarProvider from './view/calendar/navigation/CalendarProvider'
import type { BaseEvent } from './view/calendar/types'
import FullCalendar from './view/calendar/navigation/FullCalendar'

import './App.css'

const locales = { en: enUS, hu }

const possibleLocales = ['en', 'hu']

const useRandom = false
function App () {
  const [language, setLanguage] = useState<string>(possibleLocales[0])

  const locale = useMemo(() => locales[language as keyof typeof locales], [language])
  const utils = useMemo(() => new DateFnsUtils({ locale }), [locale])

  const eventProvider = useMemo(() => {
    return useRandom
      ? RandomEventProvider(10, DAY_LENGTH * 1.5)
      : FixEventProvider(events.map((event) => ({
        ...event,
        start: utils.parseISO(event.start),
        end: utils.parseISO(event.end)
      })))
  }, [utils])

  const eventClick = useCallback((event: BaseEvent) => {
    console.log('Event clicked', event)
  }, [])

  const onGridClick = useCallback((date: Date) => {
    console.error('App on grid click', date)
  }, [])

  const onLanguageChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value)
  }, [])

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={locale}>
      <div>
        <div>
          <select onChange={onLanguageChange} value={language}>
            {possibleLocales.map((locale, idx) => (<option key={idx} label={locale}>{locale}</option>))}
          </select>
        </div>
        <div className="app-week">
          <CalendarProvider>
            <FullCalendar eventProvider={eventProvider} onEventClick={eventClick} onGridClick={onGridClick}/>
          </CalendarProvider>
        </div>
      </div>
    </LocalizationProvider>
  )
}

export default App
