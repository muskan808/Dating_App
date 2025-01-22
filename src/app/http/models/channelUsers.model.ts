import { model, Schema } from "mongoose";
import { channelUsersTypes } from "../types/channelUsers.types";

const channelUsersSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    channelId: {
      type: Schema.Types.ObjectId,
      ref: "channel",
    },
    countryId: { type: Schema.Types.ObjectId, ref: "phone_codes" },
    isOwner: {
      type: Boolean,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
    },
    deletedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const ChannelUsers = model<channelUsersTypes>(
  "channel_users",
  channelUsersSchema
);

export { ChannelUsers, channelUsersTypes };
