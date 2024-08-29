/** @jsxImportSource @emotion/react */
import { useMemo, forwardRef, ReactNode } from 'react'
import { AppBar, Box, Grow, IconButton, Toolbar, Typography } from '@mui/material'
import { Close } from '@mui/icons-material'

import styles from './ModalContainer.style'

interface ModalProps {
  children : ReactNode
  title: ReactNode
  open: boolean
  variant?: 'big' | 'small'
  close: () => void
}

const ModalContainer = forwardRef<HTMLDivElement, ModalProps>(({ children, variant, title, close, open }, ref) => {
  const appendRootClass = useMemo(() => {
    return variant === 'big' ? styles.variantBig : variant === 'small' ? styles.variantSmall : undefined
  }, [variant])

  return (
    <Grow in={open} timeout={1000}>
      <Box css={styles.outer}>
        <Box tabIndex={-1} ref={ref} css={[styles.root, appendRootClass]}>
          <AppBar position="relative">
            <Toolbar>
              <Typography variant="h4" color="inherit" component="div">
                { title }
              </Typography>
              <IconButton onClick={close} edge="end" size="large" color="inherit">
                <Close></Close>
              </IconButton>
            </Toolbar>
          </AppBar>
          <div>
            {children}
          </div>
        </Box>
      </Box>
    </Grow>
  )
})

export default ModalContainer