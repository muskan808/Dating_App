import { object, string, mixed } from "yup";

export const addOrRemoveReactionRequest = object({
    chatId: string().required(),
    reactionMessage: string().required(),
    reactionMessageId: string().optional().nullable()
})
