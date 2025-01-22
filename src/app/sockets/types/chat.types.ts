import { Document } from "mongoose";

export enum messageTypeEnum {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  MUSIC = "MUSIC",
  LOCATION = "LOCATION",
  DOCUMENT = "DOCUMENT",
  AUDIO_CALL = "AUDIO_CALL",
  VIDEO_CALL = "VIDEO_CALL",
  CONTACT = "CONTACT",
  MIXED = "MIXED",
  CONSTANT_TEXT = "CONSTANT_TEXT"
}

export enum readStatusEnum {
  SENDED = "SENDED",
  RECEIVED = "RECEIVED",
  READED = "READED",
  SCHEDULE = "SCHEDULE",
}

export enum scheduleMessageStatus {
  SCHEDULE = "SCHEDULE",
  DRAFTED = "DRAFTED",
  POST = "POST",
  SENT = "SENT",
}

export enum sharePeopleEnum {
  ALL = "ALL",
  SPECIFIC = "SPECIFIC",
}

export enum deleteTypeEnum {
  SENDER = "SENDER",
  BOTH = "BOTH",
}

export interface chatTypes extends Document {
  senderId: string;
  receiverId: string;
  message: string;
  messageType: messageTypeEnum;
  updated: Boolean;
  readStatus: readStatusEnum;
  attachedMessage: string;
  forwarded: Boolean;
  deletedFor: Array<any>;
  local_id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  deleteForSender: Date;
}
