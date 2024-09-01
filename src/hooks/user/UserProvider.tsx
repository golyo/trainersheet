import { ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { User as AuthUser } from 'firebase/auth'

import {
  changeItemByEqual,
  deleteObject, doQuery, loadObject,
  removeItemByEqual,
  updateObject,
  useFirestore,
} from '../firestore/firestore'
import { useAuth } from '../auth/AuthProvider'
import UserContext, { User, TrainerContact, TrainerContactMembership, UserContextType, UserBase } from './UserContext'
import { useFirebase } from '../firebase'
import {
  MembershipType,
  MemberState,
  TrainingGroupType,
  TrainerProvider,
  TrainingGroupUIType,
  DEFAULT_MEMBER,
} from '../trainer'
import { Firestore, where } from 'firebase/firestore'
import { createCronConverter } from './cronUtils'
import { createUserEventProvider, getInterval, TrainerEvent, UserEventProvider } from '../event'
import useStorage from '../firebase/useStorage'
import { useUtils } from '../../view/calendar/const.ts'

export const loadGroups = (firestore: Firestore, trainerId: string) =>
  doQuery(firestore, `trainers/${trainerId}/groups`)

export const loadMembership = (firestore: Firestore, trainerId: string, userId: string) => {
  return loadObject(firestore, `trainers/${trainerId}/members`, userId)
}

const setMember = (firestore: Firestore, user: User, membership: TrainerContactMembership) => {
  const member: MembershipType = {
    ...membership.membership,
    id: user.id,
    name: user.name,
  }
  return updateObject(firestore, `trainers/${membership.trainer.trainerId}/members`, member)
}

const addUserRequest = (firestore: Firestore, trainerId: string, user: User, group: TrainingGroupUIType) => {
  const membership: MembershipType = {
    ...DEFAULT_MEMBER,
    state: MemberState.USER_REQUEST,
    name: user!.name,
    id: user!.id,
    groups: [ group.id ],
    ticketSheets:  [{
      type: group.groupType,
      remainingEventNo: 0,
      presenceNo: 0,
      purchasedTicketNo: 0,
    }],
  }
  return updateObject(firestore, `trainers/${trainerId}/members`, membership, false)
}

const DEFAULT_USER_VALUES = {
  memberships: [],
  location: '',
  isTrainer: false,
  registeredAsTrainer: false,
}

const createDBUser = (authUser: AuthUser) => ({
  id: authUser.email!,
  name: authUser.displayName!,
  photoURL: authUser.photoURL || '',
  registrationDate: Date.now(),
  ...DEFAULT_USER_VALUES,
})

const isTrainerEqual = (a: TrainerContactMembership, b: TrainerContactMembership) => a.trainer.trainerId === b.trainer.trainerId

const createMembership = (trainer: TrainerContact, membership: MembershipType, trainerGroups: TrainingGroupType[]) => {
  const contactGroups = trainerGroups.filter((group) => membership.groups.includes(group.id) ||
      group.attachedGroups?.some((aid) => membership.groups.includes(aid)))
  return {
    membership,
    contactGroups,
    trainerGroups,
    trainer,
  } as TrainerContactMembership
}

// const HACK_USER = 'bodylali.no1@gmail.com'
// const HACK_USER = 'horvathmarta369@gmail.com'
const HACK_USER = undefined

const UserProvider = ({ children }: { children: ReactNode }) => {
  const { firestore } = useFirebase()
  const userSrv = useFirestore<UserBase>('users')
  const { authUser } = useAuth()
  const { uploadAvatar, getAvatarUrl } = useStorage()
  const utils = useUtils()

  const [user, setUser] = useState<User | undefined>()
  const [groupMemberships, setGroupMemberships] = useState<TrainerContactMembership[]>([])

  const activeMemberships = useMemo(() => groupMemberships.filter((m) => m.membership.state === MemberState.ACCEPTED), [groupMemberships])

  const cronConverter = useMemo(() => createCronConverter(utils), [utils])

  const userChanged = useCallback(() => {
    setUser((prev) => ({
      ...prev!,
    }))
  }, [])

  const uploadAvatarIfExists = useCallback((usr: User, pAuthUser?: AuthUser) => {
    if (pAuthUser?.photoURL) {
      fetch(pAuthUser?.photoURL).then(res => {
        return res.blob();
      }).then(blob => {
        return uploadAvatar(blob, usr.id)
      }).catch(error => {
        console.error(error);
      });
    }
  }, [uploadAvatar])

  const changeUser = useCallback((newUser: User) => {
    if (!newUser.memberships) {
      newUser.memberships = []
    }
    setUser((prev) => ({
      ...prev,
      ...newUser,
    }))
  }, [])

  const loadTrainers = useCallback(() => {
    return userSrv.listAll(where('isTrainer', '==', true))
  },  [userSrv])

  const saveUser = useCallback((toSave: User) => userSrv.save(toSave).then(() => changeUser(toSave)), [changeUser, userSrv])

  const userEventProvider = useMemo(() => {
    if (!user) {
      return {} as UserEventProvider
    }
    return createUserEventProvider(firestore, user, activeMemberships)
  }, [firestore, user, activeMemberships])

  const deleteTrainerContactState = useCallback(async (membership: TrainerContactMembership) => {
    const idx = user!.memberships?.findIndex((m) => m.trainerId === membership.trainer.trainerId) || -1;
    if (idx >= 0) {
      user!.memberships?.splice(idx, 1)
    }
    await userSrv.save(user!)
    changeUser(user!)
    await deleteObject(firestore, `trainers/${membership.trainer.trainerId}/members`, membership.membership.id)
    setGroupMemberships((prev) => removeItemByEqual(prev, membership, isTrainerEqual))
  }, [changeUser, firestore, user, userSrv])

  const getDateRangeStr = useCallback((event: TrainerEvent) => {
    const update = utils.date(event.start.toISOString())
    return utils.format(update!, 'shortDate') + ' ' + getInterval(event)
  }, [utils])

  const changeTrainerContactState = useCallback(async (membership: TrainerContactMembership, toState: MemberState | null) => {
    if (!toState) {
      await deleteTrainerContactState(membership)
      return
    }
    membership.membership.state = toState
    await setMember(firestore, user!, membership)
    setGroupMemberships((prev) =>
      changeItemByEqual(prev, membership, isTrainerEqual))
  }, [deleteTrainerContactState, firestore, user])

  const membershipChanged = useCallback(() => {
    setGroupMemberships((prev) => [...prev])
  }, [])

  const loadGroupMemberships = useCallback((dbUser: User) => {
    if (!dbUser.memberships || dbUser.memberships.length === 0) {
      return
    }
    Promise.all(
      dbUser.memberships.map(async (trainerContact) => {
        const membership = await loadMembership(firestore, trainerContact.trainerId, dbUser.id) as MembershipType
        const groups = await loadGroups(firestore, trainerContact.trainerId)
        return createMembership(trainerContact, membership, groups as TrainingGroupType[])
      }),
    ).then((memberships) => {
      setGroupMemberships(memberships)
    })
  }, [firestore])

  const leaveGroup = useCallback((membership: TrainerContactMembership, groupId: string) => {
    const groupIdx = membership.membership.groups.indexOf(groupId)
    membership.membership.groups.splice(groupIdx, 1)
    const idx = membership.trainerGroups.findIndex((dg) => dg.id === groupId)
    const group = membership.contactGroups[idx]
    membership.contactGroups.splice(idx, 1)
    setMember(firestore, user!, membership).then(() => {
      group.attachedGroups.forEach((aGroupId) => {
        if (!membership.contactGroups.some((dg) => dg.attachedGroups.includes(aGroupId))) {
          const aIdx = membership.contactGroups.findIndex((dg) => dg.id === aGroupId)
          membership.contactGroups.splice(aIdx, 1)
        }
      })
      setGroupMemberships((prev) => changeItemByEqual(prev, membership, isTrainerEqual))
    })
  }, [firestore, user])

  const addGroupMembership = useCallback((trainer: User, group: TrainingGroupUIType) => {
    if (!user!.memberships?.some((m) => m.trainerId === trainer.id)) {
      user!.memberships?.push({
        trainerId: trainer.id,
        trainerName: trainer.name,
      })
      saveUser(user!)
    }
    return addUserRequest(firestore, trainer.id, user!, group).then(() => loadGroupMemberships(user!))
  }, [firestore, loadGroupMemberships, saveUser, user])

  // first login, dbUser exists if trainer registered user
  const createDbUser = useCallback((pAuthUser: AuthUser, dbUser?: User) => {
    const toSave = {
      ...createDBUser(pAuthUser!),
      ...dbUser,
    }
    userSrv.save(toSave as User, true, false).then(() => changeUser(toSave))
    uploadAvatarIfExists(toSave, pAuthUser)
  }, [changeUser, uploadAvatarIfExists, userSrv]);

  const loadUser = useCallback((pAuthUser: AuthUser) => {
    userSrv.get(HACK_USER || pAuthUser!.email!).then((dbUser) => {
      if (dbUser) {
        if (!dbUser.registrationDate) {
          createDbUser(pAuthUser, user);
        } else {
          // TODO DELETE THIS UPLOAD LATER
          changeUser(dbUser)
          loadGroupMemberships(dbUser)
        }
      } else {
        createDbUser(pAuthUser);
      }
    })
  }, [changeUser, createDbUser, loadGroupMemberships, user, userSrv])

  useEffect(() => {
    if (!authUser) {
      if (user) {
        setUser(undefined)
        setGroupMemberships([])
      }
      return
    }
    if (!user || (!HACK_USER && user.id != authUser.email)) {
      loadUser(authUser)
    }
  }, [authUser, loadUser, user])

  const ctx = {
    addGroupMembership,
    activeMemberships,
    changeTrainerContactState,
    cronConverter,
    getDateRangeStr,
    groupMemberships,
    loadTrainers,
    leaveGroup,
    membershipChanged,
    saveUser,
    user: user,
    userEventProvider,
    utils,
    userChanged,
    getAvatarUrl,
    uploadAvatar,
  }

  if (authUser && !user) {
    return null
  }
  if (user) {
    return (
      <UserContext.Provider value={ctx as UserContextType}>
        <TrainerProvider>
          { children}
        </TrainerProvider>
      </UserContext.Provider>
    )
  }
  return <UserContext.Provider value={ctx}>{ children}</UserContext.Provider>
}

const useUser = () => useContext(UserContext)

export { useUser }

export default UserProvider
