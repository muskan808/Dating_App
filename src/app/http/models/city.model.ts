import mongoose from "mongoose";
import { CityType } from "../types/counry-state-city.type";

const citySchema = new mongoose.Schema({
    name: String,
    stateId: { type: mongoose.Schema.Types.ObjectId, ref: 'State' },
    latitude: String,
    longitude: String,
});

const City = mongoose.model<CityType>('City', citySchema);
export default City