import 'server-only';
import { v2 as cloudinary } from 'cloudinary';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

export const isCloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret);

let configured = false;
function ensureConfigured() {
  if (!isCloudinaryConfigured) {
    throw new Error('Cloudinary is not configured (missing CLOUDINARY_* env vars).');
  }
  if (!configured) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    configured = true;
  }
}

const UPLOAD_FOLDER = process.env.CLOUDINARY_UPLOAD_FOLDER || 'MTK';

export interface UploadResult {
  url: string;
  publicId: string;
}

/**
 * Upload an image buffer to Cloudinary under a subfolder.
 * @param buffer    raw image bytes
 * @param subfolder appended under the base upload folder (e.g. 'payment-proofs')
 */
export async function uploadImage(
  buffer: Buffer,
  subfolder: string,
): Promise<UploadResult> {
  ensureConfigured();
  const folder = `${UPLOAD_FOLDER}/${subfolder}`;

  return new Promise<UploadResult>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Cloudinary upload failed'));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
}

/** Best-effort delete (e.g. when a rejected proof should be removed). */
export async function deleteImage(publicId: string): Promise<void> {
  ensureConfigured();
  await cloudinary.uploader.destroy(publicId).catch(() => {});
}
