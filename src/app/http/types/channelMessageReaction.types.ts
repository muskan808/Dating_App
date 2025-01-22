import { Document } from "mongoose";

export interface channelMessageReactionTypes extends Document {
    id: string;
    messageId: string;
    message: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date
}