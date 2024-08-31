import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Controller, FieldValues, useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { Modal, MenuItem, TextField, Button } from '@mui/material'
import ModalContainer from '../../common/ModalContainer'
import { useTrainer } from '../../../hooks/trainer'
import LabelValue from '../../common/LabelValue'
import { useUtils } from '../../calendar/const.ts'
import { MuiPickersAdapter } from '@mui/x-date-pickers'

interface Props {
  startDate: Date
  resetStartDate: () => void
}

function getTimeStr(date: Date, utils: MuiPickersAdapter<Date>) {
  const hour = utils.getHours(date).toString().padStart(2, '0')
  const min = utils.getMinutes(date).toString().padStart(2, '0')
  return hour + ':' + min
}

export default function NewEventPopup({ startDate, resetStartDate }: Props) {
  const { t } = useTranslation()

  const utils = useUtils()
  const { groups, createEvent } = useTrainer()

  const schema = useMemo(() => yup.object({
    groupId: yup.string().required(),
    time: yup.string().required(),
  }), [])

  const { handleSubmit, control, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      groupId: '',
      time: getTimeStr(startDate, utils),
    },
  })

  const doChanges = useCallback((values: FieldValues) => {
    const group = groups.find((g) => g.id === values.groupId)!
    createEvent(group, utils.toJsDate(startDate)).then(() => resetStartDate())
  }, [createEvent, groups, resetStartDate, startDate, utils])

  return (
    <Modal
      open={!!startDate}
      onClose={resetStartDate}
    >
      <ModalContainer variant="small" open={!!startDate} close={resetStartDate} title={t('event.createNew')}>
        <form onSubmit={handleSubmit(doChanges)} className="flex-container" noValidate>
          <LabelValue label={t('common.date')}>{utils.formatByString(startDate, utils.formats.fullDate)}</LabelValue>
          <Controller
            control={control}
            name={'time' as never}
            render={({ field }) =>
              <TextField
                {...field}
                size="small"
                label={t('event.startHour')}
                type="time"
                value={field.value || ''}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
                sx={{ minWidth: 110 }}
                error={!!errors.time}
                helperText={errors.time?.message as string || ''}
              />
            }
          />
          <Controller
            control={control}
            name="groupId"
            render={({ field }) => (
              <TextField
                {...field}
                select
                label={t('trainingGroup.title')}
                size="small"
                variant="outlined"
                error={!!errors.groupId}
                helperText={errors.groupId?.message as string || ''}
              >
                <MenuItem value={''}>-</MenuItem>
                {groups.map((group, idx) =>
                  (<MenuItem key={idx} value={group.id}>{group.name}</MenuItem>),
                )}
              </TextField>
            )}
          />
          <div className="horizontal">
            <Button color='primary' type='submit' variant='contained'>
              {t('common.create')}
            </Button>
            <Button color='primary' onClick={resetStartDate}>
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </ModalContainer>
    </Modal>
  )
}
