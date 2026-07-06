'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { ROLES } = require('../constants/roles');
const { USER_STATUS } = require('../constants/status');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required: [name, email, password, role]
 *       properties:
 *         _id: { type: string }
 *         name: { type: string }
 *         email: { type: string, format: email }
 *         mobile: { type: string }
 *         role: { type: string, enum: [super_admin, principal, accountant, student, parent] }
 *         status: { type: string, enum: [active, inactive, suspended] }
 *         createdAt: { type: string, format: date-time }
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    mobile: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian mobile number'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: Object.values(ROLES),
        message: 'Invalid role',
      },
      required: [true, 'Role is required'],
      default: ROLES.STUDENT,
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
    lastLogin: { type: Date },
    loginCount: { type: Number, default: 0 },
    avatar: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ createdAt: -1 });

// ─── Virtuals ───────────────────────────────────────────────────────────────
userSchema.virtual('isActive').get(function () {
  return this.status === USER_STATUS.ACTIVE;
});

// ─── Hooks ──────────────────────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const rounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 12;
  this.password = await bcrypt.hash(this.password, rounds);
  if (!this.isNew) this.passwordChangedAt = new Date();
  next();
});

// ─── Instance Methods ────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  return resetToken;
};

userSchema.methods.createEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return token;
};

userSchema.methods.wasPasswordChangedAfter = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedAt = Math.floor(this.passwordChangedAt.getTime() / 1000);
    return jwtTimestamp < changedAt;
  }
  return false;
};

// ─── Statics ────────────────────────────────────────────────────────────────
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByEmailWithPassword = function (email) {
  return this.findOne({ email: email.toLowerCase() }).select('+password');
};

const User = mongoose.model('User', userSchema);
module.exports = User;
