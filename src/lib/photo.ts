import imageCompression from 'browser-image-compression'

/** Compress a picked image and return a data URL. Handles iOS HEIC/large files. */
export async function compressToDataUrl(file: File): Promise<string> {
  const compressed = await imageCompression(file, {
    maxWidthOrHeight: 1200,
    maxSizeMB: 0.3,
    useWebWorker: true,
    fileType: 'image/webp',
  })
  return imageCompression.getDataUrlFromFile(compressed)
}
