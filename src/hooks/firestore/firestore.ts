import { useFirebase } from '../firebase/FirebaseProvider'
import { useCallback, useMemo } from 'react'
import {
  deleteDoc,
  doc,
  setDoc,
  addDoc,
  getDoc,
  collection,
  getDocs,
  query,
  SnapshotOptions,
  QueryDocumentSnapshot,
  Firestore,
  FirestoreDataConverter,
  QueryConstraint,
} from 'firebase/firestore'
import { get, set, omit } from 'lodash-es'
import { useDialog } from '../dialog'
import { WithFieldValue } from '@firebase/firestore'

interface DataWithId {
  id: string
}

const idConverter: FirestoreDataConverter<DataWithId> = {
  toFirestore: (object: WithFieldValue<DataWithId>) => {
    const toDb = { ...object }
    omit(toDb, ['id'])
    return toDb
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions) => {
    const data = snapshot.data(options)
    return {
      ...data,
      id: snapshot.id,
    }
  },
}

export const removeStr = (items: string[], value: string) => {
  const idx = items.indexOf(value)
  if (idx >= 0) {
    items.splice(idx, 1)
  }
  return items
}

export const removeItemByCheck : <T> (items: T[], check: (item: T) => boolean) => T[] = (items, check) => {
  const cutted = [...items]
  const idx = cutted.findIndex((item) => check(item))
  if (idx >= 0) {
    cutted.splice(idx, 1)
  }
  return cutted
}

export const removeItemByEqual : <T> (items: T[], item: T, isEqual: (a: T, b: T) => boolean) => T[] = (items, item, isEqual) =>
  removeItemByCheck(items, (find) => isEqual(find, item))

export const removeItemById : <T extends { id: string }> (items: T[], id: string) => T[] = (items, id) =>
  removeItemByCheck(items, (item) => item.id === id)

export const changeItemByEqual :<T> (items: T[], newItem: T, isEqual: (a: T, b: T) => boolean) => T[] = (items, newItem, isEqual) => {
  const changed = [...items]
  const idx = changed.findIndex((item) => isEqual(item, newItem))
  if (idx >= 0) {
    changed[idx] = newItem
  } else {
    changed.push(newItem)
  }
  return changed
}

export const changeItem : <T extends { id: string }> (items: T[], newItem: T) => T[] = (items, newItem) =>
  changeItemByEqual(items, newItem, (a, b) => a.id === b.id)

export const createDatePropertiesWithConverter = (properties: string[]) => ({
  toFirestore: (object: DataWithId) => {
    const newobj = idConverter.toFirestore(object)
    properties.forEach((prop) => {
      const val = get(object, prop) as Date
      if (val) {
        set(object, prop, val.getTime())
      }
    })
    return newobj
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions) => {
    const object = idConverter.fromFirestore(snapshot, options)
    properties.forEach((prop) => {
      const val = get(object, prop) as number
      if (val) {
        set(object, prop, new Date(val))
      }
    })
    return object
  },
})

export const loadObject = (firestore: Firestore, path: string, id: string) => {
  const docRef = doc(firestore, path, id)
  return getDoc(docRef).then((document) => {
    return document  ? {
      id: id,
      ...document.data(),
    } : undefined
  })
}

export const deleteObject = (firestore: Firestore, path: string, id: string) => {
  const docRef = doc(firestore, path, id)
  return deleteDoc(docRef)
}

export const updateObject = <T extends DataWithId>(firestore: Firestore, path: string, object: T, merge = true) => {
  const docRef = doc(firestore, path, object.id)
  const updated = { ...object }
  return setDoc(docRef, updated as Partial<T>, { merge })
}

export const getCollectionRef = (firestore: Firestore, path: string, dateProperties?: string[]) => collection(firestore, path)
  .withConverter(dateProperties ? createDatePropertiesWithConverter(dateProperties) : idConverter)

export const doQuery = <T>(firestore: Firestore, path: string, dateProperties?: string[], ...queryConstraints: QueryConstraint[]) => {
  return getDocs(query(getCollectionRef(firestore, path, dateProperties), ...queryConstraints))
    .then((querySnapshot) => querySnapshot.docs.map((document) => document.data() as T))
}

