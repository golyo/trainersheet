import { FC, FunctionComponent, MouseEvent, useCallback, useMemo } from 'react'
import { MuiPickersAdapter } from '@mui/x-date-pickers';
import { AdapterFormats } from '@mui/x-date-pickers/models/adapters';

import { EMPTY_CLICK, useUtils } from './const.ts'

import type { BaseEvent, CalendarEvent, EventClick } from './types'
import './EventItem.css'

interface EventItemProps {
  event: BaseEvent
  showMouseOver?: boolean
  showTimeRange?: boolean
  dateFormat?: keyof AdapterFormats
  onEventClick?: EventClick
}

const GENERATED_SUFFIX = '-generated'
const getComponent = (Component: FC, props?: object) => <Component {...props} />
const isGeneratedId = (id: string) => id.endsWith(GENERATED_SUFFIX)
export const getOriginalId = (id: string) => isGeneratedId(id) ? id.substring(0, id.length - GENERATED_SUFFIX.length) : id
export const createGeneratedId = (id: string) => `${id}${GENERATED_SUFFIX}`

export const getTimeRange = (utils: MuiPickersAdapter<Date>, from: Date, to: Date, dateFormat?: string) => {
  const startFormat = dateFormat ?? utils.formats.fullDate
  const endFormat = dateFormat ?? utils.getYear(from) === utils.getYear(to) ? 'MMM dd, p' : startFormat
  return `${utils.formatByString(from, startFormat)} - ${utils.formatByString(to, endFormat)}`
}

const setZoomValueByTarget = (zoomNo: number) => (event: MouseEvent<HTMLDivElement>) => {
  const isSheetEvent = event.currentTarget.getAttribute('data-type') === 'sheet-event'
  const dataId = event.currentTarget.getAttribute('data-id')
  if (isSheetEvent && dataId) {
    const elements = document.querySelectorAll(`[data-id='${dataId}']`)
    elements.forEach((el) => {
      (el as HTMLDivElement).style.zIndex = `${zoomNo}`
    })
  }
}

const EventItem: FunctionComponent<EventItemProps> = (
  { event, showMouseOver, showTimeRange, onEventClick, dateFormat }) => {
  const utils = useUtils()
  const handleClick = useCallback((click: MouseEvent, event: BaseEvent) => {
    if (event.onEventClick != null) {
      event.onEventClick(event, click)
    } else if (onEventClick != null) {
      onEventClick(event, click)
    }
    click.stopPropagation()
  }, [onEventClick])

  const timeRange = useMemo(() => {
    const cEvent = event as CalendarEvent
    if (!showTimeRange || !cEvent.start) {
      return ''
    }
    return getTimeRange(utils, cEvent.start, cEvent.end, dateFormat)
  }, [utils, event, showTimeRange, dateFormat])

  const containerClassName = event.className ? `event-container ${event.className}` : 'event-container'
  return (
    <div
      data-type="sheet-event"
      data-id={event.id}
      className={containerClassName}
      style={event.style}
      onMouseEnter={showMouseOver && !isGeneratedId(event.id) ? setZoomValueByTarget(3) : EMPTY_CLICK}
      onMouseLeave={showMouseOver && !isGeneratedId(event.id) ? setZoomValueByTarget(2) : EMPTY_CLICK}
      onClick={(e) => { handleClick(e, event) }}
    >
      <div className="event-title">{event.title}</div>
      {event.description && <div className="event-description">{event.description}</div>}
      {timeRange && <div className="event-description">{timeRange}</div>}
      {!!event.content && getComponent(event.content, event.contentProperties)}
      {event.badge && <div className="event-badge">{event.badge}</div>}
    </div>
  )
}

export default EventItem
