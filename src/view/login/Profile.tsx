import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button, MenuItem, Paper, Select, SelectChangeEvent, Typography } from '@mui/material'
import { useUser } from '../../hooks/user'
import { useAuth } from '../../hooks/auth'
import LabelValue from '../common/LabelValue'
import TrainerBaseData from '../trainer/TrainerBaseData'
import ProfilePopup from './ProfilePopup'
import useStorage from '../../hooks/firebase/useStorage'
import UserAvatar from '../common/UserAvatar'
import { useDialog } from '../../hooks/dialog'
import { useTrainer } from '../../hooks/trainer';

const MAX_AVATAR_SIZE = 100000

const Profile = () => {
  const { t, i18n } = useTranslation()
  const { isPasswordEnabled } = useAuth()
  const { user, userChanged } = useUser()
  const { trainerData } = useTrainer()
  const { showDialog } = useDialog()

  const { uploadAvatar } = useStorage()

  const [language, setLanguage] = useState(i18n.language)

  const handleChangeLanguage = useCallback((event: SelectChangeEvent<string>) => {
    const newLanguage = event.target.value
    setLanguage(newLanguage)
    i18n.changeLanguage(newLanguage)
  }, [i18n])

  const selectFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files && e.target.files.length > 0 ? e.target.files![0] : undefined
    if (!selectedFile) {
      return
    }
    if (selectedFile.size >= MAX_AVATAR_SIZE) {
      showDialog({
        title: 'common.warning',
        description: 'warning.maxAvatarSize',
      })
      return
    }
    uploadAvatar(selectedFile, user!.id).then(() => {
      userChanged()
    })
  }, [showDialog, uploadAvatar, user, userChanged])

  if (!user) {
    return <div></div>
  }

  return (
    <div>
      <Paper className="flex-container" elevation={3}>
        <Typography variant="h4">{t('login.profile')}</Typography>
        <LabelValue label={t('common.language')}>
          <Select
            value={language}
            onChange={handleChangeLanguage}
            variant="standard"
          >
            <MenuItem value="hu">
              magyar
            </MenuItem>
            <MenuItem value="en">
              english
            </MenuItem>
          </Select>
        </LabelValue>
        <LabelValue label={t('login.email')}>{user.id}</LabelValue>
        <LabelValue label={t('login.userName')}>{user.name}</LabelValue>
        <LabelValue label={t('login.photoURL')}>
          <div className="horizontal">
            <UserAvatar userId={user.id}/>
            <Button variant="contained" component="label">
              {t('login.newAvatar')}
              <input
                type="file"
                accept="image/jpeg"
                onChange={selectFile}
                hidden
              />
            </Button>
          </div>
        </LabelValue>
        <div>
          <ProfilePopup />
          { isPasswordEnabled() && <Link to="changePassword">{t('login.changePassword')}</Link> }
        </div>
      </Paper>
      {!trainerData && <Paper className="flex-container" elevation={3}>
        <div>{t('trainer.registrationInfo')}</div>
        <div>
          <TrainerBaseData buttonLabel={t('common.register') as string}/>
        </div>
      </Paper>}
      {trainerData && <Paper className="flex-container" elevation={3}>
        <div>{t('trainer.trainerInfo')}</div>
        <div>
          <TrainerBaseData/>
        </div>
      </Paper>}
    </div>
  )
}

export default Profile
