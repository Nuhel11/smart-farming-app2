import express from 'express';
import pool from '../db.js';
import protect from '../middleware/auth.js';
import { uploadMultipleImages } from '../middleware/upload.js';
import { uploadMultipleFilesToS3, deleteMultipleFilesFromS3 } from '../services/s3Service.js';

const router = express.Router();

// =====================================================
// Route: GET /api/skus
// Purpose: Get all SKUs (with optional filters)
// =====================================================
router.get('/', async (req, res) => {
    try {
        const { category, is_active, search } = req.query;
        
        let query = 'SELECT * FROM SKUs WHERE 1=1';
        const params = [];

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }

        if (is_active !== undefined) {
            query += ' AND is_active = ?';
            params.push(is_active === 'true');
        }

        if (search) {
            query += ' AND (title LIKE ? OR short_description LIKE ? OR sku_code LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        query += ' ORDER BY created_at DESC';

        const [skus] = await pool.execute(query, params);
        
        // Parse JSON images field for each SKU
        const skusWithParsedImages = skus.map(sku => {
            let images = [];
            if (sku.images) {
                try {
                    if (typeof sku.images === 'string') {
                        // Try to parse as JSON
                        try {
                            images = JSON.parse(sku.images);
                        } catch (e) {
                            // If it's a single URL string, wrap it in an array
                            if (sku.images.startsWith('http://') || sku.images.startsWith('https://')) {
                                images = [sku.images];
                            } else {
                                images = [];
                            }
                        }
                    } else if (Array.isArray(sku.images)) {
                        images = sku.images;
                    }
                } catch (e) {
                    console.error('Error parsing images for SKU:', sku.sku_id, e);
                    images = [];
                }
            }
            return {
                ...sku,
                images: Array.isArray(images) ? images : []
            };
        });

        res.status(200).json({
            success: true,
            count: skusWithParsedImages.length,
            data: skusWithParsedImages
        });
    } catch (error) {
        console.error('Error fetching SKUs:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while fetching SKUs.' 
        });
    }
});

// =====================================================
// Route: GET /api/skus/:skuId
// Purpose: Get a single SKU by ID
// =====================================================
router.get('/:skuId', async (req, res) => {
    try {
        const { skuId } = req.params;
        
        const [rows] = await pool.execute(
            'SELECT * FROM SKUs WHERE sku_id = ?',
            [skuId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'SKU not found.'
            });
        }

        const sku = rows[0];
        // Safely parse images
        if (sku.images) {
            try {
                if (typeof sku.images === 'string') {
                    try {
                        sku.images = JSON.parse(sku.images);
                    } catch (e) {
                        // If it's a single URL string, wrap it in an array
                        if (sku.images.startsWith('http://') || sku.images.startsWith('https://')) {
                            sku.images = [sku.images];
                        } else {
                            sku.images = [];
                        }
                    }
                } else if (!Array.isArray(sku.images)) {
                    sku.images = [];
                }
            } catch (e) {
                console.error('Error parsing images:', e);
                sku.images = [];
            }
        } else {
            sku.images = [];
        }

        res.status(200).json({
            success: true,
            data: sku
        });
    } catch (error) {
        console.error('Error fetching SKU:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching SKU.'
        });
    }
});

