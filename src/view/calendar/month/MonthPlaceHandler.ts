import { MuiPickersAdapter } from '@mui/x-date-pickers'
import { DAY_LENGTH, EMPTY_CLICK, getWeekdays, WEEK_LENGTH } from '../const.ts'
import { createGeneratedId } from '../EventItem'
import type { SheetEvent } from '../EventSheet'
import type { CalendarEvent, EventClick } from '../types'
import { type MonthCalendarStyle } from '../navigation/CalendarContext'

interface MonthCalendarPlaceHandlerProps {
  hideWeekends?: boolean
  monthStyle: MonthCalendarStyle
  utils: MuiPickersAdapter<Date>
  onHeaderEventClick?: EventClick
}

export const startDateOrder = (utils: MuiPickersAdapter<Date>) => (event1: CalendarEvent, event2: CalendarEvent) => {
  const start1 = utils.startOfDay(event1.start).getTime()
  const start2 = utils.startOfDay(event2.start).getTime()
  const diff = start1 - start2
  return diff || event2.end.getTime() - event1.end.getTime()
}

const getRightmostNotSetBit: (n: number, iteration?: number) => number = (n: number, iteration = 0) => ((n & 1)
  ? getRightmostNotSetBit(n >> 1, iteration + 1)
  : iteration + 1)

const setBitPos = (n: number, pos: number) => n | (1 << (pos - 1))

