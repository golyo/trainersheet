import { CSSProperties, ReactNode, useCallback, useEffect, useRef } from 'react'
import './CalendarModal.css'

interface CalendarModalProps {
  title: string
  visible?: boolean
  modalStyle?: CSSProperties
  children?: ReactNode
  closeModal?: () => void
}

const CalendarModal = ({
  title,
  children,
  visible = false,
  modalStyle,
  closeModal
}: CalendarModalProps) => {
  const modalContainerRef = useRef<HTMLDivElement | null>(null)

  const onCloseClick = useCallback(() => {
    if (closeModal) {
      closeModal()
    }
  }, [closeModal])

  const onClickHandler = useCallback((e: MouseEvent) => {
    let node = e.target as HTMLElement
    const check = modalContainerRef.current as HTMLElement
    while (node && node !== check) {
      node = node.offsetParent as HTMLElement
    }
    if (!node && closeModal) {
      // clicked outside of modal & can close -> close modal
      closeModal()
    }
  }, [closeModal])

  useEffect(() => {
    if (closeModal) {
      document.addEventListener('click', onClickHandler)
    }
    return () => {
      window.removeEventListener('click', onClickHandler)
    }
  })

  return (
    <div className="dialog-backdrop">
      <div className="dialog-container" style={{
        ...modalStyle,
        visibility: visible ? 'visible' : 'hidden'
      }} ref={modalContainerRef}>
        <div className="dialog-header">
          {title}
          {closeModal && <span className="dialog-close" onClick={onCloseClick}>&times</span>}
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  )
}
export default CalendarModal
