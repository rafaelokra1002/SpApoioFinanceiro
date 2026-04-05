import { v2 as cloudinary } from 'cloudinary';

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
    throw new Error('Cloudinary não configurado');
  }

  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'auto',
  });
  return result.secure_url;
}

export function shouldUseCloudinary(): boolean {
  return hasCloudinaryConfig();
}

export function getUploadUrl(filename: string, baseUrl: string): string {
  return `${baseUrl}/uploads/${filename}`;
}
