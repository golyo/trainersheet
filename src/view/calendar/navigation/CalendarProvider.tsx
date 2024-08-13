import { FunctionComponent, ReactNode, useCallback, useContext, useMemo, useState } from 'react'

import CalendarContext, {
  DEFAULT_MONTH_CALENDAR_STYLE,
  DEFAULT_WEEK_CALENDAR_STYLE,
  type MonthCalendarStyle,
  type WeekCalendarStyle
} from './CalendarContext.ts'
import { useUtils } from '../const.ts';

interface CalendarContextProviderType {
  initialDate?: Date
  weekCalendarStyle?: WeekCalendarStyle
  monthCalendarStyle?: MonthCalendarStyle
  children: ReactNode
}

const CalendarProvider: FunctionComponent<CalendarContextProviderType> = (
  {
    children,
    weekCalendarStyle: weekCalendarStyleParam,
    monthCalendarStyle: monthCalendarStyleParam,
    initialDate
  }) => {
  const utils = useUtils();
  const [actualDate, setActualDate] = useState<Date>(initialDate || new Date())

  const nextDay = useCallback(() => { setActualDate((prev) => utils.addDays(prev, 1)) }, [utils])
  const prevDay = useCallback(() => { setActualDate((prev) => utils.addDays(prev, -1)) }, [utils])
  const nextWeek = useCallback(() => { setActualDate((prev) => utils.addDays(prev, 7)) }, [utils])
  const prevWeek = useCallback(() => { setActualDate((prev) => utils.addDays(prev, -7)) }, [utils])
  const nextMonth = useCallback(() => { setActualDate((prev) => utils.addMonths(prev, 1)) }, [utils])
  const prevMonth = useCallback(() => { setActualDate((prev) => utils.addMonths(prev, -1)) }, [utils])
  const setMonth = useCallback((monthNo: number) => { setActualDate((prev) => utils.setMonth(prev, monthNo)) }, [utils])
  const nextYear = useCallback(() => { setActualDate((prev) => utils.addYears(prev, 1)) }, [utils])
  const prevYear = useCallback(() => { setActualDate((prev) => utils.addYears(prev, -1)) }, [utils])
  const setYear = useCallback((monthNo: number) => { setActualDate((prev) => utils.setYear(prev, monthNo)) }, [utils])

  const weekCalendarStyle: WeekCalendarStyle = useMemo(() => ({
    ...DEFAULT_WEEK_CALENDAR_STYLE,
    ...weekCalendarStyleParam
  }), [weekCalendarStyleParam])

  const monthCalendarStyle: MonthCalendarStyle = useMemo(() => ({
    ...DEFAULT_MONTH_CALENDAR_STYLE,
    ...monthCalendarStyleParam
  }), [monthCalendarStyleParam])

  const navigation = {
    setActualDate,
    nextDay,
    prevDay,
    nextWeek,
    prevWeek,
    nextMonth,
    prevMonth,
    setMonth,
    nextYear,
    prevYear,
    setYear
  }

  const ctx = {
    utils,
    actualDate,
    navigation,
    weekCalendarStyle,
    monthCalendarStyle
  }
  return <CalendarContext.Provider value={ctx}>{ children }</CalendarContext.Provider>
}

const useCalendarContext = () => useContext(CalendarContext)

export { useCalendarContext }

export default CalendarProvider
