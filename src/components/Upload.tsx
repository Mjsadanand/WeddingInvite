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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed. Please try again.'
      setError(message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="upload-panel">
      <h2>Wedding Gallery</h2>
      <p>Click a selfie or choose from your gallery. Your memories appear instantly.</p>

      {!uploadPreset ? (
        <p className="upload-error">
          Cloudinary upload preset missing. Create an unsigned preset in your Cloudinary dashboard and set VITE_CLOUDINARY_UPLOAD_PRESET.
        </p>
      ) : null}

      {!isSupabaseConfigured ? (
        <p className="upload-error">Supabase keys missing. Configure environment variables to enable uploads.</p>
      ) : null}

      {isConfigured ? (
        <>
          <div className="upload-actions">
            <label htmlFor="camera-upload" className="gold-btn upload-action-btn">
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

            <label htmlFor="gallery-upload" className="gold-btn upload-action-btn">
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

          <div className="upload-row">
            <button
              className="gold-btn"
              onClick={() => void handleUpload()}
              disabled={isUploading || !selectedFile}
            >
              {isUploading ? 'Uploading...' : 'Upload Photo'}
            </button>
          </div>

          {previewUrl ? (
            <div className="preview-card">
              <p>Preview before upload</p>
              <img src={previewUrl} alt="Upload preview" loading="lazy" />
            </div>
          ) : null}
        </>
      ) : null}

      {error ? <p className="upload-error">{error}</p> : null}
    </div>
  )
}

export default Upload
