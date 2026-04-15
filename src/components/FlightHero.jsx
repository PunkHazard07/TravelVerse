import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plane,
  Calendar,
  Users,
  Search,
  ArrowLeftRight,
  AlertCircle,
  X,
  Loader2,
  ChevronDown,
  Plus,
  Minus,
} from "lucide-react";
import AirportAutocomplete from "./AirportAutocomplete";

const API_BASE = import.meta.env.VITE_BASE_URL;

const flightAPI = {
  searchFlights: async (params) => {
    const response = await fetch(`${API_BASE}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        err.error?.message || err.message || "Failed to search flights"
      );
    }
    return response.json();
  },
};

const CounterRow = ({ label, sublabel, value, onDecrement, onIncrement, min = 0 }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
    <div>
      <p className="text-sm font-medium text-gray-800">{label}</p>
      {sublabel && <p className="text-xs text-gray-400">{sublabel}</p>}
    </div>
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onDecrement}
        disabled={value <= min}
        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-blue-500 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="w-4 text-center text-sm font-semibold text-gray-900">{value}</span>
      <button
        type="button"
        onClick={onIncrement}
        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
);

const CABIN_CLASSES = [
  { label: "Economy",         value: "ECONOMY" },
  { label: "Premium Economy", value: "PREMIUM_ECONOMY" },
  { label: "Business",        value: "BUSINESS" },
  { label: "First",           value: "FIRST" },
];

const TravellersDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Parse current value back into parts
  const adultMatch = value.match(/(\d+)\s*Adult/i);
  const childMatch = value.match(/(\d+)\s*Child/i);
  const infantMatch = value.match(/(\d+)\s*Infant/i);

  //find the cabin value that matches the stored label
  const storedCabin = CABIN_CLASSES.find((c) => value.toLowerCase().includes(c.label.toLowerCase()))

  const [adults, setAdults] = useState(adultMatch ? parseInt(adultMatch[1]) : 1);
  const [children, setChildren] = useState(childMatch ? parseInt(childMatch[1]) : 0);
  const [infants, setInfants] = useState(infantMatch ? parseInt(infantMatch[1]) : 0);
  const [cabinClass, setCabinClass] = useState(storedCabin ?? CABIN_CLASSES[0]);

  // Rebuild the string whenever any value changes — keeps parseTravellers() happy
  useEffect(() => {
    const parts = [`${adults} Adult${adults !== 1 ? "s" : ""}`];
    if (children > 0) parts.push(`${children} Child${children !== 1 ? "ren" : ""}`);
    if (infants > 0) parts.push(`${infants} Infant${infants !== 1 ? "s" : ""}`);
    parts.push(cabinClass.label);
    onChange(parts.join(", "));
  }, [adults, children, infants, cabinClass]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 pl-9 md:pl-10 pr-3 md:pr-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-left text-gray-700 hover:border-gray-400 transition-colors"
      >
        <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5 pointer-events-none" />
        <span className="flex-1 truncate">{value}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4 min-w-70">
          {/* Counters */}
          <CounterRow
            label="Adults" sublabel="Age 12+"
            value={adults}
            onDecrement={() => setAdults((v) => Math.max(1, v - 1))}
            onIncrement={() => setAdults((v) => v + 1)}
            min={1}
          />
          <CounterRow
            label="Children" sublabel="Age 2–11"
            value={children}
            onDecrement={() => setChildren((v) => Math.max(0, v - 1))}
            onIncrement={() => setChildren((v) => v + 1)}
          />
          <CounterRow
            label="Infants" sublabel="Under 2"
            value={infants}
            onDecrement={() => setInfants((v) => Math.max(0, v - 1))}
            onIncrement={() => setInfants((v) => v + 1)}
          />

          {/* Cabin class */}
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Cabin Class</p>
            <div className="grid grid-cols-2 gap-2">
              {CABIN_CLASSES.map((cls) => (
                <button
                  key={cls.value}
                  type="button"
                  onClick={() => setCabinClass(cls)}
                  className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                    cabinClass === cls
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600"
                  }`}
                >
                  {cls.label}
                </button>
              ))}
            </div>
          </div>

          {/* Done */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
};