export const insertObject = <T extends DataWithId>(firestore: Firestore, path: string, object: T) => {
  const collectionRef = getCollectionRef(firestore, path)
  return addDoc(collectionRef, object).then((docRef) => {
    object.id = docRef.id
    return object
  })
}

export const cloneObject = (firestore: Firestore, fromPath: string, toPath: string, id: string) => {
  loadObject(firestore, fromPath, id).then((data) => {
    if (!data) {
      throw new Error('Data not found to id ' + fromPath + '/' + id)
    }
    updateObject(firestore, toPath, data).then(() => {
      console.log('Object moved', data)
    })
  })
}

export const cloneCollection = <T extends DataWithId, U extends DataWithId>(firestore: Firestore, fromPath: string, toPath: string, transform: (data: T) => U) => {
  const fromRef = getCollectionRef(firestore, fromPath)
  getDocs(fromRef).then((querySnapshot) => {
    querySnapshot.docs.forEach((document) => {
      const data = document.data() as T
      const transformed = transform(data)
      updateObject<U>(firestore, toPath, transformed).then(() => {
        console.log('Object moved from collection', document.data(), false)
      })
    })
  })
}

export const useFirestore = <T extends DataWithId>(path: string, dateProperties?: string[]) => {
  const { firestore } = useFirebase()
  const { showBackdrop, hideBackdrop } = useDialog()
  
  const collectionRef = useMemo(() => getCollectionRef(firestore, path, dateProperties), [dateProperties, firestore, path])

  const getDocRef = useCallback((id: string) => doc(collectionRef, id), [collectionRef])

  const hiddeError = useCallback((err: unknown, messageKey?: string) => {
    hideBackdrop(messageKey)
    throw err
  }, [hideBackdrop])

  const save = useCallback((data: T, merge = true, useMessage = true) => {
    showBackdrop()
    if (data.id) {
      const docRef = getDocRef(data.id)
      return setDoc(docRef, data, { merge }).then(() => {
        hideBackdrop(useMessage && 'common.modifySuccess')
        return docRef
      })
    } else {
      return addDoc(collectionRef, data).then((docRef) => {
        data.id = docRef.id
        hideBackdrop(useMessage && 'common.insertSuccess')
        return docRef
      }, (err) => hiddeError(err, useMessage ? 'error.update' : undefined))
    }
  }, [collectionRef, getDocRef, hiddeError, hideBackdrop, showBackdrop])

  const getAndModify: (id: string, modifier: (item: T) => T, checkExistence?: boolean, useMessage?: boolean) => Promise<T> =
    useCallback((id: string, modifier: (item: T) => T, checkExistence, useMessage = true) => {
      showBackdrop()
      const docRef = getDocRef(id)
      return new Promise<T>((resolve, reject) => {
        getDoc(docRef).then((querySnapshot) => {
          const inDb = querySnapshot.data() as T
          if (checkExistence && !inDb) {
            hideBackdrop()
            reject(`Not found data in database to ${path}/${id}`)
            return
          }
          const modified = modifier(inDb)
          setDoc(docRef, modified).then(() => {
            hideBackdrop(useMessage ? 'common.modifySuccess' : '')
            resolve(modified)
          })
        })
      })
    }, [getDocRef, hiddeError, hideBackdrop, path, showBackdrop])

  const remove = useCallback((id: string, useMessage = true) => {
    showBackdrop()
    return deleteDoc(getDocRef(id)).then(
      () => hideBackdrop(useMessage && 'common.removeSuccess'),
      (err) => hiddeError(err, useMessage ? 'error.update' : undefined))
  }, [getDocRef, hiddeError, hideBackdrop, showBackdrop])

  const listAll = useCallback((...queryConstraints: QueryConstraint[]) => {
    showBackdrop()
    return getDocs(query(collectionRef, ...queryConstraints)).then((querySnapshot) => {
      const result = querySnapshot.docs.map((document) => document.data())
      hideBackdrop()
      return result as T[]
    })
  }, [collectionRef, hideBackdrop, showBackdrop])

  const get = useCallback((id: string) => {
    showBackdrop()
    return getDoc(getDocRef(id)).then((document) => {
      hideBackdrop()
      return document.data() as T
    })
  }, [getDocRef, hideBackdrop, showBackdrop])

  return useMemo(() => ({
    get,
    getAndModify,
    listAll,
    remove,
    save,
  }), [get, getAndModify, listAll, remove, save])
}
