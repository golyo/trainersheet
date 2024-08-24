import { useUtils as useMuiUtils } from '@mui/x-date-pickers/internals/hooks/useUtils'
import * as colors from '@mui/material/colors'
import { MuiPickersAdapter } from '@mui/x-date-pickers'
import { eachDayOfInterval } from 'date-fns'
import { CalendarEvent } from './types.ts'
import { Color } from '@mui/material';

export const EMPTY_CLICK: () => void = function () {
  // do nothing
}

type ColorIdx = keyof typeof colors;

export const EVENT_COLORS = Object.keys(colors).filter((key) => key !== 'common').map((key) => (colors[key as ColorIdx] as Color)[300])

export const MINUTE_LENGTH = 1000 * 60
export const HOUR_LENGTH = MINUTE_LENGTH * 60
export const HOUR_NO = 24
export const DAY_LENGTH = HOUR_LENGTH * HOUR_NO
export const WEEK_LENGTH = DAY_LENGTH * 7

// TODO handle event changes
const CALENDAR_EVENT_CHANGED = 'CalendarEventChanged'

export const useUtils = () => useMuiUtils<Date>() as MuiPickersAdapter<Date>

export const getWeekdays = (utils: MuiPickersAdapter<Date>) => {
  const now = new Date()
  return eachDayOfInterval({
    start: utils.startOfWeek(now),
    end: utils.endOfWeek(now),
  }).map((day) => utils.formatByString(day, 'EEEEEE'))
}

export const dispatchCalendarEventChangeEvent = <T extends CalendarEvent>(event: T) => {
  const eventChanged = new CustomEvent(CALENDAR_EVENT_CHANGED, {
    detail: {
      event,
    },
  })
  window.dispatchEvent(eventChanged)
}