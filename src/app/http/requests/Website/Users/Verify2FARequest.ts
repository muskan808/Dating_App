import { object, string, mixed } from "yup";

export const Verify2FARequest = object({
  secret: string().required(),
  token: string().required(),
});
