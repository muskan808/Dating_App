import { Document } from "mongoose";

export interface stickerTypes extends Document {
    id: string;
    title: string;
    url: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}