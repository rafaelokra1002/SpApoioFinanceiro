import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function hasCloudinaryConfig(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

export async function uploadToCloudinary(filePath: string, folder: string = 'sp-apoio'): Promise<string> {
  if (!hasCloudinaryConfig()) {
    throw new Error('Cloudinary não configurado. Configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET.');
  }

  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'auto',
  });

  // Remove arquivo temporário após upload para Cloudinary
  try {
    fs.unlinkSync(filePath);
  } catch (_) {}

  return result.secure_url;
}

export function shouldUseCloudinary(): boolean {
  return hasCloudinaryConfig();
}

export function getUploadUrl(filename: string, baseUrl: string): string {
  return `${baseUrl}/uploads/${filename}`;
}
