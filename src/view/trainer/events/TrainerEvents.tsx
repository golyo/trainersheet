import { useEffect, useState } from 'react'
import { getNextEventFrom, getNextEventTo, TrainerEvent } from '../../../hooks/event'
import { Avatar, Badge, IconButton, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useUser } from '../../../hooks/user'
import { useTrainer } from '../../../hooks/trainer'
import { Event as EventIcon, Groups } from '@mui/icons-material'
import { Link, useParams } from 'react-router-dom'

const H5 = 'h5' as const
const H3 = 'h3' as const

export default function TrainerEvents() {
  const { groupId } = useParams<{ groupId: string }>()
  const { t } = useTranslation()
  const { getDateRangeStr } = useUser()
  const { eventProvider } = useTrainer()
  const [events, setEvents] = useState<TrainerEvent[]>([])
  
  useEffect(() => {
    eventProvider.setGroupRestriction(groupId)
    eventProvider.getEvents(getNextEventFrom(120), getNextEventTo()).then((tevents) => setEvents(tevents))
  }, [eventProvider, groupId])

  return (
    <div className="flex-container">
      <Typography variant={groupId ? H5 : H3}>{t('trainer.nextEvents')}</Typography>
      <List>
        {events.map((event, idx) => (
          <ListItem key={idx}
                    secondaryAction={
                      <IconButton component={Link} to={`/group/${event.groupId}/event/${event.id}`}>
                        <Badge badgeContent={event.memberIds.length.toString()} color="primary">
                          <Groups />
                        </Badge>
                      </IconButton>
                    }
                    divider
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: event.style?.backgroundColor}}>
                <EventIcon></EventIcon>
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={event.description} secondary={
              <>
                {getDateRangeStr(event)}
              </>
            } />
          </ListItem>
        ))}
      </List>
    </div>
  )
}
