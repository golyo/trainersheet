import './CalendarModal.css'
import './LoadingIndicator.css'

interface LoadingIndicatorProps {
  visible?: boolean
}

const LoadingIndicator = ({ visible }: LoadingIndicatorProps) => {
  return (
    <>
      {visible && <div className="dialog-backdrop">
        <div className="loading-mark">
        </div>
      </div>}
    </>
  )
}
export default LoadingIndicator
