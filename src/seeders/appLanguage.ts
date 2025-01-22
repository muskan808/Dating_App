import mongoose from "mongoose";
import { connection } from "../app/providers/db";
import languages from "../storage/data/languages.json";
import Languages from "../app/http/models/languages.model";

async function seed() {
  await connection();
  console.log("starting seeding languages");

  for (const languagesData of languages) {
    const { name, key, logo } = languagesData;
    await Languages.findOneAndUpdate(
      {
        name,
      },
      {
        name,
        logo,
        key,
      },
      { upsert: true }
    );
  }

  await mongoose.disconnect();
  console.log("Seeding completed");
}

seed().catch((err) => {
  console.error(err);
  mongoose.disconnect();
});
