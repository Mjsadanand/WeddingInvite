import { useEffect, useRef, useState } from 'react'
import { uploadToCloudinary } from '../utils/cloudinaryClient'
import { optimizeImageForUpload } from '../utils/imageOptimization'
import { isSupabaseConfigured, saveGalleryImageUrl, type GalleryImage } from '../utils/supabaseClient'

type UploadProps = {
  onUploadSuccess: (image: GalleryImage) => void
}

function Upload({ onUploadSuccess }: UploadProps) {
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined
  const requiredPasscode = import.meta.env.VITE_UPLOAD_PASSCODE as string | undefined
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [passcode, setPasscode] = useState<string>('')
  const [isPasscodeVerified, setIsPasscodeVerified] = useState<boolean>(false)
  const selectionVersionRef = useRef(0)

  const isConfigured = Boolean(uploadPreset && isSupabaseConfigured && requiredPasscode)

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    const selectionVersion = ++selectionVersionRef.current
    setError(null)

    previewUrls.forEach((url) => URL.revokeObjectURL(url))

    if (files.length === 0) {
      setSelectedFiles([])
      setPreviewUrls([])
      setIsOptimizing(false)
      return
    }

    setIsOptimizing(true)

    try {
      const optimizedFiles = await Promise.all(files.map((file) => optimizeImageForUpload(file)))

      if (selectionVersionRef.current !== selectionVersion) {
        return
      }

      setSelectedFiles(optimizedFiles)
      setPreviewUrls(optimizedFiles.map((file) => URL.createObjectURL(file)))
    } catch {
      if (selectionVersionRef.current !== selectionVersion) {
        return
      }

      setSelectedFiles(files)
      setPreviewUrls(files.map((file) => URL.createObjectURL(file)))
      setError('Some images could not be optimized. Uploading original files instead.')
    } finally {
      if (selectionVersionRef.current === selectionVersion) {
        setIsOptimizing(false)
      }
      event.target.value = ''
    }
  }

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previewUrls])

  const resetSelection = () => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url))
    setSelectedFiles([])
    setPreviewUrls([])
    setIsOptimizing(false)
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !uploadPreset) {
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const uploadResults = await Promise.allSettled(
        selectedFiles.map(async (file) => {
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
        resetSelection()
        setIsModalOpen(false)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed. Please try again.'
      setError(message)
    } finally {
      setIsUploading(false)
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
      setError('Invalid passcode. Please try again.')
      setPasscode('')
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    resetSelection()
    setError(null)
    setPasscode('')
    setIsPasscodeVerified(false)
  }

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

      {!requiredPasscode ? (
        <p className="upload-error">Upload passcode missing. Set VITE_UPLOAD_PASSCODE in your .env file.</p>
      ) : null}

      {isConfigured ? (
        <button className="upload-trigger-btn" onClick={() => setIsModalOpen(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Upload My Pics
        </button>
      ) : null}

      {isModalOpen ? (
        <div className="upload-modal-overlay" onClick={closeModal}>
          <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              ×
            </button>

            <h3>Upload Your Photos</h3>
            <p>Share your favorite moments from the celebration</p>

            {!isPasscodeVerified ? (
              <div className="preview-card">
                <p>Enter passcode to continue</p>
                <input
                  type="password"
                  value={passcode}
                  onChange={(event) => setPasscode(event.target.value)}
                  placeholder="Enter upload passcode"
                  className="upload-passcode-input"
                />
                <button
                  className="primary-btn"
                  onClick={handlePasscodeSubmit}
                  disabled={!passcode.trim()}
                >
                  Unlock Upload
                </button>
              </div>
            ) : (
              <div className="upload-actions">
                <label htmlFor="camera-upload" className="upload-option-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  Click Selfie
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
                  Choose Photo
                </label>
                <input
                  id="gallery-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onFileChange}
                  className="hidden-input"
                />
              </div>
            )}

            {previewUrls.length > 0 ? (
              <div className="preview-card">
                <p>Selected {selectedFiles.length} photo(s)</p>
                <div className="preview-grid">
                  {previewUrls.map((url, index) => (
                    <img key={url} src={url} alt={`Upload preview ${index + 1}`} loading="lazy" />
                  ))}
                </div>
                {isOptimizing ? <p>Optimizing photos for faster upload and preview...</p> : null}
                <button
                  className="primary-btn"
                  onClick={() => void handleUpload()}
                  disabled={isUploading || isOptimizing || selectedFiles.length === 0}
                >
                  {isUploading ? 'Uploading...' : '⬆️ Upload Photos'}
                </button>
              </div>
            ) : null}

            {error ? <p className="upload-error">{error}</p> : null}
          </div>
        </div>
      ) : null}
    </>
  )
}

export default Upload
