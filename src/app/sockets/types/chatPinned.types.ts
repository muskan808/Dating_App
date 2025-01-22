import { Document } from "mongoose";

export enum removingTimeEnum {
    "24_HOURS" = "24_HOURS",
    "7_DAYS" = "7_DAYS",
    "30_DAYS" = "30_DAYS",
    NONE = "NONE"
}

export interface chatPinnedTypes extends Document {
    id: string;
    chatId: string;
    userId: string;
    removingTime: removingTimeEnum;
    createdAt: Date;
    deletedAt: Date;
}