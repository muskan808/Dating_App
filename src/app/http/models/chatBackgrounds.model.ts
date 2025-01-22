import { model, Schema, Model } from 'mongoose';
import { chatBackgroundTypes } from '../types/chatBackgrounds.types';

const chatBackgroundSchema = new Schema({
    url: {
        type: String
    },
    name: {
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
}, { timestamps: true });

const ChatBackgrounds = model<chatBackgroundTypes>("chat_backgrounds", chatBackgroundSchema);

export { ChatBackgrounds, chatBackgroundTypes };