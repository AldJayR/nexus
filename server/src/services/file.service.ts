import { MultipartFile } from '@fastify/multipart';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { env } from '../config/env.js';

// Interface for pre-buffered file data (used to avoid stream timeout issues)
export interface BufferedFile {
  buffer: Buffer;
  mimetype: string;
  filename: string;
}

export class FileService {
  constructor() {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    });
  }

  private readonly allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  /**
   * Save a pre-buffered file to Cloudinary.
   * Use this when the file has been buffered during multipart parsing.
   */
  async saveFile(file: BufferedFile): Promise<{ filename: string; path: string; mimetype: string; size: number }> {
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(`Unsupported file type: ${file.mimetype}. Only PDF, JPEG, PNG, GIF, and WEBP are allowed.`);
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'nexus_uploads',
          resource_type: 'auto', // Auto-detect image vs raw (pdf)
          timeout: 300000, // 5 minutes timeout for large file uploads
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Upload failed'));

          resolve({
            filename: result.public_id,
            path: result.secure_url,
            mimetype: file.mimetype,
            size: result.bytes,
          });
        }
      );

      // Convert buffer to readable stream and pipe to Cloudinary
      const readable = Readable.from(file.buffer);
      readable.pipe(uploadStream);
    });
  }

  /**
   * @deprecated Use saveFile with BufferedFile instead.
   * Save a multipart file stream directly. This may cause timeout issues
   * if the stream is not consumed immediately during multipart parsing.
   */
  async saveFileFromStream(file: MultipartFile): Promise<{ filename: string; path: string; mimetype: string; size: number }> {
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(`Unsupported file type: ${file.mimetype}. Only PDF, JPEG, PNG, GIF, and WEBP are allowed.`);
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'nexus_uploads',
          resource_type: 'auto',
          timeout: 300000,
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Upload failed'));

          resolve({
            filename: result.public_id,
            path: result.secure_url,
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
