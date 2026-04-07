export const POPULAR_AFRICAN_AIRPORTS = [
  // Nigeria
  { iataCode: 'LOS', name: 'Murtala Muhammed International Airport', cityName: 'Lagos', countryName: 'Nigeria' },
  { iataCode: 'ABV', name: 'Nnamdi Azikiwe International Airport', cityName: 'Abuja', countryName: 'Nigeria' },
  { iataCode: 'KAN', name: 'Mallam Aminu Kano International Airport', cityName: 'Kano', countryName: 'Nigeria' },
  { iataCode: 'PHC', name: 'Port Harcourt International Airport', cityName: 'Port Harcourt', countryName: 'Nigeria' },
  
  // Ghana
  { iataCode: 'ACC', name: 'Kotoka International Airport', cityName: 'Accra', countryName: 'Ghana' },
  
  // Kenya
  { iataCode: 'NBO', name: 'Jomo Kenyatta International Airport', cityName: 'Nairobi', countryName: 'Kenya' },
  { iataCode: 'MBA', name: 'Moi International Airport', cityName: 'Mombasa', countryName: 'Kenya' },
  
  // South Africa
  { iataCode: 'JNB', name: 'O.R. Tambo International Airport', cityName: 'Johannesburg', countryName: 'South Africa' },
  { iataCode: 'CPT', name: 'Cape Town International Airport', cityName: 'Cape Town', countryName: 'South Africa' },
  { iataCode: 'DUR', name: 'King Shaka International Airport', cityName: 'Durban', countryName: 'South Africa' },
  
  // Egypt
  { iataCode: 'CAI', name: 'Cairo International Airport', cityName: 'Cairo', countryName: 'Egypt' },
  { iataCode: 'HRG', name: 'Hurghada International Airport', cityName: 'Hurghada', countryName: 'Egypt' },
  { iataCode: 'SSH', name: 'Sharm El Sheikh International Airport', cityName: 'Sharm El Sheikh', countryName: 'Egypt' },
  
  // Morocco
  { iataCode: 'CMN', name: 'Mohammed V International Airport', cityName: 'Casablanca', countryName: 'Morocco' },
  { iataCode: 'RAK', name: 'Marrakech Menara Airport', cityName: 'Marrakech', countryName: 'Morocco' },
  
  // Ethiopia
  { iataCode: 'ADD', name: 'Addis Ababa Bole International Airport', cityName: 'Addis Ababa', countryName: 'Ethiopia' },
  
  // Tanzania
  { iataCode: 'DAR', name: 'Julius Nyerere International Airport', cityName: 'Dar es Salaam', countryName: 'Tanzania' },
  { iataCode: 'ZNZ', name: 'Abeid Amani Karume International Airport', cityName: 'Zanzibar', countryName: 'Tanzania' },
  
  // Uganda
  { iataCode: 'EBB', name: 'Entebbe International Airport', cityName: 'Entebbe', countryName: 'Uganda' },
  
  // Senegal
  { iataCode: 'DSS', name: 'Blaise Diagne International Airport', cityName: 'Dakar', countryName: 'Senegal' },
  
  // Ivory Coast
  { iataCode: 'ABJ', name: 'Félix Houphouët-Boigny International Airport', cityName: 'Abidjan', countryName: 'Ivory Coast' },
  
  // Algeria
  { iataCode: 'ALG', name: 'Houari Boumediene Airport', cityName: 'Algiers', countryName: 'Algeria' },
  
  // Tunisia
  { iataCode: 'TUN', name: 'Tunis-Carthage International Airport', cityName: 'Tunis', countryName: 'Tunisia' },
  
  // Rwanda
  { iataCode: 'KGL', name: 'Kigali International Airport', cityName: 'Kigali', countryName: 'Rwanda' },
  
  // Botswana
  { iataCode: 'GBE', name: 'Sir Seretse Khama International Airport', cityName: 'Gaborone', countryName: 'Botswana' },
  
  // Zimbabwe
  { iataCode: 'HRE', name: 'Robert Gabriel Mugabe International Airport', cityName: 'Harare', countryName: 'Zimbabwe' },
];

export const POPULAR_GLOBAL_AIRPORTS = [
  // UK
  { iataCode: 'LHR', name: 'Heathrow Airport', cityName: 'London', countryName: 'United Kingdom' },
  { iataCode: 'LGW', name: 'Gatwick Airport', cityName: 'London', countryName: 'United Kingdom' },
  { iataCode: 'MAN', name: 'Manchester Airport', cityName: 'Manchester', countryName: 'United Kingdom' },
  
  // USA
  { iataCode: 'JFK', name: 'John F. Kennedy International Airport', cityName: 'New York', countryName: 'United States' },
  { iataCode: 'LAX', name: 'Los Angeles International Airport', cityName: 'Los Angeles', countryName: 'United States' },
  { iataCode: 'ORD', name: 'O\'Hare International Airport', cityName: 'Chicago', countryName: 'United States' },
  { iataCode: 'MIA', name: 'Miami International Airport', cityName: 'Miami', countryName: 'United States' },
  { iataCode: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport', cityName: 'Atlanta', countryName: 'United States' },
  
  // UAE
  { iataCode: 'DXB', name: 'Dubai International Airport', cityName: 'Dubai', countryName: 'United Arab Emirates' },
  { iataCode: 'AUH', name: 'Abu Dhabi International Airport', cityName: 'Abu Dhabi', countryName: 'United Arab Emirates' },
  
  // France
  { iataCode: 'CDG', name: 'Charles de Gaulle Airport', cityName: 'Paris', countryName: 'France' },
  
  // Germany
  { iataCode: 'FRA', name: 'Frankfurt Airport', cityName: 'Frankfurt', countryName: 'Germany' },
  
  // Netherlands
  { iataCode: 'AMS', name: 'Amsterdam Airport Schiphol', cityName: 'Amsterdam', countryName: 'Netherlands' },
  
  // Turkey
  { iataCode: 'IST', name: 'Istanbul Airport', cityName: 'Istanbul', countryName: 'Turkey' },
  
  // Qatar
  { iataCode: 'DOH', name: 'Hamad International Airport', cityName: 'Doha', countryName: 'Qatar' },
  
  // China
  { iataCode: 'PEK', name: 'Beijing Capital International Airport', cityName: 'Beijing', countryName: 'China' },
  { iataCode: 'PVG', name: 'Shanghai Pudong International Airport', cityName: 'Shanghai', countryName: 'China' },
];

// Combine all airports
export const ALL_AIRPORTS = [...POPULAR_AFRICAN_AIRPORTS, ...POPULAR_GLOBAL_AIRPORTS];

// Search function for fallback
export const searchFallbackAirports = (keyword) => {
  if (!keyword || keyword.length < 2) return [];
  
  const searchTerm = keyword.toLowerCase();
  
  return ALL_AIRPORTS.filter(airport => 
    airport.cityName.toLowerCase().includes(searchTerm) ||
    airport.iataCode.toLowerCase().includes(searchTerm) ||
    airport.name.toLowerCase().includes(searchTerm) ||
    airport.countryName.toLowerCase().includes(searchTerm)
  ).slice(0, 10); // Return max 10 results
};

/**
 * the reaon for this file is because the amadeus API doesn't include some airports for the auto complete
 * I used this to get a list of popular airports in Africa and globally and,
 *  created a search function that will be used as a fallback when the amadeus API doesn't return any results. 
 * This way, users can still find their desired airports even if they are not included in the amadeus API response.
 * add this to the autoComplete component and call the searchFallbackAirports function when the amadeus API doesn't return any results.
 */