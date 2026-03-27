/* eslint-disable react-hooks/purity */
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type OpeningScreenProps = {
  onOpenComplete: () => void
}

function OpeningScreen({ onOpenComplete }: OpeningScreenProps) {
  const [isOpening, setIsOpening] = useState(false)

  const handleOpen = () => {
    setIsOpening(true)
    window.setTimeout(onOpenComplete, 2200)
  }

  return (
    <AnimatePresence>
      <motion.div
        className="opening-overlay"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Confetti Particles */}
        {isOpening && (
          <div className="confetti-container">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="confetti"
                initial={{ 
                  x: 0, 
                  y: 0, 
                  scale: 0,
                  rotate: 0,
                  opacity: 0 
                }}
                animate={{ 
                  x: (Math.random() - 0.5) * 600,
                  y: Math.random() * -400 - 100,
                  scale: [0, 1, 0.8],
                  rotate: Math.random() * 720,
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: 2,
                  delay: i * 0.02,
                  ease: 'easeOut'
                }}
              />
            ))}
          </div>
        )}

        {/* Main Card with Door Effect */}
        <div className="card-wrapper">
          {/* Left Door */}
          <motion.div
            className="door door-left"
            animate={isOpening ? { rotateY: -120 } : {}}
            transition={{ duration: 1, ease: 'easeInOut' }}
          >
            <div className="door-content">
              <div className="door-ornament" />
            </div>
          </motion.div>

          {/* Right Door */}
          <motion.div
            className="door door-right"
            animate={isOpening ? { rotateY: 120 } : {}}
            transition={{ duration: 1, ease: 'easeInOut' }}
          >
            <div className="door-content">
              <div className="door-ornament" />
            </div>
          </motion.div>

          {/* Inner Content */}
          <motion.div
            className="inner-content"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isOpening ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <motion.div
              animate={isOpening ? { 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              } : {}}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <p className="inner-title">You're Invited!</p>
              <p className="inner-subtitle">To Our Special Day</p>
              <div className="heart-icon">💕</div>
            </motion.div>
          </motion.div>
        </div>

        {/* Unlock Button */}
        {!isOpening && (
          <motion.button
            className="unlock-btn"
            onClick={handleOpen}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>✨ UNLOCK INVITATION</span>
          </motion.button>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default OpeningScreen
