import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type SVGProps,
} from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import OpeningScreen from './components/OpeningScreen'
import BottomNav from './components/BottomNav'
import {
  deleteGalleryImage,
  fetchWeddingImages,
  isSupabaseConfigured,
  subscribeToGallery,
  type GalleryImage,
} from './utils/supabaseClient'

const Hero = lazy(() => import('./components/Hero'))
const Timeline = lazy(() => import('./components/Timeline'))
const Events = lazy(() => import('./components/Events'))
const Location = lazy(() => import('./components/Location'))
const Upload = lazy(() => import('./components/Upload'))
const Gallery = lazy(() => import('./components/Gallery'))

gsap.registerPlugin(ScrollTrigger)

const WEDDING_DATE = '2026-04-13T12:38:00+05:30'
const INVITE_OPENED_STORAGE_KEY = 'wedding_invite_opened'
const LANGUAGE_STORAGE_KEY = 'wedding_language'
const DESTINATION = {
  nameEn: 'Gurubhavan Kalyan Mantapa, Municipal Ground Road, Haveri',
  nameKn: 'ಗುರುಭವನ ಕಲ್ಯಾಣ ಮಂಟಪ, ಮ್ಯೂನಿಸಿಪಲ್ ಗ್ರೌಂಡ್ ರಸ್ತೆ, ಹಾವೇರಿ',
  lat: 14.795,
  lng: 75.399,
}

type TabKey = 'home' | 'location' | 'gallery'
type Language = 'en' | 'kn'
type IconComponent = (props: SVGProps<SVGSVGElement>) => ReactElement

type SkeletonBlockProps = {
  className?: string
}

function SkeletonBlock({ className = '' }: SkeletonBlockProps) {
  return <div className={`skeleton-block ${className}`.trim()} aria-hidden="true" />
}

type PageSkeletonProps = {
  tab: TabKey
}

