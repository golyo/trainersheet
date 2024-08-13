import { useCallback, useEffect, useRef } from 'react'
import { CalendarViewType } from './types.ts'
import { useCalendarContext } from './CalendarProvider.tsx'
import Arrow from './ArrowNavigation.tsx'

import './CalendarNavigation.css'

interface CalendarNavigationProps {
  viewMode: CalendarViewType
  dayLabel?: string
  weekLabel?: string
  monthLabel?: string
  yearLabel?: string
}

const CalendarNavigation = ({
  viewMode,
  dayLabel = 'day',
  weekLabel = 'week',
  monthLabel = 'month',
  yearLabel = 'year'
}: CalendarNavigationProps) => {
  const dayRef = useRef<HTMLDivElement | null>(null)

  const { navigation: { prevYear, prevMonth, prevWeek, prevDay, nextDay, nextWeek, nextMonth, nextYear, setActualDate } } = useCalendarContext()

  const goToday = useCallback(() => {
    setActualDate(new Date())
  }, [setActualDate])

  useEffect(() => {
    if (dayRef.current) {
      dayRef.current!.style.width = `${dayRef.current!.offsetWidth}px`
    }
  }, [dayRef])

  return (
    <div className="navigation-container">
      <Arrow direction="left" onClick={prevYear} arrowNo={3} title={yearLabel} />
      <Arrow direction="left" onClick={prevMonth} arrowNo={2} title={monthLabel} />
      {viewMode === CalendarViewType.WEEK && <Arrow direction="left" onClick={prevWeek} arrowNo={1} title={weekLabel} />}
      {viewMode === CalendarViewType.DAY && <Arrow direction="left" onClick={prevDay} arrowNo={1} title={dayLabel} />}
      <div className="today-container" onClick={goToday} ref={dayRef}>
        <span className="today-label">today</span>
      </div>
      {viewMode === CalendarViewType.DAY && <Arrow direction="right" onClick={nextDay} arrowNo={1} title={dayLabel} />}
      {viewMode === CalendarViewType.WEEK && <Arrow direction="right" onClick={nextWeek} arrowNo={1} title={weekLabel} />}
      <Arrow direction="right" onClick={nextMonth} arrowNo={2} title={monthLabel} />
      <Arrow direction="right" onClick={nextYear} arrowNo={3} title={yearLabel} />
    </div>
  )
}

export default CalendarNavigation
