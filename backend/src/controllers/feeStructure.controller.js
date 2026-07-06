'use strict';

const FeeStructureService = require('../services/feeStructure.service');
const { sendSuccess, sendPaginated } = require('../utils/response.util');
const { MESSAGES } = require('../constants/messages');

class FeeStructureController {
  async createFeeStructure(req, res) {
    const fsData = { ...req.body, createdBy: req.user.id };
    const fs = await FeeStructureService.createFeeStructure(fsData);
    return sendSuccess(res, 201, MESSAGES.CREATE_SUCCESS('Fee structure'), fs);
  }

  async getFeeStructureById(req, res) {
    const fs = await FeeStructureService.getFeeStructureById(req.params.id);
    return sendSuccess(res, 200, MESSAGES.FETCH_SUCCESS('Fee structure'), fs);
  }

  async updateFeeStructure(req, res) {
    const fs = await FeeStructureService.updateFeeStructure(req.params.id, req.body);
    return sendSuccess(res, 200, MESSAGES.UPDATE_SUCCESS('Fee structure'), fs);
  }

  async deleteFeeStructure(req, res) {
    await FeeStructureService.deleteFeeStructure(req.params.id);
    return sendSuccess(res, 200, MESSAGES.DELETE_SUCCESS('Fee structure'));
  }

  async findAllFeeStructures(req, res) {
    const { feeStructures, meta } = await FeeStructureService.findAllFeeStructures(req.query);
    return sendPaginated(res, 200, MESSAGES.FETCH_SUCCESS('Fee structures'), feeStructures, meta);
  }
}

module.exports = new FeeStructureController();
