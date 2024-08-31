import { useCallback, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Controller, FieldValues, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { styled } from '@mui/material/styles';
import { Button, ButtonProps, TextField } from '@mui/material'
import { useAuth } from '../../hooks/auth'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import googleSvg from '../../resources/google.svg'
import facebookSvg from '../../resources/facebook.svg'
import mailSvg from '../../resources/mail.svg'

const GoogleButton = styled(Button)<ButtonProps>(() => ({
  color: '#757575',
  backgroundColor: 'white',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: 'white',
  },
}));

const FacebookButton = styled(Button)<ButtonProps>(() => ({
  color: 'white',
  backgroundColor: '#4267b2',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#4267b2',
  },
}));

const EmailButton = styled(Button)<ButtonProps>(() => ({
  textTransform: 'none',
}));

const Login = () => {
  const schema = useMemo(() => yup.object({
    email: yup.string().email().required(),
    password: yup.string().required(),
  }), [])

  const [showEmail, setShowEmail] = useState(false)
  const { control, handleSubmit, setError, formState: { errors } } = useForm({ resolver: yupResolver(schema) })
  const { login, authUser, signInWithGoogle, signInWithFacebook } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const doLogin = useCallback((values: FieldValues) => {
    const { email, password } = values
    login(email, password).then(() => {
      navigate('/')
    }).catch((err) => {
      setError('email', {
        type: 'manual',
        message: t(`login.error.${err.code}`)!,
      })
    })
  }, [login, navigate, setError, t])

  const toggleEmailLogin = useCallback(() => {
    setShowEmail((prev) => !prev)
  }, [])

  if (authUser) {
    return authUser.emailVerified ? <Navigate to="/" /> : <Navigate to="/verification" />
  }

  return (
    <div>
      {!showEmail && (
        <div className="flex-container">
          <h2>{t('login.welcome')}</h2>
          <GoogleButton variant="contained"
                        onClick={signInWithGoogle}
                        startIcon={<img className="button-img" src={googleSvg} alt=""></img>}
          >
            {t('login.googleLogin')}
          </GoogleButton>
          <FacebookButton variant="contained"
                          onClick={signInWithFacebook}
                          startIcon={<img className="button-img" src={facebookSvg} alt=""></img>}
          >
            {t('login.facebookLogin')}
          </FacebookButton>
          <EmailButton variant="contained"
                       color="secondary"
                       onClick={toggleEmailLogin}
                       startIcon={<img className="button-img" src={mailSvg} alt=""></img>}
          >
            {t('login.emailLogin')}
          </EmailButton>
        </div>
      )}
      {showEmail && (
        <form onSubmit={handleSubmit(doLogin)} className="flex-container" noValidate>
          <h2>{t('login.login')}</h2>
          <Controller
            name="email"
            control={control}
            defaultValue=""
            render={({field: {onChange, value}}) => (
              <TextField
                onChange={onChange}
                value={value}
                label={t('login.email')}
                required
                error={!!errors.email}
                helperText={errors.email?.message as string || ''}
              />
            )}
          />
          <Controller
            name="password"
            control={control}
            defaultValue=""
            render={({field: {onChange, value}}) => (
              <TextField
                onChange={onChange}
                value={value}
                type="password"
                label={t('login.password')}
                required
                error={!!errors.email}
              />
            )}
          />
          <div>
            <Button color="primary" type="submit" variant="contained">
              {t('login.login')}
            </Button>
            <Button color="primary" onClick={toggleEmailLogin} variant="outlined">
              {t('common.cancel')}
            </Button>
          </div>
          <div>
            <Link to="/register">
              {t('login.registerLink')}
            </Link>
          </div>
          <div>
            <Link to="/resetPassword">
              {t('login.resetPassword')}
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}

export default Login
