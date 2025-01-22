import { Document } from "mongoose";

export interface phoneCodesTypes extends Document {
  id: string;
  dial_code: string;
  name: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
