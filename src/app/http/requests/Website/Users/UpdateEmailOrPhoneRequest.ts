import { object, string, mixed, boolean } from "yup";
import { devicesTypeEnum } from "../../../types/auth.types";
import { contactInfoTypeEnum } from "../../../types/otp.types";

export const UpdateEmailOrPhoneRequest = object({
  contactInfoType: mixed<contactInfoTypeEnum>()
    .oneOf(Object.values(contactInfoTypeEnum))
    .required(),
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
  deviceType: mixed<devicesTypeEnum>()
    .oneOf(Object.values(devicesTypeEnum))
    .required(),
});

export const UpdateUsersLocation = object({
  latitude: string().required(),
  longitude: string().required(),
  km: string().optional(),
  gender: string().optional(),
});

export const UpdateUsersLocationSettings = object({
  differentName: boolean().required(),
  name: string().optional(),
  audio: boolean().required(),
  video: boolean().optional(),
  group: boolean().optional(),
  profile: boolean().optional(),
  userId: boolean().optional(),
  mobile: boolean().optional(),
});
