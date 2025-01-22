import { type } from "os";

// export enum PushNotificationChannels {
//   DATABASE = "db",
//   PUSH = "fcm",
//   MAIL = "mail",
// }

export enum CronEnums {
  EVERY_MINUTE = "* * * * * ",
  EVERY_FIVE_MINUTES = "*/5 * * * * ",
  EVERY_10_MINUTES = "*/10 * * * * ",
  EVERY_15_MINUTES = "*/15 * * * * ",
  EVERY_30_MINUTES = "*/30 * * * *",
  EVERY_HOUR = "0 * * * *",
  EVERYDAY_MIDNIGHT = "0 0 * * *",
}

// export type sendPushNotificationType = {
//   fcmTokens: string[];
//   messagePayload: MessagingPayload;
// };

export interface SendMailType {
  subject: string;
  email: string;
}

export interface SendLeaveAppliedMailType extends SendMailType {
  startDate: Date;
  endDate: Date;
  fullName: string;
  otherUserFullName: string;
  count: number;
}
export interface SendMemberAddedMailType extends SendMailType {
  fullName: string;
  otherUserFullName: string;
}
export interface SendLeaveResponseType extends SendMailType {
  fullName: string;
  startDate: string;
  endDate: string;
  status: string;
}

export enum UPLOAD_TYPES {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  MUSIC = "MUSIC",
  DOCUMENT = "DOCUMENT",
  ALLOWED_IMAGE_VIDEO_MUSIC_DOCUMENT = "ALLOWED_IMAGE_VIDEO_MUSIC_DOCUMENT",
}

export const ALLOWED_IMAGE_TYPE = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/gif",
];

export const ALLOWED_VIDEO_TYPE = [
  "video/mp4",
  "video/x-matroska",
  "video/quicktime",
];

export const ALLOWED_DOCUMENT_TYPES = [
  "text/plain",
  "application/pdf",
  "application/doc",
  "application/msword",
  "application/docx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/octet-stream",
  "application/vnd.ms-excel",
];

export const ALLOWED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/amr",
  "video/3gpp",
  "audio/aac",
  "video/mpeg",
  "audio/mp4",
  "audio/ogg",
];

export type Badge = {
  host: string;
  id: string;
  userNo: String | null;
  date: string;
  boothName?: string;
  venue: string;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string;
  country: string;
  city?: string;
  companyName?: string;
  QRLogo?: string;
};

export interface UploadedFile extends Express.Multer.File {
  key: string;
  originalname: string;
  mimetype: string;
  size: number;
  location: string; // The S3 object URL
}

export interface SettingsItem {
  id: string;
  key: string;
  value: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface GroupedSettingsItem {
  type: string;
  data: SettingsItem[];
}

export interface expoAgendaDescriptionType {
  id: number;
  startTime: Date;
  endTime: Date;
  subject: string;
  description: string;
}

export interface updateExpoAgendaDescriptionType {
  id: string;
  startTime: Date;
  endTime: Date;
  subject: string;
  description: string;
}
