import { Document } from "mongoose";

export enum readStatusEnum {
    SENDED = "SENDED",
    RECEIVED = "RECEIVED",
    READED = "READED",
    SCHEDULE = "SCHEDULE",
}

export interface channelMessageStatusTypes extends Document {
    id: string;
    messageId: string;
    status: readStatusEnum;
    userId: string;
    channelId: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date
}