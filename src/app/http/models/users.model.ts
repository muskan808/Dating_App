import { model, Schema } from "mongoose";
import {
  userTypes,
  statusEnum,
  userGenderEnum,
  registrationTypeEnum,
  securityMode,
} from "../types/users.types";

const usersSchema = new Schema(
  {
    email: {
      type: String,
    },
    username: {
      type: String,
    },
    password: {
      type: String,
    },
    name: {
      type: String,
    },
    bio: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: userGenderEnum,
    },
    image: {
      type: String,
    },
    phoneCode: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    mergedPhoneNumber: {
      type: String,
    },
    status: {
      type: String,
      enum: statusEnum,
    },
    registrationType: {
      type: String,
      enum: registrationTypeEnum,
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
    },
    online: {
      type: Boolean,
    },
    countryId: { type: Schema.Types.ObjectId, ref: "Country" },
    messageRemoveTimer: {
      type: String,
    },
    sequrity: {
      type: String,
      enum: securityMode,
      default: securityMode.NONE,
    },
    twofaQR: {
      type: String,
    },
    twofaCode: {
      type: String,
    },
    pin: {
      type: String,
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    locationSetting: {
      type: Object,
    },
    showNotification: {
      type: Boolean,
    },
    backgroudOption: {
      type: Object,
    },
    chatOptions: {
      type: Object,
    },
    contacts: [
      {
        name: String,
        number: String,
      },
    ],
    lastSeenPrivacy: {
      type: String,
    },
    exceptContacts: [
      {
        name: String,
        number: String,
      },
    ],
    languageId: { type: Schema.Types.ObjectId, ref: "Languages" },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: Date,
    deletedAt: Date,
  },
  { timestamps: true }
);

const Users = model<userTypes>("users", usersSchema);

// Create 2dsphere index for the location field
usersSchema.index({ location: "2dsphere" });

// Define the interface for the User model

export { userTypes, Users };
