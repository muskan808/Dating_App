import { model, Schema } from "mongoose";
import {
  registrationTypeEnum,
  otpTypes,
  otpTypeEnum,
  contactInfoTypeEnum,
} from "../types/otp.types";
import { env } from "../../../env";

const otpSchema = new Schema(
  {
    registrationType: {
      type: String,
      enum: registrationTypeEnum,
    },
    contactInfoType: {
      type: String,
      enum: contactInfoTypeEnum
    },
    phoneCode: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    email: {
      type: String,
    },
    otp: {
      type: String,
    },
    callId: {
      type: String,
    },
    otpVerified: {
      type: Boolean,
    },
    otpType: {
      type: String,
      enum: otpTypeEnum,
    },
    token: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 60 * 5,
    },
    updatedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Otp = model<otpTypes>("otp", otpSchema);

export { Otp, otpSchema };
