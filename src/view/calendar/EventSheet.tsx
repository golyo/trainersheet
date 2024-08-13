import { FunctionComponent, CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BaseEvent, EventClick } from './types'
import './EventSheet.css'
import EventItem from './EventItem'

interface ContainerProps {
  height: number
  width: number
}

export interface SheetEventPosition {
  top: number
  height: number
  left: number
  width: number
}

export interface SheetEvent {
  event: BaseEvent
  position: SheetEventPosition
}

interface EventSheetProps {
  events: SheetEvent[]
  showMouseOver?: boolean
  minEventHeight?: number
  widthMargin?: number
  heightMargin?: number
  eventPadding?: number
  onEventClick?: EventClick
  sheetStyle?: CSSProperties
}

const EventSheet: FunctionComponent<EventSheetProps> = ({
  events,
  showMouseOver = true,
  minEventHeight,
  widthMargin = 1,
  heightMargin = 1,
  eventPadding = 0,
  onEventClick,
  sheetStyle = {}
}) => {
  const [containerProps, setContainerProps] = useState<ContainerProps>({ height: 0, width: 0 })
  const ref = useRef<HTMLDivElement | null>(null)

  const setupWidthAnsHeight = useCallback(() => {
    if (ref.current) {
      setContainerProps({
        height: ref.current!.clientHeight,
        width: ref.current!.clientWidth
      })
    }
  }, [ref])

  useEffect(() => {
    setupWidthAnsHeight()
    window.addEventListener('resize', setupWidthAnsHeight)
    return () => { window.removeEventListener('resize', setupWidthAnsHeight) }
  }, [setupWidthAnsHeight])

  const usedStyle = useMemo(() => (
    {
      minWidth: 2 * (widthMargin + eventPadding + 20),
      ...sheetStyle
    }
  ), [sheetStyle, widthMargin, eventPadding])

  const eventStyles = useMemo(() => {
    if (!containerProps) {
      return []
    }
    const result = [] as BaseEvent[]
    events.forEach((event) => {
      const top = Math.min(1, event.position.top)
      const height = Math.min((1 - top), event.position.height)
      const left = Math.min(1, event.position.left)
      const width = Math.min((1 - left), event.position.width)
      let leftVal = left * containerProps.width + widthMargin
      const widthVal = width * containerProps.width - 2 * widthMargin - 2 * eventPadding - 1
      const styleWidth: number = (event.event.style?.width ?? 0) as number
      if (event.event.style?.width && widthVal > styleWidth) {
        leftVal += (widthVal - styleWidth) / 2
      }
      result.push({
        ...event.event,
        style: {
          top: top * containerProps.height + heightMargin + 1,
          height: Math.max(height * containerProps.height - 2 * heightMargin - 2 * eventPadding - 1, minEventHeight ?? 0),
          left: leftVal,
          width: widthVal,
          ...event.event.style,
          padding: eventPadding
        }
      })
    })
    return result
  }, [containerProps, widthMargin, heightMargin, eventPadding, events, minEventHeight])

  return (
    <div className="sheet-container" ref={ref} style={usedStyle}>
      {eventStyles.map((event, idx) => (
        <EventItem key={idx} event={event} showMouseOver={showMouseOver} onEventClick={onEventClick} />
      ))}
    </div>
  )
}

export default EventSheet
