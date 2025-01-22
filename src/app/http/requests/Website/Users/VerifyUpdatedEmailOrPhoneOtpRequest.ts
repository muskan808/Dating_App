import { object, string, mixed } from "yup";
import { contactInfoTypeEnum } from "../../../types/otp.types";

export const VerifyUpdatedEmailOrPhoneOTPRequest = object({
    contactInfoType: mixed<contactInfoTypeEnum>()
    .oneOf(Object.values(contactInfoTypeEnum))
    .required(),
  otp: string().when("contactInfoType", {
    is: contactInfoTypeEnum.EMAIL,
    then: (schema) => schema.required(),
  }),
  callId: string().when("contactInfoType", {
    is: contactInfoTypeEnum.PHONENUMBER,
    then: (schema) => schema.required(),
  }),
  phoneCode: string().when("contactInfoType", {
    is: contactInfoTypeEnum.PHONENUMBER,
    then: (schema) => schema.required(),
  }),
  phoneNumber: string().when("contactInfoType", {
    is: contactInfoTypeEnum.PHONENUMBER,
    then: (schema) => schema.required(),
  }),
  email: string().when("contactInfoType", {
    is: contactInfoTypeEnum.EMAIL,
    then: (schema) => schema.required(),
  }),
});
