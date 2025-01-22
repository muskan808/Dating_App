import { Document } from "mongoose";

export enum devicesTypeEnum {
  IOS = "IOS",
  ANDROID = "ANDROID",
  WEB = "WEB",
}

export interface deviceType extends Document {
  userId: string;
  authToken: string;
  device: devicesTypeEnum;
  notificationToken: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
