import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Users, Search, Star } from "lucide-react";

const HotelHero = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    destination: "",
    checkIn : "",
    checkOut: "",
    adults: 2,
    rooms: 1,
    minRating: 0
  });

  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [showStarDropdown, setShowStarDropdown] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    const destination = formData.destination.trim();

    if (!destination) {
        alert("Please enter a destination");
        return;
    }

    if (!formData.checkIn || !formData.checkOut) {
        alert("Please select both check-in and check-out dates");
        return;
    }

    const parts = destination.split(",").map(part => part.trim());
    const city = parts[0];
    const country = parts[1] || "";

    //build query parameters
    const searchParams = new URLSearchParams ({
      city,
      ...(country && { country }),
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      adults: formData.adults,
      rooms: formData.rooms,
      ...(formData.minRating > 0 && { minRating: formData.minRating })
    });

    navigate(`/hotel-search?${searchParams.toString()}`);
  };

  const incrementGuests = (type) => {
    if (type === "adults" && formData.adults < 10) {
      handleInputChange("adults", formData.adults + 1);
    } else if (type === "rooms" && formData.rooms < 5) {
      handleInputChange("rooms", formData.rooms + 1);
    }
  };

  const decrementGuests = (type) => {
    if (type === "adults" && formData.adults > 1) {
      handleInputChange("adults", formData.adults - 1);
    } else if (type === "rooms" && formData.rooms > 1) {
      handleInputChange("rooms", formData.rooms - 1);
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1920&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/20 to-black/50" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Title */}
        <div className="text-center mb-8 sm:mb-12 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-2xl tracking-tight">
            Find the Perfect Hotel
          </h1>
          <p className="text-lg sm:text-xl text-white/90 drop-shadow-lg max-w-2xl mx-auto">
            Discover your ideal stay from thousands of hotels worldwide
          </p>
        </div>

        {/* Search Card */}
        <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          {/* Main Search Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Destination Input */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="City, hotel name, or landmark"
                  value={formData.destination}
                  onChange={(e) =>
                    handleInputChange("destination", e.target.value)
                  }
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
                />
              </div>
            </div>

            {/* Check-in Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-in
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.checkIn}
                  min={new Date().toISOString().split("T")[0]}                  onChange={(e) => handleInputChange("checkIn", e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Check-out Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-out
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.checkOut}
                  min={formData.checkIn || new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    handleInputChange("checkOut", e.target.value)
                  }
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Guests and Rooms */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Guests & Rooms
              </label>
              <button
                onClick={() => {
                  setShowGuestDropdown(!showGuestDropdown);
                  setShowStarDropdown(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-900">
                    {formData.adults} adult{formData.adults !== 1 ? "s" : ""},{" "}
                    {formData.rooms} room{formData.rooms !== 1 ? "s" : ""}
                  </span>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                    showGuestDropdown ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Guest Dropdown */}
              {showGuestDropdown && (
                <div className="absolute top-full mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-xl p-4 z-20">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">Adults</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => decrementGuests("adults")}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors border border-gray-300"
                        >
                          -
                        </button>
                        <span className="text-gray-900 w-8 text-center font-medium">
                          {formData.adults}
                        </span>
                        <button
                          onClick={() => incrementGuests("adults")}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors border border-gray-300"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">Rooms</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => decrementGuests("rooms")}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors border border-gray-300"
                        >
                          -
                        </button>
                        <span className="text-gray-900 w-8 text-center font-medium">
                          {formData.rooms}
                        </span>
                        <button
                          onClick={() => incrementGuests("rooms")}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors border border-gray-300"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Filters and Search Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-4">
              {/* Star Rating Filter */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowStarDropdown(!showStarDropdown);
                    setShowGuestDropdown(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium transition-all"
                >
                  <Star
                    className="w-5 h-5 text-yellow-400"
                    fill={formData.minRating > 0 ? "currentColor" : "none"}
                  />
                  <span>
                    {formData.minRating > 0
                      ? `${formData.minRating}+ stars`
                      : "Any rating"}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                      showStarDropdown ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showStarDropdown && (
                  <div className="absolute top-full mt-2 right-0 bg-white border border-gray-300 rounded-lg shadow-xl p-2 z-20 min-w-40">
                    {[0, 3, 4, 5].map((stars) => (
                      <button
                        key={stars}
                        onClick={() => {
                          handleInputChange("minRating", stars);
                          setShowStarDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 rounded transition-colors flex items-center gap-2 ${
                          formData.minRating === stars
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {stars === 0 ? (
                          "Any rating"
                        ) : (
                          <>
                            {stars}
                            <Star
                              className="w-4 h-4 text-yellow-400"
                              fill="currentColor"
                            />
                            <span>+</span>
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="w-full sm:w-auto px-8 py-3.5 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
            >
              <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-lg">Search Hotels</span>
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <p className="text-white/80 text-base mt-8 text-center max-w-2xl">
          Compare prices from top booking sites • Best price guarantee • 24/7
          customer support
        </p>
      </div>
    </div>
  );
};

export default HotelHero;