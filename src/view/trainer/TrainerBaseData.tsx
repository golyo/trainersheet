import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Button, MenuItem, Modal, TextField } from '@mui/material'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useTrainer } from '../../hooks/trainer'
import ModalContainer from '../common/ModalContainer'
import { TrainerDataType } from '../../hooks/trainer/TrainerContext.ts'
import { useLanguages } from '../../hooks/language/LanguageProvider.tsx';

const TrainerBaseData = ({ buttonLabel } : { buttonLabel?: string }) => {
  const { t } = useTranslation()
  const { trainerData, saveTrainerData } = useTrainer()
  
  const { ipData, countries } = useLanguages();

  const [open, setOpen] = useState(false)

  const schema = useMemo(() => yup.object({
    id: yup.string().required(),
    name: yup.string().required(),
    country: yup.string().required(),
    zipCode: yup.string().required(),
    address: yup.string().required(),
  }), [])

  const { handleSubmit, control, formState: { errors }, setValue } = useForm<TrainerDataType>({
    resolver: yupResolver(schema),
    defaultValues: trainerData,
  })

  console.log('Form default values', trainerData);

  const openModal = useCallback(() => setOpen(true), [])
  const closeModal = useCallback(() => setOpen(false), [])

  const doChanges = useCallback((values: TrainerDataType) => {
    saveTrainerData(values).then(() => closeModal())
  }, [closeModal, saveTrainerData])

  useEffect(() => {
    if (!trainerData) {
      return
    }
    if (!trainerData.country) {
      setValue('country' as keyof TrainerDataType, ipData.countryCode.toLowerCase())
    }
  }, [ipData.countryCode, setValue, trainerData])

  if (!trainerData) {
    return <div></div>
  }

  return (
    <>
      <Button variant="contained" onClick={openModal}>{buttonLabel || t('trainer.trainerData')}</Button>
      <Modal
        open={open}
        onClose={closeModal}
      >
        <ModalContainer variant="big" open={open} close={closeModal} title={t('trainer.trainerData')}>
          <form onSubmit={handleSubmit(doChanges)} className="flex-container" noValidate>
            <Controller
              name="id"
              control={control}
              defaultValue={trainerData.id}
              render={({ field }) => (
                <TextField
                  { ...field }
                  label={t('login.email')}
                  size="small"
                  variant="outlined"
                  required
                  disabled
                />
              )}
            />
            <Controller
              name="name"
              control={control}
              defaultValue={trainerData.name}
              render={({ field }) => (
                <TextField
                  { ...field }
                  size="small"
                  required
                  label={t('trainer.trainingName')}
                  error={!!errors.name}
                  helperText={errors.name?.message as string || ''}
                />
              )}
            />
            <Controller
              control={control}
              name="country"
              defaultValue={trainerData.country}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label={t('trainer.country')}
                  size="small"
                  variant="outlined"
                  error={!!errors.country}
                  helperText={errors.country?.message as string || ''}
                >
                  <MenuItem value={''}>-</MenuItem>
                  {countries.map((country, idx) =>
                    (<MenuItem key={idx} value={country.alpha2}>{country.name}</MenuItem>),
                  )}
                </TextField>
              )}
            />
            <Controller
              name="zipCode"
              control={control}
              defaultValue={trainerData.zipCode}
              render={({ field }) => (
                <TextField
                  { ...field }
                  size="small"
                  required
                  label={t('trainer.zipCode')}
                  error={!!errors.zipCode}
                  helperText={errors.zipCode?.message as string || ''}
                />
              )}
            />
            <Controller
              name="address"
              control={control}
              defaultValue={trainerData.address}
              render={({ field }) => (
                <TextField
                  { ...field }
                  size="small"
                  required
                  label={t('trainer.address')}
                  error={!!errors.address}
                  helperText={errors.address?.message as string || ''}
                />
              )}
            />
            <div className="horizontal">
              <Button type='submit' variant='contained'>
                {t('common.save')}
              </Button>
              <Button onClick={closeModal}>
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </ModalContainer>
      </Modal>
    </>
  )
}

export default TrainerBaseData