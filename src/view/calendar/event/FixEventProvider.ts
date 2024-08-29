import { type CalendarEvent, type EventProvider } from '../types.ts'

const FixEventProvider: <T extends CalendarEvent>(events: T[]) => EventProvider<T> = <T extends CalendarEvent>(events: T[]) => ({
  getEvents: async () => {
    const promise = new Promise<T[]>((resolve) =>{
      setTimeout(() => {
        return resolve(events)
      }, 1000);
    });
    return await promise;
  }
})

export default FixEventProvider
