import mongoose from "mongoose";
import { CountryType } from "../types/counry-state-city.type";


const countrySchema = new mongoose.Schema({
    name: String,
    iso3: String,
    iso2: String,
    numericCode: String,
    phoneCode: String,
    capital: String,
    currency: String,
    currencyName: String,
    currencySymbol: String,
    native: String,
    region: String,
    subregion: String,
    latitude: String,
    longitude: String
})

const Country = mongoose.model<CountryType>('Country', countrySchema);


export default Country;
