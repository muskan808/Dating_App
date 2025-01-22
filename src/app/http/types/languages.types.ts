import mongoose, { Document } from "mongoose";

export interface LanguagesType extends Document {
  name: string;
}
