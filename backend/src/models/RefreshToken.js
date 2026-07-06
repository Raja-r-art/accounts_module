'use strict';

const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    ipAddress: { type: String },
    userAgent: { type: String },
    isRevoked: { type: Boolean, default: false },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index — auto-delete when expired
    },
  },
  { timestamps: true }
);

refreshTokenSchema.index({ user: 1 });
refreshTokenSchema.index({ token: 1 }, { unique: true });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

refreshTokenSchema.statics.revokeAllForUser = function (userId) {
  return this.updateMany({ user: userId }, { isRevoked: true });
};

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
module.exports = RefreshToken;
