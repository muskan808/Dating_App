import { Document } from "mongoose"

export interface channelEarningsTypes extends Document {
    userId: string;
    channelId: string;
    amount: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date
}