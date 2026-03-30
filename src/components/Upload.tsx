import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { uploadToCloudinary } from '../utils/cloudinaryClient'
import { optimizeImageForUpload } from '../utils/imageOptimization'
import { isSupabaseConfigured, saveGalleryImageUrl, type GalleryImage } from '../utils/supabaseClient'

type UploadProps = {
  onUploadSuccess: (image: GalleryImage) => void
  language: 'en' | 'kn'
}

function Upload({ onUploadSuccess, language }: UploadProps) {
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined
  const requiredPasscode = import.meta.env.VITE_UPLOAD_PASSCODE as string | undefined
  // Keep passcode flow in code for quick re-enable later.
  const isPasscodeEnabled = false
  const [selectedCount, setSelectedCount] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTriggerHidden, setIsTriggerHidden] = useState(false)
  const [passcode, setPasscode] = useState<string>('')
  const [isPasscodeVerified, setIsPasscodeVerified] = useState<boolean>(!isPasscodeEnabled)
  const selectionVersionRef = useRef(0)
  const lastScrollYRef = useRef(0)

  const isConfigured = Boolean(
    uploadPreset && isSupabaseConfigured && (!isPasscodeEnabled || requiredPasscode),
  )

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0 || !uploadPreset) {
      return
    }

    setIsUploading(true)
    setError(null)
    setSelectedCount(files.length)

    try {
      const uploadResults = await Promise.allSettled(
        files.map(async (file) => {
          const cloudinaryResult = await uploadToCloudinary(file, uploadPreset)
          return saveGalleryImageUrl(cloudinaryResult.secure_url)
        }),
      )

      const successfulUploads = uploadResults.filter(
        (result): result is PromiseFulfilledResult<GalleryImage> => result.status === 'fulfilled',
      )
      const failedCount = uploadResults.length - successfulUploads.length

      successfulUploads.forEach((result) => onUploadSuccess(result.value))

      if (failedCount > 0) {
        setError(
          `Uploaded ${successfulUploads.length} image(s). ${failedCount} failed. Please retry remaining files.`,
        )
      } else {
        setSelectedCount(0)
        setIsModalOpen(false)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed. Please try again.'
      setError(message)
    } finally {
      setIsUploading(false)
    }
  }

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    const selectionVersion = ++selectionVersionRef.current
    setError(null)

    if (files.length === 0) {
      setSelectedCount(0)
      setIsOptimizing(false)
      event.target.value = ''
      return
    }

    setIsOptimizing(true)

    try {
      const optimizedFiles = await Promise.all(files.map((file) => optimizeImageForUpload(file)))

      if (selectionVersionRef.current !== selectionVersion) {
        return
      }

      await uploadFiles(optimizedFiles)
    } catch {
      if (selectionVersionRef.current !== selectionVersion) {
        return
      }

      setError('Some images could not be optimized. Uploading original files instead.')
      await uploadFiles(files)
    } finally {
      if (selectionVersionRef.current === selectionVersion) {
        setIsOptimizing(false)
      }
      event.target.value = ''
    }
  }

  const handlePasscodeSubmit = () => {
    if (!requiredPasscode) {
      setError('Upload passcode is not configured. Set VITE_UPLOAD_PASSCODE in your .env file.')
      return
    }

    if (passcode === requiredPasscode) {
      setIsPasscodeVerified(true)
      setError(null)
    } else {
      setError(language === 'kn' ? 'ತಪ್ಪಾದ ಪಾಸ್‌ಕೋಡ್. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.' : 'Invalid passcode. Please try again.')
      setPasscode('')
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedCount(0)
    setIsOptimizing(false)
    setError(null)
    setPasscode('')
    setIsPasscodeVerified(!isPasscodeEnabled)
  }

  useEffect(() => {
    if (!isModalOpen) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isModalOpen])

  useEffect(() => {
    setIsTriggerHidden(false)
    lastScrollYRef.current = window.scrollY

    const onScroll = () => {
      const currentY = window.scrollY
      const delta = currentY - lastScrollYRef.current

      if (Math.abs(delta) < 10) {
        return
      }

      if (delta > 0 && currentY > 320) {
        setIsTriggerHidden(true)
      }

      if (delta < 0 || currentY <= 220) {
        setIsTriggerHidden(false)
      }

      lastScrollYRef.current = currentY
    }

    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <>
      {!uploadPreset ? (
        <p className="upload-error">
          Cloudinary upload preset missing. Create an unsigned preset in your Cloudinary dashboard and set VITE_CLOUDINARY_UPLOAD_PRESET.
        </p>
      ) : null}

      {!isSupabaseConfigured ? (
        <p className="upload-error">Supabase keys missing. Configure environment variables to enable uploads.</p>
      ) : null}

      {isPasscodeEnabled && !requiredPasscode ? (
        <p className="upload-error">Upload passcode missing. Set VITE_UPLOAD_PASSCODE in your .env file.</p>
      ) : null}

      {isConfigured ? (
        <>
          <button className="upload-trigger-btn" onClick={() => setIsModalOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {language === 'kn' ? 'ನನ್ನ ಫೋಟೋಗಳನ್ನು ಅಪ್ಲೋಡ್ ಮಾಡಿ' : 'Upload My Pics'}
          </button>
        </>
      ) : null}

      {isConfigured && typeof document !== 'undefined'
        ? createPortal(
            <button
              className={`upload-fab-btn ${isTriggerHidden ? 'is-hidden' : ''}`}
              onClick={() => setIsModalOpen(true)}
              disabled={isTriggerHidden}
              title={language === 'kn' ? 'ಫೋಟೋ ಅಪ್ಲೋಡ್ ಮಾಡಿ' : 'Upload photos'}
              aria-label={language === 'kn' ? 'ಫೋಟೋ ಅಪ್ಲೋಡ್ ಮಾಡಿ' : 'Upload photos'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>,
            document.body,
          )
        : null}

      {isModalOpen && typeof document !== 'undefined'
        ? createPortal(
            <div className="upload-modal-overlay" onClick={closeModal}>
              <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={closeModal}>
                  ×
                </button>

                <h3>{language === 'kn' ? 'ನಿಮ್ಮ ಫೋಟೋಗಳನ್ನು ಅಪ್ಲೋಡ್ ಮಾಡಿ' : 'Upload Your Photos'}</h3>
                <p>
                  {language === 'kn'
                    ? 'ಕಾರ್ಯಕ್ರಮದ ನಿಮ್ಮ ಮೆಚ್ಚಿನ ಕ್ಷಣಗಳನ್ನು ಇಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ'
                    : 'Share your favorite moments from the celebration'}
                </p>

                {isPasscodeEnabled && !isPasscodeVerified ? (
                  <div className="preview-card">
                    <p>{language === 'kn' ? 'ಮುಂದುವರಿಸಲು ಪಾಸ್‌ಕೋಡ್ ನಮೂದಿಸಿ' : 'Enter passcode to continue'}</p>
                    <input
                      type="password"
                      value={passcode}
                      onChange={(event) => setPasscode(event.target.value)}
                      placeholder={language === 'kn' ? 'ಅಪ್ಲೋಡ್ ಪಾಸ್‌ಕೋಡ್ ನಮೂದಿಸಿ' : 'Enter upload passcode'}
                      className="upload-passcode-input"
                    />
                    <button
                      className="primary-btn"
                      onClick={handlePasscodeSubmit}
                      disabled={!passcode.trim()}
                    >
                      {language === 'kn' ? 'ಅಪ್ಲೋಡ್ ಅನ್ಲಾಕ್ ಮಾಡಿ' : 'Unlock Upload'}
                    </button>
                  </div>
                ) : (
                  <div className="upload-actions">
                    <label htmlFor="camera-upload" className="upload-option-btn">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                      {language === 'kn' ? 'ಸೆಲ್ಫಿ ಕ್ಲಿಕ್ ಮಾಡಿ' : 'Click Selfie'}
                    </label>
                    <input
                      id="camera-upload"
                      type="file"
                      accept="image/*"
                      capture="user"
                      multiple
                      onChange={onFileChange}
                      className="hidden-input"
                    />

                    <label htmlFor="gallery-upload" className="upload-option-btn">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      {language === 'kn' ? 'ಫೋಟೋ ಆಯ್ಕೆಮಾಡಿ' : 'Choose Photo'}
                    </label>
                    <input
                      id="gallery-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={onFileChange}
                      className="hidden-input"
                    />

                    {isOptimizing || isUploading ? (
                      <div className="upload-loader-card" role="status" aria-live="polite">
                        <span className="upload-spinner" aria-hidden="true" />
                        <p>
                          {isOptimizing
                            ? language === 'kn'
                              ? 'ಫೋಟೋಗಳನ್ನು ಅಪ್ಲೋಡ್‌ಗೆ ತಯಾರಿಸಲಾಗುತ್ತಿದೆ...'
                              : 'Preparing photos for upload...'
                            : language === 'kn'
                              ? `${selectedCount} ಫೋಟೋ ಅಪ್ಲೋಡ್ ಆಗುತ್ತಿದೆ...`
                              : `Uploading ${selectedCount} photo(s)...`}
                        </p>
                      </div>
                    ) : null}
                  </div>
                )}

                {error ? <p className="upload-error">{error}</p> : null}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}

export default Upload
