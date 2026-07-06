'use strict';

/**
 * Build pagination options from request query
 * @param {Object} query - Express request query object
 * @returns {Object} { page, limit, skip, sort }
 */
const getPaginationOptions = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  // Build sort object
  let sort = {};
  if (query.sortBy) {
    const sortOrder = query.sortOrder === 'desc' ? -1 : 1;
    sort[query.sortBy] = sortOrder;
  } else {
    sort.createdAt = -1; // default: newest first
  }

  return { page, limit, skip, sort };
};

/**
 * Build pagination metadata
 */
const getPaginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page < Math.ceil(total / limit),
  hasPrevPage: page > 1,
});

/**
 * Build search and filter query from request
 */
const buildSearchQuery = (query, searchFields = []) => {
  const filter = {};

  // Text search
  if (query.search && searchFields.length > 0) {
    filter.$or = searchFields.map((field) => ({
      [field]: { $regex: query.search, $options: 'i' },
    }));
  }

  return filter;
};

module.exports = { getPaginationOptions, getPaginationMeta, buildSearchQuery };
