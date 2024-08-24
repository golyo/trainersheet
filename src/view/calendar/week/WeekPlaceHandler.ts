import { type ArrowNavigationType, ArrowNavigation } from '../navigation/ArrowNavigation'
import { DAY_LENGTH, EMPTY_CLICK, getWeekdays, HOUR_LENGTH, HOUR_NO, MINUTE_LENGTH } from '../const.ts'
import { startDateOrder } from '../month/MonthPlaceHandler'
import { createGeneratedId } from '../EventItem'
import { type SheetEvent } from '../EventSheet'
import { type CalendarEvent, type EventClick } from '../types'
import { MuiPickersAdapter } from '@mui/x-date-pickers'

const BEFORE_COL_NO = 1
const HOUR_MARK_HEIGHT = 0.02
const GMT_HEIGHT = 1 / 3
const IN_RANGE_MARGIN = 1 / 10
const MIN_MARGIN = 1 / 2

export const DEFAULT_RESULT: CalendarPlaceHandlerResult = {
  firstHour: 0,
  inDayEvents: [],
  headerEvents: []
}

export interface CalendarPlaceHandlerResult {
  headerEvents: SheetEvent[]
  inDayEvents: SheetEvent[]
  firstHour: number
}

export interface CalendarPlaceHandlerProps {
  utils: MuiPickersAdapter<Date>
  hideWeekends?: boolean
  minEventHeight?: number
  maxEventNo: number
  arrowProperties?: ArrowNavigationType
}

interface EventWithIdx {
  event: CalendarEvent
  idx: number
}

interface EventRangeType {
  startDayTime: number
  events: EventWithIdx[]
  maxIdx: number
  maxDate: number
}

interface EventDrawMap {
  skipEvents: CalendarEvent[]
  eventRanges: EventRangeType[]
}

const eventRangeSort = (er1: EventWithIdx, er2: EventWithIdx) => (er1.idx - er2.idx) || (er1.event.start.getTime() - er2.event.start.getTime())

const resetArray: <T,>(arr: T[]) => void = <T,>(arr: T[]) => {
  while (arr.length > 0) {
    arr.pop()
  }
}

const PaddingHandler = (maxEventNo: number, minStartDiff: number, useUpPriority?: boolean) => {
  const inRangeEndDates: number[] = []
  const inRangeStartDates: number[] = []

  let startDayTime = 0

  const reset = (startDay: number) => {
    startDayTime = startDay
    resetArray(inRangeEndDates)
    resetArray(inRangeStartDates)
  }

  const getFirstEnabledIdx = (event: CalendarEvent) => {
    const checkStart = Math.max(event.start.getTime(), startDayTime)
    let idx = inRangeEndDates.findIndex((endDate) => endDate <= checkStart)
    if (idx < 0) {
      if (minStartDiff && (!useUpPriority || inRangeStartDates.length === maxEventNo)) {
        idx = inRangeStartDates.findIndex((startDate) => startDate + minStartDiff <= event.start.getTime())
      }
      if (idx < 0) {
        idx = inRangeEndDates.length
        if (idx === maxEventNo) {
          // skip
          return -1
        }
      }
    }
    inRangeEndDates[idx] = event.end.getTime()
    inRangeStartDates[idx] = checkStart
    return idx
  }

  const getDefaultRange = () => ({
    startDayTime: 0,
    maxIdx: 0,
    maxDate: 0,
    events: []
  } as EventRangeType)
  const getEventDrawMap = (events: CalendarEvent[], dayIdx: number) => {
    const drawMap: EventDrawMap = {
      eventRanges: [],
      skipEvents: []
    }
    let eventRange: EventRangeType | undefined = undefined
    events.forEach((event) => {
      if (!eventRange || event.start.getTime() > eventRange.maxDate) {
        if (eventRange) {
          drawMap.eventRanges.push(eventRange)
        }
        eventRange = getDefaultRange()
        reset(startDayTime)
      }
      const idx = getFirstEnabledIdx(event)
      if (idx < 0) {
        drawMap.skipEvents.push(event)
      } else {
        eventRange.startDayTime = startDayTime + DAY_LENGTH * dayIdx
        eventRange.maxDate = Math.max(eventRange.maxDate, event.end.getTime())
        eventRange.maxIdx = Math.max(eventRange.maxIdx, idx)
        eventRange.events.push({
          idx,
          event
        })
      }
    })
    if (eventRange) {
      drawMap.eventRanges.push(eventRange)
    }
    drawMap.eventRanges.forEach((er) => er.events.sort(eventRangeSort))
    return drawMap
  }

  return {
    getEventDrawMap,
    reset
  }
}

