'use strict';

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    action: {
      type: String,
      required: true,
      enum: ['login', 'logout', 'create', 'update', 'delete', 'view', 'export', 'payment', 'other'],
    },
    resource: { type: String, required: true },
    resourceId: { type: String, default: null },
    ipAddress: { type: String },
    userAgent: { type: String },
    method: { type: String },
    url: { type: String },
    statusCode: { type: Number },
    details: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

auditLogSchema.index({ user: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ resource: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 }); // auto-delete after 90 days

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
