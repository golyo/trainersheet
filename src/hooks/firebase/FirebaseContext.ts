import { createContext } from 'react'

import { Auth } from 'firebase/auth'
import { Analytics } from 'firebase/analytics'
import { Firestore } from 'firebase/firestore'
import { FirebaseStorage } from 'firebase/storage'

export type FirebaseServices = {
  auth: Auth
  analytics: Analytics
  firestore: Firestore
  storage: FirebaseStorage
}

const FirebaseContext = createContext<FirebaseServices>({} as FirebaseServices)

export default FirebaseContext