import { type ChangeEvent, useCallback, useMemo, useState } from 'react'
import { CalendarViewType } from './types.ts'
import type { CalendarEvent, CalendarProps } from '../types.ts'
import DayListCalendar from '../list/DayListCalendar.tsx'
import WeekCalendar from '../week/WeekCalendar.tsx'
import MonthCalendar from '../month/MonthCalendar.tsx'
import CalendarNavigation from './CalendarNavigation.tsx'

import './FullCalendar.css'

interface CalendarNavigationProps<T extends CalendarEvent> extends CalendarProps<T> {
  defaultViewMode?: CalendarViewType
}

const FullCalendar = <T extends CalendarEvent>({ defaultViewMode = CalendarViewType.WEEK, eventProvider, onEventClick, onGridClick }: CalendarNavigationProps<T>) => {
  const [viewMode, setViewMode] = useState<CalendarViewType>(defaultViewMode!)

  const props = useMemo(() => ({
    eventProvider,
    onEventClick,
    onGridClick
  }), [eventProvider, onEventClick, onGridClick])

  const handleViewModeChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    setViewMode(event.currentTarget.value as CalendarViewType)
  }, [])

  return (
    <div className="full-calendar-container">
      <div>
        <select onChange={handleViewModeChange} value={viewMode}>
          <option value="day">day</option>
          <option value="month">month</option>
          <option value="week">week</option>
        </select>
      </div>
      <CalendarNavigation viewMode={viewMode} />
      <div className="calendar-mode-container">
        { viewMode === CalendarViewType.DAY && <DayListCalendar { ...props } />}
        { viewMode === CalendarViewType.WEEK && <WeekCalendar { ...props } />}
        { viewMode === CalendarViewType.MONTH && <MonthCalendar { ...props } />}
      </div>
    </div>
  )
}

export default FullCalendar
