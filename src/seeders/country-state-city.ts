import mongoose from "mongoose";
import { connection } from "../app/providers/db";
import Country from "../app/http/models/country.model";
import State from "../app/http/models/state.model";
import City from "../app/http/models/city.model";
import countries from "../storage/data/countries.json";
import states from "../storage/data/provinces.json";
import cities from "../storage/data/cities.json";
import { CityType } from "../app/http/types/commonTypes";

async function seed() {
    await connection();
    console.log("starting seeding countries, states, cities");

    for (const countryData of countries) {
        const { name,
            iso3,
            iso2,
            numeric_code,
            phone_code,
            capital,
            currency,
            currency_name,
            currency_symbol,
            native,
            region,
            subregion,
            latitude,
            longitude } = countryData
        const country = await Country.findOneAndUpdate({
                name,
                iso2
            },
            {
                name,
                iso3,
                iso2,
                numericCode: numeric_code,
                phoneCode: phone_code,
                capital,
                currency,
                currencyName: currency_name,
                currencySymbol: currency_symbol,
                native,
                region,
                subregion,
                latitude,
                longitude
            },
            { upsert: true, new: true}
        );

        const relevantStates = states.filter((state: any) => state.country_id == countryData.id);

        for (const stateData of relevantStates) {
            const { name, state_code, latitude, longitude } = stateData
            
            
            const state = await State.findOneAndUpdate(
                { name },
                {
                    name,
                    stateCode: state_code,
                    latitude,
                    longitude,
                    countryId: country._id
                },
                { upsert: true, new: true }
            );

            const cityData: CityType[] = cities as any

            const relevantCities = cityData.filter((city: any) => city.country_id == countryData.id && city.state_id == stateData.id);

            for (const cityData of relevantCities) {
                const { name, latitude, longitude } = cityData
                await City.findOneAndUpdate(
                    { name },
                    {
                        name,
                        latitude,
                        longitude,
                        stateId: state._id
                    },
                    { upsert: true, new: true}
                );
            }
        }

        console.log(`Seeded country: ${country.name}`);
    }

    await mongoose.disconnect();
    console.log("Seeding completed");
}

seed().catch(err => {
    console.error(err);
    mongoose.disconnect();
});
