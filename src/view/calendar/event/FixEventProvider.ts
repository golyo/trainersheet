import { type CalendarEvent, type EventProvider } from '../types.ts'

const FixEventProvider: <T extends CalendarEvent>(events: T[]) => EventProvider<T> = <T extends CalendarEvent>(events: T[]) => ({
  getEvents: async () => {
    return await new Promise(resolve => setTimeout(() => { resolve(events) }, 1000))
  }
})

export default FixEventProvider
