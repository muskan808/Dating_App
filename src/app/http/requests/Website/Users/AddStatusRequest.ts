import { object, string, mixed, boolean, array } from "yup";
import { sharePeopleEnum } from "../../../../sockets/types/chat.types";

export const AddStatusRequest = object({
  content: string().optional(),
  mediaUrl: string().optional(),
  filter: string().optional(),
  sticker: string().optional(),
  music: string().optional(),
  scheduleDate: string()
    .nullable()
    .optional()
    .test(
      "is-future-date",
      "Schedule date must be in the future",
      function (value) {
        if (!value) return true; // If scheduleDate is not provided, validation passes
        return new Date(value).getTime() > new Date().getTime(); // Check if the date is in the future
      }
    ),
  statusId: string()
    .nullable()
    .when(["deleteNow", "scheduleNow"], {
      is: (deleteNow: boolean, scheduleNow: boolean, drafted: boolean) =>
        deleteNow === true || scheduleNow === true || drafted === true,
      then: (schema) =>
        schema.required(
          "statusId is required when deleteNow or scheduleNow or drafted is true"
        ),
      otherwise: (schema) => schema.nullable(),
    }),
  scheduleStatus: string(),
  deleteNow: boolean(),
  sharePeople: string().oneOf(Object.values(sharePeopleEnum)).required(),
  specificUsersIds: array().when("sharePeople", {
    is: "ALL",
    then: (schema) =>
      schema
        .max(0, "specificUsersIds must be empty when sharePeople is ALL")
        .nullable(),
    otherwise: (schema) =>
      schema
        .min(
          1,
          "At least one specific user is required when sharePeople is SPECIFIC"
        )
        .required(),
  }),
});
