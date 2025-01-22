import { Document } from "mongoose";

export interface channelMessageCommentsTypes extends Document {
    id: string;
    messageId: string;
    message: string;
    userId: string;
    reactions: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date
}