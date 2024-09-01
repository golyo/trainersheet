import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Typography } from '@mui/material'

import { useUser } from '../../hooks/user'
import { TrainerEvent } from '../../hooks/event'
import WeekCalendar from '../calendar/week/WeekCalendar.tsx'
import { BaseEvent } from '../calendar/types.ts'
import EventPopup from './EventPopup.tsx';

export default function UserCalendar() {
  const { t } = useTranslation()
  const { userEventProvider } = useUser()
  const [selectedEvent, setSelectedEvent] = useState<TrainerEvent | null>(null)

  const eventClick = useCallback((event: BaseEvent) => {
    setSelectedEvent(event as TrainerEvent)
  }, [])

  const resetEvent = useCallback(() => setSelectedEvent(null), [])

  return (
    <div>
      <Typography variant="h4">{t('menu.myCalendar')}</Typography>
      <WeekCalendar eventProvider={userEventProvider} onEventClick={eventClick} />
      <EventPopup event={selectedEvent} resetEvent={resetEvent} />
    </div>
  )
}