const DateInput = ({ name, value, onChange, min, placeholder }) => (
  <div className="relative">
    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5 pointer-events-none z-10" />
    <input
      type="date"
      name={name}
      value={value}
      onChange={onChange}
      min={min}
      placeholder={placeholder}
      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400 cursor-pointer"
    />
  </div>
);

//parse the traveller summary string back into structred data for the Api
const parseTravellers = (str) => {
  const adultMatch  = str.match(/(\d+)\s*Adult/i);
  const childMatch  = str.match(/(\d+)\s*Child/i);
  const infantMatch = str.match(/(\d+)\s*Infant/i);

  //find the cabin entry by matching the label string
  const cabin = CABIN_CLASSES.find((c) => str.toLowerCase().includes(c.label.toLowerCase()));

    const childrenCount = childMatch ? parseInt(childMatch[1]) : 0;
    const infantsCount = infantMatch ? parseInt(infantMatch[1]) : 0;

    const childrenAges = Array(childrenCount).fill(10); // Default age 10 for children
    const infantAges = Array(infantsCount).fill(1);    // Default age 1 for infants

  return {
    adults: adultMatch ? parseInt(adultMatch[1]) : 1,
    children: childrenCount,
    infants: infantsCount,
    childrenAges: childrenAges,
    infantAges: infantAges,
    travelClass: cabin?.value ?? "ECONOMY"
  }
};

