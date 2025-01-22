import mongoose, { Schema, Document } from "mongoose";
import {
  scheduleMessageStatus,
  sharePeopleEnum,
} from "../../sockets/types/chat.types";
import { IStatus } from "../types/status.type";

const statusSchema = new Schema<IStatus>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    content: { type: String, required: false },
    mediaUrl: { type: String, required: false },
    filter: { type: String, required: false },
    sticker: { type: String, required: false },
    music: { type: String, required: false },
    scheduleStatus: {
      type: String,
      enum: scheduleMessageStatus,
    },
    scheduleDate: {
      type: Date,
    },
    scheduleName: {
      type: String,
    },
    delete24CronName: {
      type: String,
    },
    sharePeople: {
      type: String,
      enum: sharePeopleEnum,
    },
    specificUsersIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "users",
    },
  },
  { timestamps: true }
);

export const Status = mongoose.model<IStatus>("status", statusSchema);
