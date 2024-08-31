import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useCallback  } from 'react'
import { useFirebase } from './FirebaseProvider.tsx';

const jpegMetadata = {
  contentType: 'image/jpeg',
}

const useStorage = () => {
  const { storage } = useFirebase();

  const uploadAvatar = useCallback((file: File | Blob, fileName: string) => {
    const storageRef = ref(storage, `avatars/${fileName}.jpg`)

    return uploadBytes(storageRef, file, jpegMetadata)
  }, [storage])

  const getAvatarUrl = useCallback((fileName: string) => {
    return getDownloadURL(ref(storage, `avatars/${fileName}.jpg`))
  }, [storage])

  return {
    uploadAvatar,
    getAvatarUrl,
  }
}

export default useStorage