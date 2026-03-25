import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type OpeningScreenProps = {
  onOpenComplete: () => void
}

function OpeningScreen({ onOpenComplete }: OpeningScreenProps) {
  const [isOpening, setIsOpening] = useState(false)

  const handleOpen = () => {
    setIsOpening(true)
    window.setTimeout(onOpenComplete, 1200)
  }

  return (
    <AnimatePresence>
      <motion.div
        className="opening-overlay"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="wedding-card"
          animate={
            isOpening
              ? {
                  scale: [1, 1.08, 1.2],
                  rotateY: [0, -10, -22],
                  rotateZ: [0, 1, -1],
                  opacity: [1, 1, 0],
                }
              : undefined
          }
          transition={{ duration: 1.1, ease: 'easeInOut' }}
        >
          <p className="open-heading">You are invited to a wedding</p>
          <button className="open-btn" onClick={handleOpen} disabled={isOpening}>
            {isOpening ? 'Opening...' : 'Tap to Open'}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default OpeningScreen
