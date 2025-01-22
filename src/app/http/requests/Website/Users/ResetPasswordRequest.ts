import { object, string, mixed } from "yup";
import { registrationTypeEnum } from "../../../types/otp.types";

export const ResetPasswordRequest = object({
    registrationType: mixed<registrationTypeEnum>().oneOf(Object.values(registrationTypeEnum)).required(),
    phoneCode: string().when(
        "registrationType", {
            is: registrationTypeEnum.PHONENUMBER,
            then: (schema) => schema.required()
        }
    ),
    phoneNumber: string().when(
        "registrationType", {
            is: registrationTypeEnum.PHONENUMBER,
            then: (schema) => schema.required()
        }
    ),
    email: string().when(
        "registrationType", {
            is: registrationTypeEnum.EMAIL,
            then: (schema) => schema.required()
        }
    ),
    password: string().required(),
    token: string().required()
})
