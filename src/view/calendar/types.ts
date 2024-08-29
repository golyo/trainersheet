import { type CSSProperties, type FC, MouseEvent } from 'react'

export type EventClick = (event: BaseEvent, click: MouseEvent) => void
export type GridClick = (date: Date, click: MouseEvent) => void

export interface BaseEvent {
  id: string
  title: string
  description?: string
  content?: FC
  contentProperties?: object
  badge?: string
  style?: CSSProperties
  className?: string
  onEventClick?: EventClick
}

export interface CalendarEvent extends BaseEvent {
  start: Date
  end: Date
}

export type GetEventsType<T extends CalendarEvent> = (from: Date, to: Date) => Promise<T[]>

export interface EventProvider<T extends CalendarEvent> {
  getEvents: GetEventsType<T>
}

export interface CalendarProps<T extends CalendarEvent> {
  showMouseOver?: boolean
  eventProvider: EventProvider<T>
  onEventClick?: EventClick
  onGridClick?: GridClick
}

export enum TimeUnits {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year'
}