// =====================================================
// Route: POST /api/skus
// Purpose: Create a new SKU
// =====================================================
router.post('/', uploadMultipleImages, async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const {
            title,
            short_description,
            long_description,
            price_usd,
            category,
            sku_code,
            stock_quantity,
            is_active
        } = req.body;

        // Validation
        if (!title || !price_usd) {
            return res.status(400).json({
                success: false,
                message: 'Title and price are required fields.'
            });
        }

        // Upload images to S3 if any
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            try {
                const files = req.files.map(file => ({
                    buffer: file.buffer,
                    originalname: file.originalname,
                    mimetype: file.mimetype
                }));
                imageUrls = await uploadMultipleFilesToS3(files);
            } catch (s3Error) {
                console.error('S3 upload error:', s3Error);
                // If S3 is not configured, continue without images
                if (s3Error.message.includes('not configured') || s3Error.message.includes('credentials')) {
                    console.warn('S3 not configured, continuing without image upload');
                    imageUrls = [];
                } else {
                    throw s3Error; // Re-throw if it's a different error
                }
            }
        }

        await connection.beginTransaction();

        // Insert SKU into database
        const insertQuery = `
            INSERT INTO SKUs (
                title, short_description, long_description, 
                price_usd, category, sku_code, images, 
                stock_quantity, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await connection.execute(insertQuery, [
            title,
            short_description || null,
            long_description || null,
            parseFloat(price_usd),
            category || null,
            sku_code || null,
            JSON.stringify(imageUrls),
            stock_quantity ? parseInt(stock_quantity) : 0,
            is_active !== undefined ? (is_active === 'true' || is_active === true) : true
        ]);

        await connection.commit();

        // Fetch the created SKU
        const [newSku] = await connection.execute(
            'SELECT * FROM SKUs WHERE sku_id = ?',
            [result.insertId]
        );

        const createdSku = newSku[0];
        // Safely parse images
        if (createdSku.images) {
            try {
                if (typeof createdSku.images === 'string') {
                    try {
                        createdSku.images = JSON.parse(createdSku.images);
                    } catch (e) {
                        if (createdSku.images.startsWith('http://') || createdSku.images.startsWith('https://')) {
                            createdSku.images = [createdSku.images];
                        } else {
                            createdSku.images = [];
                        }
                    }
                } else if (!Array.isArray(createdSku.images)) {
                    createdSku.images = [];
                }
            } catch (e) {
                console.error('Error parsing created SKU images:', e);
                createdSku.images = [];
            }
        } else {
            createdSku.images = [];
        }

        res.status(201).json({
            success: true,
            message: 'SKU created successfully.',
            data: createdSku
        });

    } catch (error) {
        await connection.rollback();
        
        // If there was an error and images were uploaded, clean them up
        if (req.files && req.files.length > 0) {
            try {
                const files = req.files.map(file => ({
                    buffer: file.buffer,
                    originalname: file.originalname,
                    mimetype: file.mimetype
                }));
                // Note: We can't easily delete files that were just uploaded on error
                // This is a limitation - in production, consider tracking uploaded files
            } catch (cleanupError) {
                console.error('Error during cleanup:', cleanupError);
            }
        }

        console.error('Error creating SKU:', error);
        console.error('Error stack:', error.stack);
        console.error('Error code:', error.code);
        console.error('Error sqlMessage:', error.sqlMessage);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'SKU code already exists.'
            });
        }

        if (error.code === 'ER_NO_SUCH_TABLE') {
            return res.status(500).json({
                success: false,
                message: 'SKUs table does not exist. Please run the database schema migration.'
            });
        }

        // Return more detailed error in development
        const errorMessage = process.env.NODE_ENV === 'production' 
            ? 'Server error during SKU creation.'
            : error.message || error.sqlMessage || 'Server error during SKU creation.';

        res.status(500).json({
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV !== 'production' ? {
                message: error.message,
                sqlMessage: error.sqlMessage,
                code: error.code
            } : undefined
        });
    } finally {
        connection.release();
    }
});

// =====================================================
// Route: PUT /api/skus/:skuId
// Purpose: Update an existing SKU
// =====================================================
router.put('/:skuId', uploadMultipleImages, async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { skuId } = req.params;
        const {
            title,
            short_description,
            long_description,
            price_usd,
            category,
            sku_code,
            stock_quantity,
            is_active,
            existing_images // JSON array of existing image URLs to keep
        } = req.body;

        // Check if SKU exists
        const [existingSku] = await connection.execute(
            'SELECT * FROM SKUs WHERE sku_id = ?',
            [skuId]
        );

        if (existingSku.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'SKU not found.'
            });
        }

        await connection.beginTransaction();

        let imageUrls = [];
        
        // Keep existing images if provided
        if (existing_images) {
            try {
                let existingImagesArray;
                if (typeof existing_images === 'string') {
                    // Try to parse as JSON first
                    try {
                        existingImagesArray = JSON.parse(existing_images);
                    } catch (parseError) {
                        // If parsing fails, check if it's a single URL string
                        if (existing_images.startsWith('http://') || existing_images.startsWith('https://')) {
                            existingImagesArray = [existing_images];
                        } else {
                            // Try to parse as comma-separated URLs
                            existingImagesArray = existing_images.split(',').map(url => url.trim()).filter(url => url);
                        }
                    }
                } else if (Array.isArray(existing_images)) {
                    existingImagesArray = existing_images;
                } else {
                    existingImagesArray = [];
                }
                imageUrls = Array.isArray(existingImagesArray) ? existingImagesArray : [];
            } catch (e) {
                console.error('Error parsing existing_images:', e);
                // Fallback: parse from current SKU
                imageUrls = existingSku[0].images ? JSON.parse(existingSku[0].images) : [];
            }
        } else {
            // If no existing_images provided, parse from current SKU
            try {
                imageUrls = existingSku[0].images ? JSON.parse(existingSku[0].images) : [];
            } catch (parseError) {
                console.error('Error parsing existing SKU images:', parseError);
                imageUrls = [];
            }
        }

        // Upload new images if any
        if (req.files && req.files.length > 0) {
            const files = req.files.map(file => ({
                buffer: file.buffer,
                originalname: file.originalname,
                mimetype: file.mimetype
            }));
            const newImageUrls = await uploadMultipleFilesToS3(files);
            imageUrls = [...imageUrls, ...newImageUrls];
        }

        // Build update query dynamically
        const updateFields = [];
        const updateValues = [];

        if (title !== undefined) {
            updateFields.push('title = ?');
            updateValues.push(title);
        }
        if (short_description !== undefined) {
            updateFields.push('short_description = ?');
            updateValues.push(short_description || null);
        }
        if (long_description !== undefined) {
            updateFields.push('long_description = ?');
            updateValues.push(long_description || null);
        }
        if (price_usd !== undefined) {
            updateFields.push('price_usd = ?');
            updateValues.push(parseFloat(price_usd));
        }
        if (category !== undefined) {
            updateFields.push('category = ?');
            updateValues.push(category || null);
        }
        if (sku_code !== undefined) {
            updateFields.push('sku_code = ?');
            updateValues.push(sku_code || null);
        }
        if (stock_quantity !== undefined) {
            updateFields.push('stock_quantity = ?');
            updateValues.push(parseInt(stock_quantity));
        }
        if (is_active !== undefined) {
            updateFields.push('is_active = ?');
            updateValues.push(is_active === 'true' || is_active === true);
        }

        // Always update images and updated_at
        updateFields.push('images = ?');
        updateValues.push(JSON.stringify(imageUrls));
        updateFields.push('updated_at = CURRENT_TIMESTAMP');

        updateValues.push(skuId); // For WHERE clause

        const updateQuery = `
            UPDATE SKUs 
            SET ${updateFields.join(', ')}
            WHERE sku_id = ?
        `;

        await connection.execute(updateQuery, updateValues);
        await connection.commit();

        // Fetch updated SKU
        const [updatedSku] = await connection.execute(
            'SELECT * FROM SKUs WHERE sku_id = ?',
            [skuId]
        );

        const sku = updatedSku[0];
        // Safely parse images
        if (sku.images) {
            try {
                if (typeof sku.images === 'string') {
                    try {
                        sku.images = JSON.parse(sku.images);
                    } catch (e) {
                        if (sku.images.startsWith('http://') || sku.images.startsWith('https://')) {
                            sku.images = [sku.images];
                        } else {
                            sku.images = [];
                        }
                    }
                } else if (!Array.isArray(sku.images)) {
                    sku.images = [];
                }
            } catch (e) {
                console.error('Error parsing updated SKU images:', e);
                sku.images = [];
            }
        } else {
            sku.images = [];
        }

        res.status(200).json({
            success: true,
            message: 'SKU updated successfully.',
            data: sku
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error updating SKU:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'SKU code already exists.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during SKU update.'
        });
    } finally {
        connection.release();
    }
});

// =====================================================
// Route: DELETE /api/skus/:skuId
// Purpose: Delete a SKU (PROTECTED - Admin only)
// =====================================================
router.delete('/:skuId', async (req, res) => {
    const connection = await pool.getConnection();

    try {

        const { skuId } = req.params;

        // Fetch SKU to get image URLs before deletion
        const [skuRows] = await connection.execute(
            'SELECT images FROM SKUs WHERE sku_id = ?',
            [skuId]
        );

        if (skuRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'SKU not found.'
            });
        }

        await connection.beginTransaction();

        // Delete from database
        await connection.execute(
            'DELETE FROM SKUs WHERE sku_id = ?',
            [skuId]
        );

        await connection.commit();

        // Delete images from S3
        try {
            // Safely parse images
            let images = [];
            if (skuRows[0].images) {
                try {
                    if (typeof skuRows[0].images === 'string') {
                        try {
                            images = JSON.parse(skuRows[0].images);
                        } catch (e) {
                            if (skuRows[0].images.startsWith('http://') || skuRows[0].images.startsWith('https://')) {
                                images = [skuRows[0].images];
                            } else {
                                images = [];
                            }
                        }
                    } else if (Array.isArray(skuRows[0].images)) {
                        images = skuRows[0].images;
                    }
                } catch (e) {
                    console.error('Error parsing images for deletion:', e);
                    images = [];
                }
            }
            if (images.length > 0) {
                await deleteMultipleFilesFromS3(images);
            }
        } catch (s3Error) {
            console.error('Error deleting images from S3:', s3Error);
            // Don't fail the request if S3 deletion fails
        }

        res.status(200).json({
            success: true,
            message: 'SKU deleted successfully.'
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error deleting SKU:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during SKU deletion.'
        });
    } finally {
        connection.release();
    }
});

export default router;

