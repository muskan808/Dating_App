import { Document } from "mongoose";

export enum userGenderEnum {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export enum statusEnum {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum registrationTypeEnum {
  EMAIL = "EMAIL",
  PHONENUMBER = "PHONENUMBER",
  BOTH = "BOTH",
}

export enum securityMode {
  TWOFA = "TWOFA",
  PIN = "PIN",
  NONE = "NONE",
}

export enum messageRemoveTimerEnum {
  "24_HOURS" = "24_HOURS",
  "7_DAYS" = "7_DAYS",
  "90_DAYS" = "90_DAYS",
  OFF = "OFF",
}

export enum lastSeenPrivacyEnum {
  "EVERYONE" = "EVERYONE",
  "MY_CONTACTS" = "MY_CONTACTS",
  "MY_CONTACTS_EXCEPT" = "MY_CONTACTS_EXCEPT",
  "NOBODY" = "NOBODY",
}

export interface userTypes extends Document {
  email: string;
  username: string;
  password: string;
  name: string;
  bio: string;
  dateOfBirth: string | Date;
  gender: userGenderEnum;
  image: string;
  phoneCode: string;
  sequrity: string;
  locationSetting: any;
  languageId: {
    _id: string;
    name: string;
  };
  phoneNumber: string;
  countryId: string;
  status: statusEnum;
  registrationType: registrationTypeEnum;
  profileCompleted: Boolean;
  messageRemoveTimer: messageRemoveTimerEnum;
  showNotification: Boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
