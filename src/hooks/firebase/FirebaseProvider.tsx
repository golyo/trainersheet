import { useContext, useEffect, useMemo, useState, ReactNode } from 'react'
import { getAuth } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

import FirebaseContext, { FirebaseServices } from './FirebaseContext'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_APP_API_KEY,
  authDomain: import.meta.env.VITE_APP_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_APP_DATABASE_URL,
  projectId: import.meta.env.VITE_APP_PROJECT_ID,
  storageBucket: import.meta.env.VITE_APP_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_APP_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_APPID,
  measurementId: import.meta.env.VITE_APP_MEASUREMENT_ID,
}

const FirebaseProvider = ({ children }: { children: ReactNode }) => {
  const [services, setServices] = useState<FirebaseServices>({} as FirebaseServices)

  useEffect(() => {
    const app = initializeApp(firebaseConfig)

    const analytics = getAnalytics(app)
    const auth = getAuth(app)
    const firestore = getFirestore(app)
    const storage = getStorage(app)

    setServices({
      auth,
      analytics,
      firestore,
      storage,
    })
  }, [])

  const ctx = useMemo(() => (
    services
  ), [services])

  return services.auth ? <FirebaseContext.Provider value={ctx}>{children}</FirebaseContext.Provider> : null
}

const useFirebase = () => useContext<FirebaseServices>(FirebaseContext)

export { useFirebase }

export default FirebaseProvider