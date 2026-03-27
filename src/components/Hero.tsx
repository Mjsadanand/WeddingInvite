import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'

type HeroProps = {
  sectionId: string
  weddingDate: string
  brideName: string
  groomName: string
}

type Countdown = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const MUSIC_URL = '/weddingmusic.mp3'

const getCountdown = (targetDate: string): Countdown => {
  const diff = new Date(targetDate).getTime() - Date.now()

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  const seconds = Math.floor(diff / 1000)
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
  }
}

function Hero({ sectionId, weddingDate, brideName, groomName }: HeroProps) {
  const [countdown, setCountdown] = useState<Countdown>(() => getCountdown(weddingDate))
  const [isMusicOn, setIsMusicOn] = useState(false)
  const [isAudioReady, setIsAudioReady] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown(getCountdown(weddingDate))
    }, 1000)

    return () => {
      window.clearInterval(timer)
    }
  }, [weddingDate])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleCanPlayThrough = () => {
      setIsAudioReady(true)
      // Autoplay with sound after audio is fully loaded
      audio.muted = false
      audio.play().catch(() => {
        // Browser blocked autoplay - user can click button instead
        setIsMusicOn(false)
      })
    }

    const handleError = () => {
      console.error('Error loading audio file')
      setIsAudioReady(false)
    }

    audio.addEventListener('canplaythrough', handleCanPlayThrough, { once: true })
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlayThrough)
      audio.removeEventListener('error', handleError)
    }
  }, [])

  useEffect(() => {
    const petals = gsap.utils.toArray<HTMLElement>('.petal')
    petals.forEach((petal, index) => {
      gsap.to(petal, {
        y: 90,
        x: index % 2 === 0 ? 20 : -20,
        repeat: -1,
        yoyo: true,
        duration: 3 + Math.random() * 2,
        ease: 'sine.inOut',
        delay: index * 0.15,
      })
    })

    return () => {
      petals.forEach((petal) => {
        gsap.killTweensOf(petal)
      })
    }
  }, [])

  const petals = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        id: `petal-${index}`,
        left: `${(index * 8) + 5}%`,
        // eslint-disable-next-line react-hooks/purity
        top: `${Math.random() * 80}%`,
        delay: `${index * 0.5}s`,
      })),
    [],
  )

  const countdownItems = useMemo(
    () => [
      { label: 'Days', value: countdown.days },
      { label: 'Hours', value: countdown.hours },
      { label: 'Minutes', value: countdown.minutes },
      { label: 'Seconds', value: countdown.seconds },
    ],
    [countdown],
  )

  const toggleMusic = async () => {
    if (!audioRef.current || !isAudioReady) {
      return
    }

    if (isMusicOn) {
      audioRef.current.pause()
      setIsMusicOn(false)
      return
    }

    try {
      await audioRef.current.play()
      setIsMusicOn(true)
    } catch (error) {
      console.error('Error playing audio:', error)
      setIsMusicOn(false)
    }
  }

  return (
    <section id={sectionId} className="hero section-shell">
      <audio 
        ref={audioRef} 
        src={MUSIC_URL} 
        loop 
        preload="auto"
        crossOrigin="anonymous"
      />

      <div className="petal-wrap" aria-hidden="true">
        {petals.map((petal) => (
          <span 
            key={petal.id} 
            className="petal" 
            style={{
              left: petal.left,
              top: petal.top,
              animationDelay: petal.delay
            }}
          />
        ))}
      </div>

      <div className="hero-content">
        <motion.div
          className="hero-badge"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="save-date-label">Save The Date</p>
          <div className="couple-names">
            <span className="groom-name script-font">{groomName.split(' ')[0]}</span>
            <span className="bride-name script-font">{brideName.split(' ')[0]}</span>
          </div>
          <div className="wedding-date-badge">
            <span>APRIL</span>
            <span className="date-number">13</span>
            <span>2026</span>
          </div>
        </motion.div>

        <motion.p
          className="hero-subline"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          Join us as two hearts become one in a celebration of love, tradition, and forever.
        </motion.p>

        <div className="countdown-grid">
          {countdownItems.map((item) => (
            <motion.div
              key={item.label}
              className="countdown-item"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <strong>{String(item.value).padStart(2, '0')}</strong>
              <span>{item.label}</span>
            </motion.div>
          ))}
        </div>

        <button 
          className="music-toggle" 
          onClick={() => void toggleMusic()}
          disabled={!isAudioReady}
          title={isAudioReady ? 'Toggle music' : 'Loading audio...'}
        >
          {!isAudioReady ? '⏳ Loading...' : isMusicOn ? '🔊 Music On' : '🔇 Music Off'}
        </button>
      </div>
    </section>
  )
}

export default Hero
