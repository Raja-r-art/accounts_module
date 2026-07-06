'use strict';

const QRCode = require('qrcode');

/**
 * Generate QR Code as a Data URL (base64)
 */
const generateQRCodeDataURL = async (data) => {
  const qrData = typeof data === 'object' ? JSON.stringify(data) : String(data);
  return QRCode.toDataURL(qrData, {
    errorCorrectionLevel: 'M',
    margin: 1,
    scale: 4,
    color: { dark: '#000000', light: '#FFFFFF' },
  });
};

/**
 * Generate QR Code as a Buffer
 */
const generateQRCodeBuffer = async (data) => {
  const qrData = typeof data === 'object' ? JSON.stringify(data) : String(data);
  return QRCode.toBuffer(qrData, { errorCorrectionLevel: 'M', margin: 1, scale: 4 });
};

module.exports = { generateQRCodeDataURL, generateQRCodeBuffer };
