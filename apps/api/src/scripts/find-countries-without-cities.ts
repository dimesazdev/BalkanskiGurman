import { Country, City } from "country-state-city";

const countries = Country.getAllCountries();

const countriesWithoutCities = countries.filter(country => {
  const cities = City.getCitiesOfCountry(country.isoCode);
  return !cities || cities.length === 0;
});

console.log("Countries with NO cities:");
countriesWithoutCities.forEach(c => {
  console.log(`${c.name} (${c.isoCode})`);
});
