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
  Square
} from "lucide-react";
import BookingSteps from "../components/BookingSteps";
import AirlineLogo from "../components/Airlinelogo";

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
    maxPrice: 5000,
    stops: "any",
    airlines: [],
  });

  useEffect(() => {
    //get data from sessionStorage
    const storedData = sessionStorage.getItem('flightSearchData');
    if(storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setSearchData(parsedData);
        setLoading(false);
      } catch (error) {
        console.error("Error parsing search data:", error);
        setLoading(false);
        navigate('/flight')
      }
    } else{
      navigate('/flight');
    }
    setLoading(false);
  }, [navigate]);

      const parseDuration = (isoDuration) => {
      const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
      const hours = match[1] ? parseInt(match[1]) : 0;
      const minutes = match[2] ? parseInt(match[2]) : 0;
      return `${hours}h ${minutes}m`;
    };

  const transformOffer = (offer, overridePrice = null) => {
    if (!offer?.itineraries?.[0]) return null;

    const itinerary = offer.itineraries[0];
    const firstSeg = itinerary.segments[0];
    const lastSeg = itinerary.segments[itinerary.segments.length - 1];
    const stopCount = itinerary.segments.length - 1;

    return {
      id: offer.offerId,
      flightNumber: `${firstSeg.carrierCode}${firstSeg.number}`,
      carrierCode: offer.carrierCode ?? firstSeg.carrierCode,
      airlineName: offer.carrierName ?? offer.carrierCode ?? offer.validatingAirlineCodes?.[0] ?? "Unknown",
      departureAirport: firstSeg.departure.iataCode,
      arrivalAirport: lastSeg.arrival.iataCode,
      departureTime: firstSeg.departure.at,
      arrivalTime: lastSeg.arrival.at,
      duration: parseDuration(itinerary.duration),
      stops: stopCount === 0 ? "Direct" : `${stopCount} stop${stopCount > 1 ? "s" : ""}`,
      price: overridePrice ?? parseFloat(offer.price.total),
      currency: offer.price.currency,
      numberOfBookableSeats: offer.numberOfBookableSeats,
      rawOffer: offer
    };
  };

  const separateFlights = (flightOffers) => {
    const outbound = [];
    const returnFlights = [];

    flightOffers.forEach((offer) => {
      if (!offer.itineraries) return;

      if (offer.itineraries.length === 1) {
        const t = transformOffer(offer);
        if (t) outbound.push(t);
      } else if (offer.itineraries.length === 2) {
        const halfPrice = parseFloat(offer.price.total) / 2;

        const outOffer = { ...offer, 
          itineraries: [offer.itineraries[0]],
          price: {...offer.price, total: halfPrice.toString()}
        };
        const retOffer = {
          ...offer,
          offerId: offer.offerId + "-return",
          itineraries: [offer.itineraries[1]],
          price: {...offer.price, total: halfPrice.toString()}
        };

        const tOut = transformOffer(outOffer, halfPrice);
        const tRet = transformOffer(retOffer, halfPrice);
        if (tOut) outbound.push(tOut);
        if (tRet) returnFlights.push(tRet);
      }
    });

    return { outboundFlights: outbound, returnFlights };

  };

  //transform and separate flights
  const { outboundFlights, returnFlights } = useMemo(() => {
    if (searchData?.results?.success && searchData.results.data) {
      return separateFlights(searchData.results.data);
    }
    return { outboundFlights: [], returnFlights: [] };
  }, [searchData]);

  const availableAirlines = useMemo(() => {
    const seen = new Set();
    const list = [];

    [...outboundFlights, ...returnFlights].forEach((f) => {
      if (f.carrierCode && !seen.has(f.carrierCode)) {
        seen.add(f.carrierCode);
        list.push({ code: f.carrierCode, name: f.airlineName });
      }
    });

    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [outboundFlights.length, returnFlights.length]);

    const toggleAirline = (code) => {
    setFilters((prev) => {
      const already = prev.airlines.includes(code);
      return {
        ...prev,
        airlines: already
          ? prev.airlines.filter((c) => c !== code)
          : [...prev.airlines, code],
      };
    });
  };


  const applyFilters = (flights) => {
    let filtered = [...flights];

    // Airline filter — if nothing selected, show all
    if (filters.airlines.length > 0) {
      filtered = filtered.filter((f) => {
        const code = f.carrierCode || f.airline;
        return filters.airlines.includes(code);
      });
    }

    // Stops filter
    if (filters.stops !== "any") {
      filtered = filtered.filter((f) => {
        if (filters.stops === "direct") return f.stops === "Direct";
        if (filters.stops === "1-stop") return f.stops === "1 stop";
        if (filters.stops === "2+-stops") return f.stops.includes("2") || f.stops.includes("3");
        return true;
      });
    }

    // Price filter
    filtered = filtered.filter((f) => f.price <= filters.maxPrice);

    // Sort
    if (sortBy === "price-low") filtered.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-high") filtered.sort((a, b) => b.price - a.price);
    else if (sortBy === "departure")
      filtered.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));

    return filtered;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
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

      const filteredOutbound = applyFilters(outboundFlights);
      const filteredReturn = applyFilters(returnFlights);
      const currency = outboundFlights[0]?.currency;

      const selectedOutboundFlight = filteredOutbound.find(
        (f) => f.id === selectedOutbound
      );
      const selectedReturnFlight = filteredReturn.find(
      (f) => f.id === selectedReturn
      );

    const totalPrice =
    (selectedOutboundFlight?.price ?? 0) + (selectedReturnFlight?.price ?? 0);

  const handleModifySearch = () => navigate("/flight");

  const handleContinueToBook = () => {
        const bookingPayload = {
          outbound: selectedOutboundFlight,
          returnFlight: selectedReturnFlight || null,
          searchParams,
          totalPrice,
          currency,
        };
        sessionStorage.setItem("flightBookingData",
          JSON.stringify(bookingPayload));
        navigate("/flight-booking");
    }

    const FlightCard = ({flight, isSelected = false, onSelect }) => {
    const isExpanded = expandedFlight === flight.id;

    return (
            <div
        className={`bg-white rounded-lg border-2 transition-all ${
          isSelected
            ? "border-blue-600 shadow-lg"
            : "border-gray-200 hover:border-blue-300 hover:shadow-md"
        }`}
      >
        <div className="p-4 md:p-6 cursor-pointer" onClick={() => onSelect(flight.id)}>
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Airline */}
            <div className="flex items-center gap-3 lg:w-40">
              <AirlineLogo carrierCode={flight.carrierCode} size="md" />
              <div>
                <p className="font-semibold text-gray-900 text-sm leading-tight">
                  {flight.airlineName}
                </p>
                <p className="text-xs text-gray-500">{flight.flightNumber}</p>
              </div>
            </div>

            {/* Route */}
            <div className="flex-1 grid grid-cols-3 gap-2 items-center">
              <div className="text-left">
                <p className="text-2xl font-bold text-gray-900">
                  {formatTime(flight.departureTime)}
                </p>
                <p className="text-sm text-gray-600 mt-1">{flight.departureAirport}</p>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">{flight.duration}</p>
                <div className="flex items-center justify-center gap-1">
                  <div className="h-px bg-gray-300 flex-1" />
                  <Plane className="w-4 h-4 text-gray-400 rotate-90" />
                  <div className="h-px bg-gray-300 flex-1" />
                </div>
                <p className="text-xs text-gray-500 mt-1">{flight.stops}</p>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {formatTime(flight.arrivalTime)}
                </p>
                <p className="text-sm text-gray-600 mt-1">{flight.arrivalAirport}</p>
              </div>
            </div>

            {/* Price */}
            <div className="lg:w-40 flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-2">
              <div className="text-left lg:text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {flight.currency} {flight.price.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">per person</p>
              </div>
              <button
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(flight.id);
                }}
              >
                {isSelected ? "Selected" : "Select"}
              </button>
            </div>
          </div>

          {/* Bottom row */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">{flight.airlineName}</span>
                  {" • "}
                  {flight.flightNumber}
                </p>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                  {flight.numberOfBookableSeats ?? 0} seats available
                </span>
              </div>
              <button
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedFlight(isExpanded ? null : flight.id);
                }}
              >
                Flight details
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Expanded */}
        {isExpanded && (
          <div className="px-4 md:px-6 pb-4 md:pb-6 border-t border-gray-100">
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Departure</h4>
                <p className="text-sm text-gray-600">
                  {formatDate(flight.departureTime)} at {formatTime(flight.departureTime)}
                </p>
                <p className="text-sm text-gray-600">{flight.departureAirport}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Arrival</h4>
                <p className="text-sm text-gray-600">
                  {formatDate(flight.arrivalTime)} at {formatTime(flight.arrivalTime)}
                </p>
                <p className="text-sm text-gray-600">{flight.arrivalAirport}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

    if (!results || !results.success || outboundFlights.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plane className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No flights found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find any flights matching your search criteria. Please try adjusting your search parameters.
          </p>
          <button
            onClick={handleModifySearch}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Modify Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Search Summary */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-sm md:text-base">
                <span className="font-semibold text-gray-900">{searchParams.dep_airport}</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <span className="font-semibold text-gray-900">{searchParams.arr_airport}</span>
              </div>
              {searchParams.departure_date && (
                <>
                  <span className="text-sm text-gray-500 hidden md:inline">•</span>
                  <span className="text-sm text-gray-600 hidden md:inline">
                    {formatDate(searchParams.departure_date)}
                    {searchParams.return_date && ` ${formatDate(searchParams.return_date)}`}
                  </span>
                </>
              )}
            </div>
            <BookingSteps currentStep={1} />
            <button 
              onClick={handleModifySearch}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Modify Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="lg:w-64">
            <div className="lg:sticky lg:top-24">
              {/* Mobile Filter Toggle */}
              <button
                className="lg:hidden w-full bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between mb-4"
                onClick={() => setShowFilters(!showFilters)}
              >
                <span className="flex items-center gap-2 font-medium">
                  <SlidersHorizontal className="w-5 h-5" />
                  Filters
                  {filters.airlines.length > 0 && (
                    <span className="ml-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {filters.airlines.length}
                    </span>
                  )}
                </span>
                {showFilters ? <X className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
              </button>

              {/* Filters */}
              <div
                className={`bg-white rounded-lg border border-gray-200 p-4 space-y-6 ${
                  showFilters ? "block" : "hidden lg:block"
                }`}
              >
                {/* Sort */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Sort by</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="departure">Departure Time</option>
                  </select>
                </div>

                   {/* ── AIRLINE FILTER ── */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Airlines</h3>
                    {filters.airlines.length > 0 && (
                      <button
                        onClick={() => setFilters((prev) => ({ ...prev, airlines: [] }))}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {availableAirlines.length === 0 ? (
                    <p className="text-sm text-gray-400">No airlines available</p>
                  ) : (
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {availableAirlines.map(({ code, name }) => {
                        const checked = filters.airlines.includes(code);
                        return (
                          <button
                            key={code}
                            type="button"
                            onClick={() => toggleAirline(code)}
                            className="w-full flex items-center gap-2.5 text-left hover:bg-gray-50 rounded-md px-1 py-1 transition-colors"
                          >
                            {checked ? (
                              <CheckSquare className="w-4 h-4 text-blue-600 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-400 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="text-sm text-gray-700 font-medium truncate">{name}</p>
                              <p className="text-xs text-gray-400">{code}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Active filter badge summary */}
                  {filters.airlines.length > 0 && (
                    <p className="text-xs text-blue-600 mt-2">
                      Showing {filters.airlines.length} airline{filters.airlines.length > 1 ? "s" : ""}
                    </p>
                  )}
                </div>

                  {/* Stops */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Stops</h3>
                  <div className="space-y-2">
                    {["any", "direct", "1-stop", "2+-stops"].map((option) => (
                      <label
                        key={option}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="stops"
                          value={option}
                          checked={filters.stops === option}
                          onChange={(e) =>
                            setFilters({ ...filters, stops: e.target.value })
                          }
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {option.replace("-", " ")}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Max Price:{" "}
                    {currency ? `${currency} ` : ""}
                    {filters.maxPrice.toLocaleString()} 
                  </h3>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      setFilters({ ...filters, maxPrice: parseInt(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>

                {/* Reset all */}
                <button 
                onClick={() => setFilters({
                  maxPrice: 5000,
                  stops: "any",
                  airlines: []
                })}
                className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 space-y-8">
            {/* Outbound Flights */}
          <div>
              <div className="flex items-center gap-2 mb-4">
                <Plane className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Outbound Flight</h2>
                <span className="text-sm text-gray-500">
                  ({filteredOutbound.length} of {outboundFlights.length} flights)
                </span>
              </div>

              {filteredOutbound.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <p className="text-gray-500 mb-2">No flights match your current filters.</p>
                  <button
                    onClick={() => setFilters((prev) => ({ ...prev, airlines: [] }))}
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
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Return Flights */}
            {searchParams.tripType === "return" && returnFlights.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Plane className="w-5 h-5 text-blue-600 rotate-180" />
                  <h2 className="text-xl font-bold text-gray-900">Return Flight</h2>
                  <span className="text-sm text-gray-500">
                    ({filteredReturn.length} of {returnFlights.length} flights)
                  </span>
                </div>

                {filteredReturn.length === 0 ? (
                  <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                    <p className="text-gray-500 mb-2">No return flights match your current filters.</p>
                    <button
                      onClick={() => setFilters((prev) => ({ ...prev, airlines: [] }))}
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
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      {(selectedOutbound || selectedReturn) && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Price</p>
                <p className="text-2xl font-bold text-blue-600">
                  {currency} {totalPrice.toFixed(2)}
                </p>
              </div>
              <button
                onClick={handleContinueToBook}
                className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                  selectedOutbound &&
                  (searchParams.tripType === "one-way" || selectedReturn)
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                disabled={
                  !selectedOutbound ||
                  (searchParams.tripType === "return" && !selectedReturn)
                }
              >
                Continue to Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightSearchResults;