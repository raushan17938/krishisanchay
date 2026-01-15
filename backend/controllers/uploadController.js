import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

// @desc    Upload image to Cloudinary
// @route   POST /api/upload
// @access  Private
export const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Debug: Check Cloudinary Config


        // Upload stream to Cloudinary
        const streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'Krishi_Sanchay',
                        resource_type: 'auto',
                    },
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        const result = await streamUpload(req);

        res.status(200).json({
            success: true,
            data: result.secure_url,
            public_id: result.public_id
        });

    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ success: false, message: `Image upload failed: ${error.message}` });
    }
};

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload/:public_id
// @access  Private
export const deleteImage = async (req, res) => {
    try {
        const public_id = req.params.public_id;
        if (!public_id) {
            return res.status(400).json({ success: false, message: 'No public_id provided' });
        }

        await cloudinary.uploader.destroy(public_id);

        res.status(200).json({ success: true, message: 'Image deleted' });
    } catch (error) {
        console.error('Delete Image Error:', error);
        res.status(500).json({ success: false, message: 'Image delete failed' });
    }
};
