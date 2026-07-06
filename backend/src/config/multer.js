'use strict';

const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const AppError = require('../utils/AppError');

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_DOC_TYPES = [...ALLOWED_IMAGE_TYPES, 'application/pdf'];
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024; // 10MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (allowedTypes) => (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`, 400), false);
  }
};

const uploadDocument = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: fileFilter(ALLOWED_DOC_TYPES),
});

const uploadImage = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: fileFilter(ALLOWED_IMAGE_TYPES),
});

module.exports = { uploadDocument, uploadImage };
