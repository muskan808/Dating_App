import mongoose from "mongoose";
import { Status } from "../app/http/models/status.model";
import { UserSpecificSettings } from "../app/http/models/usersSpecificSettings.model";
import { env } from "../env";
import {
  ALLOWED_DOCUMENT_TYPES,
  ALLOWED_IMAGE_TYPE,
  ALLOWED_VIDEO_TYPE,
  ALLOWED_AUDIO_TYPES,
  Badge,
  UPLOAD_TYPES,
} from "./types";
import schedule from "node-schedule";
import { lastSeenPrivacyEnum } from "../app/http/types/usersSpecificSettings.types";

export const queueConnection = {
  connection: {
    host: env.redis.host,
    port: env.redis.port,
  },
};
export const exportContentType = (type: string) => {
  if (type === "pdf") {
    return "application/pdf";
  } else if (type === "xlsx") {
    return "application/vnd.ms-excel";
  } else {
    return "text/csv";
  }
};

export enum fileTypeEnum {
  PNG = "PNG",
  JPEG = "JPEG",
  JPG = "JPG",
  WEBP = "WEBP",
  HEIC = "HEIC",

  MP4 = "MP4",
  MOV = "MOV",
  MKV = "MKV",

  DOC = "DOC",
  DOCX = "DOCX",
  PDF = "PDF",
  XLSX = "XLSX",
  PPTX = "PPTX",
  XLS = "XLS",

  MP3 = "MP3",
  AMR = "AMR",
  "3GP" = "3GP",
  AAC = "AAC",
  MPEG = "MPEG",
  M4A = "M4A",
  OGG = "OGG",
}
export const pagination = (
  totalCount: number,
  perPage: number,
  page: number
) => {
  return {
    total: totalCount,
    per_page: perPage,
    current_page: page,
    last_page: Math.ceil(totalCount / perPage),
  };
};

export const randomPasswordGenerator = () => {
  return Math.random().toString(36).slice(-8);
};

export const validFileTypes = (type: UPLOAD_TYPES) => {
  if (type === UPLOAD_TYPES.IMAGE) {
    return ALLOWED_IMAGE_TYPE;
  } else if (type === UPLOAD_TYPES.VIDEO) {
    return ALLOWED_VIDEO_TYPE;
  } else if (type === UPLOAD_TYPES.DOCUMENT) {
    return ALLOWED_DOCUMENT_TYPES;
  } else if (type === UPLOAD_TYPES.MUSIC) {
    return ALLOWED_AUDIO_TYPES;
  } else if (type === UPLOAD_TYPES.ALLOWED_IMAGE_VIDEO_MUSIC_DOCUMENT) {
    return [
      ...ALLOWED_IMAGE_TYPE,
      ...ALLOWED_VIDEO_TYPE,
      ...ALLOWED_DOCUMENT_TYPES,
      ...ALLOWED_AUDIO_TYPES,
    ];
  }
  return [];
};

export const STORAGE_PATH = env.app.root_dir + "/storage/uploads";

export const DEFAULT_DATE_FORMAT = "DD-MM-YYYY hh:mm:ss";

export const cleanString = (input: string) => {
  // Remove special characters and replace spaces with underscores
  const cleanedString = input
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/\s+/g, "_")
    .toLowerCase();
  return cleanedString;
};

export const TIME_SLOT = [
  "09:00:00 - 09:15:00",
  "09:15:00 - 09:30:00",
  "09:30:00 - 09:45:00",
  "09:45:00 - 10:00:00",
  "10:00:00 - 10:15:00",
  "10:15:00 - 10:30:00",
  "10:30:00 - 10:45:00",
  "10:45:00 - 11:00:00",
  "11:00:00 - 11:15:00",
  "11:15:00 - 11:30:00",
  "11:30:00 - 11:45:00",
  "11:45:00 - 12:00:00",
  "12:00:00 - 12:15:00",
  "12:15:00 - 12:30:00",
  "12:30:00 - 12:45:00",
  "12:45:00 - 13:00:00",
  "13:00:00 - 13:15:00",
  "13:15:00 - 13:30:00",
  "13:30:00 - 13:45:00",
  "13:45:00 - 14:00:00",
  "14:00:00 - 14:15:00",
  "14:15:00 - 14:30:00",
  "14:30:00 - 14:45:00",
  "14:45:00 - 15:00:00",
  "15:00:00 - 15:15:00",
  "15:15:00 - 15:30:00",
  "15:30:00 - 15:45:00",
  "15:45:00 - 16:00:00",
];

export const GetFileType = (mimeType: string) => {
  if (ALLOWED_IMAGE_TYPE.includes(mimeType)) {
    const type = mimeType.split("/")[1];
    if (type === "png") {
      return fileTypeEnum.PNG;
    }
    if (type === "jpeg") {
      return fileTypeEnum.JPEG;
    }
    if (type === "jpg") {
      return fileTypeEnum.JPG;
    }
    if (type === "webp") {
      return fileTypeEnum.WEBP;
    }
  } else if (ALLOWED_VIDEO_TYPE.includes(mimeType)) {
    const type = mimeType.split("/")[1];
    if (type === "mp4") {
      return fileTypeEnum.MP4;
    }
    if (type === "mkv") {
      return fileTypeEnum.MKV;
    }
  } else if (ALLOWED_AUDIO_TYPES.includes(mimeType)) {
    const type = mimeType.split("/")[1];
    if (type == "mp3") {
      return fileTypeEnum.MP3;
    }
  } else if (ALLOWED_DOCUMENT_TYPES.includes(mimeType)) {
    const type = mimeType.split("/")[1];
    if (type === "doc") {
      return fileTypeEnum.DOC;
    }
    if (type === "docx") {
      return fileTypeEnum.DOCX;
    }
    if (type === "pdf") {
      return fileTypeEnum.PDF;
    }
    if (type === "xlsx") {
      return fileTypeEnum.XLSX;
    }
  }
};

