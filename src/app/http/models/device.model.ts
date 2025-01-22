import mongoose from 'mongoose';
import { deviceType, devicesTypeEnum } from '../types/auth.types';
import { env } from '../../../env';

const deviceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    authToken: { type: String, unique: true },
    device: {
      type: String,
      enum: devicesTypeEnum,
      require: true
    },
    notificationToken: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: parseInt(env.auth.deviceExpireIn) * 60 * 60 * 1000,
    },
    updatedAt: Date,
    deletedAt: Date,
  },
  { timestamps: true }
);

const Device = mongoose.model<deviceType>("Device", deviceSchema);

export { deviceType, Device };
