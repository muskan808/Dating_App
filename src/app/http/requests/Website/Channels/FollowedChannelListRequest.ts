import { boolean, object, string } from "yup";

export const FollowedChannelListRequest = object({
    country: string().optional(),
    isOwner: boolean().optional()
})
