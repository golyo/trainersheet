import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useForm,
  useFieldArray,
  Controller,
  FieldValues
} from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  Avatar,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputAdornment,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import { Event as EventIcon, ExpandMore } from '@mui/icons-material'
import { GroupType, TrainingGroupUIType, useTrainer } from '../../../hooks/trainer'
import { Accordion, AccordionDetails, AccordionSummary } from '../../common/ZhAccordion'
import CronWeekPicker from '../../common/CronWeekPicker'
import ModalContainer from '../../common/ModalContainer'
import { useDialog } from '../../../hooks/dialog'
import { EVENT_COLORS } from '../../calendar/const.ts'

interface ModalTitleProps {
  trainingGroup: TrainingGroupUIType
  isOpen: boolean
  closePopup: () => void
  saveGroup: (group: TrainingGroupUIType) => Promise<void>
}
const EditGroupPopup = ({ trainingGroup, isOpen, closePopup, saveGroup } : ModalTitleProps) => {
  const { t } = useTranslation()
  const { showDialog } = useDialog()
  const { groups } = useTrainer()
  const [showPublic, setShowPublic] = useState<boolean>(true)

  const toggleAccordion = useCallback(() => setShowPublic((prev) => !prev), [])
  const schema = useMemo(() => yup.object({
    id: yup.string().required(),
    name: yup.string().required(),
    color: yup.string().required(),
    attachedGroups: yup.array().of(yup.string().required()).required(),
    groupType: yup.mixed<GroupType>().oneOf(Object.values(GroupType)).required(),
    inviteOnly: yup.boolean().required(),
    duration: yup.number().integer().min(1).max(24 * 60),
    cancellationDeadline: yup.number().integer().min(0).max(120).required(),
    ticketLength: yup.number().integer().min(1).max(100),
    ticketValidity: yup.number(),
    maxMember: yup.number().integer().min(1).max(100),
    showMembers: yup.boolean().required(),
    crons: yup.array().of(
      yup.object().shape({
        days: yup.array().of(yup.string().required()).min(1, t('error.required') as string).required(),
        time: yup.string().required(),
      }).required(),
    ).required(),
  }), [t])

  const { handleSubmit, control, setValue, reset, trigger, formState: { errors }, watch } = useForm<TrainingGroupUIType>({ resolver: yupResolver(schema) })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'crons',
  })

  const groupColor = watch('color')
  const attachedGroups = watch('attachedGroups')

  const attachableGroups = useMemo(() => groups.filter((gr) => gr.id != trainingGroup.id ), [groups, trainingGroup.id])

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => (i + 1))
  }, [])

  useEffect(() => {
    reset(trainingGroup)
  }, [reset, trainingGroup])

  const modifyData = useCallback((modifiedGroup: FieldValues) => {
    const toSave = {
      ...trainingGroup,
      ...modifiedGroup,
    }
    saveGroup(toSave)
    closePopup()
  }, [closePopup, saveGroup, trainingGroup])

  const onGroupTypeChanged = useCallback(() => {
    if (attachedGroups.length > 0) {
      showDialog({
        title: 'common.warning',
        description: 'warning.groupTypeChangeIfNotAttached',
      })
    }
    return attachedGroups.length === 0
  }, [attachedGroups, showDialog])

  if (!trainingGroup) {
    return null
  }

  return (
    <Modal
      open={isOpen}
      onClose={closePopup}
    >
      <ModalContainer variant="big" open={isOpen} title={(
        <>
          <Avatar sx={{ bgcolor: groupColor }}>
            <EventIcon></EventIcon>
          </Avatar>
          <span>{t('trainingGroup.title')}</span>
        </>
      )} close={closePopup}>
        <form onSubmit={handleSubmit(modifyData)} className="vertical">
          <div>
            <Accordion disableGutters expanded={showPublic} onChange={toggleAccordion}>
              <AccordionSummary expandIcon={<ExpandMore />} >
                <Typography>{t('trainer.groupPublic')}</Typography>
              </AccordionSummary>
              <AccordionDetails className="vertical">
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('trainingGroup.name')}
                      size="small"
                      variant="outlined"
                      error={!!errors.name}
                      helperText={errors.name?.message as string || ''}
                    />
                  )}
                />
                <Controller
                  name="groupType"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      select
                      label={t('trainingGroup.groupType')}
                      size="small"
                      variant="outlined"
                      onChange={(e) => {
                        if (onGroupTypeChanged()) {
                          field.onChange(e)
                        }
                      }}
                    >
                      {Object.values(GroupType).map((gtype, idx) =>
                        (<MenuItem key={idx} value={gtype}>{t(`groupType.${gtype}`)}</MenuItem>),
                      )}
                    </TextField>
                  )}
                />
                <Controller
                  control={control}
                  name="duration"
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label={t('trainingGroup.duration')}
                      size="small"
                      variant="outlined"
                      error={!!errors.duration}
                      helperText={errors.duration?.message as string || ''}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Avatar variant="square">{t('common.min')}</Avatar>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="maxMember"
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label={t('trainingGroup.maxMember')}
                      size="small"
                      variant="outlined"
                      error={!!errors.maxMember}
                      helperText={errors.maxMember?.message as string || ''}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="color"
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label={t('trainingGroup.color')}
                      size="small"
                      variant="outlined"
                      sx={{ backgroundColor: field.value }}
                      error={!!errors.color}
                      helperText={errors.color?.message as string || ''}
                    >
                      <MenuItem value=''>-</MenuItem>
                      {EVENT_COLORS.map((color, idx) =>
                        (<MenuItem key={idx} sx={{
                          'backgroundColor': color,
                          '&:hover': {
                            backgroundColor: color,
                          },
                        }} value={color}>{color}</MenuItem>),
                      )}
                    </TextField>
                  )}
                />
                {fields.map((_, index) => (
                  <div key={index}>
                    <CronWeekPicker
                      control={control}
                      setValue={setValue}
                      errors={errors}
                      trigger={trigger}
                      name={`crons.${index}`}
                      onDelete={index > 0 ? () => remove(index) : undefined}
                      onAdd={fields.length - 1 === index ? () => append({ days: [], time: '' }) : undefined}
                    />
                  </div>
                ))}
              </AccordionDetails>
            </Accordion>
            <Accordion disableGutters expanded={!showPublic} onChange={toggleAccordion}>
              <AccordionSummary expandIcon={<ExpandMore />} >
                <Typography>{t('trainer.groupSettings')}</Typography>
              </AccordionSummary>
              <AccordionDetails className="vertical">
                <Controller
                  control={control}
                  name="cancellationDeadline"
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label={t('trainingGroup.cancellationDeadline')}
                      size="small"
                      variant="outlined"
                      error={!!errors.cancellationDeadline}
                      helperText={errors.cancellationDeadline?.message as string || ''}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Avatar variant="square">{t('common.hour')}</Avatar>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="ticketLength"
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label={t('trainingGroup.ticketLength')}
                      size="small"
                      variant="outlined"
                      error={!!errors.ticketLength}
                      helperText={errors.ticketLength?.message as string || ''}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Avatar variant="square">{t('common.pcs')}</Avatar>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="ticketValidity"
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      select
                      label={t('trainingGroup.ticketValidity')}
                      size="small"
                      variant="outlined"
                    >
                      <MenuItem value={0}>{t('common.unlimited')}</MenuItem>
                      {months.map((month, idx) => (
                        <MenuItem value={month} key={idx}>{month + ' ' + t('common.month')}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                <FormControlLabel
                  control={
                    <Controller
                      name="inviteOnly"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          {...field}
                          checked={field.value}
                        />
                      )}
                    />
                  }
                  label={t('trainingGroup.inviteOnly') as string}
                />
                <FormControlLabel
                  control={
                    <Controller
                      name="showMembers"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          {...field}
                          checked={field.value}
                        />
                      )}
                    />}
                  label={t('trainingGroup.showMembers') as string}
                />
                <Controller
                  name="attachedGroups"
                  control={control}
                  render={({ field }) => (
                    <FormControl size="small">
                      <InputLabel id="attachedGroupsLabel">{t('trainingGroup.attachedGroups')}</InputLabel>
                      <Select
                        {...field}
                        labelId="attachedGroupsLabel"
                        fullWidth
                        multiple
                        label={t('trainingGroup.attachedGroups')}
                        size="small"
                      >
                        {attachableGroups.map((group, idx) =>
                          (<MenuItem key={idx} value={group.id}>{group.name}</MenuItem>),
                        )}
                      </Select>
                    </FormControl>
                  )}
                />
              </AccordionDetails>
            </Accordion>
          </div>
          <div>
            <Button color="primary" type="submit" variant="contained">
              {t('common.save')}
            </Button>
            <Button color="primary" onClick={closePopup}>
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </ModalContainer>
    </Modal>

  )
}

export default EditGroupPopup
