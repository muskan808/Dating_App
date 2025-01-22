import { model, Schema } from "mongoose";

const channelMessageReactionSchema = new Schema(
  {
    messageId: {
      type: Schema.Types.ObjectId,
      ref: "channel_messages",
    },
    message: {
      type: String,
    },
    userId: {
      type: Schema.Types.ObjectId,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
    },
    deletedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const ChannelMessageReactions = model(
  "channel_message_reaction",
  channelMessageReactionSchema
);

export { ChannelMessageReactions };
