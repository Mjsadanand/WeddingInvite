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

const MUSIC_URL = 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_85d0ce87f9.mp3?filename=romantic-wedding-piano-17311.mp3'

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
    if (!audioRef.current) {
      return
    }

    if (isMusicOn) {
      audioRef.current.pause()
      setIsMusicOn(false)
      return
    }

    audioRef.current.muted = false
    await audioRef.current.play()
    setIsMusicOn(true)
  }

  return (
    <section id={sectionId} className="hero section-shell parallax-layer">
      <audio ref={audioRef} src={MUSIC_URL} autoPlay muted loop preload="metadata" />

      <div className="petal-wrap" aria-hidden="true">
        {Array.from({ length: 12 }, (_, index) => (
          <span key={`petal-${index}`} className="petal" />
        ))}
      </div>

      <motion.p
        className="family-line"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.8 }}
      >
        Together with their families
      </motion.p>

      <motion.h1
        className="couple-names"
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1.1 }}
      >
        <span>{brideName}</span>
        <span className="heart">❤</span>
        <span>{groomName}</span>
      </motion.h1>

      <motion.p
        className="hero-subline shimmer"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 0.2 }}
      >
        Join us as two hearts become one in a celebration of love, tradition, and forever.
      </motion.p>

      <div className="countdown-grid">
        {countdownItems.map((item) => (
          <motion.div
            key={item.label}
            className="countdown-item"
            whileHover={{ y: -4, boxShadow: '0 0 24px rgba(255, 215, 0, 0.28)' }}
          >
            <strong>{String(item.value).padStart(2, '0')}</strong>
            <span>{item.label}</span>
          </motion.div>
        ))}
      </div>

      <button className="music-toggle" onClick={() => void toggleMusic()}>
        {isMusicOn ? 'Music: On' : 'Music: Off'}
      </button>
    </section>
  )
}

export default Hero
