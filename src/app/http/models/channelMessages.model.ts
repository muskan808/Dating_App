import { model, Schema } from "mongoose";
import {
  channelMessagesTypes,
  messageTypeEnum,
} from "../types/channelMessage.types";

const channelMessagesSchema = new Schema(
  {
    message: {
      type: String,
    },
    attachedMessage: {
      type: String,
    },
    musicLink: {
      type: String,
    },
    messageType: {
      type: String,
      enum: messageTypeEnum,
    },
    isComment: {
      type: Boolean,
    },
    isSave: {
      type: Boolean,
    },
    senderId: {
      type: Schema.Types.ObjectId,
    },
    channelId: {
      type: Schema.Types.ObjectId,
    },
    replyMessageId: {
      type: Schema.Types.ObjectId,
      ref: "channel_messages",
    },
    forwarded: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
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
      default: null,
    },
  },
  { timestamps: true }
);

const ChannelMessages = model<channelMessagesTypes>(
  "channel_messages",
  channelMessagesSchema
);

export { ChannelMessages, channelMessagesTypes, messageTypeEnum };
