import { object, string, mixed, boolean } from "yup";
import { messageTypeEnum } from "../types/chat.types";

export const sendMessageRequest = object({
  userId: string().optional(),
  message: string().required(),
  messageType: mixed<messageTypeEnum>()
    .oneOf(Object.values(messageTypeEnum))
    .required(),
  attachedMessage: string().optional(),
  scheduleDate: string().optional().nullable(),
  isSilent: boolean().optional(),
  messageId: string()
    .nullable()
    .when(["deleteNow", "scheduleNow"], {
      is: (deleteNow: boolean, scheduleNow: boolean) =>
        deleteNow === true || scheduleNow === true,
      then: (schema) =>
        schema.required(
          "messageId is required when deleteNow or scheduleNow is true"
        ),
      otherwise: (schema) => schema.nullable(),
    }),
  deleteNow: boolean().optional(),
  scheduleNow: boolean().optional(),
  forwarded: boolean().optional(),
  replyMessageId: string().optional().nullable(),
  contactId: string().optional().nullable(),
  local_id: string().optional()
});
