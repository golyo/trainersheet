import { useCallback } from 'react'
import { Controller, FieldValues, useForm } from 'react-hook-form'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, TextField } from '@mui/material'
import { AuthState, useAuth } from '../../hooks/auth'
import BackButton from '../common/BackButton'

const PasswordReset = () => {
  const { handleSubmit, control, formState, setError, formState: { errors } } = useForm()
  const { t } = useTranslation()

  const { startPasswordReset, authState } = useAuth()

  const startReset = useCallback((values: FieldValues) => {
    const { email } = values
    startPasswordReset(email).then(() => {
      // setErrors({})
    }).catch((err) => {
      setError('email', {
        type: 'manual',
        message: t(`login.error.${err.code}`)!,
      })
    })
  }, [startPasswordReset, setError, t])

  if (authState === AuthState.AUTHORIZED || authState === AuthState.VERIFIED) {
    return <Navigate to="/"></Navigate>
  }

  const isSubmitted = formState.isSubmitted && Object.keys(errors).length === 0

  return (
    <div>
      <h2>{t('login.resetPassword')}</h2>
      <form onSubmit={handleSubmit(startReset)} className="flex-container">
        <Controller
                    name={'email' as never}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <TextField
                            onChange={onChange}
                            value={value}
                            label={t('login.email')}
                            error={!!errors.email}
                            helperText={errors.email?.message as string || ''}
                            required
                            disabled={isSubmitted}
                        />
                    )}
                />
        {isSubmitted && <div>Password change email was sent.</div>}
        <div className="horizontal">
          {!isSubmitted && <Button color='primary' type='submit' variant='contained' disabled={isSubmitted}>
            {t('login.resetPassword')}
          </Button>
          }
          <BackButton />
        </div>
      </form>
    </div>
  )
}

export default PasswordReset