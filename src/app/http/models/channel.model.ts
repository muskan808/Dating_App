import { model, Schema } from "mongoose";
import { channelTypes } from "../types/channel.types";

const channelSchema = new Schema(
  {
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    countryId: { type: Schema.Types.ObjectId, ref: "phone_codes" },
    icon: {
      type: String,
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

const Channels = model<channelTypes>("channel", channelSchema);

export { Channels, channelTypes };
