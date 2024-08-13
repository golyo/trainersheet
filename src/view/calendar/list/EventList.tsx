import { FunctionComponent, useMemo } from 'react'
import { AdapterFormats } from '@mui/x-date-pickers/models/adapters';

import { DAY_LENGTH } from '../const.ts'
import type { EventClick, CalendarEvent } from '../types'
import EventItem from '../EventItem'

import './EventList.css'

const RANGE_IN_RADIUS = '5px'
const RANGE_OUT_RADIUS = '20px'

interface EventListProps {
  events: CalendarEvent[]
  from: Date
  onEventClick?: EventClick
  dateFormat?: keyof AdapterFormats
  skipRangeRadius?: boolean
  to?: Date
}

const EventList: FunctionComponent<EventListProps> = (
  { events, dateFormat, from, to, onEventClick, skipRangeRadius }) => {
  const showEvents = useMemo(() => {
    const fromTime = from.getTime()
    const toTime = to ? to.getTime() : fromTime + DAY_LENGTH
    const result = events.filter((e) => e.start.getTime() < toTime && e.end.getTime() > fromTime)
    if (skipRangeRadius) {
      return result
    }
    return result.map((e) => {
      const leftRadius = e.start.getTime() < fromTime ? RANGE_IN_RADIUS : RANGE_OUT_RADIUS
      const rightRadius = e.end.getTime() > toTime ? RANGE_IN_RADIUS : RANGE_OUT_RADIUS
      return {
        ...e,
        style: {
          ...e.style,
          borderRadius: `${leftRadius} ${rightRadius} ${rightRadius} ${leftRadius}`
        }
      }
    })
  }, [from, to, events, skipRangeRadius])

  return (
    <div className="event-list">
      <div className="event-list-inner">
        {showEvents.map((event, idx) => <EventItem
          event={event} key={idx} showTimeRange dateFormat={dateFormat} onEventClick={onEventClick} />)}
      </div>
    </div>
  )
}

export default EventList
