import mongoose from 'mongoose';
import { StateType } from '../types/counry-state-city.type';

const stateSchema = new mongoose.Schema({
  name: String,
  countryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' },
  provinceCode: String,
  latitude: String,
  longitude: String,
});

const State = mongoose.model<StateType>('State', stateSchema);

export default State;