const FlightHero = () => {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState("return");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDirectFlights, setShowDirectFlights] = useState(false);
  const [formData, setFormData] = useState({
    dep_airport: "",
    dep_airport_code: "",
    arr_airport: "",
    arr_airport_code: "",
    departure_date: "",
    return_date: "",
    flight_number: "",
    airline: "",
    travellers: "1 Adult, Economy",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwapAirports = () => {
    setFormData((prev) => ({
      ...prev,
      dep_airport: prev.arr_airport,
      dep_airport_code: prev.arr_airport_code,
      arr_airport: prev.dep_airport,
      arr_airport_code: prev.dep_airport_code,
    }));
  };

  const validateForm = () => {
    if (!formData.dep_airport_code)
      throw new Error("Please select a departure airport from the dropdown");
    if (!formData.arr_airport_code)
      throw new Error("Please select an arrival airport from the dropdown");
    if (!formData.departure_date)
      throw new Error("Please select a departure date");
    if (tripType === "return" && !formData.return_date)
      throw new Error("Please select a return date for a round trip");
    if (formData.dep_airport_code === formData.arr_airport_code)
      throw new Error("Origin and destination cannot be the same airport");
  };

  const handleSearch = async () => {
    setError(null);
    setLoading(true);
    try {
      validateForm();
      const { adults, children, infants, childrenAges, infantAges, travelClass } = parseTravellers(formData.travellers);
      
      const searchParams = {
        originLocationCode: formData.dep_airport_code,
        destinationLocationCode: formData.arr_airport_code,
        departureDate: formData.departure_date,
        adults,
        children,
        infants,
        childrenAges,
        infantAges,
        travelClass,
        max: 50,
        nonStop: showDirectFlights,
        ...(tripType === "return" && formData.return_date
          ? { returnDate: formData.return_date }
          : {}),
        ...(formData.airline.trim() ? { airline: formData.airline.trim() } : {}),
      };

      const results = await flightAPI.searchFlights(searchParams);
      const searchData = {
        results,
        searchParams: {
          dep_airport: formData.dep_airport,
          arr_airport: formData.arr_airport,
          dep_airport_code: formData.dep_airport_code,
          arr_airport_code: formData.arr_airport_code,
          departure_date: formData.departure_date,
          return_date: formData.return_date,
          tripType,
        },
      };
      sessionStorage.setItem("flightSearchData", JSON.stringify(searchData));
      navigate("/flight-search");
    } catch (err) {
      setError(err.message);
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-linear-to-b from-blue-900 to-blue-800">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000')` }}
      >
        <div className="absolute inset-0 bg-linear-to-b from-blue-900/70 via-blue-800/60 to-blue-900/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 py-12 md:py-20 max-w-7xl mx-auto">
        {/* Hero Text */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-4 drop-shadow-lg">
            Find the best flight deals anywhere
          </h1>
          <p className="text-lg md:text-xl text-white/90 drop-shadow">
            Search and compare flights from hundreds of airlines
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
          {/* Trip Type */}
          <div className="flex flex-wrap gap-3 md:gap-4 mb-6">
            {[
              { value: "return", label: "Round-trip" },
              { value: "one-way", label: "One-way" }
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setTripType(value)}
                className={`px-4 md:px-6 py-2 rounded-full font-medium transition-all text-sm md:text-base capitalize ${
                  tripType === value
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {label.replace("-", " ")}
              </button>
            ))}
          </div>

          {/* Main Fields */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 mb-4">
            {/* From / To */}
            <div className="lg:col-span-5">
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                From / To
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <AirportAutocomplete
                    value={formData.dep_airport}
                    onChange={(display, code) =>
                      setFormData((prev) => ({ ...prev, dep_airport: display, dep_airport_code: code }))
                    }
                    placeholder="e.g., Lagos, London"
                    icon={Plane}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSwapAirports}
                  aria-label="Swap airports"
                  className="shrink-0 flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-md bg-gray-100 hover:bg-gray-200 border border-gray-300 transition-colors"
                >
                  <ArrowLeftRight className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                </button>
                <div className="flex-1">
                  <AirportAutocomplete
                    value={formData.arr_airport}
                    onChange={(display, code) =>
                      setFormData((prev) => ({ ...prev, arr_airport: display, arr_airport_code: code }))
                    }
                    placeholder="e.g., Paris, Dubai"
                    icon={Plane}
                  />
                </div>
              </div>
            </div>

            {/* Departure Date */}
            <div className="lg:col-span-2">
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                Depart
              </label>
              <DateInput
                name="departure_date"
                value={formData.departure_date}
                onChange={handleInputChange}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* Return Date */}
            {tripType === "return" && (
              <div className="lg:col-span-2">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                  Return
                </label>
                <DateInput
                  name="return_date"
                  value={formData.return_date}
                  onChange={handleInputChange}
                  min={formData.departure_date || new Date().toISOString().split("T")[0]}
                />
              </div>
            )}

            {/* Travellers */}
            <div className={tripType === "return" ? "lg:col-span-3" : "lg:col-span-5"}>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                Travellers and cabin class
              </label>
              <div className="relative">
                <TravellersDropdown
                  value={formData.travellers}
                  onChange={(val) => setFormData((p) => ({ ...p, travellers: val }))}
                />
              </div>
            </div>
          </div>

          {/* Options row */}
          <div className="flex flex-wrap gap-3 md:gap-4 mb-5 md:mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showDirectFlights}
                onChange={(e) => setShowDirectFlights(e.target.checked)}
                className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-xs md:text-sm text-gray-700">Direct flights only</span>
            </label>
          </div>

          {/* Advanced Search */}
          <details className="mb-5 md:mb-6">
            <summary className="text-xs md:text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-700 mb-3">
              Advanced Search Options
            </summary>
            <div className="mt-3 md:mt-4 max-w-sm">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                  Airline (Optional)
                </label>
                <input
                  type="text"
                  name="airline"
                  value={formData.airline}
                  onChange={handleInputChange}
                  placeholder="e.g., American Airlines"
                  className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </details>

          {/* Error */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-3 md:py-4 px-6 md:px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 text-base md:text-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
                Searching flights...
              </>
            ) : (
              <>
                <Search className="w-5 h-5 md:w-6 md:h-6" />
                Search Flights
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlightHero;