const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Utility to create a dynamic multer instance
 * @param {Object} options - Configuration options
 * @param {string} options.destination - Directory for file uploads
 * @param {string} options.prefix - Prefix for the uploaded file name
 * @param {Array} options.allowedTypes - Array of allowed file extensions
 * @param {number} options.fileSizeLimit - Max file size limit in MB
 */
const createMulter = ({ destination, prefix = 'file', allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png'], fileSizeLimit = 5 }) => {
    
    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination,
        filename: (req, file, cb) => {
            const uniqueSuffix = `${prefix}_${Date.now()}${path.extname(file.originalname)}`;
            cb(null, uniqueSuffix);
        }
    });

    const fileFilter = (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error(`Only ${allowedTypes.join(', ')} files are allowed`), false);
        }
    };

    return multer({
        storage,
        fileFilter,
        limits: { fileSize: fileSizeLimit * 1024 * 1024 }
    });
};

module.exports = createMulter;
