import { CalendarEvent, EventProvider } from '../../view/calendar/types.ts';

export interface TrainerEvent extends CalendarEvent {
  deletable?: boolean
  trainerId: string
  groupId: string
  showMembers: boolean
  memberIds: string[]
  memberNames: string[],
  isChecked?: boolean,
  isDeleted?: boolean,
}

export interface UserEventProvider extends EventProvider<TrainerEvent> {
  setGroupRestriction: (groupId: string | undefined) => void
}
