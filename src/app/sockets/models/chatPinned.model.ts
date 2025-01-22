import { model, Schema } from "mongoose";
import { chatPinnedTypes, removingTimeEnum } from "../types/chatPinned.types";

const pinnedSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId
    },
    chatId: {
        type: Schema.Types.ObjectId
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    removingTime: {
        type: String,
        enum: removingTimeEnum
    },
    scheduleName: {
        type: String
    },
    deletedAt: {
        type: Date
    }
}, { timestamps: true });

const ChatPinned = model<chatPinnedTypes>("chat_pinned", pinnedSchema);

export { ChatPinned, chatPinnedTypes };