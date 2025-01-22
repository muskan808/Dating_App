import { array, boolean, object, string } from "yup";

export const ChannelFollowRequest = object({
  channelId: string().required(),
  follow: boolean().required(),
});

export const ChannelSavePostRequest = object({
  messageId: array()
    .of(string().required("Message ID is required"))
    .min(1, "Array must contain at least one valid Message ID") // Minimum one valid value
    .required("Message ID array is required"),
});
