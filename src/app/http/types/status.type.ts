import mongoose from "mongoose";

export interface IStatus extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  content: string;
  mediaUrl?: string;
  filter: string;
  sticker?: string;
  music?: string;
  scheduleStatus?: string;
  scheduleDate: Date;
  scheduleName: String;
  delete24CronName: String;
  sharePeople: String;
  specificUsersIds: mongoose.Schema.Types.ObjectId;
  updatedAt: Date;
  deletedAt: Date;
}
