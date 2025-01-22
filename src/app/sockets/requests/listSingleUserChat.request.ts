import { object, string, mixed } from "yup";

export const listSingleUserChatRequest = object({
    userId: string().required()
})
