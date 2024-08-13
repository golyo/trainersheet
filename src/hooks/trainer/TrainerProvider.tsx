import { useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react'
import TrainerContext, {
  MembershipType,
  TrainerDataType, TrainerState,
  TrainingGroupType, TrainingGroupUIType,
} from './TrainerContext'
import { useUser } from '../user'
import { changeItem, insertObject, removeItemById, useFirestore } from '../firestore/firestore'
import { createTrainerEventProvider } from '../event/eventUtil'
import { useFirebase } from '../firebase'
import { convertGroupToFirestore } from './GroupProvider'
import useTrainerEvents from './useTrainerEvents'

const setTrainerDeafults = (trainerData: TrainerDataType) => {
  trainerData.zipCode = trainerData.zipCode || ''
  trainerData.address = trainerData.address || ''
}

const TrainerProvider = ({ children }: { children: Iterable<ReactNode> }) => {
  const { firestore } = useFirebase()
  const { user, cronConverter } = useUser()

  const [state, setState] = useState<TrainerState>({ groups: [] })

  const trainerSrv = useFirestore<TrainerDataType>('trainers')
  const groupSrv = useFirestore<TrainingGroupType>('trainers/' + user!.id + '/groups')
  const memberSrv = useFirestore<MembershipType>('trainers/' + user!.id + '/members')

  const { groups, trainerData, members } = state

  const {
    activateEvent,
    addMemberToEvent,
    buySeasonTicket,
    deleteEvent,
    removeMemberFromEvent,
    createEvent,
  } = useTrainerEvents(user!, groups, setState)

  const eventProvider = useMemo(() => groups ? createTrainerEventProvider(firestore, user!, groups) : undefined, [firestore, groups, user])

  const membershipChanged = useCallback((memberships: MembershipType[]) => setState((prev) => ({
    trainerData: prev.trainerData,
    groups: prev.groups,
    members: memberships,
  })), [])

  const saveGroup = useCallback((modifiedUi: TrainingGroupUIType) => {
    const modified = convertGroupToFirestore(modifiedUi, cronConverter)
    return groupSrv.save(modified).then(() => setState((prev) => ({
      trainerData: prev.trainerData,
      groups: changeItem(prev.groups!, modified),
      members: prev.members,
    })))
  }, [cronConverter, groupSrv])

  const sendEmail = useCallback((to: string, subject: string, html: string) => {
    console.log('Send email', to, subject, html)
    const mail = {
      id: '',
      to,
      message: {
        subject: subject,
        html: html,
      },
    }
    return insertObject(firestore, 'mail', mail)
  }, [firestore])

  const deleteGroup = useCallback((groupId: string) => groupSrv.remove(groupId).then(() => setState((prev) => ({
    trainerData: prev.trainerData,
    groups: removeItemById(prev.groups!, groupId),
    members: prev.members,
  }))), [groupSrv])

  const saveTrainerData = useCallback((modified: TrainerDataType) => trainerSrv.save(modified).then(() => setState((prev) => ({
    trainerData: modified,
    members: prev.members,
    groups: prev.groups,
  }))), [trainerSrv])

  const updateMembership = useCallback((membership: MembershipType) => {
    return memberSrv.save(membership).then(() => {
      setState((prev) => ({
        trainerData: prev.trainerData,
        members: changeItem(prev.members!, membership),
        groups: prev.groups,
      }))
    })
  }, [memberSrv])

  const loadTrainerState = useCallback(() => {
    if (!user) {
      return
    }
    Promise.all([trainerSrv.get(user!.id) as PromiseLike<unknown>, memberSrv.listAll(), groupSrv.listAll()]).then((objects) => {
      setTrainerDeafults(objects[0] as TrainerDataType)
      setState({
        trainerData: objects[0] as TrainerDataType | undefined,
        members: objects[1] as MembershipType[],
        groups: objects[2] as TrainingGroupType[],
      })
    })
  }, [groupSrv, memberSrv, trainerSrv, user])

  useEffect(() => {
    if (!trainerData) {
      loadTrainerState()
    }
  }, [loadTrainerState, trainerData])

  if (!trainerData || !eventProvider) {
    return null
  }
  const ctx = {
    trainerData,
    members: members!,
    saveTrainerData,
    groups: groups!,
    eventProvider: eventProvider!,

    saveGroup,
    deleteGroup,
    sendEmail,
    membershipChanged,
    updateMembership,

    activateEvent,
    addMemberToEvent,
    buySeasonTicket,
    createEvent,
    deleteEvent,
    removeMemberFromEvent,
  }

  return <TrainerContext.Provider value={ctx}>{children}</TrainerContext.Provider>
}

const useTrainer = () => useContext(TrainerContext)

export { useTrainer }

export default TrainerProvider