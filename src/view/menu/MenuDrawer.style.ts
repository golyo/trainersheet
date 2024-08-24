import { css } from '@emotion/react'
import { ThemeOptions } from '@mui/material/styles'

const drawerWidth = 200

const styles  = (theme: ThemeOptions) => ({
  root: css`
    min-width: 320px
    display: flex
    flex-direction: column
    height: 100%
  `,
  menuButton: css`
    margin-left: 12px
    margin-right: 36px
  `,
  hide: css`
    display: none
  `,
  drawer: css`
    width: ${drawerWidth}px
    flexShrink: 0
    white-space: nowrap
    z-index: ${theme.zIndex!.appBar! - 1}
  `,
  drawerOpen: css`
    width: ${drawerWidth}px
  `,
  drawerClose: css`
    overflow-x: hidden
    width: 100px
  `,
  toolbar: css`
    display: flex
    align-items: center
    justify-content: flex-end
  `,
  content: css`
    flex-grow: 1
    width: 100vw
  `,
  grow: css`
    flex-grow: 1
  `,
  container: css`
    padding: 20px
  `,
  menuHorizontal: css`
    display: flex
    flex-direction: row
    gap: 10px
  `,
  avatarButton: css`
    max-width: 120px
  `,
})

export default styles
