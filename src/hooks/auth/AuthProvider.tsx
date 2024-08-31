import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  AuthProvider as IAuthProvider,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  FacebookAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateEmail as updateFirebaseEmail,
  updatePassword as updateFirebasePassword,
  updateProfile,
  User as AuthUser,
} from 'firebase/auth'
import * as Sentry from '@sentry/react'
import i18n from '../../i18n'
import { useFirebase } from '../firebase/FirebaseProvider'
import AuthContext, { AuthState } from './AuthContext'

const isEqual = (val1: string | null, val2: string | null) => {
  return (!val1 && !val2) || (val1 === val2)
}

const NOT_AUTH_PAGES = [
  '/login',
  '/verification',
  '/register',
  '/changePassword',
  '/resetPassword',
]

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { auth } = useFirebase()
  const navigate = useNavigate()
  const location = useLocation()

  const [state, setState] = useState<{ authUser?: AuthUser; authState: AuthState }>({ authState: AuthState.INIT })
  const { authUser, authState } = state

  const authProviders = useMemo(() => ({
    google: new GoogleAuthProvider(),
    facebook: new FacebookAuthProvider(),
  }), [])

  useEffect(() => {
    auth.languageCode = i18n.language

    i18n.on('languageChanged', ((lng: string) => {
      auth.languageCode = lng
    }))
  }, [auth])

  useEffect(() => {
    auth.onAuthStateChanged(dbUser => {
      if (dbUser) {
        Sentry.setUser({ email: dbUser.email! })
        setState({
          authState: dbUser.emailVerified ? AuthState.VERIFIED : AuthState.AUTHORIZED,
          authUser: dbUser,
        })
      } else {
        Sentry.setUser({ email: 'undefined' })
        setState({
          authState: AuthState.UNAUTHORIZED,
          authUser: undefined,
        })
      }
      console.log('Auth state changed', dbUser)
    })
  }, [auth])

  useEffect(() => {
    if (!authUser) {
      if (authState !== AuthState.INIT && !NOT_AUTH_PAGES.includes(location.pathname)) {
        navigate('/login')
      }
    }
  }, [authState, navigate, authUser, location.pathname])

  const login = useCallback((email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password)
  }, [auth])

  const updatePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    if (!authUser || !authUser.email) {
      throw new Error('User not defined')
    }
    const authCredential = await EmailAuthProvider.credential(authUser.email, oldPassword)
    const userCredential = await reauthenticateWithCredential(authUser, authCredential)
    await updateFirebasePassword(userCredential.user, newPassword)
  }, [authUser])

  const signInWithProvider = useCallback((provider: IAuthProvider) => {
    return signInWithPopup(auth, provider).then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result)
        const token = credential!.accessToken
        // The signed-in user info.
        const user = result.user
        console.log('+++++AUTH success', token, user)
      }).catch((error) => {
        // Handle Errors here.
        console.error('ERROR WHILE LOGIN', error.customData.email, error.code, error.message)
      });
  }, [auth]);
  const signInWithGoogle = useCallback(() => signInWithProvider(authProviders.google), [auth, authProviders])

  const signInWithFacebook = useCallback(() => signInWithProvider(authProviders.facebook), [auth, authProviders])

  const startPasswordReset = useCallback((email: string) => {
    const actionCodeSettings = {
      url: window.location.origin + '/#/registrationSuccess?action=changePassword',
      handleCodeInApp: true,
    }
    return sendPasswordResetEmail(auth, email, actionCodeSettings)
  }, [auth])

  const sendEmailToUser = useCallback((userParam: AuthUser, newUser: boolean) => {
    if (!userParam.emailVerified) {
      const actionCodeSettings = {
        url: window.location.origin + '/#/registrationSuccess?action=registration',
        handleCodeInApp: true,
      }
      return sendEmailVerification(userParam, actionCodeSettings).then((res: unknown) => {
        console.info('Email verification sent', res, actionCodeSettings)
        if (newUser) {
          navigate('/verification')
        }
      })
    } else {
      console.warn('Email already verified!')
      return Promise.resolve()
    }
  }, [navigate])

  const sendVerifyEmail = useCallback(() => {
    return sendEmailToUser(authUser!, false)
  }, [authUser, sendEmailToUser])

  const register = useCallback((email: string, password: string, displayName: string) => {
    return createUserWithEmailAndPassword(auth, email, password).then((result) => {
      updateProfile(result.user, { displayName }).then(() => {
        sendEmailToUser(result.user, true)
      })
      return result
    })
  }, [auth, sendEmailToUser])

  const updateEmail = useCallback(async (newEmail: string, password: string) => {
    if (!authUser || !authUser.email) {
      throw new Error('User not defined')
    }
    if (authUser.email && !isEqual(authUser.email, newEmail)) {
      const authCredential = await EmailAuthProvider.credential(authUser.email, password)
      const { user: dbUser } = await reauthenticateWithCredential(authUser, authCredential)
      await updateFirebaseEmail(dbUser, newEmail)
      await sendEmailToUser(dbUser, true)
    }
    return Promise.resolve()
  }, [sendEmailToUser, authUser])

  const updateUser = useCallback(async (displayName: string, photoURL?: string) => {
    if (!authUser) {
      throw new Error('User not defined')
    }
    console.log('+++++updateUser0', authUser.photoURL)
    if (!isEqual(authUser.displayName, displayName) || !isEqual(authUser.photoURL, photoURL || '')) {
      console.log('+++++updateUser1', photoURL)
      return updateProfile(authUser, { displayName, photoURL }).then(() => {
        setState({
          authState,
          authUser: {
            ...authUser,
            displayName,
            photoURL: photoURL || '',
          } as AuthUser,
        })
      })
    }
    return Promise.resolve()
  }, [authUser, authState])

  const logout = useCallback(() => {
    return signOut(auth)
  }, [auth])

  const isPasswordEnabled = useCallback(() => !!authUser && !!authUser.providerData.find((data) => data.providerId === 'password'), [authUser])

  if (authState === AuthState.INIT) {
    return null
  }

  const ctx = {
    ...state,
    login,
    logout,
    sendVerifyEmail,
    register,
    updateUser,
    updateEmail,
    updatePassword,
    startPasswordReset,
    signInWithGoogle,
    signInWithFacebook,
    isPasswordEnabled,
  }

  return <AuthContext.Provider value={ctx}>{ children}</AuthContext.Provider>
}

const useAuth = () => useContext(AuthContext)

export { useAuth }

export default AuthProvider