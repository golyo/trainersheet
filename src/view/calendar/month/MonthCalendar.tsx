import { type MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import EventSheet from '../EventSheet'
import type { BaseEvent, CalendarEvent, CalendarProps } from '../types'

import { useCalendarContext } from '../navigation/CalendarProvider'

import { getOriginalId } from '../EventItem'
import EventList from '../list/EventList'
import CalendarModal from '../CalendarModal'
import LoadIndicator from '../LoadIndicator'
import MonthPlaceHandler from './MonthPlaceHandler'
import './MonthCalendar.css'
import { useUtils } from '../const.ts';

export const getHeaderStyle = (colNo: number, height: string) => ({
  backgroundSize: `${100 / (colNo ?? 1)}%`,
  height
})

const MonthCalendar = <T extends CalendarEvent>({
  eventProvider,
  onEventClick
}: CalendarProps<T>) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const [modalDate, setModalDate] = useState<Date>()

  const utils = useUtils();
  const { actualDate, monthCalendarStyle: monthStyle } = useCalendarContext()
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const onHeaderEventClick = useCallback((event: BaseEvent) => {
    const id = getOriginalId(event.id)
    const start = new Date(id)
    if (event.badge) {
      setModalDate(start)
    }
  }, [utils])

  const closeModal = useCallback(() => {
    setModalDate(undefined)
  }, [])

  const calendarHandler = useMemo(() => MonthPlaceHandler({
    utils,
    monthStyle,
    onHeaderEventClick
  }), [utils, monthStyle, onHeaderEventClick])

  const sheetResult = useMemo(() => calendarHandler.transformToSheetEvents(calendarEvents),
    [calendarHandler, calendarEvents])

  const gridStyle = useMemo(() => {
    return {
      backgroundImage: 'linear-gradient(90deg, transparent 0px, transparent calc(100% - 1px), var(--grid-color) calc(100%))',
      backgroundSize: `${100 / calendarHandler.getColNo()}%`
    }
  }, [calendarHandler, calendarEvents])

  const modalState = useMemo(() => ({
    visible: !!modalDate,
    title: modalDate ? `${utils.formatByString(utils.date(modalDate.toISOString()), utils.formats.shortDate)} - ${utils.formatByString(utils.date(modalDate.toISOString()), 'EEEE')}` : ''
  }), [utils, modalDate])

  const modalEventClick = useCallback((event: BaseEvent, click: MouseEvent) => {
    closeModal()
    if (onEventClick) {
      onEventClick(event, click)
    }
  }, [closeModal, onEventClick])

  const headerBackgroundDivs = useMemo(() => {
    const headerStyle = getHeaderStyle(calendarHandler.getColNo(), `${100 * monthStyle.dayTitleHeightRatio}%`)
    const rowNoArray = [...Array(calendarHandler.getRowNo())]

    return <div className="month-calendar-background-container" style={gridStyle}>
      {
        rowNoArray.map((_, idx) => (
          <div key={idx} className="month-calendar-background-item">
            <div className="month-calendar-header" style={headerStyle}></div>
          </div>
        ))
      }
    </div>
  }, [calendarHandler, gridStyle, monthStyle.dayTitleHeightRatio])

  useEffect(() => {
    calendarHandler.setActualDate(actualDate)
    setCalendarEvents([])
    setLoading(true)
    eventProvider.getEvents(calendarHandler.getFirstDay(), calendarHandler.getLastDay()).then((calendarEvents) => {
      setCalendarEvents(calendarEvents)
      setLoading(false)
    }).catch((err) => {
      console.error('Error while get events', err)
      throw new Error(err)
    })
  }, [actualDate, calendarHandler, eventProvider, utils])

  return (
    <div ref={ref} className='month-calendar-container'>
      <LoadIndicator visible={loading} />
      {headerBackgroundDivs}
      <EventSheet events={sheetResult ?? []}
                  minEventHeight={monthStyle.minEventHeight}
                  onEventClick={onEventClick} />
      <CalendarModal
        visible={modalState.visible}
        title={modalState.title}
        closeModal={closeModal}
        modalStyle={{ width: 320, maxHeight: '90%', overflow: 'auto' }}>
        {!!modalDate && calendarEvents && <EventList events={calendarEvents} from={modalDate} onEventClick={modalEventClick} />}
      </CalendarModal>
    </div>
  )
}

export default MonthCalendar
