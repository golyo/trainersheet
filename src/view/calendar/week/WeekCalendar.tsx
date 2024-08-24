import { MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useCalendarContext } from '../navigation/CalendarProvider'
import { HOUR_NO, useUtils } from '../const.ts'
import EventSheet from '../EventSheet'
import WeekPlaceHandler, { type CalendarPlaceHandlerResult, DEFAULT_RESULT } from './WeekPlaceHandler'
import type { CalendarEvent, CalendarProps } from '../types'
import LoadIndicator from '../LoadIndicator'

import './WeekCalendar.css'

const WeekCalendar = <T extends CalendarEvent>({
  eventProvider,
  showMouseOver,
  onGridClick,
  onEventClick
}: CalendarProps<T>) => {
  const ref = useRef<HTMLDivElement | null>(null)

  const utils = useUtils()
  const { actualDate, navigation: { nextWeek, prevWeek }, weekCalendarStyle } = useCalendarContext()
  const [sheetResult, setSheetResult] = useState<CalendarPlaceHandlerResult>(DEFAULT_RESULT)
  const [loading, setLoading] = useState<boolean>(false)

  const calendarHandler = useMemo(() => WeekPlaceHandler({
    utils,
    hideWeekends: weekCalendarStyle.hideWeekends,
    maxEventNo: weekCalendarStyle.maxEventsHeaderNo,
    arrowProperties: !weekCalendarStyle.showNavigation
      ? undefined
      : {
          onRightClick: nextWeek,
          onLeftClick: prevWeek
        }
  }), [utils, weekCalendarStyle, nextWeek, prevWeek])
  const headerStyle = useMemo(() => {
    return {
      backgroundImage: `linear-gradient(var(--grid-color) 0px, transparent 1px, transparent 100%),
                        linear-gradient(90deg, var(--grid-color) 0px, white calc(30%), white calc(70%), var(--grid-color) calc(100%))`,
      backgroundSize: `${100 / calendarHandler.getColNo()}% 50%`,
      height: weekCalendarStyle.rowHeight * 2
    }
  }, [calendarHandler, weekCalendarStyle])

  const gridStyle = useMemo(() => {
    return {
      backgroundImage: `linear-gradient(var(--grid-color) 0px, transparent 1px, transparent 100%),
                        linear-gradient(90deg, transparent 0px, transparent calc(100% - 1px), var(--grid-color) calc(100%))`,
      backgroundSize: `${100 / calendarHandler.getColNo()}% ${100 / HOUR_NO}%`,
      height: weekCalendarStyle.rowHeight * HOUR_NO
    }
  }, [calendarHandler, weekCalendarStyle])

  const handleGridClick = useCallback((e: MouseEvent) => {
    if (onGridClick == null) {
      return
    }
    const target = (e.target as HTMLDivElement)
    const rect = target.getBoundingClientRect()
    const colIdx = Math.floor((e.clientX - rect.left) / (target.clientWidth / calendarHandler.getColNo()))
    const rowIdx = Math.floor((e.clientY - rect.top) / (target.clientHeight / HOUR_NO))
    if (colIdx > 0) {
      const gridDate = utils.setHours(utils.addDays(utils.startOfWeek(actualDate), colIdx - 1), rowIdx)
      onGridClick(gridDate, e)
    }
  }, [actualDate, calendarHandler, onGridClick, utils])

  useEffect(() => {
    if (ref.current && sheetResult?.firstHour) {
      ref.current!.scrollTop = sheetResult.firstHour * weekCalendarStyle.rowHeight
    }
  }, [sheetResult, weekCalendarStyle, ref])

  useEffect(() => {
    calendarHandler.setActualDate(actualDate)
    const endDate = utils.addDays(utils.date(calendarHandler.getFirstWeekDay().toISOString()), calendarHandler.getWeekDayNo())
    setSheetResult(calendarHandler.transformToSheetEvents([]))
    setLoading(true)
    eventProvider.getEvents(calendarHandler.getFirstWeekDay(), endDate).then((calendarEvents) => {
      setSheetResult(calendarHandler.transformToSheetEvents(calendarEvents))
      setLoading(false)
    }).catch((err) => {
      console.error('Error while get events', err)
      throw new Error(err)
    })
  }, [actualDate, calendarHandler, eventProvider, utils])

  return (
    <>
      <div ref={ref} className='week-calendar-container'>
        <LoadIndicator visible={loading} />
        <div className="week-calendar-header-container" style={headerStyle} >
          <EventSheet events={sheetResult.headerEvents}
                      minEventHeight={weekCalendarStyle.minEventHeight}
                      onEventClick={onEventClick}
                      showMouseOver={showMouseOver} />
        </div>
        <div onClick={handleGridClick}>
          <EventSheet events={sheetResult.inDayEvents}
                      sheetStyle={gridStyle}
                      minEventHeight={weekCalendarStyle.minEventHeight}
                      onEventClick={onEventClick}
                      showMouseOver={showMouseOver} />
        </div>
      </div>
    </>
  )
}

export default WeekCalendar
