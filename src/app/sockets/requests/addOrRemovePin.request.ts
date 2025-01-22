import { object, string, mixed, boolean } from "yup";

export const addOrRemovePinRequest = object({
    chatId: string().required(),
    deleted: boolean().optional()
})