const MonthPlaceHandler = ({ utils, monthStyle, onHeaderEventClick }: MonthCalendarPlaceHandlerProps) => {
  let firstDayTime: number
  let rowNo: number
  let lastDayTime: number
  let isFirstSunday: boolean
  const weekDayNo = monthStyle.hideWeekends ? 5 : 7
  const eventDiff = (1 - monthStyle.dayTitleHeightRatio) * (1 - monthStyle.eventHeightRatio) / Math.max((monthStyle.maxEventsNo - 1), 1)

  const getFirstDay = () => new Date(firstDayTime)
  const getLastDay = () => new Date(lastDayTime)
  const getStartOfWeekTime = (date: Date) => {
    const startWeekTime = utils.startOfWeek(date).getTime()
    return monthStyle.hideWeekends && isFirstSunday ? startWeekTime + DAY_LENGTH : startWeekTime
  }

  const appendHeaderLabelEvents = (events: SheetEvent[], outSideDays: boolean[], onEventClick: EventClick) => {
    const weekDays = getWeekdays(utils)
    const shift = monthStyle.hideWeekends && isFirstSunday ? 1 : 0
    let actDay = getFirstDay()
    for (let rowIdx = 0 rowIdx < rowNo rowIdx++) {
      for (let i = 0 i < weekDayNo i++) {
        const idx = rowIdx * weekDayNo + i
        const event = {
          event: {
            id: createGeneratedId(utils.toJsDate(actDay).toISOString()),
            title: weekDays[i + shift],
            badge: outSideDays[idx] ? '+' : undefined,
            description: utils.formatByString(actDay, utils.formats.shortDate),
            className: 'month-header-event',
            onEventClick
          },
          position: {
            left: i / weekDayNo,
            width: 1 / weekDayNo,
            top: rowIdx / rowNo,
            height: monthStyle.dayTitleHeightRatio / rowNo
          }
        }
        events.push(event)
        actDay = utils.addDays(actDay, 1)
      }
      if (weekDayNo < 7) {
        actDay = utils.addDays(actDay, 7 - weekDayNo)
      }
    }
  }

  const setActualDate = (actualDate: Date) => {
    const startMonthDate = utils.startOfMonth(actualDate)
    const startWeekDate = utils.startOfWeek(startMonthDate)
    isFirstSunday = startWeekDate.toLocaleString('en', { weekday: 'short' }).toLowerCase() === 'sun'
    firstDayTime = getStartOfWeekTime(startMonthDate)
    const endMonthDate = utils.endOfMonth(actualDate)
    rowNo = Math.floor((endMonthDate.getTime() - firstDayTime) / WEEK_LENGTH) + 1
    lastDayTime = firstDayTime + WEEK_LENGTH * rowNo - (monthStyle.hideWeekends ? DAY_LENGTH * (isFirstSunday ? 1 : 2) : 0)
  }

  const getColNo = () => weekDayNo
  const getRowNo = () => rowNo

  const isInRange = (date: Date) => date.getTime() <= lastDayTime && date.getTime() >= firstDayTime
  const filterEvents = (events: CalendarEvent[]) => events.filter((event) => event.start.getTime() < (lastDayTime) && event.end.getTime() > firstDayTime)

  const findInDayIdx = (rowIdxMap: number[], mapIdx: number, colIdx: number, colLength: number) => {
    let actIdx = 0
    let inDayIdx = 0
    do {
      inDayIdx = getRightmostNotSetBit(rowIdxMap[mapIdx + actIdx])
      actIdx++
    } while (inDayIdx > monthStyle.maxEventsNo && actIdx < colLength && actIdx + colIdx < weekDayNo)
    return inDayIdx
  }
  const appendMonthEvent = (sheetEvents: SheetEvent[], event: CalendarEvent, rowIdxMap: number[], outSideDays: boolean[]) => {
    const actWeekStart = getStartOfWeekTime(event.start)
    const actDateStart = utils.startOfDay(event.start).getTime()
    const endDateFinish = Math.min(utils.startOfDay(event.end).getTime() + DAY_LENGTH, lastDayTime)
    let rowIdx = (actWeekStart - firstDayTime) / WEEK_LENGTH
    let colIdx = (actDateStart - actWeekStart) / DAY_LENGTH
    let fullColLength = (endDateFinish - actDateStart) / DAY_LENGTH
    while (fullColLength > 0) {
      const colLength = Math.min(fullColLength, weekDayNo - colIdx)
      const mapIdx = rowIdx * weekDayNo + colIdx
      const inDayIdx = findInDayIdx(rowIdxMap, mapIdx, colIdx, colLength)
      if (inDayIdx > monthStyle.maxEventsNo) {
        outSideDays.fill(true, mapIdx, mapIdx + colLength)
      } else {
        for (let i = 0 i < colLength i++) {
          rowIdxMap[mapIdx + i] = setBitPos(rowIdxMap[mapIdx + i], inDayIdx)
        }
        const top = (rowIdx + monthStyle.dayTitleHeightRatio + (eventDiff * (inDayIdx - 1))) / rowNo
        sheetEvents.push({
          event,
          position: {
            left: colIdx / weekDayNo,
            width: colLength / weekDayNo,
            top,
            height: (1 - monthStyle.dayTitleHeightRatio) * monthStyle.eventHeightRatio / rowNo
          }
        })
      }
      fullColLength = fullColLength - colLength
      rowIdx++
      colIdx = 0
    }
  }

  const transformToSheetEvents = (events: CalendarEvent[]) => {
    if (!rowNo) {
      // set actual date not called before
      return []
    }
    events.sort(startDateOrder(utils))
    const rowIdxMap = new Array(rowNo * weekDayNo).fill(0)
    const outSideDays = new Array(rowNo * weekDayNo)
    const inRangeEvents = filterEvents(events)
    const result: SheetEvent[] = []

    inRangeEvents.forEach((event) => {
      appendMonthEvent(result, event, rowIdxMap, outSideDays)
    })
    appendHeaderLabelEvents(result, outSideDays, onHeaderEventClick ?? EMPTY_CLICK)
    return result
  }

  return {
    getColNo,
    getRowNo,
    getFirstDay,
    getLastDay,
    getWeekDayNo: () => weekDayNo,
    isInRange,
    setActualDate,
    transformToSheetEvents
  }
}

export default MonthPlaceHandler
