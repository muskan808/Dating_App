import { object, string, mixed } from "yup";
import { securityMode } from "../../../types/users.types";

export const VerifyPinRequest = object({
  oldPin: string().optional(),
  newPin: string().required(),
});

export const Set2FAMode = object({
  mode: mixed<securityMode>().oneOf(Object.values(securityMode)).required(),
});
