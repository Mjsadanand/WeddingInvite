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

type CloudinaryTransformationOptions = {
  width?: number
  height?: number
  crop?: 'fill' | 'limit' | 'fit' | 'scale'
  quality?: string | number
  format?: 'auto' | 'webp' | 'jpg' | 'jpeg' | 'png' | 'avif'
  dpr?: string | number
}

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined

export const isCloudinaryConfigured = Boolean(cloudName)

const CLOUDINARY_API_ENDPOINT = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`

function buildTransformationString(options: CloudinaryTransformationOptions) {
  const transformationParts: string[] = []

  if (options.crop) {
    transformationParts.push(`c_${options.crop}`)
  }

  if (options.width) {
    transformationParts.push(`w_${Math.round(options.width)}`)
  }

  if (options.height) {
    transformationParts.push(`h_${Math.round(options.height)}`)
  }

  if (options.quality) {
    transformationParts.push(`q_${options.quality}`)
  }

  if (options.format) {
    transformationParts.push(`f_${options.format}`)
  }

  if (options.dpr) {
    transformationParts.push(`dpr_${options.dpr}`)
  }

  return transformationParts.join(',')
}

export function getOptimizedCloudinaryUrl(
  imageUrl: string,
  options: CloudinaryTransformationOptions,
) {
  try {
    const parsed = new URL(imageUrl)

    if (parsed.hostname !== 'res.cloudinary.com' || !parsed.pathname.includes('/image/upload/')) {
      return imageUrl
    }

    const transformation = buildTransformationString(options)
    if (!transformation) {
      return imageUrl
    }

    const [beforeUpload, afterUpload] = parsed.pathname.split('/image/upload/')
    if (!afterUpload) {
      return imageUrl
    }

    parsed.pathname = `${beforeUpload}/image/upload/${transformation}/${afterUpload}`
    return parsed.toString()
  } catch {
    return imageUrl
  }
}

export function getGalleryThumbUrl(imageUrl: string, width: number = 640) {
  return getOptimizedCloudinaryUrl(imageUrl, {
    crop: 'fill',
    width,
    height: width,
    quality: 'auto',
    format: 'auto',
    dpr: 'auto',
  })
}

export function getLightboxUrl(imageUrl: string, width: number = 1600) {
  return getOptimizedCloudinaryUrl(imageUrl, {
    crop: 'limit',
    width,
    quality: 'auto',
    format: 'auto',
    dpr: 'auto',
  })
}

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
