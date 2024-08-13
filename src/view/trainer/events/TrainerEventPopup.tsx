import * as React from 'react';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { useCallback, useMemo, useState } from 'react';
import { Avatar, Button, Divider, IconButton, List, ListItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Delete, Event as EventIcon } from '@mui/icons-material';
import ModalContainer from '../../common/ModalContainer';
import { getInterval, TrainerEvent } from '../../../hooks/event';
import TrainerActionsPopup from './TrainerActionsPopup';
import { GroupType, useTrainer } from '../../../hooks/trainer';
import { useDialog } from '../../../hooks/dialog';
import NewEventMemberPopup from './NewEventMemberPopup';

interface Props {
  selectedEvent: TrainerEvent;
  groupType: GroupType;
  resetEvent: () => void;
}

const TrainerEventPopup = ({ selectedEvent, groupType, resetEvent }: Props) => {
  const { t } = useTranslation();

  const [event, setEvent] = useState<TrainerEvent>(selectedEvent);

  const { activateEvent, removeMemberFromEvent, deleteEvent, members } = useTrainer();
  
  const { showConfirmDialog } = useDialog();

  const memberNames = useMemo(() => {
    if (!event) {
      return [];
    }
    return event.memberIds.map((mid) => members.find((m) => m.id === mid)?.name || mid);
  }, [event, members]);

  const interval = useMemo(() => event ? getInterval(event) : '', [event]);

  const isStarted = useMemo(() => Date.now() > event.start.getTime(), [event.start]);

  const doWork = useCallback((confirmKey: string, work: (event: TrainerEvent) => Promise<unknown>) => {
    showConfirmDialog({
      description: confirmKey,
      okCallback: () => {
        work(event).then(() => {
          resetEvent();
        });
      },
    });
  }, [event, resetEvent, showConfirmDialog]);

  const isMemberExists = useCallback((memberId: string) => members.some((m) => m.id === memberId), [members]);

  const removeMember = useCallback((memberId: string) => {
    showConfirmDialog({
      description: t('confirm.removeFromEvent'),
      okCallback: () => {
        removeMemberFromEvent(event, memberId, true).then((dbEvent) => setEvent!(dbEvent));
      },
    });
  }, [event, removeMemberFromEvent, setEvent, showConfirmDialog, t]);

  const doActivateEvent = useCallback(() => doWork('confirm.activateEvent', activateEvent), [activateEvent, doWork]);
  const doDeleteEvent = useCallback(() => doWork('confirm.deleteEvent', deleteEvent), [deleteEvent, doWork]);

  return (
    <Modal
      open={!!event}
      onClose={resetEvent}
    >
      <ModalContainer variant="small" open={!!event} close={resetEvent} title={(
        <>
          <Avatar sx={{ bgcolor: event.style?.backgroundColor ? event.style.backgroundColor : '#FFF' }}>
            <EventIcon></EventIcon>
          </Avatar>
          <span>{event?.title}</span>
        </>
      )}>
        <div>
          <Typography variant="subtitle1">{event?.description + ' ' + interval}</Typography>
          <Typography variant="subtitle2">{t('event.members')}</Typography>
          <Divider />
          <List>
            {event?.memberIds.map((memberId, idx) => (
              <ListItem key={idx}
                        secondaryAction={isMemberExists(memberId) ? <TrainerActionsPopup
                          memberId={memberId}
                          event={event}
                          groupType={groupType}
                          setEvent={setEvent}
                        /> : <IconButton onClick={() => removeMember(memberId)}><Delete /></IconButton>}
                        divider
              >
                <Typography key={idx} variant="subtitle2">{memberNames[idx]}</Typography>
              </ListItem>
            ))}
          </List>
          <div className="horizontal">
            {!event.isDeleted && <NewEventMemberPopup event={event} eventChanged={setEvent} />}
            {!isStarted && !event.isDeleted && <Button size="small" variant='outlined' onClick={doDeleteEvent}>{t('common.delete')}</Button>}
            {!isStarted && event.isDeleted && <Button size="small" variant='outlined' onClick={doActivateEvent}>{t('common.activate')}</Button>}
            <Button size="small" onClick={resetEvent}>{t('common.close')}</Button>
          </div>
        </div>
      </ModalContainer>
    </Modal>
  );
};

export default TrainerEventPopup;