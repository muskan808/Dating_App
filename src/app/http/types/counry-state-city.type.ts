import mongoose, { Document } from "mongoose";

export interface CountryType extends Document {
    name: string;
    iso3: string;
    iso2: string;
    numericCode: string;
    phoneCode: string;
    capital: string;
    currency: string;
    currencyName: string;
    currencySymbol: string;
    native: string;
    region: string;
    subregion: string;
    latitude: string;
    longitude: string;
}

export interface StateType extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    countryId: mongoose.Types.ObjectId;
    stateCode: string;
    latitude: string;
    longitude: string;
}

export interface CityType extends Document{
    _id: mongoose.Types.ObjectId;
    name: string;
    provinceId: mongoose.Types.ObjectId;
    latitude: string;
    longitude: string;
}