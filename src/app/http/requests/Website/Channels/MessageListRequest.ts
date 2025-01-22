import { object, string } from "yup";

export const MessageListRequest = object({
    channelId: string().optional()
})
