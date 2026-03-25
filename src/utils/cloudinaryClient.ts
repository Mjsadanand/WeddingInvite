export type CloudinaryUploadResult = {
  event?: ProgressEvent
  info: {
    public_id: string
    secure_url: string
    original_filename: string
    bytes: number
    [key: string]: unknown
  }
}

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined

export const isCloudinaryConfigured = Boolean(cloudName)

const CLOUDINARY_API_ENDPOINT = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`

export async function uploadToCloudinary(file: File, uploadPreset: string): Promise<CloudinaryUploadResult['info']> {
  if (!cloudName) {
    throw new Error('Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME.')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', 'wedding-gallery')

  const response = await fetch(CLOUDINARY_API_ENDPOINT as string, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Cloudinary upload failed: ${response.statusText}`)
  }

  const data = (await response.json()) as CloudinaryUploadResult['info']
  return data
}
