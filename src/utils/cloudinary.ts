// Util to upload files to Cloudinary

import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
} from '../constants';
import logger from '../logging/logger';

// Configuration
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});



const uploadToCloudinary = async (localFilePath: string) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
    });
    logger.info(`File uploaded to Cloudinary, File Src: ${response.url}`);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error: any) {
    logger.error(error);
    fs.unlinkSync(localFilePath);
    throw new Error(error);
    return null;
  }
};

const deleteFromCloudinary = async (public_id: string) => {
  try {
    await cloudinary.uploader.destroy(public_id);
    logger.info('Deleted from Cloudinary')
  } catch (error) {
    logger.error('Error in deleting cloudinary Image');
    return null;
  }
}

export { uploadToCloudinary, deleteFromCloudinary };
