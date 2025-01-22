import { object, string, mixed } from "yup";
import {
  registrationTypeEnum,
  userGenderEnum,
} from "../../../types/users.types";

export const SetupProfileRequest = object({
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
  username: string().required(),
  password: string().required(),
  name: string().required(),
  bio: string().optional(),
  dateOfBirth: string().required(),
  gender: mixed<userGenderEnum>()
    .oneOf(Object.values(userGenderEnum))
    .required(),
  image: string().optional(),
  token: string().required(),
  countryId: string().required(),
});
