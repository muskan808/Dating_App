import { array, object, string } from "yup";

export const ChannelAddRequest = object({
  name: string().required(),
  description: string().required(),
  icon: string().required(),
  channelId: string().optional(),
});
