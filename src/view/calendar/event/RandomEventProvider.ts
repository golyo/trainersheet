import { type CalendarEvent, type EventProvider, type GetEventsType } from '../types.ts'
import EventColorProvider from './EventColorProvider.ts'
import { DAY_LENGTH } from '../const.ts'

const getRandomNumber: (maxNum: number) => number = (maxNum: number) => {
  return Math.floor(Math.random() * maxNum)
}

const RandomEventProvider: (eventNo: number, maxRange: number) => EventProvider<CalendarEvent> = (eventNo, maxRange) => {
  const colorProvider = EventColorProvider(eventNo)

  const getEvents: GetEventsType<CalendarEvent> = async (from: Date, to: Date) => {
    const events: CalendarEvent[] = []
    const fromTime = from.getTime()
    const length = to.getTime() - fromTime
    const randomLength = (maxRange ?? 0) > 0 ? Math.min(maxRange, length) : length / 2
    for (let i = 0 i < eventNo i++) {
      const actLength = getRandomNumber(randomLength)
      const actStart = getRandomNumber(length)
      events.push({
        id: `id_${i}`,
        title: `title_${i}`,
        description: `description_${i}`,
        badge: `${i}`,
        style: {
          backgroundColor: colorProvider.getColorAt(i)
        },
        start: new Date(fromTime + actStart),
        end: new Date(fromTime + actStart + actLength)
      })
    }
    const last = {
      id: 'id_last',
      title: 'title_last',
      description: 'description_last',
      style: {
        backgroundColor: colorProvider.getColorAt(0)
      },
      start: new Date(fromTime + length - 10),
      end: new Date(fromTime + length + DAY_LENGTH)
    }
    events.push(last)
    return await new Promise(resolve => setTimeout(() => { resolve(events) }, 1000))
  }

  const provider: EventProvider<CalendarEvent> = {
    getEvents
  }
  return provider
}

export default RandomEventProvider
