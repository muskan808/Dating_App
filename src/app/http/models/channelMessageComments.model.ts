import { model, Schema } from "mongoose";
import { channelMessageCommentsTypes } from "../types/channelMessageComments.types";

const reactionSchema = new Schema({
    reactionMessage: {
      type: String,
    },
    userId: {
      type: Schema.Types.ObjectId,
    },
});
const channelMessageCommentsSchema = new Schema({
    messageId: {
        type: Schema.Types.ObjectId
    },
    message: {
        type: String
    },
    userId: {
        type: Schema.Types.ObjectId
    },
    reactions: [reactionSchema],
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

const ChannelMessageComments = model<channelMessageCommentsTypes>("channel_message_comments", channelMessageCommentsSchema);

export { ChannelMessageComments, channelMessageCommentsTypes };