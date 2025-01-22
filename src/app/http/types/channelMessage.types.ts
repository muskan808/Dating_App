import { Document } from "mongoose";

export enum messageTypeEnum {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  GIF = "GIF",
  VIDEO = "VIDEO",
  MUSIC = "MUSIC",
  LOCATION = "LOCATION",
  DOCUMENT = "DOCUMENT",
  AUDIO_CALL = "AUDIO_CALL",
  VIDEO_CALL = "VIDEO_CALL",
  CONTACT = "CONTACT",
  MIXED = "MIXED",
  CONSTANT_TEXT = "CONSTANT_TEXT",
}

export interface channelMessagesTypes extends Document {
  id: string;
  message: string;
  attachedMessage: string;
  messageType: messageTypeEnum;
  isComment: boolean;
  isSave: boolean;
  senderId: string;
  channelId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
