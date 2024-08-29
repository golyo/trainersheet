import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Typography } from '@mui/material'

import { TrainerEvent } from '../../../hooks/event'
import { GroupType, useTrainer } from '../../../hooks/trainer'
import TrainerEventPopup from './TrainerEventPopup'
import NewEventPopup from './NewEventPopup'
import WeekCalendar from '../../calendar/week/WeekCalendar.tsx'
import { BaseEvent } from '../../calendar/types.ts';

export default function TrainerCalendar() {
  const { t } = useTranslation()
  const { eventProvider, groups } = useTrainer()
  const [selectedEvent, setSelectedEvent] = useState<TrainerEvent | null>(null)
  const [newEventStartDate, setNewEventStartDate] = useState<Date | null>(null)

  const eventClick = useCallback((event: BaseEvent) => {
    setSelectedEvent(event as TrainerEvent)
    // navigate(`/group/${event.groupId}/event/${event.id}`)
  }, [])

  const groupType = useMemo(() => {
    if (!selectedEvent) {
      return GroupType.GROUP
    }
    return groups.find((gr) => gr.id === selectedEvent.groupId)!.groupType
  }, [groups, selectedEvent])

  const resetEvent = useCallback(() => setSelectedEvent(null), [])

  useEffect(() => eventProvider.setGroupRestriction(undefined), [eventProvider])

  return (
    <div>
      <Typography variant="h3">{t('trainer.calendar')}</Typography>
      // TODO newEventClick
      <WeekCalendar onEventClick={eventClick}
                    eventProvider={eventProvider}
      />
      {selectedEvent && <TrainerEventPopup selectedEvent={selectedEvent!} groupType={groupType} resetEvent={resetEvent} />}
      {newEventStartDate && <NewEventPopup startDate={newEventStartDate} resetStartDate={() => setNewEventStartDate(null)} />}
    </div>
  )
}
