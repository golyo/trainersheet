import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Modal, Typography } from '@mui/material'
import ModalContainer from './ModalContainer'
import { DialogType } from '../../hooks/dialog/DialogContext'

interface ConfirmDialogType extends DialogType {
  open: boolean
  hideDialog: () => void
}

const EMPTY_FUNC = () => {}

const CONTAINED = 'contained' as const
const OUTLINED = 'outlined' as const

const ConfirmDialog = ({ title, description, buttons, open, hideDialog } : ConfirmDialogType) => {
  const { t } = useTranslation()

  const onButtonClick = useCallback((idx: number) => () => {
    hideDialog();
    (buttons![idx].onClick || EMPTY_FUNC)();
  }, [buttons, hideDialog])

  return (
    <Modal
      open={open}
      onClose={hideDialog}
    >
      <ModalContainer variant="small" title={t(title)} close={hideDialog} open={open}>
        <div className="flex-container">
          <Typography id="modal-description">
            { t(description) }
          </Typography>
          <div className="horizontal">
            { buttons?.map((button, idx) => (
              <Button size="small" key={idx} onClick={onButtonClick(idx)}  variant={idx === 0 ? CONTAINED : OUTLINED} >{t(button.label)}</Button>
            )) }
          </div>
        </div>
      </ModalContainer>
    </Modal>
  )
}

export default ConfirmDialog