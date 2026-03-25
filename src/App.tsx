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
import {
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
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('home')
  const [images, setImages] = useState<GalleryImage[]>([])
  const [isLoadingImages, setIsLoadingImages] = useState(true)
  const [galleryError, setGalleryError] = useState<string | null>(null)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

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

                <section id="timeline" className="section-shell section-frame">
                  <Timeline />
                </section>

                <section id="events" className="section-shell section-frame parallax-layer">
                  <Events />
                </section>

                <section className="section-shell section-frame share-panel">
                  <h3>Share The Invitation</h3>
                  <p>Send this wedding invite to your loved ones on WhatsApp.</p>
                  <a className="gold-btn whatsapp-btn" href={shareLink} target="_blank" rel="noreferrer">
                    Share on WhatsApp
                  </a>
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
                <section id="details" className="section-shell section-frame parallax-layer location-page">
                  <Location
                    weddingDate="13 April 2026"
                    weddingTime="Muhurta around 12:38 PM"
                    venueName={DESTINATION.name}
                    lat={DESTINATION.lat}
                    lng={DESTINATION.lng}
                  />
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
                <section id="gallery" className="section-shell section-frame gallery-page">
                  <Upload
                    onUploadSuccess={(newImage) => {
                      setImages((previous) => [newImage, ...previous])
                    }}
                  />

                  {galleryError ? <p className="gallery-error">{galleryError}</p> : null}

                  <Gallery images={images} isLoading={isLoadingImages} />
                </section>
              </motion.div>
            ) : null}
            </AnimatePresence>
          </Suspense>
        </main>

        <nav className="bottom-nav" aria-label="Main navigation">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key

            return (
              <button
                key={tab.key}
                type="button"
                className={`nav-icon-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
                aria-label={tab.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="nav-icon" aria-hidden="true" />
              </button>
            )
          })}
        </nav>
      </div>
    </>
  )
}

export default App
