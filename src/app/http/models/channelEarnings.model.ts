import { model, Schema, Types } from "mongoose";
import { channelEarningsTypes } from "../types/channelEarnings.types";

const channelEarningSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId
    },
    channelId: {
        type: Schema.Types.ObjectId
    },
    amount: {
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
}, { timestamps: true })

const ChannelEarnings = model<channelEarningsTypes>("channel_earnings", channelEarningSchema);

export { ChannelEarnings, channelEarningsTypes };