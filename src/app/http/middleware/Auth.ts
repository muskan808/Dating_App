import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { env } from "../../../env";
import { Device } from "../models/device.model";

export const verifyToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const bearerToken = req.headers["authorization"];
    let token = null;
    if (bearerToken) {
        token = bearerToken.split(" ")[1];
    }
  
    if (!token) {
        return res.status(401).send({
            status: false,
            message: "Unauthorized",
        });
    }
  
    try {
        const decoded = jwt.verify(token, env.auth.secret);
        console.log(decoded);
  
        if (typeof decoded !== "string") {
            const device = await Device.findOne({
                authToken: token,
            })
    
            if (!device) {
                throw "Invalid Token";
            }
            req.body.auth = {
                token: token,
                device: device,
                user: device.userId
            };
  
        } else {
            throw "user not found";
        }
    } catch (err) {
  
        return res.status(401).send({
            status: false,
            message: "Unauthorized",
        });
    }
    return next();
};


export const verifySocketToken = async (token: string) => {
    try {
        const decoded = jwt.verify(token, env.auth.secret);
        if (typeof decoded !== "string") {
            const device = await Device.findOne({
                authToken: token,
            })

            if (!device) {
                throw "Unauthorized";
            }
           
        } else {
            throw "user not found";
        }
        return { decoded };
    } catch (error: any) {
        return {error};
    }
}