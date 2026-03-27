import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useState, useRef } from 'react'
import type { GalleryImage } from '../utils/supabaseClient'

type GalleryProps = {
  images: GalleryImage[]
  isLoading: boolean
  canDelete: boolean
  deletingImageId: string | null
  onDeleteImage: (imageId: string) => void
}

function Gallery({ images, isLoading, canDelete, deletingImageId, onDeleteImage }: GalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [imageZoom, setImageZoom] = useState(1)
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)
  const lastTouchDistance = useRef<number>(0)
  const lastTapTime = useRef<number>(0)
  const lightboxImageRef = useRef<HTMLImageElement>(null)

  const closeViewer = useCallback(() => {
    setActiveIndex(null)
    setImageZoom(1)
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

  const getDistance = (touch1: Touch | React.Touch, touch2: Touch | React.Touch) => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const handleDoubleTap = useCallback(() => {
    if (imageZoom > 1) {
      setImageZoom(1)
    } else {
      setImageZoom(2.5)
    }
  }, [imageZoom])

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch start
      lastTouchDistance.current = getDistance(e.touches[0], e.touches[1])
      return
    }

    // Single touch or double tap
    touchStartX.current = e.touches[0].clientX
    const now = Date.now()
    if (now - lastTapTime.current < 300) {
      handleDoubleTap()
    }
    lastTapTime.current = now
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch zoom
      const distance = getDistance(e.touches[0], e.touches[1])
      if (lastTouchDistance.current > 0) {
        const ratio = distance / lastTouchDistance.current
        setImageZoom((prev) => Math.max(1, Math.min(5, prev * ratio)))
      }
      lastTouchDistance.current = distance
      return
    }

    // Single touch swipe
    if (imageZoom === 1) {
      touchEndX.current = e.touches[0].clientX
    }
  }

  const handleTouchEnd = () => {
    lastTouchDistance.current = 0

    if (imageZoom > 1) {
      return
    }

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
      document.body.classList.remove('lightbox-open')
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
    document.body.classList.add('lightbox-open')
    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      document.body.classList.remove('lightbox-open')
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
            {canDelete ? (
              <button
                type="button"
                className="gallery-delete-btn"
                onClick={(event) => {
                  event.stopPropagation()
                  onDeleteImage(image.id)
                }}
                disabled={deletingImageId === image.id}
                aria-label="Delete image"
                title="Delete photo"
              >
                {deletingImageId === image.id ? 'Deleting...' : 'Delete'}
              </button>
            ) : null}

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
                ref={lightboxImageRef}
                src={activeImage.image_url}
                alt="Wedding memory preview"
                className="lightbox-image"
                style={{ transform: `scale(${imageZoom})` }}
              />
            </motion.div>

            {images.length > 1 ? (
              <div className="lightbox-counter">
                {(activeIndex ?? 0) + 1} / {images.length}
              </div>
            ) : null}

            {canDelete ? (
              <button
                type="button"
                className="lightbox-delete-btn"
                onClick={(event) => {
                  event.stopPropagation()
                  if (!activeImage) {
                    return
                  }
                  onDeleteImage(activeImage.id)
                  closeViewer()
                }}
                disabled={activeImage ? deletingImageId === activeImage.id : false}
              >
                {activeImage && deletingImageId === activeImage.id ? 'Deleting...' : 'Delete Photo'}
              </button>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}

export default Gallery
