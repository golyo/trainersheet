import { useCallback, useMemo } from 'react'
import { get } from 'lodash-es'
import { Control, Controller, UseFormSetValue, UseFormTrigger, FieldPath } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  Autocomplete, Box, IconButton,
  TextField,
} from '@mui/material'
import { AddCircle, Delete } from '@mui/icons-material'
import { getWeekdays, useUtils } from '../calendar/const.ts'
import { TrainingGroupUIType } from '../../hooks/trainer';

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
  control: Control<TrainingGroupUIType>
  setValue: UseFormSetValue<TrainingGroupUIType>
  errors: object
  trigger: UseFormTrigger<TrainingGroupUIType>
  name: FieldPath<TrainingGroupUIType>
  onDelete: (() => void) | undefined
  onAdd: (() => void) | undefined
}

const CronWeekPicker = ({ control, setValue, trigger, errors, name, onDelete, onAdd }: CronWeekPickerProps) => {
  const { t } = useTranslation()
  const utils = useUtils()

  const weekDays = useMemo(() => getWeekdays(utils), [utils])

  const autoName = `${name}.days` as FieldPath<TrainingGroupUIType>

  const cronErrors = resolve(name, errors) as CronError

  const checkCanAdd = useCallback(async () => {
    const canAdd = await trigger([autoName, `${name}.time` as FieldPath<TrainingGroupUIType>])
    if (canAdd) {
      onAdd!()
    }
  }, [autoName, name, onAdd, trigger])

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Controller
        control={control}
        name={autoName}
        render={({ field }) =>
          <Autocomplete
            {...field}
            multiple
            size="small"
            id="tags-standard"
            sx={{ width: '100%' }}
            value={(field.value as string[]) || []}
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