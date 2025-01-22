import * as jwt from "jsonwebtoken";
import { env } from "../../env";
import { Device } from "../http/models/device.model";
import { deviceTypeEnum } from "../http/types/commonTypes";

export const generateDevice = async(userId: string, deviceType: deviceTypeEnum) => {
    try {
        const token = await jwt.sign({ userId }, env.auth.secret, {
            expiresIn: env.auth.expiresIn,
        });

        return await Device.create({
            userId: userId,
            authToken: token,
            device: deviceType
        })
    } catch (error: any){
        return error;
    }
}

export const generateOtpToken = async(id: string) => {
    try {
        const token = await jwt.sign({ id }, env.auth.secret, {
            expiresIn: env.auth.expiresIn,
        });

        return token
    } catch (error: any) {
        return error;
    }
}

export const deleteDevice = async(authToken: string) => {
    try {
        return Device.deleteMany({authToken: authToken});
    } catch (error: any) {
        return error;
    }
}