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
const DESTINATION = {
  name: 'Gurubhavan Kalyan Mantapa, Municipal Ground Road, Haveri',
  lat: 14.795,
  lng: 75.399,
}

type TabKey = 'home' | 'location' | 'gallery'
type IconComponent = (props: SVGProps<SVGSVGElement>) => ReactElement

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
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('home')
  const [images, setImages] = useState<GalleryImage[]>([])
  const [isLoadingImages, setIsLoadingImages] = useState(true)
  const [galleryError, setGalleryError] = useState<string | null>(null)
  const [isDeleteEnabled, setIsDeleteEnabled] = useState(false)
  const [adminNotice, setAdminNotice] = useState<string | null>(null)
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false)
  const [adminPasscodeInput, setAdminPasscodeInput] = useState('')
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const adminLongPressTimerRef = useRef<number | null>(null)

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

  const shareLink = useMemo(() => {
    const venue = `${DESTINATION.name} (${DESTINATION.lat}, ${DESTINATION.lng})`
    const message = `With the blessings of elders, we invite you to celebrate the wedding of Mr. Dayanand M and Ms. Shweta (Neha).\nDate: 13 April 2026, Muhurta around 12:38 PM\nReception: 12 April 2026, around 7:30 PM\nVenue: ${venue}\n${window.location.href}`
    return `https://wa.me/?text=${encodeURIComponent(message)}`
  }, [])

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
      {!isInviteOpen ? <OpeningScreen onOpenComplete={() => setIsInviteOpen(true)} /> : null}

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
          <Suspense fallback={<div className="page-loader">Loading page...</div>}>
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
                  brideName="Shweta (Neha)"
                  groomName="Dayanand M"
                />

                <section id="timeline" className="section-shell timeline-section">
                  <div className="section-container">
                    <Timeline />
                  </div>
                </section>

                <section id="events" className="section-shell events-section">
                  <div className="section-container">
                    <Events />
                  </div>
                </section>

                <section className="section-shell share-panel">
                  <div className="section-container">
                    <h3>Share The Invitation</h3>
                    <p>Send this wedding invite to your loved ones on WhatsApp.</p>
                    <a className="primary-btn whatsapp-btn" href={shareLink} target="_blank" rel="noreferrer">
                      Share on WhatsApp
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
                      venueName={DESTINATION.name}
                      lat={DESTINATION.lat}
                      lng={DESTINATION.lng}
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
                      <p className="gallery-subtitle">Share your favorite moments from the celebration</p>
                    </div>

                    {galleryError ? <p className="gallery-error">{galleryError}</p> : null}

                    {adminNotice ? <p className="gallery-info">{adminNotice}</p> : null}

                    <Gallery
                      images={images}
                      isLoading={isLoadingImages}
                      canDelete={isDeleteEnabled}
                      deletingImageId={deletingImageId}
                      onDeleteImage={handleDeleteImage}
                    />

                    <Upload
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

      {isAdminModalOpen ? (
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
        </div>
      ) : null}

      {/* Bottom Navigation for Mobile/Tablet - Outside wedding-app */}
      {isInviteOpen ? <BottomNav activeTab={activeTab} onTabChange={setActiveTab} /> : null}
    </>
  )
}

export default App
