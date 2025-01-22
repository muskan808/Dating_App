import { Document } from "mongoose";

export interface channelUsersTypes extends Document {
    id: string;
    userId: string;
    channelId: string;
    isOwner: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date
}