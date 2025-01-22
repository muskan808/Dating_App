import { object, string, mixed } from "yup";
import { devicesTypeEnum } from "../../../types/auth.types";

export const UserLoginRequest = object({
    username: string().required(),
    password: string().required(),
    deviceType: mixed<devicesTypeEnum>().oneOf(Object.values(devicesTypeEnum))
})
