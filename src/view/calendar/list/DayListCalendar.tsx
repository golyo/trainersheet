import { useEffect, useMemo, useState } from 'react'

import { DAY_LENGTH, useUtils } from '../const.ts'
import type { CalendarEvent, CalendarProps } from '../types'
import { useCalendarContext } from '../navigation/CalendarProvider'
import EventList from './EventList'
import LoadIndicator from '../LoadIndicator'

import './DayListCalendar.css'

interface DayListCalendarProps<T extends CalendarEvent> extends CalendarProps<T> {
  dayCacheRange?: number
}

interface EventCache {
  from: Date
  events: CalendarEvent[]
}

const DayListCalendar = <T extends CalendarEvent>({ eventProvider, dayCacheRange = 10, onEventClick }: DayListCalendarProps<T>) => {
  const { actualDate } = useCalendarContext()
  const utils = useUtils()
  const [eventCache, setEventCache] = useState<EventCache>()
  const actualFrom = useMemo(() => utils.startOfDay(actualDate), [actualDate, utils])

  useEffect(() => {
    const time = utils.toJsDate(actualDate).getTime()
    if (eventCache && eventCache.from.getTime() <= time &&
      (eventCache.from.getTime() + (DAY_LENGTH * 2 * dayCacheRange) > time)) {
      return
    }
    const from = utils.startOfDay(utils.addDays(actualDate, -dayCacheRange))
    const to = utils.endOfDay(utils.addDays(actualDate, +dayCacheRange))
    setEventCache(undefined)
    eventProvider.getEvents(from, to)
      .then((result) => {
        setEventCache({
          from,
          events: result
        })
      }).catch((e) => {
        // TODO handle error
        console.error('Error', e)
      })
  }, [actualDate, dayCacheRange, eventCache, eventProvider, utils])

  const todayLabel = useMemo(() => utils.formatByString(actualDate, utils.formats.fullDate), [utils, actualDate])
  const weekdayLabel = useMemo(() => utils.formatByString(actualDate, 'EEEE'), [utils, actualDate])

  return (
    <div className="day-list-container">
      <div className="day-list-header">
        <span className="day-list-title">{todayLabel}</span><br/>
        <span className="day-list-description">{weekdayLabel}</span>
      </div>
      <LoadIndicator visible={!eventCache} />
      <div className="day-list-event-container">
        <EventList events={eventCache?.events ?? []} from={actualFrom} onEventClick={onEventClick} />
      </div>
    </div>
  )
}

export default DayListCalendar
