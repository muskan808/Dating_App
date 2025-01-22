import { object, string, mixed } from "yup";
import { deleteTypeEnum } from "../types/chat.types";

export const deleteMessageRequest = object({
    chatId: string().required(),
    deleteType: mixed<deleteTypeEnum>().oneOf(Object.values(deleteTypeEnum)).required()
})
