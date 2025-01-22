import { object, string, mixed } from "yup";

export const readMessageRequest = object({
    userId: string().required()
})
