import { Document } from "mongoose";

export interface channelTypes extends Document {
  id: string;
  name: string;
  description: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
