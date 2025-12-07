import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

// Initialize S3 Client
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const BUCKET_REGION = process.env.AWS_REGION || 'us-east-1';

/**
 * Upload a single file to S3
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} originalName - Original file name
 * @param {string} mimetype - File MIME type
 * @returns {Promise<string>} - S3 URL of uploaded file
 */
export async function uploadFileToS3(fileBuffer, originalName, mimetype) {
    if (!BUCKET_NAME) {
        throw new Error('AWS S3 bucket name is not configured');
    }

    try {
        // Generate unique filename
        const fileExtension = originalName.split('.').pop();
        const uniqueFileName = `skus/${uuidv4()}.${fileExtension}`;

        // Upload to S3
        const upload = new Upload({
            client: s3Client,
            params: {
                Bucket: BUCKET_NAME,
                Key: uniqueFileName,
                Body: fileBuffer,
                ContentType: mimetype,
                ACL: 'public-read', // Make files publicly accessible
            },
        });

        const result = await upload.done();

        // Return the public URL
        const fileUrl = `https://${BUCKET_NAME}.s3.${BUCKET_REGION}.amazonaws.com/${uniqueFileName}`;
        return fileUrl;
    } catch (error) {
        console.error('Error uploading file to S3:', error);
        throw new Error('Failed to upload file to S3');
    }
}

/**
 * Upload multiple files to S3
 * @param {Array} files - Array of file objects {buffer, originalname, mimetype}
 * @returns {Promise<Array<string>>} - Array of S3 URLs
 */
export async function uploadMultipleFilesToS3(files) {
    if (!files || files.length === 0) {
        return [];
    }

    try {
        const uploadPromises = files.map((file) => {
            return uploadFileToS3(file.buffer, file.originalname, file.mimetype);
        });

        const urls = await Promise.all(uploadPromises);
        return urls;
    } catch (error) {
        console.error('Error uploading multiple files to S3:', error);
        throw new Error('Failed to upload files to S3');
    }
}

/**
 * Delete a file from S3
 * @param {string} fileUrl - S3 URL of the file to delete
 * @returns {Promise<void>}
 */
export async function deleteFileFromS3(fileUrl) {
    if (!BUCKET_NAME) {
        throw new Error('AWS S3 bucket name is not configured');
    }

    try {
        // Extract key from URL
        const urlParts = fileUrl.split('.com/');
        if (urlParts.length < 2) {
            throw new Error('Invalid S3 URL format');
        }
        const key = urlParts[1];

        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });

        await s3Client.send(command);
    } catch (error) {
        console.error('Error deleting file from S3:', error);
        throw new Error('Failed to delete file from S3');
    }
}

/**
 * Delete multiple files from S3
 * @param {Array<string>} fileUrls - Array of S3 URLs
 * @returns {Promise<void>}
 */
export async function deleteMultipleFilesFromS3(fileUrls) {
    if (!fileUrls || fileUrls.length === 0) {
        return;
    }

    try {
        const deletePromises = fileUrls.map((url) => deleteFileFromS3(url));
        await Promise.all(deletePromises);
    } catch (error) {
        console.error('Error deleting multiple files from S3:', error);
        // Don't throw - log and continue
    }
}

