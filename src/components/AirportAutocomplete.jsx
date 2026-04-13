import { useState, useEffect, useRef } from "react";
import { Plane, Loader2 } from "lucide-react";
import { searchFallbackAirports } from "../data/popularAirport";

const API_BASE = import.meta.env.VITE_BASE_URL;

const normalizeDuffelPlace =(place) => ({
  iataCode: place.iata_code,
  name: place.name,
  cityName: place.city_name || place.name,
  countryCode: place.iata_country_code ?? "",
  source: "duffel",})

const AirportAutocomplete = ({
  value,
  onChange,
  placeholder = "City or airport",
  icon: Icon = Plane,
}) => {
  const [searchTerm, setSearchTerm] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (isSelected) return;
    if (searchTerm.match(/\([A-Z]{3}\)$/)) return;
    if (searchTerm.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      const localResults = searchFallbackAirports(searchTerm);

      if (localResults.length > 0) {
        setSuggestions(
          localResults.map((a) => ({
            iataCode: a.iataCode,
            name: a.name,
            cityName: a.cityName,
            countryCode: a.countryCode,
            source: "local",
          }))
        );
        setShowDropdown(true);
        return; 
      }

      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE}/airports/search?keyword=${encodeURIComponent(
            searchTerm
          )}&subType=CITY,AIRPORT&max=10`
        );

        if (response.ok) {
          const data = await response.json();

          if (data.success && data.data?.length > 0) {
            const seen = new Set();
            const results = data.data
            .filter((p) => p.iata_code && !seen.has(p.iata_code) && seen.add(p.iata_code))
            .map(normalizeDuffelPlace);

            setSuggestions(results);
            setShowDropdown(results.length > 0);
          } else {
            setSuggestions([]);
            setShowDropdown(true); // show "no results" message
          }
        }
      } catch (error) {
        console.error("Airport search error:", error);
      } finally {
        setLoading(false);
      }
    }, 400);

  return () => clearTimeout(timer);
  }, [searchTerm, isSelected]);

  const handleSelect = (airport) => {
    const display = `${airport.cityName} (${airport.iataCode})`;

    setIsSelected(true);
    setSearchTerm(display);
    setSuggestions([]);
    setShowDropdown(false);
    onChange(display, airport.iataCode); // Pass both display value and code
  };

   //handle manual input change
    const handleInputChange = (e) => {
    setIsSelected(false);
    setSearchTerm(e.target.value);
  };

  const isAlreadyResolved = searchTerm.match(/\([A-Z]{3}\)$/);

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5 pointer-events-none z-10" />
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full pl-9 md:pl-10 pr-10 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600 animate-spin" />
        )}
      </div>

      {/* Suggestions dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto">
          {suggestions.map((airport, idx) => (
            <button
              key={`${airport.iataCode}-${idx}`}
              type="button"
              onClick={() => handleSelect(airport)}
              className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-start gap-3 border-b border-gray-100 last:border-b-0"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-blue-600 font-bold text-sm">{airport.iataCode}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-gray-900 text-base">
                    {airport.cityName}
                  </span>
                  {airport.countryCode && (
                    <span className="text-xs text-gray-500">{airport.countryCode}</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate mt-0.5">{airport.name}</p>
                {airport.source === "local" && (
                  <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                    Popular
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {showDropdown &&
        !loading &&
        searchTerm.length >= 2 &&
        suggestions.length === 0 &&
        !isAlreadyResolved && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
            <p className="text-sm text-gray-600 mb-1">
              No airports found for &ldquo;{searchTerm}&rdquo;
            </p>
            <p className="text-xs text-gray-500">
              Try city names or 3-letter codes (e.g., NYC, LON)
            </p>
          </div>
        )}
    </div>
  );
};

export default AirportAutocomplete;

{/* 
    What I did in this component I created a list of of popular AIRPORTS 
    called the searchFallbackAirports function i used this first
    then I make use of the function first if the result is not in my DB list then
    I call amadeus API to search if it falls under the result 
    This way, users can still find their desired airports even if they are not included in the amadeus API response.
    */}
