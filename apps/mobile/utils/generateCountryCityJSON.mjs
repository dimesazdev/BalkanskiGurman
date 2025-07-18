// generateCountryCityJSON.mjs
import { Country, City } from "country-state-city";
import fs from "fs";

const generateCountryCityJSON = () => {
  const countries = Country.getAllCountries();
  const data = countries.map((country) => {
    const cities = City.getCitiesOfCountry(country.isoCode);
    return {
      name: country.name,
      isoCode: country.isoCode,
      cities: cities.map((city) => city.name)
    };
  });

  fs.writeFileSync("countryCityList.json", JSON.stringify(data, null, 2));
  console.log("✅ countryCityList.json has been generated!");
};

generateCountryCityJSON();
