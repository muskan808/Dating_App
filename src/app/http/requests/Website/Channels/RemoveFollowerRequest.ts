import { object, string } from "yup";

export const RemoveFollowerRequest = object({
    channelId: string().optional(),
    userId: string().optional()
})
