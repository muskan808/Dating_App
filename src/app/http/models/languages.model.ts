import mongoose from "mongoose";
import { LanguagesType } from "../types/languages.types";

const languagesSchema = new mongoose.Schema({
  name: String,
  logo: String,
  key: String,
});

const Languages = mongoose.model<LanguagesType>("Languages", languagesSchema);

export default Languages;
