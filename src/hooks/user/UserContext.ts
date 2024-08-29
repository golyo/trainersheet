import { createContext } from 'react'
import { MembershipType, MemberState, TrainingGroupType, TrainingGroupUIType } from '../trainer'
import { TrainerEvent, UserEventProvider } from '../event'
import { UploadResult } from '@firebase/storage'

export interface UiCronType {
  days: string[];
  time: string;
}

export interface CronConverter {
  toCron: (uiCron: UiCronType) => string;
  toUiCron: (cron: string) => UiCronType;
}

export interface TrainerContact {
  trainerName: string;
  trainerId: string;
}

export interface TrainerGroups {
  isAllGroup?: boolean;
  trainer: TrainerContact;
  contactGroups: TrainingGroupType[];
}

export interface TrainerContactMembership extends TrainerGroups {
  membership: MembershipType;
  trainerGroups: TrainingGroupType[];
}

export interface UserBase {
  id: string;
  name: string;
  photoUrl?: string;
  registrationDate?: number;
}

export interface User extends UserBase {
  registeredAsTrainer?: boolean;
  isTrainer?: boolean;
  location?: string;
  memberships?: TrainerContact[];
}

export interface UserContextType {
  addGroupMembership: (trainer: User, group: TrainingGroupUIType) => Promise<void>;
  activeMemberships: TrainerContactMembership[];
  changeTrainerContactState: (group: TrainerContactMembership, toState: MemberState | null) => Promise<void>;
  cronConverter: CronConverter;
  getDateRangeStr: (event: TrainerEvent) => string;
  groupMemberships: TrainerContactMembership[];
  loadTrainers: () => Promise<User[]>;
  leaveGroup: (membership: TrainerContactMembership, groupId: string) => void;
  membershipChanged: () => void;
  saveUser: (user: UserBase) => Promise<void>;
  user?: User;
  userEventProvider: UserEventProvider;
  getAvatarUrl: (avatarName: string) => Promise<string>;
  uploadAvatar: (file: File | Blob, avatarName: string) => Promise<UploadResult>;
  userChanged: () => void;
}

const UserContext = createContext<UserContextType>({} as UserContextType)

export default UserContext