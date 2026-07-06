'use strict';

const DashboardService = require('../services/dashboard.service');
const { sendSuccess } = require('../utils/response.util');

class DashboardController {
  async getStats(req, res) {
    const stats = await DashboardService.getStats();
    return sendSuccess(res, 200, 'Dashboard statistics fetched successfully.', stats);
  }

  async getChartsData(req, res) {
    const charts = await DashboardService.getChartsData();
    return sendSuccess(res, 200, 'Dashboard charts data fetched successfully.', charts);
  }
}

module.exports = new DashboardController();
