import { useState, useEffect, use } from "react";
import {useSearchParams, useNavigate} from "react-router-dom";
import {
  MapPin, Star, Wifi, Coffee, Car, Dumbbell, Shield,
  CreditCard, Lock, ChevronDown, ChevronUp, Check,
  Calendar, Users, Moon, Sparkles, ArrowRight, BadgeCheck, Loader2, AlertCircle
} from "lucide-react";

const API_BASE = import.meta.env.VITE_BASE_URL;

const HotelBooking = () => {
const [searchParams] = useSearchParams();
const navigate = useNavigate();

  const [openSections, setOpenSections] = useState({ stay: false, guest: false, payment: true });
  const [selectedCard, setSelectedCard] = useState("visa");

  const toggle = (s) => setOpenSections((prev) => ({ ...prev, [s]: !prev[s] }));
  const [hotel, setHotel] = useState(null);
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const adults = parseInt(searchParams.get("adults") || "2", 10);
  const rooms = parseInt(searchParams.get("rooms") || "1", 10);
  const [guestForm, setGuestForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialRequests: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  //load hotel from sessionStorage
  useEffect(() => {
    const raw = sessionStorage.getItem("selectedHotel");
    if (raw) {
      try {
        setHotel(JSON.parse(raw));
      } catch {
        navigate("/hotel");
      }
    } else {
      navigate("/hotel");
    }
  }, [navigate]);

  //derived Price
  const nights = (() => {
    if (!checkIn || !checkOut) return 1;
    const diff = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : 1;
  })();

  const pricePerNight = hotel?.pricePerNight || 0;
  const currency = hotel?.currency;
  const subtotal = pricePerNight * nights * rooms;
  const taxRate = 0.12;
  const taxes = Math.round(subtotal * taxRate);
  const total = subtotal + taxes;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleConfirmAndPay = async () => {
      if (!guestForm.firstName || !guestForm.lastName || !guestForm.email) {
      setError("Please fill in your first name, last name, and email.");
      setOpenSections((prev) => ({ ...prev, guest: true }));
      return;
    }

    if (!checkIn || !checkOut) {
      setError("Check-In and check-Out dates are missing. Please go back and search again.");
      return;
    }

    setError(null);
    setSubmitting(true);

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!token) {
      sessionStorage.setItem(
        "returnTo",
        `/hotel-booking?${searchParams.toString()}`
      );
      navigate("/login");
      return;
    }

    try {
      //create booking
      const bookingRes = await fetch(`${API_BASE}/bookings/hotel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hotelId:      hotel._id || hotel.id,
          checkInDate:  checkIn,
          checkOutDate: checkOut,
          totalPrice:   total,
          guests:       adults,
          rooms,
          guestDetails: {
            firstName:       guestForm.firstName,
            lastName:        guestForm.lastName,
            email:           guestForm.email,
            phone:           guestForm.phone,
            specialRequests: guestForm.specialRequests,
          },
        }),
      });

      const bookingData = await bookingRes.json();

      if (!bookingRes.ok || !bookingData.success) {
        throw new Error(bookingData.message || "Failed to create booking");
      }
      
      const bookingId= bookingData.data._id;

      const payRes = await fetch(`${API_BASE}/bookings/initialize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId,
          email: guestForm.email,
        }),
      });

      const payData = await payRes.json();

      if (!payRes.ok || !payData.success) {
        throw new Error(payData.message || "Failed to initialize payment");
      }

      //paystackCheckout
      window.location.href = payData.data.authorizationUrl;

    } catch (error) {
      setError("Failed to create booking. Please try again.");
      setSubmitting(false);
    } 
  };

  const inputClass =
    "w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400";

  const labelClass = "block text-xs text-gray-500 uppercase tracking-widest mb-1.5 font-medium";

  const SectionHeader = ({ id, label, number }) => (
    <button
      onClick={() => toggle(id)}
      className="w-full flex items-center justify-between px-6 py-5 hover:bg-blue-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold text-black">{number}</span>
        <span className="text-base font-semibold text-gray-800">{label}</span>
      </div>
      {openSections[id]
        ? <ChevronUp size={18} className="text-blue-600" />
        : <ChevronDown size={18} className="text-gray-400" />}
    </button>
  );

  if (!hotel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  const amenities = hotel.amenities || ["Free WiFi", "Breakfast", "Parking", "Pool"];
  const amenityIcons = {
    "Free WiFi": <Wifi size={13} />,
    "Breakfast": <Coffee size={13} />,
    "Parking":   <Car size={13} />,
    "Pool":      <Dumbbell size={13} />,
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* Top Bar */}
      {/* <div className="bg-blue-600 px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-white text-xs">
          <Lock size={12} />
          <span>Secure &amp; encrypted checkout</span>
        </div>
        <span className="text-white text-xs font-semibold tracking-widest">LUXE STAYS</span>
      </div> */}

      {/* Main Layout */}
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

        {/* ── LEFT COLUMN ── */}
        <div>
          {/* Page Title */}
          <div className="mb-8">
            <p className="text-xs text-blue-600 uppercase tracking-widest mb-1 font-medium">Final Step</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Complete Your Reservation</h1>
            <p className="text-sm text-gray-400">Review your stay and enter payment details below</p>
          </div>

           {/* Error banner */}
          {error && (
            <div className="flex items-start gap-3 px-4 py-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ── SECTION 1: Stay Details ── */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-3 shadow-sm">
            <SectionHeader id="stay" number="01" label="Stay Details" />

            {openSections.stay && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-6 mt-4">
                  {/* Image mosaic */}
                  <div className="grid overflow-hidden rounded-lg" style={{ gridTemplateColumns: "2fr 1fr", gridTemplateRows: "160px 100px", gap: 3 }}>
                    <img
                      src={hotel.main_photo || hotel.thumbnail || "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80"}
                      className="object-cover w-full h-full row-span-2"
                      alt="Room"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=300&q=80"
                      className="object-cover w-full h-full"
                      alt="Bath"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1540518614846-7eded433c457?w=300&q=80"
                      className="object-cover w-full h-full"
                      alt="View"
                    />
                  </div>

                  {/* Hotel info */}
                  <div className="flex flex-col gap-3">
                    {hotel.stars && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs text-blue-700 font-medium w-fit">
                        <Sparkles size={11} /> {hotel.stars}-Star Hotel
                      </span>
                    )}
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">{hotel.name}</h3>
                    {hotel.rating > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              size={12}
                              fill={i <= Math.round(hotel.rating) ? "#2563eb" : "none"}
                              color="#2563eb"
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">{hotel.rating.toFixed(1)} / 5</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-blue-600" />
                      <span className="text-xs text-gray-500">
                        {hotel.location?.city || hotel.city}, {hotel.location?.country || hotel.country}
                      </span>
                    </div>

                    <div className="h-px bg-gray-100 my-1" />

                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Check-In",  date: formatDate(checkIn),  sub: "from 3:00 PM" },
                        { label: "Check-Out", date: formatDate(checkOut), sub: "until 12:00 PM" },
                      ].map(({ label, date, sub }) => (
                        <div key={label} className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                          <p className="text-xs text-blue-400 uppercase tracking-widest mb-1">{label}</p>
                          <p className="text-sm font-semibold text-gray-800">{date}</p>
                          <p className="text-xs text-gray-400">{sub}</p>
                        </div>
                      ))}
                    </div>


                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Moon size={12} className="text-blue-600" /> {nights} night{nights !== 1 ? "s" : ""}</span>
                      <span className="text-gray-300">·</span>
                      <span className="flex items-center gap-1">
                        <Users size={12} className="text-blue-600" /> {adults} adult{adults !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                </div>

                  {/* Amenities */}
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 uppercase tracking-widest">Included Amenities</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <div className="flex flex-wrap gap-2">
                  {amenities.slice(0, 4).map((amenity) => (
                    <span
                      key={amenity}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600"
                    >
                      <span className="text-blue-600">
                        {amenityIcons[amenity] || <Wifi size={13} />}
                      </span>
                      {amenity}
                    </span>
                  ))}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-xs text-green-700">
                    <BadgeCheck size={12} /> Free cancellation
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ── SECTION 2: Guest Information ── */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-3 shadow-sm">
            <SectionHeader id="guest" number="02" label="Guest Information" />

            {openSections.guest && (
              <div className="px-6 pb-6 border-t border-gray-100 pt-4 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>First Name *</label>
                    <input
                      className={inputClass}
                      placeholder="John"
                      value={guestForm.firstName}
                      onChange={(e) => setGuestForm((p) => ({ ...p, firstName: e.target.value }))}
                    />
                  </div>
                    <div>
                    <label className={labelClass}>Last Name *</label>
                    <input
                      className={inputClass}
                      placeholder="Doe"
                      value={guestForm.lastName}
                      onChange={(e) => setGuestForm((p) => ({ ...p, lastName: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Email Address *</label>
                    <input
                      className={inputClass}
                      placeholder="john.doe@email.com"
                      type="email"
                      value={guestForm.email}
                      onChange={(e) => setGuestForm((p) => ({ ...p, email: e.target.value }))}
                    />
                  </div>
                <div>
                    <label className={labelClass}>Phone Number</label>
                    <input
                      className={inputClass}
                      placeholder="+1 (555) 000-0000"
                      value={guestForm.phone}
                      onChange={(e) => setGuestForm((p) => ({ ...p, phone: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>
                    Special Requests{" "}
                    <span className="normal-case text-gray-300 font-normal">(optional)</span>
                  </label>
                  <textarea
                    className={inputClass}
                    placeholder="Late check-in, dietary requirements, room preferences..."
                    rows={3}
                    style={{ resize: "none" }}
                    value={guestForm.specialRequests}
                    onChange={(e) => setGuestForm((p) => ({ ...p, specialRequests: e.target.value }))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── SECTION 3: Payment ── */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <SectionHeader id="payment" number="03" label="Payment Details" />

            {openSections.payment && (
              <div className="px-6 pb-6 border-t border-gray-100 pt-4 flex flex-col gap-4">
                {/* Card type selector */}
                <div className="flex gap-2">
                  {[
                    { id: "visa", label: "Visa", dot: "#1a1f71" },
                    { id: "mastercard", label: "Mastercard", dot: "#eb001b" },
                    { id: "amex", label: "Amex", dot: "#2e77bc" },
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCard(c.id)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border rounded-lg text-sm font-medium transition-all ${
                        selectedCard === c.id
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.dot }} />
                      {c.label}
                      {selectedCard === c.id && <Check size={13} className="text-blue-600" />}
                    </button>
                  ))}
                </div>

                {/* PayStack notice */}
                <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <CreditCard size={16} className="text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-0.5">
                      Secured by Paystack
                    </p>
                    <p className="text-xs text-blue-600">
                      You'll enter your card details on the secure Paystack checkout page after clicking confirm.
                    </p>
                  </div>
                </div>

                {/* Security note */}
                <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <Shield size={14} className="text-blue-500 shrink-0" />
                  <span className="text-xs text-blue-700">Your payment information is encrypted with 256-bit SSL</span>
                </div>
              </div>
            )}
          </div>

          {/* ── Confirm Button ── */}
          <div className="mt-6">
            <button
            onClick={handleConfirmAndPay}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2.5 py-4 bg-blue-600 hover:bg-blue-700 text-white text-sm 
            font-semibold uppercase tracking-widest rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-200"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock size={14} />
                  Confirm &amp; Pay {currency}{total.toLocaleString()}
                  <ArrowRight size={14} />
                </>
              )}
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">
              You will be redirected to PayStack's secure Payment Page
            </p>
          </div>
        </div>

        {/* ── RIGHT COLUMN — Order Summary ── */}
        <div className="sticky top-6">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">

            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 bg-blue-600">
              <p className="text-xs text-blue-200 uppercase tracking-widest mb-1">Booking Summary</p>
              <h3 className="text-xl font-bold text-white">Price Breakdown</h3>
            </div>

            {/* Hotel mini card */}
            <div className="px-6 py-4 border-b border-gray-100 flex gap-3 items-center">
              <img
                src={hotel.main_photo || hotel.thumbnail || "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=120&q=80"}
                className="w-16 h-16 object-cover rounded-lg shrink-0"
                alt="Hotel"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=120&q=80";
                }}
              />
              <div>
                <p className="text-sm font-bold text-gray-900 mb-0.5">{hotel.name}</p>
                <p className="text-xs text-gray-400 mb-1.5">
                  {hotel.location?.city || hotel.city}, {hotel.location?.country || hotel.country}
                </p>
                {hotel.rating > 0 && (
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={10}
                        fill={i <= Math.round(hotel.rating) ? "#2563eb" : "none"}
                        color="#2563eb"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="px-6 py-3 border-b border-gray-100 bg-gray-50 flex gap-4 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <Calendar size={12} className="text-blue-600" />
                  {formatDate(checkIn)} → {formatDate(checkOut)}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <Moon size={12} className="text-blue-600" /> {nights} night{nights !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <Users size={12} className="text-blue-600" /> {adults} guest{adults !== 1 ? "s" : ""}
              </span>
              <span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/>
                  <path d="M2 17h20"/><path d="M6 8v9"/></svg>
                    {rooms} room {rooms !== 1 ? "s": ""}
              </span>
            </div>

            {/* Pricing */}
              <div className="px-6 py-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500">
                  {currency}{pricePerNight} × {nights} night{nights !== 1 ? "s" : ""} × {rooms} room{rooms !== 1 ? "s" : ""}
                </span>
                <span className="text-sm font-medium text-gray-800">
                  {currency}{subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500">Taxes &amp; fees (12%)</span>
                <span className="text-sm font-medium text-gray-800">
                  {currency}{taxes.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="flex items-center gap-1.5 text-sm text-green-600">
                  <BadgeCheck size={13} /> Free cancellation
                </span>
                <span className="text-sm font-medium text-green-600">✓</span>
              </div>

              <div className="h-px bg-gray-200 my-3" />

              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-gray-800">Total</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {currency}{total.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">incl. all taxes</div>
                </div>
              </div>
            </div>

            {/* Guarantees */}
            <div className="px-6 pb-5 flex flex-col gap-2">
              {[
                "Free cancellation until Jun 10",
                "Best price guarantee",
                "Instant confirmation",
              ].map((text) => (
                <div key={text} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-50 border border-green-200 flex items-center justify-center shrink-0">
                    <Check size={9} className="text-green-600" strokeWidth={2.5} />
                  </div>
                  <span className="text-xs text-gray-500">{text}</span>
                </div>
              ))}
            </div>

            {/* Need help */}
            <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50 text-center">
              <p className="text-xs text-gray-400">
                Need help?{" "}
                <span className="text-blue-600 underline cursor-pointer font-medium">Chat with concierge</span>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HotelBooking;