import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useState, useRef } from 'react'
import type { GalleryImage } from '../utils/supabaseClient'

type GalleryProps = {
  images: GalleryImage[]
  isLoading: boolean
}

function Gallery({ images, isLoading }: GalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)

  const closeViewer = useCallback(() => {
    setActiveIndex(null)
  }, [])

  const openViewer = (index: number) => {
    setActiveIndex(index)
  }

  const showNext = useCallback(() => {
    if (images.length === 0) {
      return
    }

    setActiveIndex((previous) => {
      if (previous === null) {
        return null
      }

      return (previous + 1) % images.length
    })
  }, [images.length])

  const showPrevious = useCallback(() => {
    if (images.length === 0) {
      return
    }

    setActiveIndex((previous) => {
      if (previous === null) {
        return null
      }

      return (previous - 1 + images.length) % images.length
    })
  }, [images.length])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const swipeThreshold = 50
    const diff = touchStartX.current - touchEndX.current

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        showNext()
      } else {
        showPrevious()
      }
    }
  }

  const activeImage = activeIndex !== null ? images[activeIndex] : undefined

  useEffect(() => {
    if (activeIndex === null) {
      return undefined
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeViewer()
      }

      if (event.key === 'ArrowRight') {
        showNext()
      }

      if (event.key === 'ArrowLeft') {
        showPrevious()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [activeIndex, closeViewer, images.length, showNext, showPrevious])

  if (isLoading) {
    return <p className="gallery-info">Loading gallery...</p>
  }

  if (images.length === 0) {
    return <p className="gallery-info">No images uploaded yet. Be the first to share a memory.</p>
  }

  return (
    <>
      <div className="gallery-grid">
        {images.map((image, index) => (
          <motion.figure
            key={image.id}
            className="gallery-item"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, delay: Math.min(index * 0.03, 0.18) }}
          >
            <button
              type="button"
              className="gallery-item-btn"
              onClick={() => openViewer(index)}
              aria-label="Open image preview"
            >
              <img src={image.image_url} alt="Wedding memory" loading="lazy" decoding="async" />
            </button>
          </motion.figure>
        ))}
      </div>

      <AnimatePresence>
        {activeImage ? (
          <motion.div
            className="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeViewer}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <button type="button" className="lightbox-close" onClick={closeViewer} aria-label="Close preview">
              ×
            </button>

            <motion.div
              className="lightbox-content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
            >
              <img
                src={activeImage.image_url}
                alt="Wedding memory preview"
                className="lightbox-image"
              />
            </motion.div>

            {images.length > 1 ? (
              <div className="lightbox-counter">
                {(activeIndex ?? 0) + 1} / {images.length}
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}

export default Gallery
