import { object, string } from "yup";

export const UpdateLanguagesRequest = object({
  languageId: string().required(),
});
