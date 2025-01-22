import { model, Schema } from "mongoose";
import { readStatusEnum, channelMessageStatusTypes } from "../types/channelMessageStatus.types";

const channelMessageStatusSchema = new Schema({
    messageId: {
        type: Schema.Types.ObjectId
    },
    status: {
        type: String,
        enum: readStatusEnum,
        default: readStatusEnum.SENDED
    },
    userId: {
        type: Schema.Types.ObjectId
    },
    channelId: {
        type: Schema.Types.ObjectId
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
}, { timestamps: true })

const ChannelMessageStatus = model<channelMessageStatusTypes>("channel_message_status", channelMessageStatusSchema);

export { ChannelMessageStatus, readStatusEnum, channelMessageStatusTypes };