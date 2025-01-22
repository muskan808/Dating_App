import mongoose, { Schema, Document, ObjectId } from "mongoose";

interface UserSavedPosts {
  userId: ObjectId; // Reference to the user
  saved: [any]; // Array of saved posts
}

const userSavedPostsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  saved: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "channel_messages", // Reference to the channel_messages collection,
      required: true,
      default: [],
    },
  ],
});

const UserSavedPostsModel = mongoose.model<UserSavedPosts & Document>(
  "user_saved_posts",
  userSavedPostsSchema
);

export default UserSavedPostsModel;
