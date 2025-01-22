import { model, Schema } from "mongoose";
import { stickerTypes } from "../types/sticker.types";

const stickerSchema = new Schema({
    title: {
        type: String
    },
    url: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    },
    deletedAt: {
        type: Date
    }
})

const Stickers = model<stickerTypes>("stickers", stickerSchema);

export { Stickers, stickerTypes };