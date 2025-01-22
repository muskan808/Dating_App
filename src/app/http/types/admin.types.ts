import { Document } from "mongoose";

export enum statusEnum {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface adminType extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string | null;
  forgotPasswordToken: string | null;
  status: statusEnum;
  image: string;
  phoneCode: string;
  phoneNumber: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}