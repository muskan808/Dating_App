import { object, string, mixed } from "yup";
import { registrationTypeEnum } from "../../../types/users.types";

export const VerifyOTPRequest = object({
  registrationType: mixed<registrationTypeEnum>()
    .oneOf(Object.values(registrationTypeEnum))
    .required(),
  otp: string().when("registrationType", {
    is: registrationTypeEnum.EMAIL,
    then: (schema) => schema.required(),
  }),
  callId: string().when("registrationType", {
    is: registrationTypeEnum.PHONENUMBER,
    then: (schema) => schema.required(),
  }),
  phoneCode: string().when("registrationType", {
    is: registrationTypeEnum.PHONENUMBER,
    then: (schema) => schema.required(),
  }),
  phoneNumber: string().when("registrationType", {
    is: registrationTypeEnum.PHONENUMBER,
    then: (schema) => schema.required(),
  }),
  email: string().when("registrationType", {
    is: registrationTypeEnum.EMAIL,
    then: (schema) => schema.required(),
  }),
});

export const ResendOtpOrCallRequest = object({
  registrationType: mixed<registrationTypeEnum>()
    .oneOf(Object.values(registrationTypeEnum))
    .required(),
  phoneCode: string().when("registrationType", {
    is: registrationTypeEnum.PHONENUMBER,
    then: (schema) => schema.required(),
  }),
  phoneNumber: string().when("registrationType", {
    is: registrationTypeEnum.PHONENUMBER,
    then: (schema) => schema.required(),
  }),
  email: string().when("registrationType", {
    is: registrationTypeEnum.EMAIL,
    then: (schema) => schema.required(),
  }),
  deviceType: string().optional()
});