const WeekPlaceHandler = ({ utils, hideWeekends, maxEventNo, minEventHeight = 0, arrowProperties }: CalendarPlaceHandlerProps) => {
  // original if offset changed
  let firstWeekDay: Date
  // modified if timezone offset changed
  let firstWeekDayTime: number
  let isFirstSunday: boolean
  let timeZoneOffset: number
  let offsetChanged = false
  const weekDayNo = hideWeekends ? 5 : 7
  const weekTimeLength = DAY_LENGTH * weekDayNo
  const colNo = weekDayNo + BEFORE_COL_NO
  const eventShowRatio = 1 / 2 / maxEventNo

  const setActualDate = (actualDate: Date) => {
    const startDate = utils.startOfWeek(actualDate)
    isFirstSunday = startDate.toLocaleString('en', { weekday: 'short' }).toLowerCase() === 'sun'
    firstWeekDay = startDate
    firstWeekDayTime = firstWeekDay.getTime()
    timeZoneOffset = firstWeekDay.getTimezoneOffset()
    const offsetDiff = new Date(firstWeekDayTime + weekTimeLength).getTimezoneOffset() - timeZoneOffset
    offsetChanged = !!offsetDiff
    if (offsetChanged && isFirstSunday) {
      // change firstWeekDay if offset changed on sunday, and sunday is first of the week
      firstWeekDayTime = firstWeekDayTime + offsetDiff * MINUTE_LENGTH
      timeZoneOffset += offsetDiff
    }
  }

  const getColNo = () => colNo

  const filterEvents = (events: CalendarEvent[]) => events.filter((event) => event.start.getTime() < (firstWeekDayTime + weekTimeLength) && event.end.getTime() > firstWeekDayTime)

  const getStart = (event: CalendarEvent, start: number = firstWeekDayTime) => Math.max(event.start.getTime(), start)
  const getEnd = (event: CalendarEvent, end: number = firstWeekDayTime + weekTimeLength) => Math.min(event.end.getTime(), end)

  // min 0, max end - 2/5 col length
  const getHeaderStart = (event: CalendarEvent) => Math.min(getStart(event), firstWeekDayTime + weekTimeLength - DAY_LENGTH * 2 / 5)

  const appendHeaderDrawMap = (events: SheetEvent[], drawMap: EventDrawMap) => {
    drawMap.eventRanges.forEach((eventRange) => {
      eventRange.events.forEach((eIdx) => {
        events.push({
          event: eIdx.event,
          position: {
            left: (BEFORE_COL_NO + (getHeaderStart(eIdx.event) - firstWeekDayTime) / DAY_LENGTH) / colNo,
            width: (getEnd(eIdx.event) - getHeaderStart(eIdx.event)) / DAY_LENGTH / colNo,
            top: (1 + eventShowRatio * eIdx.idx) / (2),
            height: (1 - eventShowRatio * eventRange.maxIdx) / (2)
          }
        })
      })
    })
  }

  const calendarToSheetInDayEvent = (event: CalendarEvent, inRangeNo: number, startDayTime: number) => {
    const eventStart = Math.max(startDayTime, getStart(event))
    const eventBeforeRowNo = (eventStart - startDayTime) / HOUR_LENGTH
    return {
      event,
      position: {
        left: (inRangeNo * IN_RANGE_MARGIN + BEFORE_COL_NO + (startDayTime - firstWeekDayTime) / DAY_LENGTH) / colNo,
        width: (Math.max(1 - inRangeNo * IN_RANGE_MARGIN, MIN_MARGIN)) / colNo,
        top: Math.min(eventBeforeRowNo, HOUR_NO - minEventHeight) / (HOUR_NO),
        height: (getEnd(event, startDayTime + DAY_LENGTH) - eventStart) / HOUR_LENGTH / (HOUR_NO)
      }
    } as SheetEvent
  }
  const getArrows = () => ({
    event: {
      id: createGeneratedId('arrows'),
      title: '',
      content: ArrowNavigation,
      contentProperties: arrowProperties,
      onEventClick: EMPTY_CLICK
    },
    position: {
      left: 0,
      width: 1 / colNo,
      top: 0,
      height: 1 / 2
    }
  })

  const getGmtEvent = () => ({
    event: {
      id: createGeneratedId('gmt'),
      title: '',
      description: `GMT ${(timeZoneOffset > 0 ? '-' : '+')}${(-(timeZoneOffset) / 60)}`,
      className: 'week-header-event',
      onEventClick: EMPTY_CLICK
    },
    position: {
      left: 0,
      width: 1 / colNo,
      top: 3 / 4 - GMT_HEIGHT / 2,
      height: GMT_HEIGHT
    }
  })
  const appendHourEvents = (events: SheetEvent[], onEventClick: EventClick) => {
    for (let i = 0 i < HOUR_NO i++) {
      const event = {
        event: {
          id: createGeneratedId(`hour-${i}`),
          title: (i).toString().padStart(2, '0') + ':00',
          style: {
            width: 35
          },
          className: 'week-hour-event',
          onEventClick
        },
        position: {
          left: 0,
          width: 1 / colNo,
          top: 1 / (HOUR_NO) * i - HOUR_MARK_HEIGHT / 2,
          height: HOUR_MARK_HEIGHT
        }
      }
      events.push(event)
    }
  }

  const appendHeaderLabelEvents = (events: SheetEvent[], onEventClick: EventClick) => {
    if (arrowProperties) {
      events.push(getArrows())
    }
    events.push(getGmtEvent())
    const weekDays = getWeekdays(utils)
    const shift = hideWeekends && isFirstSunday ? 1 : 0
    for (let i = 0 i < weekDayNo i++) {
      const actDay = utils.addDays(firstWeekDay, i)
      const event = {
        event: {
          id: createGeneratedId(utils.toJsDate(actDay).toISOString()),
          title: weekDays[i + shift],
          description: utils.formatByString(actDay, utils.formats.shortDate),
          className: 'week-header-event',
          onEventClick
        },
        position: {
          left: 1 / colNo * (i + BEFORE_COL_NO),
          width: 1 / colNo,
          top: 0,
          height: 1 / 2
        }
      }
      events.push(event)
    }
  }

  const isOutDayEvent = (event: CalendarEvent) => event.end.getTime() - event.start.getTime() >= DAY_LENGTH

  const getEventDateStart = (event: CalendarEvent) => {
    const startDay = utils.startOfDay(event.start)
    const offsetDiff = offsetChanged ? startDay.getTimezoneOffset() - timeZoneOffset : 0
    return Math.max(startDay.getTime() - offsetDiff * MINUTE_LENGTH, firstWeekDayTime)
  }

  const isInRange = (date: Date) => firstWeekDayTime && firstWeekDayTime <= date.getTime() && date.getTime() < firstWeekDayTime + weekTimeLength

  const transformToSheetEvents = (events: CalendarEvent[]) => {
    const inRangeEvents = filterEvents(events)
    inRangeEvents.sort(startDateOrder(utils))

    const inDayEventRows: CalendarEvent[][] = new Array(weekDayNo)
    const outDayEvents: CalendarEvent[] = []
    const headerEvents: SheetEvent[] = []
    const paddingHandler = PaddingHandler(maxEventNo, DAY_LENGTH)
    let firstHour = 24

    appendHeaderLabelEvents(headerEvents, EMPTY_CLICK)
    // appendHourEvents(inDayEvents, EMPTY_CLICK)
    inRangeEvents.sort((e1: CalendarEvent, e2: CalendarEvent) => e1.start.getTime() - e2.start.getTime())
    inRangeEvents.forEach((event) => {
      if (isOutDayEvent(event)) {
        outDayEvents.push(event)
      } else {
        firstHour = Math.min(utils.getHours(event.start), firstHour)
        const eventIdx = (getEventDateStart(event) - firstWeekDayTime) / DAY_LENGTH
        if (!inDayEventRows[eventIdx]) {
          inDayEventRows[eventIdx] = []
        }
        inDayEventRows[eventIdx].push(event)
        const isSameDay = event.end.getTime() - getEventDateStart(event) < DAY_LENGTH
        if (!isSameDay && eventIdx < weekDayNo) {
          if (!inDayEventRows[eventIdx + 1]) {
            inDayEventRows[eventIdx + 1] = []
          }
          inDayEventRows[eventIdx + 1].push(event)
        }
      }
    })
    paddingHandler.reset(firstWeekDayTime)
    const outDayResult = paddingHandler.getEventDrawMap(outDayEvents, 0)
    appendHeaderDrawMap(headerEvents, outDayResult)

    const inDayResultRows = inDayEventRows.map((inDayRow, idx) => {
      paddingHandler.reset(firstWeekDayTime)
      return paddingHandler.getEventDrawMap(inDayRow, idx)
    })
    const inDayEvents: SheetEvent[] = []
    inDayResultRows.forEach((inDayResult) => {
      if (inDayResult) {
        inDayResult.eventRanges.forEach((eventRange) => {
          eventRange.events.forEach((event) => {
            inDayEvents.push(calendarToSheetInDayEvent(event.event, event.idx, eventRange.startDayTime))
          })
        })
        // TODO inDayResult.skipEvents to show
      }
    })
    appendHourEvents(inDayEvents, EMPTY_CLICK)
    return {
      headerEvents,
      inDayEvents,
      firstHour
    }
  }

  return {
    getColNo,
    getFirstWeekDay: () => firstWeekDay,
    getWeekDayNo: () => weekDayNo,
    setActualDate,
    isInRange,
    transformToSheetEvents
  }
}

export default WeekPlaceHandler