function PageSkeleton({ tab }: PageSkeletonProps) {
  if (tab === 'location') {
    return (
      <div className="skeleton-page" aria-label="Loading location section">
        <section className="section-shell">
          <div className="section-container skeleton-stack">
            <SkeletonBlock className="skeleton-title" />
            <SkeletonBlock className="skeleton-line skeleton-line-medium" />
            <SkeletonBlock className="skeleton-map" />
            <div className="skeleton-row">
              <SkeletonBlock className="skeleton-chip" />
              <SkeletonBlock className="skeleton-chip" />
              <SkeletonBlock className="skeleton-chip" />
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (tab === 'gallery') {
    return (
      <div className="skeleton-page" aria-label="Loading gallery section">
        <section className="section-shell">
          <div className="section-container skeleton-stack">
            <SkeletonBlock className="skeleton-title" />
            <SkeletonBlock className="skeleton-line" />
            <div className="skeleton-gallery-grid">
              {Array.from({ length: 6 }, (_, index) => (
                <SkeletonBlock key={`gallery-skeleton-${index}`} className="skeleton-gallery-tile" />
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="skeleton-page" aria-label="Loading home section">
      <section className="section-shell">
        <div className="section-container skeleton-stack">
          <SkeletonBlock className="skeleton-hero" />
          <SkeletonBlock className="skeleton-title" />
          <SkeletonBlock className="skeleton-line" />
          <SkeletonBlock className="skeleton-line skeleton-line-short" />
          <div className="skeleton-events-grid">
            {Array.from({ length: 3 }, (_, index) => (
              <SkeletonBlock key={`events-skeleton-${index}`} className="skeleton-event-card" />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" {...props}>
      <path d="M3 10.5L12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 9.8V20h11V9.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LocationIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" {...props}>
      <path
        d="M12 21s6.2-5.73 6.2-11A6.2 6.2 0 0 0 5.8 10c0 5.27 6.2 11 6.2 11Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.2" />
    </svg>
  )
}

function GalleryIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" {...props}>
      <rect x="3.2" y="4" width="17.6" height="16" rx="2.4" />
      <circle cx="9" cy="10" r="1.4" />
      <path d="M20.8 16.2l-4.7-4.5-4.6 4-2.6-2.3-5.6 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function App() {
  const deletePasscode = import.meta.env.VITE_DELETE_PASSCODE as string | undefined
  const [isInviteOpen, setIsInviteOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return window.localStorage.getItem(INVITE_OPENED_STORAGE_KEY) === 'true'
  })
  const [activeTab, setActiveTab] = useState<TabKey>('home')
  const [images, setImages] = useState<GalleryImage[]>([])
  const [isLoadingImages, setIsLoadingImages] = useState(true)
  const [galleryError, setGalleryError] = useState<string | null>(null)
  const [isDeleteEnabled, setIsDeleteEnabled] = useState(false)
  const [adminNotice, setAdminNotice] = useState<string | null>(null)
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false)
  const [adminPasscodeInput, setAdminPasscodeInput] = useState('')
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null)
  const [isMusicOn, setIsMusicOn] = useState(false)
  const [isAudioReady, setIsAudioReady] = useState(false)
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === 'undefined') {
      return 'kn'
    }

    const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    return savedLanguage === 'en' ? 'en' : 'kn'
  })
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const adminLongPressTimerRef = useRef<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const hasTriedAutoplayRef = useRef(false)

  const attemptAutoplay = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) {
      return
    }

    try {
      audio.muted = false
      await audio.play()
      setIsMusicOn(true)
    } catch {
      setIsMusicOn(false)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  }, [language])

  const loadImages = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setIsLoadingImages(false)
      setGalleryError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
      return
    }

    setIsLoadingImages(true)
    setGalleryError(null)

    try {
      const data = await fetchWeddingImages()
      setImages(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to fetch images right now.'
      setGalleryError(message)
    } finally {
      setIsLoadingImages(false)
    }
  }, [])

  useEffect(() => {
    void loadImages()
  }, [loadImages])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return undefined
    }

    const subscription = subscribeToGallery(() => {
      void loadImages()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [loadImages])

  const clearAdminLongPressTimer = useCallback(() => {
    if (adminLongPressTimerRef.current !== null) {
      window.clearTimeout(adminLongPressTimerRef.current)
      adminLongPressTimerRef.current = null
    }
  }, [])

  const requestAdminDeleteAccess = useCallback(() => {
    if (isDeleteEnabled) {
      setIsDeleteEnabled(false)
      setAdminNotice('Admin mode disabled.')
      return
    }

    if (!deletePasscode) {
      setAdminNotice('Delete passcode is not configured. Set VITE_DELETE_PASSCODE in your .env file.')
      return
    }

    setAdminPasscodeInput('')
    setIsAdminModalOpen(true)
  }, [deletePasscode, isDeleteEnabled])

  const closeAdminModal = useCallback(() => {
    setIsAdminModalOpen(false)
    setAdminPasscodeInput('')
  }, [])

  const submitAdminPasscode = useCallback(() => {
    if (!deletePasscode) {
      setAdminNotice('Delete passcode is not configured. Set VITE_DELETE_PASSCODE in your .env file.')
      closeAdminModal()
      return
    }

    if (adminPasscodeInput.trim() === deletePasscode.trim()) {
      setIsDeleteEnabled(true)
      setAdminNotice('Admin mode enabled for this session.')
      closeAdminModal()
      return
    }

    setAdminNotice('Incorrect admin passcode.')
  }, [adminPasscodeInput, closeAdminModal, deletePasscode])

  const handleGalleryTitlePressStart = useCallback(() => {
    clearAdminLongPressTimer()
    adminLongPressTimerRef.current = window.setTimeout(() => {
      requestAdminDeleteAccess()
    }, 700)
  }, [clearAdminLongPressTimer, requestAdminDeleteAccess])

  const handleGalleryTitlePressEnd = useCallback(() => {
    clearAdminLongPressTimer()
  }, [clearAdminLongPressTimer])

  const handleDeleteImage = useCallback(async (imageId: string) => {
    if (!isDeleteEnabled) {
      return
    }

    setDeletingImageId(imageId)
    setGalleryError(null)

    try {
      await deleteGalleryImage(imageId)
      setImages((previous) => previous.filter((image) => image.id !== imageId))
      void loadImages()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to delete image right now.'
      setGalleryError(message)
    } finally {
      setDeletingImageId(null)
    }
  }, [isDeleteEnabled, loadImages])

  useEffect(() => {
    if (!isInviteOpen) {
      return undefined
    }

    const sections = gsap.utils.toArray<HTMLElement>('.section-shell')
    const animations = sections.map((section) =>
      gsap.fromTo(
        section,
        { autoAlpha: 0, y: 50 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
          },
        },
      ),
    )

    const parallaxLayers = gsap.utils.toArray<HTMLElement>('.parallax-layer')
    const parallaxTweens = parallaxLayers.map((layer) =>
      gsap.to(layer, {
        yPercent: -12,
        ease: 'none',
        scrollTrigger: {
          trigger: layer,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      }),
    )

    return () => {
      animations.forEach((animation) => animation.kill())
      parallaxTweens.forEach((tween) => tween.kill())
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [activeTab, isInviteOpen])

  useEffect(() => {
    return () => {
      clearAdminLongPressTimer()
    }
  }, [clearAdminLongPressTimer])

  useEffect(() => {
    if (!isAdminModalOpen) {
      return undefined
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAdminModal()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [closeAdminModal, isAdminModalOpen])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleCanPlayThrough = () => {
      setIsAudioReady(true)

      if (isInviteOpen && !hasTriedAutoplayRef.current) {
        hasTriedAutoplayRef.current = true
        void attemptAutoplay()
      }
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
  }, [attemptAutoplay, isInviteOpen])

  const toggleMusic = useCallback(async () => {
    if (!audioRef.current || !isAudioReady) return

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
  }, [isMusicOn, isAudioReady])

  const handleOpenComplete = useCallback(() => {
    setIsInviteOpen(true)
    window.localStorage.setItem(INVITE_OPENED_STORAGE_KEY, 'true')

    if (!hasTriedAutoplayRef.current) {
      hasTriedAutoplayRef.current = true
      void attemptAutoplay()
    }
  }, [attemptAutoplay])

  const shareLink = useMemo(() => {
    const venueName = language === 'kn' ? DESTINATION.nameKn : DESTINATION.nameEn
    const venue = `${venueName} (${DESTINATION.lat}, ${DESTINATION.lng})`
    const message =
      language === 'kn'
        ? `ಹಿರಿಯರ ಆಶೀರ್ವಾದದಿಂದ, ಶ್ರೀ ದಯಾನಂದ ಎಂ ಮತ್ತು ಶ್ರೀಮತಿ ಶ್ವೇತಾ (ನೇಹಾ) ಅವರ ವಿವಾಹಕ್ಕೆ ಆತ್ಮೀಯ ಆಹ್ವಾನ.\nದಿನಾಂಕ: 13 ಏಪ್ರಿಲ್ 2026, ಮುಹೂರ್ತ ಸುಮಾರು ಮಧ್ಯಾಹ್ನ 12:38\nರಿಸೆಪ್ಷನ್: 12 ಏಪ್ರಿಲ್ 2026, ಸಂಜೆ ಸುಮಾರು 7:30\nಸ್ಥಳ: ${venue}\n${window.location.href}`
        : `With the blessings of elders, we invite you to celebrate the wedding of Mr. Dayanand M and Ms. Shweta (Neha).\nDate: 13 April 2026, Muhurta around 12:38 PM\nReception: 12 April 2026, around 7:30 PM\nVenue: ${venue}\n${window.location.href}`
    return `https://wa.me/?text=${encodeURIComponent(message)}`
  }, [language])

  const languageFabLabel = language === 'kn' ? 'ಭಾಷೆ: ಕನ್ನಡ' : 'Language: English'
  const brideName = language === 'kn' ? 'ಶ್ವೇತಾ (ನೇಹಾ)' : 'Shweta (Neha)'
  const groomName = language === 'kn' ? 'ದಯಾನಂದ ಎಂ' : 'Dayanand M'
  const venueName = language === 'kn' ? DESTINATION.nameKn : DESTINATION.nameEn

  const tabs: Array<{ key: TabKey; label: string; icon: IconComponent }> = [
    { key: 'home', label: 'Home', icon: HomeIcon },
    { key: 'location', label: 'Location', icon: LocationIcon },
    { key: 'gallery', label: 'Gallery', icon: GalleryIcon },
  ]

  const handleTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    const touch = event.touches[0]
    touchStartX.current = touch.clientX
    touchStartY.current = touch.clientY
  }

  const handleTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null || touchStartY.current === null) {
      return
    }

    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - touchStartX.current
    const deltaY = touch.clientY - touchStartY.current

    touchStartX.current = null
    touchStartY.current = null

    if (Math.abs(deltaX) < 55 || Math.abs(deltaX) < Math.abs(deltaY)) {
      return
    }

    const currentIndex = tabs.findIndex((tab) => tab.key === activeTab)
    if (currentIndex === -1) {
      return
    }

    if (deltaX < 0 && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].key)
    }

    if (deltaX > 0 && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].key)
    }
  }

  return (
    <>
      {!isInviteOpen ? <OpeningScreen onOpenComplete={handleOpenComplete} /> : null}

      <div className={`wedding-app ${isInviteOpen ? 'show-content' : 'hide-content'}`}>
        {/* Top Navigation */}
        <nav className="top-nav">
          <div className="nav-container">
            <ul className="nav-menu">
              {tabs.map((tab) => (
                <li key={tab.key}>
                  <button
                    className={`nav-link ${activeTab === tab.key ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <main className="page-shell" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <Suspense fallback={<PageSkeleton tab={activeTab} />}>
            <AnimatePresence mode="wait">
            {activeTab === 'home' ? (
              <motion.div
                key="home"
                className="tab-page"
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              >
                <Hero
                  sectionId="hero"
                  weddingDate={WEDDING_DATE}
                  brideName={brideName}
                  groomName={groomName}
                  language={language}
                />

                <section id="timeline" className="section-shell timeline-section">
                  <div className="section-container">
                    <Timeline language={language} />
                  </div>
                </section>

                <section id="events" className="section-shell events-section">
                  <div className="section-container">
                    <Events language={language} />
                  </div>
                </section>

                <section className="section-shell share-panel">
                  <div className="section-container">
                    <h3>Share The Invitation</h3>
                    <p>
                      {language === 'kn'
                        ? 'ಈ ವಿವಾಹ ಆಹ್ವಾನವನ್ನು ನಿಮ್ಮ ಕುಟುಂಬದವರು ಮತ್ತು ಸ್ನೇಹಿತರೊಂದಿಗೆ WhatsApp ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ.'
                        : 'Send this wedding invite to your loved ones on WhatsApp.'}
                    </p>
                    <a className="primary-btn whatsapp-btn" href={shareLink} target="_blank" rel="noreferrer">
                      {language === 'kn' ? 'WhatsApp ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ' : 'Share on WhatsApp'}
                    </a>
                  </div>
                </section>
              </motion.div>
            ) : null}

            {activeTab === 'location' ? (
              <motion.div
                key="location"
                className="tab-page"
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              >
                <section id="details" className="section-shell location-section">
                  <div className="section-container">
                    <Location
                      weddingDate="13 April 2026"
                      weddingTime="Muhurta around 12:38 PM"
                      venueName={venueName}
                      lat={DESTINATION.lat}
                      lng={DESTINATION.lng}
                      language={language}
                    />
                  </div>
                </section>
              </motion.div>
            ) : null}

            {activeTab === 'gallery' ? (
              <motion.div
                key="gallery"
                className="tab-page"
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              >
                <section id="gallery" className="section-shell gallery-section">
                  <div className="section-container">
                    <div className="gallery-header">
                      <p className="section-label">Photography</p>
                      <h2
                        className="gallery-title-admin"
                        onTouchStart={handleGalleryTitlePressStart}
                        onTouchEnd={handleGalleryTitlePressEnd}
                        onTouchCancel={handleGalleryTitlePressEnd}
                        onMouseDown={handleGalleryTitlePressStart}
                        onMouseUp={handleGalleryTitlePressEnd}
                        onMouseLeave={handleGalleryTitlePressEnd}
                      >
                        Captured Moments
                      </h2>
                      <p className="gallery-subtitle">
                        {language === 'kn'
                          ? 'ಕಾರ್ಯಕ್ರಮದ ನಿಮ್ಮ ಮೆಚ್ಚಿನ ಕ್ಷಣಗಳನ್ನು ಇಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ'
                          : 'Share your favorite moments from the celebration'}
                      </p>
                    </div>

                    {galleryError ? <p className="gallery-error">{galleryError}</p> : null}

                    {adminNotice ? <p className="gallery-info">{adminNotice}</p> : null}

                    <Gallery
                      images={images}
                      isLoading={isLoadingImages}
                      canDelete={isDeleteEnabled}
                      deletingImageId={deletingImageId}
                      onDeleteImage={handleDeleteImage}
                      language={language}
                    />

                    <Upload
                      language={language}
                      onUploadSuccess={(newImage) => {
                        setImages((previous) => [newImage, ...previous])
                      }}
                    />
                  </div>
                </section>
              </motion.div>
            ) : null}
            </AnimatePresence>
          </Suspense>
        </main>

        {/* Bottom Navigation for Mobile/Tablet */}
      </div>

      {isAdminModalOpen && typeof document !== 'undefined'
        ? createPortal(
            <div className="admin-modal-overlay" onClick={closeAdminModal}>
              <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
                <button className="modal-close" onClick={closeAdminModal}>
                  ×
                </button>

                <h3>Admin Access</h3>
                <p>Enter passcode to enable delete options</p>

                <div className="preview-card">
                  <input
                    type="password"
                    value={adminPasscodeInput}
                    onChange={(event) => setAdminPasscodeInput(event.target.value)}
                    placeholder="Enter admin passcode"
                    className="upload-passcode-input"
                    autoFocus
                  />

                  <button
                    className="primary-btn"
                    onClick={submitAdminPasscode}
                    disabled={!adminPasscodeInput.trim()}
                  >
                    Enable Delete Mode
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      {/* Bottom Navigation for Mobile/Tablet - Outside wedding-app */}
      {isInviteOpen ? <BottomNav activeTab={activeTab} onTabChange={setActiveTab} /> : null}

      {isInviteOpen && activeTab !== 'gallery' ? (
        <button
          className={`language-fab ${activeTab === 'home' ? 'above-music' : ''}`}
          onClick={() => setLanguage((previous) => (previous === 'en' ? 'kn' : 'en'))}
          title={language === 'kn' ? 'Switch to English' : 'ಕನ್ನಡಕ್ಕೆ ಬದಲಿಸಿ'}
          aria-label={language === 'kn' ? 'Switch language to English' : 'Switch language to Kannada'}
        >
          <span className="language-fab-code">{language === 'kn' ? 'EN' : 'ಕನ್ನಡ'}</span>
          <span className="language-fab-label">{languageFabLabel}</span>
        </button>
      ) : null}

      {/* Audio Element for Background Music */}
      <audio ref={audioRef} src="/weddingmusic.mp3" autoPlay loop preload="auto" crossOrigin="anonymous" />

      {/* Music FAB Button - Global Control */}
      {isInviteOpen && activeTab === 'home' ? (
        <button
          className="music-fab"
          onClick={() => void toggleMusic()}
          disabled={!isAudioReady}
          title={isMusicOn ? 'Mute Music' : 'Play Music'}
        >
          <svg className="speaker-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isMusicOn ? (
              <>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.5 8.5a4 4 0 0 1 0 7M19 4a8 8 0 0 1 0 16" strokeLinecap="round" strokeLinejoin="round" />
              </>
            ) : (
              <>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="17" y1="9" x2="23" y2="15" strokeLinecap="round" strokeLinejoin="round" />
              </>
            )}
          </svg>
        </button>
      ) : null}
    </>
  )
}

export default App
