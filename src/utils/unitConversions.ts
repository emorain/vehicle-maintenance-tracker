import { UserSettings } from '../contexts/SettingsContext';

/**
 * Convert miles to kilometers
 */
export const milesToKm = (miles: number): number => {
  return miles * 1.60934;
};

/**
 * Convert kilometers to miles
 */
export const kmToMiles = (km: number): number => {
  return km / 1.60934;
};

/**
 * Convert gallons to liters
 */
export const gallonsToLiters = (gallons: number): number => {
  return gallons * 3.78541;
};

/**
 * Convert liters to gallons
 */
export const litersToGallons = (liters: number): number => {
  return liters / 3.78541;
};

/**
 * Convert Fahrenheit to Celsius
 */
export const fahrenheitToCelsius = (f: number): number => {
  return (f - 32) * (5 / 9);
};

/**
 * Convert Celsius to Fahrenheit
 */
export const celsiusToFahrenheit = (c: number): number => {
  return (c * 9 / 5) + 32;
};

/**
 * Format distance according to user settings
 * Always store as miles in database, convert for display
 */
export const formatDistance = (miles: number, settings: UserSettings): string => {
  if (settings.distance_unit === 'kilometers') {
    return `${milesToKm(miles).toFixed(1)} km`;
  }
  return `${miles.toFixed(1)} mi`;
};

/**
 * Format fuel volume according to user settings
 * Always store as gallons in database, convert for display
 */
export const formatFuelVolume = (gallons: number, settings: UserSettings): string => {
  if (settings.fuel_unit === 'liters') {
    return `${gallonsToLiters(gallons).toFixed(2)} L`;
  }
  return `${gallons.toFixed(2)} gal`;
};

/**
 * Format temperature according to user settings
 * Always store as Fahrenheit in database, convert for display
 */
export const formatTemperature = (fahrenheit: number, settings: UserSettings): string => {
  if (settings.temperature_unit === 'celsius') {
    return `${fahrenheitToCelsius(fahrenheit).toFixed(1)}°C`;
  }
  return `${fahrenheit.toFixed(1)}°F`;
};

/**
 * Calculate fuel economy based on user settings
 * Input: miles and gallons (as stored in database)
 * Output: formatted fuel economy string
 */
export const formatFuelEconomy = (miles: number, gallons: number, settings: UserSettings): string => {
  if (settings.distance_unit === 'kilometers' && settings.fuel_unit === 'liters') {
    // L/100km
    const km = milesToKm(miles);
    const liters = gallonsToLiters(gallons);
    const litersPer100Km = (liters / km) * 100;
    return `${litersPer100Km.toFixed(2)} L/100km`;
  } else if (settings.distance_unit === 'kilometers' && settings.fuel_unit === 'gallons') {
    // km/gal
    const km = milesToKm(miles);
    const kmPerGallon = km / gallons;
    return `${kmPerGallon.toFixed(2)} km/gal`;
  } else if (settings.distance_unit === 'miles' && settings.fuel_unit === 'liters') {
    // mi/L
    const liters = gallonsToLiters(gallons);
    const milesPerLiter = miles / liters;
    return `${milesPerLiter.toFixed(2)} mi/L`;
  } else {
    // MPG (miles per gallon) - default
    const mpg = miles / gallons;
    return `${mpg.toFixed(2)} MPG`;
  }
};

/**
 * Format date according to user settings
 */
export const formatDate = (date: string | Date, settings: UserSettings): string => {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }

  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();

  switch (settings.date_format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'MM/DD/YYYY':
    default:
      return `${month}/${day}/${year}`;
  }
};

/**
 * Get distance unit label
 */
export const getDistanceUnitLabel = (settings: UserSettings): string => {
  return settings.distance_unit === 'kilometers' ? 'km' : 'mi';
};

/**
 * Get fuel unit label
 */
export const getFuelUnitLabel = (settings: UserSettings): string => {
  return settings.fuel_unit === 'liters' ? 'L' : 'gal';
};

/**
 * Get temperature unit label
 */
export const getTemperatureUnitLabel = (settings: UserSettings): string => {
  return settings.temperature_unit === 'celsius' ? '°C' : '°F';
};

/**
 * Convert user input to database format (always miles)
 * If user enters km, convert to miles for storage
 */
export const convertDistanceToMiles = (value: number, settings: UserSettings): number => {
  if (settings.distance_unit === 'kilometers') {
    return kmToMiles(value);
  }
  return value;
};

/**
 * Convert user input to database format (always gallons)
 * If user enters liters, convert to gallons for storage
 */
export const convertFuelToGallons = (value: number, settings: UserSettings): number => {
  if (settings.fuel_unit === 'liters') {
    return litersToGallons(value);
  }
  return value;
};

/**
 * Convert user input to database format (always fahrenheit)
 * If user enters celsius, convert to fahrenheit for storage
 */
export const convertTemperatureToFahrenheit = (value: number, settings: UserSettings): number => {
  if (settings.temperature_unit === 'celsius') {
    return celsiusToFahrenheit(value);
  }
  return value;
};
