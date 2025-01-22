import { Document } from "mongoose";

export enum registrationTypeEnum {
    EMAIL = "EMAIL",
    PHONENUMBER = "PHONENUMBER",
    BOTH = "BOTH"
}

export enum contactInfoTypeEnum {
    EMAIL = "EMAIL",
    PHONENUMBER = "PHONENUMBER",
    BOTH = "BOTH"
}

export enum otpTypeEnum {
    SETUP = "SETUP",
    FORGOT = "FORGOT"
}

export interface otpTypes extends Document {
    registrationType: registrationTypeEnum;
    contactInfoType: contactInfoTypeEnum;
    phoneCode: string;
    phoneNumber: string;
    email: string;
    otp: string;
    otpVerified: Boolean;
    otpType: otpTypeEnum;
    token: string;
    createdAt: Date;
    updatedAt: Date;
}