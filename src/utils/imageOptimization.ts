const DEFAULT_MAX_SIDE = 1920
const DEFAULT_MAX_OUTPUT_BYTES = 1_500_000
const DEFAULT_MIN_OPTIMIZE_BYTES = 4 * 1024 * 1024
const DEFAULT_START_QUALITY = 0.86
const DEFAULT_MIN_QUALITY = 0.54
const DEFAULT_QUALITY_STEP = 0.08

type OptimizationOptions = {
  maxSide?: number
  maxOutputBytes?: number
}

function clampQuality(value: number) {
  return Math.max(0.1, Math.min(1, value))
}

function getImageSource(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    return createImageBitmap(file)
  }

  return new Promise((resolve, reject) => {
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Unable to decode selected image.'))
    }

    image.src = objectUrl
  })
}

function drawResizedImage(
  source: ImageBitmap | HTMLImageElement,
  maxSide: number,
): { canvas: HTMLCanvasElement; width: number; height: number } {
  const sourceWidth = source.width
  const sourceHeight = source.height

  const longestSide = Math.max(sourceWidth, sourceHeight)
  const scale = longestSide > maxSide ? maxSide / longestSide : 1

  const width = Math.max(1, Math.round(sourceWidth * scale))
  const height = Math.max(1, Math.round(sourceHeight * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Canvas context unavailable for image processing.')
  }

  context.drawImage(source, 0, 0, width, height)
  return { canvas, width, height }
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to export optimized image.'))
          return
        }

        resolve(blob)
      },
      'image/jpeg',
      quality,
    )
  })
}

export async function optimizeImageForUpload(file: File, options: OptimizationOptions = {}): Promise<File> {
  if (!file.type.startsWith('image/')) {
    return file
  }

  if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return file
  }

  const maxSide = options.maxSide ?? DEFAULT_MAX_SIDE
  const maxOutputBytes = options.maxOutputBytes ?? DEFAULT_MAX_OUTPUT_BYTES
  const minOptimizeBytes = Math.max(maxOutputBytes, DEFAULT_MIN_OPTIMIZE_BYTES)

  if (file.size <= minOptimizeBytes) {
    return file
  }

  try {
    const source = await getImageSource(file)
    const { canvas } = drawResizedImage(source, maxSide)

    let quality = DEFAULT_START_QUALITY
    let optimizedBlob = await canvasToBlob(canvas, quality)

    while (optimizedBlob.size > maxOutputBytes && quality > DEFAULT_MIN_QUALITY) {
      quality = clampQuality(quality - DEFAULT_QUALITY_STEP)
      optimizedBlob = await canvasToBlob(canvas, quality)
    }

    if (optimizedBlob.size >= file.size) {
      return file
    }

    const originalBaseName = file.name.replace(/\.[^.]+$/, '')
    return new File([optimizedBlob], `${originalBaseName}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    })
  } catch {
    return file
  }
}