export const createSlug = (title: string) => {
  return title
    .toLowerCase() // Convert to lowercase
    .replace(/[^\w\s-]/g, "") // Remove non-word characters (alphanumeric, underscores, and hyphens)
    .trim() // Remove leading and trailing whitespaces
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/--+/g, "-"); // Replace consecutive hyphens with a single hyphen
};

export const generateRandomPassword = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";

  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters[randomIndex];
  }

  return password;
};

export const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString(); // Generates a random 6-digit OTP
};

export const BadgeData = (user: any) => {
  let data: Badge = {
    host: env.app.host,
    id: user.id,
    userNo: user?.userNo,
    date: "2-3 May 2023",
    boothName: user.Booth.boothName,
    venue: "The Kenyatta International Convention Centre, Nairobi,Kenya",
    title: user.title,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNo: user.displayPhone,
    country: user.Country.name,
    city: user.City?.name,
    companyName: user.Company?.companyName,
  };
};

export const suggestAlternatives = (username: string) => {
  let suggestions = [];
  suggestions.push(`${username}_1`);
  suggestions.push(`${username}123`);
  suggestions.push(`the_real_${username}`);
  suggestions.push(`${username}_pro`);

  return suggestions;
};

export const getRoomList = (rooms: any) => {
  const roomList: any = [];

  rooms.forEach((value: any, key: any) => {
    roomList.push(key);
  });

  return roomList;
};

export const manageScheduleJob = async (
  createStatus: any,
  scheduleDate?: any
) => {
  const deleteAfter24Hours = 24 * 60 * 60 * 1000;

  const deleteStatusJob = async () => {
    await Status.findByIdAndDelete(createStatus._id);
    console.log(`Status ${createStatus._id} deleted after 24 hours`);
  };

  if (scheduleDate) {
    const scheduleCronName = schedule.scheduleJob(
      new Date(scheduleDate),
      async () => {
        await Status.findByIdAndUpdate(createStatus._id, {
          updatedAt: new Date(),
          createdAt: new Date(),
        });
        console.log(`Status ${createStatus._id} updated at scheduled time`);

        const cronNameForDelete = schedule.scheduleJob(
          new Date(Date.now() + deleteAfter24Hours),
          deleteStatusJob
        );
        console.log(cronNameForDelete, "maulik271");
        await Status.updateOne(
          { _id: createStatus._id },
          { $set: { delete24CronName: cronNameForDelete?.name } }
        );
      }
    );
    console.log(scheduleCronName, "maulik277", scheduleDate);
    await Status.updateOne(
      { _id: createStatus._id },
      { $set: { scheduleName: scheduleCronName?.name } }
    );
  } else {
    const cronNameForDelete = schedule.scheduleJob(
      new Date(Date.now() + deleteAfter24Hours),
      deleteStatusJob
    );

    await Status.updateOne(
      { _id: createStatus._id },
      { $set: { delete24CronName: cronNameForDelete?.name } }
    );
  }
};

export const deleteOldCron = (name1: any, name2: any) => {
  schedule.cancelJob(name1);
  schedule.cancelJob(name2);
  return null;
};

export const extractNumbers = (str: string) => {
  return str?.replace(/\D/g, ""); // \D matches any non-digit character
};

export const verifyUserIsMuted = async (userId: string, opponentId: string) => {
  try {
    const setting = await UserSpecificSettings.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      "userwiseSetting.userId": new mongoose.Types.ObjectId(opponentId),
      "userwiseSetting.muted": true,
    });

    return setting ? true : false;
  } catch (error: any) {
    return error;
  }
};

export const lastSeenSettingVerify = async (
  userId: string,
  opponentId: string
) => {
  try {
    const setting: any = await UserSpecificSettings.findOne({
      userId: new mongoose.Types.ObjectId(opponentId),
    });
    const lastSeenType =
      setting?.generalSettings?.privacySettings?.lastSeeen?.lastSeenType;
    const exceptContacts =
      setting?.generalSettings?.privacySettings?.lastSeeen?.exceptContacts;

    if (!lastSeenType) {
      return true;
    } else {
      console.log(
        lastSeenType,
        exceptContacts,
        "maulik334",
        userId,
        opponentId,
        lastSeenPrivacyEnum
      );
      if (lastSeenType === lastSeenPrivacyEnum.EVERYONE) {
        return true;
      } else if (lastSeenType === lastSeenPrivacyEnum.MY_CONTACTS) {
        return false;
      } else if (lastSeenType === lastSeenPrivacyEnum.MY_CONTACTS_EXCEPT) {
        return false;
      } else if (lastSeenType === lastSeenPrivacyEnum.NOBODY) {
        return false;
      } else {
        return true;
      }
    }
  } catch (error: any) {
    return error;
  }
};
