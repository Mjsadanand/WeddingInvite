import { useState } from 'react'
import { uploadToCloudinary } from '../utils/cloudinaryClient'
import { isSupabaseConfigured, saveGalleryImageUrl, type GalleryImage } from '../utils/supabaseClient'

type UploadProps = {
  onUploadSuccess: (image: GalleryImage) => void
}

function Upload({ onUploadSuccess }: UploadProps) {
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const isConfigured = Boolean(uploadPreset && isSupabaseConfigured)

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setSelectedFile(file)
    setError(null)

    if (!file) {
      setPreviewUrl(null)
      return
    }

    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleUpload = async () => {
    if (!selectedFile || !uploadPreset) {
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const cloudinaryResult = await uploadToCloudinary(selectedFile, uploadPreset)
      const uploadedImage = await saveGalleryImageUrl(cloudinaryResult.secure_url)
      onUploadSuccess(uploadedImage)
      setSelectedFile(null)
      setPreviewUrl(null)
      setIsModalOpen(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed. Please try again.'
      setError(message)
    } finally {
      setIsUploading(false)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedFile(null)
    setPreviewUrl(null)
    setError(null)
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
                onChange={onFileChange}
                className="hidden-input"
              />
            </div>

            {previewUrl ? (
              <div className="preview-card">
                <p>Preview</p>
                <img src={previewUrl} alt="Upload preview" loading="lazy" />
                <button
                  className="primary-btn"
                  onClick={() => void handleUpload()}
                  disabled={isUploading || !selectedFile}
                >
                  {isUploading ? 'Uploading...' : '⬆️ Upload Photo'}
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
