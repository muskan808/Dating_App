import mongoose from "mongoose";
import { phoneCodesTypes } from "../types/phoneCode.types";

const phoneCodeSchema = new mongoose.Schema({
  name: String,
  dial_code: String,
  code: String,
});

const PhoneCode = mongoose.model<phoneCodesTypes>(
  "phone_codes",
  phoneCodeSchema
);

export default PhoneCode;
