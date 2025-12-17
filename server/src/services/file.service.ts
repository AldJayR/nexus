import { MultipartFile } from '@fastify/multipart';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';

export class FileService {
  constructor() {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    });
  }

  async saveFile(file: MultipartFile): Promise<{ filename: string; path: string; mimetype: string; size: number }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'nexus_uploads',
          resource_type: 'auto', // Auto-detect image vs raw (pdf)
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Upload failed'));

          resolve({
            filename: result.public_id, // We use public_id as the filename reference
            path: result.secure_url,    // The URL is the path
            mimetype: file.mimetype,
            size: result.bytes,
          });
        }
      );

      file.file.pipe(uploadStream);
    });
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error deleting file from Cloudinary:', error);
      // We don't throw here to avoid breaking the flow if the file is already gone
    }
  }
}

export const fileService = new FileService();
