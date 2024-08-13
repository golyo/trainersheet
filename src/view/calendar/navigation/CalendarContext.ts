import { createContext } from 'react'

interface CalendarNavigation {
  setActualDate: (date: Date) => void
  nextDay: () => void
  prevDay: () => void
  nextWeek: () => void
  prevWeek: () => void
  nextMonth: () => void
  prevMonth: () => void
  setMonth: (month: number) => void
  nextYear: () => void
  prevYear: () => void
  setYear: (year: number) => void
}

export interface CalendarStyle {
  hideWeekends: boolean
  minEventHeight: number
}

export interface MonthCalendarStyle extends CalendarStyle {
  maxEventsNo: number
  dayTitleHeightRatio: number
  eventHeightRatio: number
}

export interface WeekCalendarStyle extends CalendarStyle {
  rowHeight: number
  showNavigation: boolean
  maxEventsHeaderNo: number
  maxEventsInDayNo: number
}

export interface CalendarContextType {
  actualDate: Date
  navigation: CalendarNavigation
  weekCalendarStyle: WeekCalendarStyle
  monthCalendarStyle: MonthCalendarStyle
}

export const DEFAULT_MONTH_CALENDAR_STYLE: MonthCalendarStyle = {
  hideWeekends: false,
  minEventHeight: 15,
  maxEventsNo: 4,
  dayTitleHeightRatio: 1 / 3,
  eventHeightRatio: 1 / 2
}

export const DEFAULT_WEEK_CALENDAR_STYLE: WeekCalendarStyle = {
  hideWeekends: false,
  minEventHeight: 15,
  rowHeight: 40,
  showNavigation: false,
  maxEventsHeaderNo: 4,
  maxEventsInDayNo: 4
}

const CalendarContext = createContext<CalendarContextType>({} as CalendarContextType)

export default CalendarContext
