import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Star,
  MapPin,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Loader2,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_BASE_URL;

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=500&fit=crop";

  const stripHtml = (html = "") =>
  html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const HotelSearch = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const urlMinRating = parseFloat(searchParams.get("minRating") || "0") || 0;
  const defaultFilters = {
    minRating: urlMinRating,
    maxPrice: 500000
  }
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const [filters, setFilters ] = useState(defaultFilters)
  const [sortBy, setSortBy] = useState("recommended");
  const [appliedSortBy, setAppliedSortBy] = useState("recommended");
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const hasUnappliedChanges =
    filters.minRating !== appliedFilters.minRating ||
    filters.maxPrice !== appliedFilters.maxPrice ||
    sortBy !== appliedSortBy;

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      setError(null);
      try {
        const city = searchParams.get("city");
        const country = searchParams.get("country");
        if (!city) {
          setError("City is required for search");
          setLoading(false);
          return;
        }
        const queryParams = new URLSearchParams({
          cityName: city,
          country: country || city,
          limit: 100,
        });
        const response = await fetch(`${API_BASE}/hotels?${queryParams.toString()}`);
        if (!response.ok) throw new Error(`Failed to fetch hotels: ${response.status}`);
        const data = await response.json();
        const hotelsData = data.success && Array.isArray(data.data) ? data.data : [];
        setHotels(hotelsData);
        setInitialLoadComplete(true);
      } catch (error) {
        setError(error.message || "An error occurred while fetching hotels");
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, [searchParams]);

  const performAdvancedSearch = useCallback(async () => {
    if (!initialLoadComplete) return;

    setLoading(true);
    setError(null);
    try {
      const city = searchParams.get("city");
      const country = searchParams.get("country");

      if (!city) {
        setError("City is required");
        setLoading(false);
        return;
      }

      const queryParams = new URLSearchParams({
        city,
        ...(country && { country }),
        sortBy: appliedSortBy,
        limit: 100,
      });
    
      if (appliedFilters.minRating > 0) {
        queryParams.set("minRating", appliedFilters.minRating);
      }
    
      if (appliedFilters.maxPrice < 500000) {
        queryParams.set("maxPrice", appliedFilters.maxPrice);
      }

      const response = await fetch(
        `${API_BASE}/hotels/advanced-search?${queryParams.toString()}`
      );

      if (!response.ok)
        throw new Error(`Advanced search failed: ${response.status}`);

      const data = await response.json();

      const hotelsData =
        data.success && Array.isArray(data.data) ? data.data : [];

      setHotels(hotelsData);
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [
    appliedFilters.minRating,
    appliedFilters.maxPrice,
    appliedSortBy,
    initialLoadComplete,
    searchParams,
  ]);

  useEffect(() => {
    performAdvancedSearch();
  }, [performAdvancedSearch]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setAppliedFilters({ minRating: filters.minRating, maxPrice: filters.maxPrice });
    setAppliedSortBy(sortBy);
  };

  const clearFilters = () => {
    const defaults = { minRating: 0, maxPrice: 500000 };
    setFilters(defaults);
    setSortBy("recommended");
    setAppliedFilters(defaults);
    setAppliedSortBy("recommended");
  };

  const getImageUrl = (hotel) =>
    hotel.main_photo || hotel.thumbnail || DEFAULT_IMAGE;

  const handleBookNow = (hotel) => {
    const checkIn = searchParams.get("checkIn") || "";
    const checkOut = searchParams.get("checkOut") || "";
    const adults = searchParams.get("adults") || "2";
    const rooms = searchParams.get("rooms") || "1";    sessionStorage.setItem("selectedHotel", JSON.stringify(hotel));

    const bookingParams = new URLSearchParams({
      hotelId: hotel._id || hotel.id || "",
      checkIn,
      checkOut,
      adults,
      rooms,
    });
    navigate(`/hotel-booking?${bookingParams.toString()}`);
  };

  const formatPrice = (hotel) => {
    if (hotel.pricePerNightNGN) {
      return `₦${hotel.pricePerNightNGN.toLocaleString("en-NG")}`;
    }
    // Fallback: if NGN conversion somehow missing, show USD
    if (hotel.pricePerNight) {
      return `$${hotel.pricePerNight.toFixed(2)}`;
    }
    return "Price unavailable";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Search Results</h1>
              <p className="text-sm text-gray-600 mt-1">
                {loading ? "Loading..." : `${hotels.length} hotels found`}
                {appliedFilters.minRating > 0 && (
                  <span className="ml-2 text-blue-600">• Min rating: {appliedFilters.minRating}</span>
                )}
              {appliedFilters.maxPrice < 500000 && (
                  <span className="ml-2 text-blue-600">
                    • Max price: ₦{appliedFilters.maxPrice.toLocaleString("en-NG")}
                  </span> )}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                    sortBy !== appliedSortBy
                      ? "bg-orange-50 border-orange-300 text-orange-700"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-sm font-medium">Sort by</span>
                  {sortBy !== appliedSortBy && (
                    <span className="w-2 h-2 bg-orange-500 rounded-full" />
                  )}
                  <ChevronDown className={`w-4 h-4 transition-transform ${showSortDropdown ? "rotate-180" : ""}`} />
                </button>
                {showSortDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-40">
                    {[
                      { value: "recommended", label: "Recommended" },
                      { value: "price-low",   label: "Price: Low to High" },
                      { value: "price-high",  label: "Price: High to Low" },
                      { value: "rating",      label: "Highest Rating" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => { setSortBy(option.value); setShowSortDropdown(false); }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                          sortBy === option.value ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  hasUnappliedChanges && !showFilters
                    ? "bg-orange-600 hover:bg-orange-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="text-sm font-medium">Filters</span>
                {hasUnappliedChanges && !showFilters && (
                  <span className="ml-1 px-2 py-0.5 bg-white text-orange-600 text-xs font-bold rounded-full">!</span>
                )}
              </button>

              {!showFilters && hasUnappliedChanges && (
                <button
                  onClick={applyFilters}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-md animate-pulse"
                >
                  <span className="text-sm font-semibold">Apply Changes</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-80 shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                  <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Clear all
                  </button>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Rating: {filters.minRating === 0 ? "Any" : filters.minRating.toFixed(1)}
                    </label>
                    <input
                      type="range" min="0" max="5" step="0.5"
                      value={filters.minRating}
                      onChange={(e) => handleFilterChange("minRating", parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Any</span><span>10.0</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Price: ₦{filters.maxPrice.toLocaleString("en-NG")}/night
                    </label>
                    <input
                      type="range" min="10000" max="500000" step="5000"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange("maxPrice", parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>₦10,000</span><span>₦500,000+</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={applyFilters}
                      disabled={!hasUnappliedChanges}
                      className={`w-full py-3 rounded-lg font-semibold transition-all ${
                        hasUnappliedChanges
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {hasUnappliedChanges ? "Apply Filters" : "No Changes"}
                    </button>
                    {hasUnappliedChanges && (
                      <p className="text-xs text-gray-500 mt-2 text-center">Click to see updated results</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hotel Results */}
          <div className="flex-1">
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Searching for hotels...</h3>
                <p className="text-gray-600">Please wait while we find the best options for you</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 text-2xl">⚠</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Hotels</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : hotels.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No hotels found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters to see more results</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={clearFilters} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    Clear Filters
                  </button>
                  <button onClick={() => window.location.href = "/hotel"} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors">
                    New Search
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {hotels.map((hotel, index) => (
                  <div
                    key={hotel._id || hotel.id || hotel.apiHotelId || `hotel-${index}`}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Fixed height card: image left, details right */}
                    <div className="flex flex-col md:flex-row md:h-56">

                      {/* Image — fixed width + full height, never stretches card */}
                      <div className="md:w-72 h-52 md:h-full shrink-0 overflow-hidden bg-gray-100">
                        <img
                          src={getImageUrl(hotel)}
                          alt={hotel.name || "Hotel"}
                          className="w-full h-full object-cover object-center"
                          onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                        />
                      </div>

                      {/* Details — fills remaining space, no overflow */}
                      <div className="flex flex-1 min-w-0 flex-col md:flex-row">

                        {/* Left: name, location, description, tags */}
                        <div className="flex-1 min-w-0 p-5 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-3 mb-1">
                              <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-1">
                                {hotel.name}
                              </h3>
                              {hotel.rating > 0 && (
                                <div className="flex items-center gap-1 bg-blue-600 text-white px-2.5 py-1 rounded-lg shrink-0">
                                  <Star className="w-3.5 h-3.5 fill-current" />
                                  <span className="text-sm font-semibold">{hotel.rating.toFixed(1)}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 text-gray-500 mb-3">
                              <MapPin className="w-3.5 h-3.5 shrink-0" />
                              <span className="text-sm truncate">
                                {hotel.location?.city}, {" "}{hotel.location?.country }
                              </span>
                            </div>

                            {(hotel.hotelDescription || hotel.description) && (
                              <p className="text-gray-600 text-sm line-clamp-2">
                                {stripHtml(
                                  hotel.hotelDescription || hotel.description
                                ).substring(0, 160)}
                                ...
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-3 flex-wrap">
                            <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                              Best Price
                            </span>
                            {hotel.stars && (
                              <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                                {hotel.stars} Star Hotel
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right: price + book button — fixed width, vertically centered */}
                        <div className="md:w-48 bg-gray-50 p-5 flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-200 shrink-0">
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Per night</p>
                            <p className="text-3xl font-bold text-gray-900 leading-none">
                              {formatPrice(hotel)}
                            </p>
                            {hotel.pricePerNightNGN && hotel.pricePerNight && (
                              <p className="text-xs text-gray-400 mt-1">
                                ≈ ${hotel.pricePerNight.toFixed(2)} USD
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">+taxes & fees</p>
                          </div>
                          <button
                            onClick={() => handleBookNow(hotel)}
                            className="w-full mt-4 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                          >
                            Book Now
                          </button>
                        </div>

                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelSearch;