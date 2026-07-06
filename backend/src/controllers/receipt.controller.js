'use strict';

const ReceiptService = require('../services/receipt.service');
const { sendSuccess, sendPaginated } = require('../utils/response.util');
const { MESSAGES } = require('../constants/messages');

class ReceiptController {
  async getReceiptById(req, res) {
    const receipt = await ReceiptService.getReceiptById(req.params.id);
    return sendSuccess(res, 200, MESSAGES.FETCH_SUCCESS('Receipt'), receipt);
  }

  async downloadReceiptPDF(req, res) {
    const pdfPath = await ReceiptService.downloadReceiptPDF(req.params.id);
    return res.download(pdfPath);
  }

  async findAllReceipts(req, res) {
    const { receipts, meta } = await ReceiptService.findAllReceipts(req.query);
    return sendPaginated(res, 200, MESSAGES.FETCH_SUCCESS('Receipts'), receipts, meta);
  }
}

module.exports = new ReceiptController();
