/* eslint-disable react-hooks/purity */
import { useEffect, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Confetti from 'react-confetti'
import { useSpring, animated, config } from '@react-spring/web'

type OpeningScreenProps = {
  onOpenComplete: () => void
}

function OpeningScreen({ onOpenComplete }: OpeningScreenProps) {
  const [isOpening, setIsOpening] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([])

  // Window size for confetti
  useEffect(() => {
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Sparkle animation
  useEffect(() => {
    const interval = setInterval(() => {
      setSparkles(prev => [
        ...prev.slice(-20),
        {
          id: Date.now(),
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight
        }
      ])
    }, 300)
    return () => clearInterval(interval)
  }, [])

  // Preload audio
  useEffect(() => {
    const preloader = new Audio('/weddingmusic.mp3')
    preloader.preload = 'auto'
    preloader.load()
    return () => {
      preloader.src = ''
    }
  }, [])

  // Spring animations
  const backgroundSpring = useSpring({
    background: isOpening 
      ? 'linear-gradient(135deg, #fff5f8 0%, #ffe4ec 50%, #ffd1dc 100%)'
      : 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 50%, #f48fb1 100%)',
    config: config.slow
  })

  const titleSpring = useSpring({
    transform: isOpening ? 'scale(1.2) rotate(2deg)' : 'scale(1) rotate(0deg)',
    opacity: isOpening ? 1 : 0.9,
    config: config.wobbly
  })

  const handleOpen = useCallback(() => {
    setIsOpening(true)
    setShowConfetti(true)
    
    // Stop confetti after 3 seconds
    setTimeout(() => setShowConfetti(false), 3000)
    
    // Complete opening after animation
    setTimeout(onOpenComplete, 2500)
  }, [onOpenComplete])

  return (
    <AnimatePresence>
      <animated.div
        className="opening-overlay-new"
        style={backgroundSpring}
      >
        {/* Confetti Effect */}
        {showConfetti && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            numberOfPieces={200}
            recycle={false}
            gravity={0.3}
            colors={['#e91e63', '#ff6b9d', '#fff', '#ffd700', '#ff6b35']}
          />
        )}

        {/* Floating Sparkles */}
        <div className="sparkles-container">
          {sparkles.map(sparkle => (
            <motion.div
              key={sparkle.id}
              className="sparkle"
              initial={{ 
                x: sparkle.x, 
                y: sparkle.y, 
                scale: 0, 
                opacity: 0 
              }}
              animate={{ 
                scale: [0, 1, 0], 
                opacity: [0, 1, 0],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 2, ease: 'easeOut' }}
            />
          ))}
        </div>

        {/* Floating Hearts */}
        <div className="hearts-container">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="floating-heart"
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 50,
                scale: 0
              }}
              animate={{
                y: -100,
                scale: [0, 1, 0.8, 0],
                rotate: [0, 360]
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                delay: i * 0.5,
                repeat: Infinity,
                repeatDelay: 3
              }}
            >
              💖
            </motion.div>
          ))}
        </div>

        <motion.div
          className="opening-content"
          initial={false}
          animate={{
            x: isOpening ? '-110vw' : '0vw',
            opacity: isOpening ? 0.96 : 1
          }}
          transition={{ duration: 1.1, ease: 'easeInOut' }}
        >
          {/* Main Wedding Card */}
          <motion.div
            className="wedding-invitation-card"
            initial={{ scale: 0.8, opacity: 0, rotateY: -15 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          >
            {/* Decorative Border */}
            <div className="card-border">
              <div className="border-corner border-top-left" />
              <div className="border-corner border-top-right" />
              <div className="border-corner border-bottom-left" />
              <div className="border-corner border-bottom-right" />
            </div>

            {/* Card Content */}
            <div className="card-content">
              {/* Header Ornament */}
              <motion.div
                className="header-ornament"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                ✨💍✨
              </motion.div>

              {/* Main Title */}
              <animated.div style={titleSpring}>
                <motion.h1
                  className="invitation-title"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  You're  Invited
                </motion.h1>
              </animated.div>

              {/* Subtitle */}
              <motion.p
                className="invitation-subtitle"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                To Celebrate Our Special Day
              </motion.p>

              {/* Decorative Divider */}
              <motion.div
                className="divider"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.9, duration: 0.8 }}
              />

              {/* Wedding Rings Animation */}
              <motion.div
                className="rings-animation"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.1, duration: 0.6, type: 'spring' }}
              >
                <motion.div
                  className="ring ring-1"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                  className="ring ring-2"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                />
              </motion.div>

              {/* Love Message */}
              <motion.div
                className="love-message"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.8 }}
              >
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  💕
                </motion.span>
                <span>With Love & Joy</span>
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                >
                  💕
                </motion.span>
              </motion.div>
            </div>
          </motion.div>

          {/* Open Invitation Button */}
          <motion.button
            className="open-invitation-btn"
            onClick={handleOpen}
            disabled={isOpening}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{
              opacity: isOpening ? 0 : 1,
              y: isOpening ? 30 : 0,
              scale: isOpening ? 0.96 : 1
            }}
            transition={{ delay: isOpening ? 0 : 1.5, duration: 0.8, type: 'spring' }}
            whileHover={{
              scale: 1.05,
              y: -5,
              boxShadow: '0 20px 40px rgba(233, 30, 99, 0.3)'
            }}
            whileTap={{ scale: 0.95 }}
            style={{ pointerEvents: isOpening ? 'none' : 'auto' }}
          >
            <motion.span
              animate={{
                textShadow: [
                  '0 0 0px rgba(233, 30, 99, 0)',
                  '0 0 10px rgba(233, 30, 99, 0.5)',
                  '0 0 0px rgba(233, 30, 99, 0)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              OPEN INVITATION
            </motion.span>
          </motion.button>
        </motion.div>

        {/* Opening Animation Overlay */}
        {isOpening && (
          <motion.div
            className="opening-animation"
            initial={{ opacity: 0, x: '100vw' }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.85, ease: 'easeInOut' }}
          >
            <motion.div
              className="opening-text"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1, type: 'spring', bounce: 0.6 }}
            >
              <h2>Welcome!</h2>
              <p>Preparing your invitation...</p>
              <motion.div
                className="loading-hearts"
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                🎀🎁🎀
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </animated.div>
    </AnimatePresence>
  )
}

export default OpeningScreen
