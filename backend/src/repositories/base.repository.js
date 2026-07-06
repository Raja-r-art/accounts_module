'use strict';

/**
 * Base Repository — provides reusable CRUD operations
 */
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findAll({ filter = {}, sort = { createdAt: -1 }, skip = 0, limit = 10, populate = [] } = {}) {
    let query = this.model.find(filter).sort(sort).skip(skip).limit(limit);
    if (populate.length) populate.forEach((p) => { query = query.populate(p); });
    return query.lean();
  }

  async count(filter = {}) {
    return this.model.countDocuments(filter);
  }

  async findById(id, populate = []) {
    let query = this.model.findById(id);
    if (populate.length) populate.forEach((p) => { query = query.populate(p); });
    return query;
  }

  async findOne(filter = {}, populate = []) {
    let query = this.model.findOne(filter);
    if (populate.length) populate.forEach((p) => { query = query.populate(p); });
    return query;
  }

  async create(data) {
    return this.model.create(data);
  }

  async updateById(id, data, options = { new: true, runValidators: true }) {
    return this.model.findByIdAndUpdate(id, data, options);
  }

  async deleteById(id) {
    return this.model.findByIdAndDelete(id);
  }

  async updateOne(filter, data, options = { new: true, runValidators: true }) {
    return this.model.findOneAndUpdate(filter, data, options);
  }

  async aggregate(pipeline) {
    return this.model.aggregate(pipeline);
  }

  async exists(filter) {
    return this.model.exists(filter);
  }

  async bulkCreate(dataArray) {
    return this.model.insertMany(dataArray, { ordered: false });
  }
}

module.exports = BaseRepository;
