import { object, string, mixed } from "yup";
import { registrationTypeEnum } from "../../../types/users.types";
import { devicesTypeEnum } from "../../../types/auth.types";

export const UserRegisterRequest = object({
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
  deviceType: mixed<devicesTypeEnum>()
    .oneOf(Object.values(devicesTypeEnum))
    .required(),
  countryId: string().required(),
});
