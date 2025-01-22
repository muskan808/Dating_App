import { object, string, mixed } from "yup";
import { messageTypeEnum } from "../types/chat.types";

export const editMessageRequest = object({
    chatId: string().required(),
    message: string().required(),
    messageType: mixed<messageTypeEnum>().oneOf(Object.values(messageTypeEnum)).required(),
    attachedMessage: string().optional(),
})
