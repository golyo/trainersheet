import { useCallback, useMemo } from 'react'
import { get } from 'lodash-es'
import { Control, Controller, FieldValues } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  Autocomplete, AutocompleteValue, Box, IconButton,
  TextField,
} from '@mui/material'
import { AddCircle, Delete } from '@mui/icons-material'
import { getWeekdays, useUtils } from '../calendar/const.ts';

const resolve = (path: string, obj: object) => {
  return get(obj, path, undefined) as unknown
}

interface CronError {
  time: string
  days: {
    message: string
  }
}
interface CronWeekPickerProps {
  control: Control<FieldValues>
  setValue: (name: string, values: AutocompleteValue<unknown, false, false, false>) => void
  errors: object
  trigger: (values: string[]) => Promise<boolean>
  name: string
  onDelete: (() => void) | undefined
  onAdd: (() => void) | undefined
}

const CronWeekPicker = ({ control, setValue, trigger, errors, name, onDelete, onAdd }: CronWeekPickerProps) => {
  const { t } = useTranslation()
  const utils = useUtils()

  const weekDays = useMemo(() => getWeekdays(utils), [utils])

  const autoName = `${name}.days`

  const cronErrors = resolve(name, errors) as CronError

  const checkCanAdd = useCallback(async () => {
    const canAdd = await trigger([`${name}.days`, `${name}.time`])
    if (canAdd) {
      onAdd!()
    }
  }, [name, onAdd, trigger])

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Controller
        control={control}
        name={autoName as never}
        render={({ field }) =>
          <Autocomplete
            {...field}
            multiple
            size="small"
            id="tags-standard"
            sx={{ width: '100%' }}
            value={field.value || []}
            options={weekDays}
            onChange={(_, values) => setValue(autoName, values)}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('trainingGroup.days')}
                placeholder="Nap"
                error={!!cronErrors?.days}
                helperText={cronErrors?.days?.message as string || ''}
              />
            )}
          />
        }
      />
      <Controller
        control={control}
        name={`${name}.time` as never}
        render={({ field }) =>
          <TextField
            {...field}
            size="small"
            label={t('trainingGroup.time')}
            type="time"
            value={field.value || ''}
            InputLabelProps={{ shrink: true }}
            inputProps={{ step: 300 }}
            sx={{ minWidth: 110 }}
            error={!!cronErrors?.time }
          />
        }
      />
      <Box sx={{ width: '40px' }}>
        { onDelete && <IconButton size="small" onClick={onDelete} color="warning">
          <Delete></Delete>
        </IconButton> }
        { onAdd && <IconButton size="small" onClick={checkCanAdd} color="secondary">
          <AddCircle></AddCircle>
        </IconButton> }
      </Box>
    </Box>
  )
}

export default CronWeekPicker