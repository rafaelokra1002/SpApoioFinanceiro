// Upload service - handled by multer middleware
// This file is kept for future cloud storage integration (e.g., Cloudinary, S3)

export function getUploadUrl(filename: string, baseUrl: string): string {
  return `${baseUrl}/uploads/${filename}`;
}
