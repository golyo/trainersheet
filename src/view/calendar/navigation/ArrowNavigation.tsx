import { FunctionComponent, MouseEvent, useCallback } from 'react'
import type { ArrowNoType, DirectionType } from './types.ts'
import './ArrowNavigation.css'

interface ArrowProps {
  direction: DirectionType
  onClick?: (event: MouseEvent) => void
  arrowNo?: ArrowNoType
  title?: string
}
const Arrow = ({ direction, arrowNo = 1, title, onClick }: ArrowProps) => {
  const createArrowStyle = useCallback((idx: number) => ({
    [direction === 'left' ? 'borderRight' : 'borderLeft']: '12px solid var(--arrow-color)',
    left: -7 * ((arrowNo - 1) / 2 + idx + 1 - arrowNo)
  }), [direction, arrowNo])

  return (
    <div className={`arrow-container arrow-container-${direction}`} onClick={onClick} title={title}>
      <div className="arrow-rectangle">
        {[...Array(arrowNo)].map((_, idx) => (
          <div key={idx} className="arrow" style={createArrowStyle(idx)} />
        ))}
      </div>
    </div>
  )
}

export interface ArrowNavigationType {
  arrowNo?: ArrowNoType
  arrowColor?: string
  title?: string
  onLeftClick?: () => void
  onRightClick?: () => void
}

export const ArrowNavigation: FunctionComponent<ArrowNavigationType> = ({ arrowNo, title = '', onLeftClick, onRightClick }) => {
  return (
    <div className="table-arrow-container">
      <Arrow direction="left" arrowNo={arrowNo} onClick={onLeftClick} />
      <div className="arrow-title">{title}</div>
      <Arrow direction="right" arrowNo={arrowNo} onClick={onRightClick} />
    </div>
  )
}

export default Arrow
