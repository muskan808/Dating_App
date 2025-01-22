import { model, Schema } from "mongoose";
import {
  chatTypes,
  messageTypeEnum,
  readStatusEnum,
  scheduleMessageStatus,
} from "../types/chat.types";

const reactionSchema = new Schema({
  reactionMessage: {
    type: String,
  },
  userId: {
    type: Schema.Types.ObjectId,
  },
});

const chatSchema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
    },
    message: {
      type: String,
    },
    messageType: {
      type: String,
      enum: messageTypeEnum,
      default: messageTypeEnum.TEXT,
      required: true,
    },
    attachedMessage: {
      type: String,
    },
    updated: {
      type: Boolean,
    },
    readStatus: {
      type: String,
      enum: readStatusEnum,
      default: readStatusEnum.SENDED,
      required: true,
    },
    replyMessageId: {
      type: Schema.Types.ObjectId,
    },
    contactId: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    reactions: [reactionSchema],
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
    forwarded: {
      type: Boolean,
      default: false,
    },
    local_id: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
    },
    deleteForSender: {
      type: Date,
    },
    deletedFor: {
      type: Array,
    },
    deletedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Chats = model<chatTypes>("chats", chatSchema);

export { Chats, chatTypes };
