import { Document } from "mongoose";

export interface chatBackgroundTypes extends Document {
    id: string,
    url: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}