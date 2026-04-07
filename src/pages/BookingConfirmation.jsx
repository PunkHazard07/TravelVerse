import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DownloadTicketButton from "../components/Downloadticketbutton";
import {
  CheckCircle,
  Plane,
  Hotel,
  Calendar,
  Clock,
  Users,
  Download,
  Home,
  Share2,
  Luggage,
  MapPin,
  Hash,
  CreditCard,
  Moon
} from "lucide-react";

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [flightBookingData, setFlightBookingData] = useState(null);

  useEffect(() => {
    const confirmedRaw = sessionStorage.getItem("confirmedBooking");
    const flightRaw = sessionStorage.getItem("flightBookingData");

    if (!confirmedRaw) {
      navigate("/flight");
      return;
    }
    try {
      setBooking(JSON.parse(confirmedRaw));
    } catch {
      navigate("/flight");
    }
    if (flightRaw) {
      try {
        setFlightBookingData(JSON.parse(flightRaw));
      } catch {
        /* ignore */
      }
    }
  }, [navigate]);

  if (!booking) return null;

  const formatTime = (dateStr) => {
    if (!dateStr) return "--";
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "---";
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatShortDate = (dateStr) => {
    if (!dateStr) return "---";
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatMediumDate = (dateStr) => {
    if (!dateStr) return "---";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  };

  const isHotel = booking.bookingType === "hotel";
  const isFlight = booking.bookingType === "flight";

  //flight data
  const flight = booking.flightData;
  const outboundItinerary = flight?.itineraries?.[0];
  const returnItinerary = flight?.itineraries?.[1] || null;
  const firstSeg = outboundItinerary?.segments?.[0];
  const lastSeg = outboundItinerary?.segments?.[outboundItinerary.segments.length - 1];
  const retFirstSeg = returnItinerary?.segments?.[0];
  const retLastSeg = returnItinerary?.segments?.[returnItinerary?.segments?.length - 1];

  //hotel data
  const hotelData = booking.hotelData;
  const checkIn = booking.checkInDate || booking.checkIn;
  const checkOut = booking.checkOutDate || booking.checkOut;
  const nightsCount = (() => {
    if (!checkIn || !checkOut) return 1;
    const diff = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : 1;
  })();

  const currency = flight?.price?.currency || flightBookingData?.currency || "USD";
  const totalPrice = booking.totalPrice || 0;

  const paidAt = booking.paymentMetadata?.paidAt
    ? new Date(booking.paymentMetadata.paidAt).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });


  const FlightLeg = ({ label, firstSeg, lastSeg, itinerary }) => {
    if (!firstSeg) return null;
    const stops = (itinerary?.segments?.length || 1) - 1;
    const stopsLabel = stops === 0 ? "Direct" : `${stops} stop${stops > 1 ? "s" : ""}`;

    return (
      <div className="bg-gray-50 rounded-xl p-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          {label}
        </p>
        <div className="flex items-center gap-4">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {formatTime(firstSeg.departure?.at)}
            </p>
            <p className="text-sm font-semibold text-gray-700">
              {firstSeg.departure?.iataCode}
            </p>
            <p className="text-xs text-gray-400">
              {formatShortDate(firstSeg.departure?.at)}
            </p>
          </div>

          <div className="flex-1 text-center">
            <div className="flex items-center gap-2">
              <div className="h-px bg-gray-300 flex-1" />
              <Plane className="w-4 h-4 text-blue-500 rotate-90" />
              <div className="h-px bg-gray-300 flex-1" />
            </div>
            <p className="text-xs text-gray-400 mt-1">{stopsLabel}</p>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              {formatTime(lastSeg?.arrival?.at)}
            </p>
            <p className="text-sm font-semibold text-gray-700">
              {lastSeg?.arrival?.iataCode}
            </p>
            <p className="text-xs text-gray-400">
              {formatShortDate(lastSeg?.arrival?.at)}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Hash className="w-3 h-3" />
            {firstSeg.carrierCode}
            {firstSeg.number}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Luggage className="w-3 h-3" /> 23kg included
          </span>
        </div>
      </div>
    );
  };

  const HotelStay = () => (
    <div className="bg-gray-50 rounded-xl p-5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
        Hotel Stay
      </p>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
          <Hotel className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {hotelData?.hotelName || "Hotel"}
          </h3>
          {hotelData?.city && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
              <MapPin className="w-3.5 h-3.5" />
              {hotelData.city}{hotelData.country ? `, ${hotelData.country}` : ""}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Check-in</p>
              <p className="text-sm font-semibold text-gray-800">{formatMediumDate(checkIn)}</p>
              <p className="text-xs text-gray-400">from 3:00 PM</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Check-out</p>
              <p className="text-sm font-semibold text-gray-800">{formatMediumDate(checkOut)}</p>
              <p className="text-xs text-gray-400">until 12:00 PM</p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Moon className="w-3.5 h-3.5 text-blue-500" />
              {nightsCount} night{nightsCount !== 1 ? "s" : ""}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-blue-500" />
              {hotelData?.guests || 1} guest{(hotelData?.guests || 1) !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-gray-800 break-all">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50">
      {/* Top success banner */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-3xl mx-auto px-4 py-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
            <CheckCircle className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-blue-100 text-sm">
            {isHotel
              ? "Your hotel reservation is confirmed. Check your account for more details "
              : "Your Flight ticket is confirmed. Check your account for more details"}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
        {/* Reference Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-xs uppercase tracking-wider mb-1">
                  Booking Reference
                </p>
                <p className="text-white text-3xl font-bold font-mono tracking-widest">
                  {booking.bookingReference}
                </p>
              </div>
              <div className="text-right">
                <p className="text-blue-200 text-xs uppercase tracking-wider mb-1">
                  Status
                </p>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    booking.status === "confirmed"
                      ? "bg-green-400/20 text-green-100"
                      : booking.status === "pending"
                      ? "bg-yellow-400/20 text-yellow-100"
                      : "bg-red-400/20 text-red-100"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {booking.status?.charAt(0).toUpperCase() +
                    booking.status?.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="p-6 space-y-4">
            {isHotel && <HotelStay />}
            {isFlight && (
              <>
                <FlightLeg
                  label="Outbound Flight"
                  firstSeg={firstSeg}
                  lastSeg={lastSeg}
                  itinerary={outboundItinerary}
                />
                {returnItinerary && (
                  <FlightLeg
                    label="Return Flight"
                    firstSeg={retFirstSeg}
                    lastSeg={retLastSeg}
                    itinerary={returnItinerary}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Booking Info Grid */}
        <div className="grid sm:grid-cols-2 gap-5">
          {/* Booking Details */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-2">Booking Details</h3>
            <div className="divide-y divide-gray-100">
              <InfoRow
                icon={<Hash className="w-3.5 h-3.5 text-blue-600" />}
                label="Booking Reference"
                value={booking.bookingReference}
              />
              <InfoRow
                icon={<Calendar className="w-3.5 h-3.5 text-blue-600" />}
                label="Booked On"
                value={formatDate(booking.createdAt || new Date().toISOString())}
              />
              <InfoRow
                icon={<Clock className="w-3.5 h-3.5 text-blue-600" />}
                label="Payment Time"
                value={paidAt}
              />
              {booking.providerBookingId && (
                <InfoRow
                  icon={<MapPin className="w-3.5 h-3.5 text-blue-600" />}
                  label="Provider ID"
                  value={booking.providerBookingId}
                />
              )}
              {isHotel && hotelData?.hotelName && (
                <InfoRow
                  icon={<Hotel className="w-3.5 h-3.5 text-blue-600" />}
                  label="Hotel"
                  value={hotelData.hotelName}
                />
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-2">Payment Summary</h3>
            <div className="divide-y divide-gray-100">
              <InfoRow
                icon={<CreditCard className="w-3.5 h-3.5 text-blue-600" />}
                label="Payment Method"
                value={
                  (booking.paymentMethod?.charAt(0).toUpperCase() +
                    booking.paymentMethod?.slice(1)) ||
                  "Paystack"
                }
              />
              <InfoRow
                icon={<Hash className="w-3.5 h-3.5 text-blue-600" />}
                label="Payment Reference"
                value={booking.paymentReference || "—"}
              />
              <InfoRow
                icon={<CreditCard className="w-3.5 h-3.5 text-blue-600" />}
                label="Channel"
                value={booking.paymentMetadata?.channel || "Online"}
              />
              <div className="flex items-start gap-3 py-3">
                <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-0.5">Total Paid</p>
                  <p className="text-xl font-bold text-green-600">
                    {currency} {totalPrice.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Passenger (flight only) */}
        {booking.flightData?.passengers?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Passengers
            </h3>
            <div className="space-y-3">
              {booking.flightData.passengers.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white text-sm font-bold">{i + 1}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {p.firstName} {p.lastName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Guest details (hotel only) */}
        {isHotel && booking.guestDetails && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Guest Details
            </h3>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                <span className="text-white text-sm font-bold">1</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">
                  {booking.guestDetails.firstName} {booking.guestDetails.lastName}
                </p>
                {booking.guestDetails.email && (
                  <p className="text-xs text-gray-500">{booking.guestDetails.email}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* What's next */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
          <h3 className="font-semibold text-blue-900 mb-3">What happens next?</h3>
          <ul className="space-y-2 text-sm text-blue-700">
            {isHotel ? (
              <>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  Your booking confirmation will be sent to your email within 15 minutes.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  Check-in is available from 3:00 PM on your arrival date.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  Present this booking reference at the hotel reception.
                </li>
              </>
            ) : (
              <>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  Your e-ticket will be sent to your email within 15 minutes.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  Check in online 24–48 hours before departure.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  Arrive at the airport at least 2 hours before your flight.
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pb-8">
          <DownloadTicketButton
            booking={booking}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            label="Download Confirmation"
            size={16}
          />

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `${isHotel?"Hotel":"Flight"} Booking Confirmed`,
                  text: `My booking reference is ${booking.bookingReference}`,
                });
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share Booking
          </button>
          <button
            onClick={() => {
              // Clear session data and go home
              sessionStorage.removeItem("confirmedBooking");
              sessionStorage.removeItem("flightBookingData");
              sessionStorage.removeItem("flightSearchData");
              navigate("/");
            }}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-100"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;