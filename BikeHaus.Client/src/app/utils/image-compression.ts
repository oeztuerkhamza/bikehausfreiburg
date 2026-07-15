/**
 * Downscale + re-encode an image File in the browser before upload.
 *
 * Phone photos are often 10–25 MB at full resolution — slow to upload over
 * mobile and large enough to exceed the server request-size limit, so they
 * silently fail to upload. We shrink the longest edge to `maxEdge` px and
 * re-encode, typically turning a 15 MB original into ~0.4–1 MB while staying
 * visually indistinguishable on screen (2048 px is retina-sharp for any web
 * display).
 *
 * Quality is preserved as much as possible:
 *  - PNG / WebP keep their format so transparency (e.g. logos) is never lost.
 *  - Everything else is encoded as high-quality JPEG.
 *  - GIFs (possibly animated) and non-images pass through untouched.
 *  - If the re-encode would be larger, or anything fails, the original File is
 *    returned — uploads never break because of compression.
 */
export async function compressImageFile(
  file: File,
  maxEdge = 2048,
  quality = 0.85,
): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') {
    return file;
  }

  try {
    const source = await loadImage(file);
    const srcWidth = 'naturalWidth' in source ? source.naturalWidth : source.width;
    const srcHeight = 'naturalHeight' in source ? source.naturalHeight : source.height;
    if (!srcWidth || !srcHeight) return file;

    const scale = Math.min(1, maxEdge / Math.max(srcWidth, srcHeight));
    const width = Math.round(srcWidth * scale);
    const height = Math.round(srcHeight * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(source, 0, 0, width, height);
    if ('close' in source) source.close();

    // Keep transparency-capable formats as-is; encode photos as JPEG.
    const outputType =
      file.type === 'image/png'
        ? 'image/png'
        : file.type === 'image/webp'
          ? 'image/webp'
          : 'image/jpeg';

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(
        resolve,
        outputType,
        outputType === 'image/png' ? undefined : quality,
      ),
    );
    if (!blob || blob.size >= file.size) return file;

    const ext =
      outputType === 'image/png' ? '.png' : outputType === 'image/webp' ? '.webp' : '.jpg';
    const name = file.name.replace(/\.[^.]+$/, '') + ext;
    return new File([blob], name, { type: outputType, lastModified: Date.now() });
  } catch {
    return file;
  }
}

/**
 * Prefer createImageBitmap with `imageOrientation: 'from-image'` so EXIF
 * rotation from phone cameras is baked in (portrait photos stay upright).
 * Fall back to a plain <img> where it's unavailable.
 */
async function loadImage(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      /* fall through to <img> */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
