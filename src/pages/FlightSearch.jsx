import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plane,
  ArrowRight,
  Filter,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckSquare, 
  Square,
  AlertCircle,
  Clock
} from "lucide-react";
import BookingSteps from "../components/BookingSteps";
import AirlineLogo from "../components/Airlinelogo";

//Helpers
const parseDuration =(iso) => {
  if (!iso) return "—";
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return iso;
  const h = m[1] ? parseInt(m[1]) : 0;
  const min = m[2] ? parseInt(m[2]) : 0;
  if (h && min) return `${h}h ${min}m`;
  if (h) return `${h}h`;
  return `${min}m`;
}

const formatTime = (dt) => {
  if (!dt) return "—";
  return new Date(dt).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const formatDate = (dt) => {
  if (!dt) return "";
  return new Date(dt).toLocaleDateString("en-GB", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

//Transform a mapped Duffel offer
const transformOffer = (offer, itineraryIndex = 0, overridePrice = null) => {
  const  itinerary = offer.itineraries?.[itineraryIndex];
  if (!itinerary) return null;

  const firstSeg = itinerary.segments?.[0];
  const lastSeg  = itinerary.segments?.[itinerary.segments.length - 1];
  if (!firstSeg || !lastSeg) return null;

  const stopCount = itinerary.segments.length - 1;
  const price = overridePrice ?? offer.price?.total ?? 0;

  return {
    id: `${offer.offerId}${itineraryIndex > 0 ? "-return" : ""}`,
    offerId: offer.offerId,
    flightNumber: `${firstSeg.carrierCode ?? ""}${firstSeg.number ?? ""}`,
    carrierCode: offer.carrierCode ?? firstSeg.carrierCode ?? "",
    airlineName: offer.carrierName ?? offer.carrierCode ?? "Unknown Airline",
    logoLockupUrl: offer.logoLockupUrl ?? null,
    logoSymbolUrl: offer.logoSymbolUrl ?? null,
    departureAirport: firstSeg.departure?.iataCode ?? "—",
    arrivalAirport: lastSeg.arrival?.iataCode ?? "—",
    departureTime: firstSeg.departure?.at ?? null,
    arrivalTime: lastSeg.arrival?.at ?? null,
    duration: parseDuration(itinerary.duration),
    stops: stopCount === 0 ? "Direct" : `${stopCount} stop${stopCount > 1 ? "s" : ""}`,
    price,
    currency: offer.price?.currency ?? "USD",
    numberOfBookableSeats: offer.numberOfBookableSeats ?? null,
    expiresAt: offer.expiresAt ?? null,
    rawOffer: offer,
  };
};

const separateFlights = (offers) => {
  const outbound = [];
  const returnFlights = [];

  offers.forEach((offer) => {
    if (!offer.itineraries?.length) return;

    if (offer.itineraries.length === 1) {
      const t = transformOffer(offer, 0);
      if(t) outbound.push(t);
    } else if (offer.itineraries.length >= 2) {
      const halfPrice = (offer.price?.total ?? 0)/2;
      const tOut = transformOffer(offer, 0, halfPrice);
      const tRet = transformOffer(offer, 1, halfPrice);
      if(tOut) outbound.push(tOut);
      if(tRet) returnFlights.push(tRet);
    }  });

  return { outboundFlights: outbound, returnFlights };
};

const FlightCard = ({ flight, isSelected, onSelect, expanded, onToggleExpand }) => (
  <div
    className={`bg-white rounded-xl border-2 transition-all duration-200 ${
      isSelected
        ? "border-blue-600 shadow-lg shadow-blue-100"
        : "border-gray-200 hover:border-blue-300 hover:shadow-md"
    }`}
  >
    <div className="p-4 md:p-6 cursor-pointer" onClick={() => onSelect(flight.id)}>
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Airline */}
        <div className="flex items-center gap-3 lg:w-44">
          <AirlineLogo carrierCode={flight.carrierCode} size="md" />
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm leading-tight truncate">
              {flight.airlineName}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{flight.flightNumber}</p>
          </div>
        </div>

        {/* Route timeline */}
        <div className="flex-1 grid grid-cols-3 gap-2 items-center">
          <div className="text-left">
            <p className="text-2xl font-bold text-gray-900 tabular-nums">
              {formatTime(flight.departureTime)}
            </p>
            <p className="text-sm font-medium text-gray-600 mt-0.5">
              {flight.departureAirport}
            </p>
            <p className="text-xs text-gray-400">{formatDate(flight.departureTime)}</p>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              {flight.duration}
            </p>
            <div className="flex items-center justify-center gap-1">
              <div className="h-px bg-gray-300 flex-1" />
              <Plane className="w-4 h-4 text-blue-400 rotate-90" />
              <div className="h-px bg-gray-300 flex-1" />
            </div>
            <p
              className={`text-xs mt-1 font-medium ${
                flight.stops === "Direct" ? "text-green-600" : "text-amber-600"
              }`}
            >
              {flight.stops}
            </p>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 tabular-nums">
              {formatTime(flight.arrivalTime)}
            </p>
            <p className="text-sm font-medium text-gray-600 mt-0.5">
              {flight.arrivalAirport}
            </p>
            <p className="text-xs text-gray-400">{formatDate(flight.arrivalTime)}</p>
          </div>
        </div>

        {/* Price + select */}
        <div className="lg:w-40 flex flex-row lg:flex-col items-center justify-between lg:items-end gap-3">
          <div className="text-left lg:text-right">
            <p className="text-2xl font-bold text-blue-600 tabular-nums">
              {flight.currency} {flight.price.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">per person</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(flight.id); }}
            className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${
              isSelected
                ? "bg-blue-600 text-white shadow-md"
                : "bg-blue-50 text-blue-600 hover:bg-blue-100"
            }`}
          >
            {isSelected ? "✓ Selected" : "Select"}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          {flight.numberOfBookableSeats != null && (
            <span className="text-xs px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full">
              {flight.numberOfBookableSeats} seats left
            </span>
          )}
          {flight.expiresAt && (
            <span className="text-xs text-amber-600">
              Offer expires {formatDate(flight.expiresAt)}
            </span>
          )}
        </div>
        <button
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
          onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
        >
          Flight details
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
    </div>

    {/* Expanded segments */}
    {expanded && (
      <div className="px-4 md:px-6 pb-5 border-t border-gray-100">
        <h4 className="font-semibold text-gray-800 mt-4 mb-3 text-sm">Segment details</h4>
        <div className="space-y-3">
          {flight.rawOffer.itineraries
            .find((_, i) => (flight.id.endsWith("-return") ? i === 1 : i === 0))
            ?.segments?.map((seg, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg text-sm"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <Plane className="w-4 h-4 text-blue-600 rotate-90" />
                </div>
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div>
                    <p className="text-xs text-gray-500">From</p>
                    <p className="font-semibold">{seg.departure?.iataCode}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(seg.departure?.at)} {formatTime(seg.departure?.at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">To</p>
                    <p className="font-semibold">{seg.arrival?.iataCode}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(seg.arrival?.at)} {formatTime(seg.arrival?.at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Flight</p>
                    <p className="font-semibold">
                      {seg.carrierCode}{seg.number}
                    </p>
                    <p className="text-xs text-gray-500">{seg.carrierName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="font-semibold">{parseDuration(seg.duration)}</p>
                    {seg.cabin && (
                      <p className="text-xs text-gray-500">{seg.cabin}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    )}
  </div>
);

//main page
const FlightSearchResults = () => {
  const navigate = useNavigate();
  const [selectedOutbound, setSelectedOutbound] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("recommended");
  const [expandedFlight, setExpandedFlight] = useState(null);
  const [searchData, setSearchData] = useState(null);
  const [loading, setLoading] = useState(true);


  // Filter states
  const [filters, setFilters] = useState({
    maxPrice: 10000,
    stops: "any",
    airlines: [],
  });

  useEffect(() => {
    const stored = sessionStorage.getItem("flightSearchData");
    if (!stored) { navigate("/flight"); return; }
    try {
      setSearchData(JSON.parse(stored));
    } catch {
      navigate("/flight");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const { outboundFlights, returnFlights } = useMemo(() => {
    if (searchData?.results?.success && searchData.results.data) {
      return separateFlights(searchData.results.data);
    }
    return { outboundFlights: [], returnFlights: [] };
  }, [searchData]);

  const availableAirlines = useMemo(() => {
    const seen = new Set();
    return [...outboundFlights, ...returnFlights]
      .filter((f) => f.carrierCode && !seen.has(f.carrierCode) && seen.add(f.carrierCode))
      .map((f) => ({ code: f.carrierCode, name: f.airlineName }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [outboundFlights, returnFlights]);

  const toggleAirline = (code) =>
    setFilters((p) => ({
      ...p,
      airlines: p.airlines.includes(code)
        ? p.airlines.filter((c) => c !== code)
        : [...p.airlines, code],
    }));

  const applyFilters = (flights) => {
    let f = [...flights];

    if (filters.airlines.length > 0)
      f = f.filter((fl) => filters.airlines.includes(fl.carrierCode));

    if (filters.stops !== "any")
      f = f.filter((fl) => {
        if (filters.stops === "direct")   return fl.stops === "Direct";
        if (filters.stops === "1-stop")   return fl.stops === "1 stop";
        if (filters.stops === "2+-stops") return fl.stops.includes("2") || fl.stops.includes("3");
        return true;
      });

    f = f.filter((fl) => fl.price <= filters.maxPrice);

    if (sortBy === "price-low")  f.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") f.sort((a, b) => b.price - a.price);
    if (sortBy === "departure")
      f.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));

    return f;
  };

  if (loading || !searchData) {
        return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-xl text-gray-600">Loading flight results...</p>
        </div>
      </div>
    );
  }

      const { results, searchParams } = searchData;

    if (!results?.success || outboundFlights.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plane className="w-8 h-8 text-gray-400" />
          </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No flights found</h2>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t find any flights for this route and date. Try adjusting your search.
          </p>
          {results?.error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{results.error.message}</p>
            </div>
          )}
          <button
            onClick={() => navigate("/flight")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Modify Search
          </button>
        </div>
      </div>
    );
  }


  const filteredOutbound = applyFilters(outboundFlights);
  const filteredReturn   = applyFilters(returnFlights);
  const currency = outboundFlights[0]?.currency ?? "USD";
  const selectedOutboundFlight = filteredOutbound.find((f) => f.id === selectedOutbound);
  const selectedReturnFlight   = filteredReturn.find((f) => f.id === selectedReturn);
  const totalPrice = (selectedOutboundFlight?.price ?? 0) + (selectedReturnFlight?.price ?? 0);

  const handleContinueToBook = () => {
    sessionStorage.setItem(
      "flightBookingData",
      JSON.stringify({
        outbound:     selectedOutboundFlight,
        returnFlight: selectedReturnFlight ?? null,
        searchParams,
        totalPrice,
        currency,
      })
    );
    navigate("/flight-booking");
  };

  const FilterPanel = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-6">
      {/* Sort */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Sort by</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="recommended">Recommended</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="departure">Departure Time</option>
        </select>
      </div>

      {/* Airlines */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-sm">Airlines</h3>
          {filters.airlines.length > 0 && (
            <button
              onClick={() => setFilters((p) => ({ ...p, airlines: [] }))}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Clear
            </button>
          )}
        </div>
        {availableAirlines.length === 0 ? (
          <p className="text-sm text-gray-400">No airlines found</p>
        ) : (
          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {availableAirlines.map(({ code, name }) => {
              const checked = filters.airlines.includes(code);
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => toggleAirline(code)}
                  className="w-full flex items-center gap-2.5 text-left hover:bg-gray-50 rounded-md px-1 py-1.5 transition-colors"
                >
                  {checked
                    ? <CheckSquare className="w-4 h-4 text-blue-600 shrink-0" />
                    : <Square className="w-4 h-4 text-gray-400 shrink-0" />
                  }
                  <div className="min-w-0">
                    <p className="text-sm text-gray-700 font-medium truncate">{name}</p>
                    <p className="text-xs text-gray-400">{code}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Stops */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Stops</h3>
        <div className="space-y-2">
          {["any", "direct", "1-stop", "2+-stops"].map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="stops"
                value={opt}
                checked={filters.stops === opt}
                onChange={() => setFilters((p) => ({ ...p, stops: opt }))}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-700 capitalize">{opt.replace("-", " ")}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 text-sm">
          Max Price: {currency} {filters.maxPrice.toLocaleString()}
        </h3>
        <input
          type="range"
          min="0"
          max="10000"
          step="50"
          value={filters.maxPrice}
          onChange={(e) => setFilters((p) => ({ ...p, maxPrice: parseInt(e.target.value) }))}
          className="w-full accent-blue-600"
        />
      </div>

      <button
        onClick={() => setFilters({ maxPrice: 10000, stops: "any", airlines: [] })}
        className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        Reset Filters
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-sm md:text-base font-semibold text-gray-900">
                <span>{searchParams.dep_airport_code}</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <span>{searchParams.arr_airport_code}</span>
              </div>
              {searchParams.departure_date && (
                <span className="hidden md:inline text-sm text-gray-500">
                  · {formatDate(searchParams.departure_date)}
                  {searchParams.return_date && ` – ${formatDate(searchParams.return_date)}`}
                </span>
              )}
            </div>
            <BookingSteps currentStep={1} />
            <button
              onClick={() => navigate("/flight")}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Modify Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64">
            <div className="lg:sticky lg:top-24">
              {/* Mobile toggle */}
              <button
                className="lg:hidden w-full bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between mb-4"
                onClick={() => setShowFilters((v) => !v)}
              >
                <span className="flex items-center gap-2 font-medium text-sm">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {filters.airlines.length > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {filters.airlines.length}
                    </span>
                  )}
                </span>
                {showFilters ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
              </button>
              <div className={showFilters ? "block" : "hidden lg:block"}>
                <FilterPanel />
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 space-y-8">
            {/* Outbound */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Plane className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  {searchParams.tripType === "return" ? "Outbound Flight" : "Available Flights"}
                </h2>
                <span className="text-sm text-gray-500">
                  ({filteredOutbound.length} of {outboundFlights.length})
                </span>
              </div>

              {filteredOutbound.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <p className="text-gray-500 mb-2">No flights match your current filters.</p>
                  <button
                    onClick={() => setFilters((p) => ({ ...p, airlines: [] }))}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear airline filter
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOutbound.map((flight) => (
                    <FlightCard
                      key={flight.id}
                      flight={flight}
                      isSelected={selectedOutbound === flight.id}
                      onSelect={setSelectedOutbound}
                      expanded={expandedFlight === flight.id}
                      onToggleExpand={() =>
                        setExpandedFlight((v) => (v === flight.id ? null : flight.id))
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Return */}
            {searchParams.tripType === "return" && returnFlights.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Plane className="w-5 h-5 text-blue-600 rotate-180" />
                  <h2 className="text-xl font-bold text-gray-900">Return Flight</h2>
                  <span className="text-sm text-gray-500">
                    ({filteredReturn.length} of {returnFlights.length})
                  </span>
                </div>

                {filteredReturn.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <p className="text-gray-500 mb-2">No return flights match your filters.</p>
                    <button
                      onClick={() => setFilters((p) => ({ ...p, airlines: [] }))}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear airline filter
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredReturn.map((flight) => (
                      <FlightCard
                        key={flight.id}
                        flight={flight}
                        isSelected={selectedReturn === flight.id}
                        onSelect={setSelectedReturn}
                        expanded={expandedFlight === flight.id}
                        onToggleExpand={() =>
                          setExpandedFlight((v) => (v === flight.id ? null : flight.id))
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky booking bar */}
      {(selectedOutbound || selectedReturn) && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-20">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Total price</p>
                <p className="text-2xl font-bold text-blue-600 tabular-nums">
                  {currency} {totalPrice.toFixed(2)}
                </p>
              </div>
              <button
                onClick={handleContinueToBook}
                disabled={
                  !selectedOutbound ||
                  (searchParams.tripType === "return" && !selectedReturn)
                }
                className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                  selectedOutbound &&
                  (searchParams.tripType !== "return" || selectedReturn)
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Continue to Book →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightSearchResults;

