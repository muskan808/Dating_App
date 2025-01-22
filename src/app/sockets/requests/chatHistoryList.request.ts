import { object, string, mixed } from "yup";

export const chatHistoryListRequest = object({
    search: string().optional().nullable(),
    page: string().optional().nullable(),
    perPage: string().optional().nullable()
})
