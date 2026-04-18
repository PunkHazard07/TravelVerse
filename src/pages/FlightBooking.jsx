import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plane,
  ChevronDown,
  ChevronUp,
  User,
  Mail,
  Phone,
  Calendar,
  Lock,
  Info,
  Luggage,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import BookingSteps from "../components/BookingSteps";
import FlightSummaryCard from "../components/FlightSummaryCard";
import SeatSelector from "../components/SeatSelector";

const API_BASE = import.meta.env.VITE_BASE_URL;

const Section = ({ id, openSections, toggle, title, icon, children }) => {
    const isOpen = openSections.has(id);
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggle(id)}
          className="w-full flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
              {icon}
            </div>
            <span className="font-semibold text-gray-900">{title}</span>
          </div>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {isOpen && (
          <div className="px-6 pb-6 border-t border-gray-100">{children}</div>
        )}
      </div>
    );
  };

  const InputField = ({ label, type = "text", placeholder, icon, value, onChange }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full border border-gray-200 rounded-lg py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            icon ? "pl-10 pr-4" : "px-4"
          }`}
        />
      </div>
    </div>
  );

  const FlightBooking = () => {
  const navigate = useNavigate();
  const [openSections, setOpenSections] = useState(new Set(["passengers", "contact", "extras"]));
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passengers, setPassengers] = useState([
    { firstName: "", lastName: "", gender: "", dob: "" },
  ]);
  const [contact, setContact] = useState({ email: "", phone: "" });
  const [extras, setExtras] = useState({
    extraBaggage: false
  });
  const [selectedSeatServices, setSelectedSeatServices] = useState([]);

  const extraCosts = { extraBaggage: 45 };

  useEffect(() => {
  const stored = sessionStorage.getItem("flightBookingData");
  if (!stored) { navigate("/flight"); return; }
  try {
    const parsed = JSON.parse(stored);
    console.log("outbound rawOffer:", parsed.outbound?.rawOffer);      // check this
    console.log("offerId:", parsed.outbound?.rawOffer?.offerId);       // is it defined?
    setBookingData(parsed);
  } catch {
    navigate("/flight");
  }
}, [navigate]);

  const toggle = (id) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addPassenger = () =>
    setPassengers((prev) => [
      ...prev,
      { firstName: "", lastName: "", gender: "", dob: "" },
    ]);

  const removePassenger = (idx) =>
    setPassengers((prev) => prev.filter((_, i) => i !== idx));

  const updatePassenger = (idx, field, value) =>
    setPassengers((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p))
    );

  const validate = () => {
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.firstName.trim() || !p.lastName.trim())
        return `Passenger ${i + 1}: First and last name are required`;
      if (!p.dob)
        return `Passenger ${i + 1}: Date of birth is required`;
    }
    if (!contact.email.trim()) return "Email address is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email))
      return "Enter a valid email address";
    if (!contact.phone.trim()) return "Phone number is required";
    return null;
  };

  const redirectToLogin = () => {
    sessionStorage.setItem("returnTo", "/flight-booking");
    navigate("/login");
  };

  const handleConfirmAndPay = async () => {
    
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) { redirectToLogin();  return; }

    //validate form
    const validateError = validate();
    if (validateError) {
      setError(validateError);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setError("");
    setLoading(true);

    try {
      const { outbound, returnFlight } = bookingData;
      const raw = outbound.rawOffer;

      const returnItineraries = returnFlight?.rawOffer?.itineraries ?? [];
      const combinedItineraries = [...raw.itineraries, ...returnItineraries];

      const flightOffer = {
        offerId: raw.offerId,
        source: raw.source ?? "duffel",
        validatingAirlineCodes: raw.validatingAirlineCodes ?? [],
        itineraries: combinedItineraries,
        price: {
          currency: raw.price.currency,
          total: bookingData.totalPrice.toString(),
          base: (raw.price.base ?? bookingData.totalPrice).toString(),
        },
        numberOfBookableSeats: raw.numberOfBookableSeats ?? null,
      };

      const extrasTotal = Object.entries(extras)
        .filter(([, on]) => on)
        .reduce((sum, [key]) => sum + extraCosts[key], 0);

      const grandTotal = bookingData.totalPrice + extrasTotal;

      const bookingRes = await fetch(`${API_BASE}/flight`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          flightOffer,
          passengers: passengers.map((p) => ({
            firstName: p.firstName,
            lastName: p.lastName,
            gender: p.gender,
            dateOfBirth: p.dob,
          })),
            selectedServices: selectedSeatServices.map((s) => ({
              id: s.id,
              quantity: 1,
          })),
          totalPrice: grandTotal,
        }),
      });

      if (bookingRes.status === 401) {
        redirectToLogin();
        return;
      }

      const bookingJson = await bookingRes.json();
      if (!bookingRes.ok || !bookingJson.success) {
        throw new Error(bookingJson.message || "Booking failed. Please try again.");
      }

      const bookingId = bookingJson.data._id;

      const payRes = await fetch(`${API_BASE}/initialize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId, email: contact.email }),
      });

      if (payRes.status === 401) {
        redirectToLogin();
        return;
      }

      const payJson = await payRes.json();

      if (!payRes.ok || !payJson.success) {
        throw new Error(payJson.message || "Failed to initialize payment");
      }

      window.location.href = payJson.data.authorizationUrl;
    } catch (error) {
      console.error(error);
      setError(error.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  const { outbound, returnFlight, currency, totalPrice } = bookingData;

  const extrasTotal = Object.entries(extras)
    .filter(([, on]) => on)
    .reduce((sum, [key]) => sum + extraCosts[key], 0);
  
  const seatServicesTotal = selectedSeatServices.reduce(
    (sum, s) => sum + (s.totalAmount || 0), 0 
  );

  const grandTotal = totalPrice + extrasTotal + seatServicesTotal;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Plane className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Complete Your Booking</span>
          </div>
          <BookingSteps currentStep={2} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-4">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT: Forms */}
          <div className="lg:col-span-2 space-y-4">
            <Section
              id="passengers"
              openSections={openSections}
              toggle={toggle}
              title="Passenger Details"
              icon={<User className="w-4 h-4 text-blue-600" />}
            >
              <div className="pt-5 space-y-6">
                {passengers.map((p, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{idx + 1}</span>
                        </div>
                        <h4 className="font-semibold text-gray-700 text-sm">
                          Passenger {idx + 1} · Adult
                        </h4>
                      </div>
                      {idx > 0 && (
                        <button
                          onClick={() => removePassenger(idx)}
                          className="text-red-500 hover:text-red-600 flex items-center gap-1 text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InputField
                        label="First Name"
                        placeholder="e.g. John"
                        value={p.firstName}
                        onChange={(v) => updatePassenger(idx, "firstName", v)}
                      />
                      <InputField
                        label="Last Name"
                        placeholder="e.g. Doe"
                        value={p.lastName}
                        onChange={(v) => updatePassenger(idx, "lastName", v)}
                      />
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                          Gender
                        </label>
                        <select
                          value={p.gender}
                          onChange={(e) => updatePassenger(idx, "gender", e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="">Select gender</option>
                          <option>Male</option>
                          <option>Female</option>
                          <option>Prefer not to say</option>
                        </select>
                      </div>
                      <InputField
                        label="Date of Birth"
                        type="date"
                        icon={<Calendar className="w-4 h-4" />}
                        value={p.dob}
                        onChange={(v) => updatePassenger(idx, "dob", v)}
                      />
                    </div>
                    {idx < passengers.length - 1 && (
                      <div className="mt-6 border-t border-gray-100" />
                    )}
                  </div>
                ))}

                <button
                  onClick={addPassenger}
                  className="w-full border-2 border-dashed border-gray-200 rounded-lg py-3 text-sm text-blue-600 font-medium hover:border-blue-300 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Another Passenger
                </button>
              </div>
            </Section>

            <Section
              id="contact"
              openSections={openSections}
              toggle={toggle}
              title="Contact Information"
              icon={<Mail className="w-4 h-4 text-blue-600" />}
            >
              <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  icon={<Mail className="w-4 h-4" />}
                  value={contact.email}
                  onChange={(v) => setContact((c) => ({ ...c, email: v }))}
                />
                <InputField
                  label="Phone Number"
                  type="tel"
                  placeholder="+234 800 000 0000"
                  icon={<Phone className="w-4 h-4" />}
                  value={contact.phone}
                  onChange={(v) => setContact((c) => ({ ...c, phone: v }))}
                />
                <div className="sm:col-span-2">
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                    <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-blue-700">
                      Booking confirmation and e-tickets will be sent to this email address.
                    </p>
                  </div>
                </div>
              </div>
            </Section>

  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <h3 className="font-semibold text-gray-900 mb-4">Seat Selection</h3>
        <SeatSelector
            offerId={outbound?.offerId || outbound?.rawOffer?.offerId}
            passengers={passengers.map((p, i) => ({
            ...p,
            id: outbound?.rawOffer?.passengers?.[i]?.id,
        }))}
        onSeatsChange={setSelectedSeatServices}
      />
  </div>

            <Section
              id="extras"
              openSections={openSections}
              toggle={toggle}
              title="Add-ons"
              icon={<Luggage className="w-4 h-4 text-blue-600" />}
            >
              <div className="pt-5 space-y-3">
                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={extras.extraBaggage}
                      onChange={(e) =>
                        setExtras((prev) => ({
                          ...prev,
                          extraBaggage: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Extra Baggage (23 kg)
                      </p>
                      <p className="text-xs text-gray-500">Add an additional checked bag</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">
                    + {currency} {extraCosts.extraBaggage.toFixed(2)}
                  </span>
                </label>
              </div>
            </Section>
          </div>

          {/* RIGHT: Summary */}
          <div className="space-y-4">
            <FlightSummaryCard
              flight={outbound}
              label="Outbound Flight"
              icon={<Plane className="w-4 h-4 text-blue-600" />}
            />
            {returnFlight && (
              <FlightSummaryCard
                flight={returnFlight}
                label="Return Flight"
                icon={<Plane className="w-4 h-4 text-blue-600 rotate-180" />}
              />
            )}

            {/* Price Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Price Summary</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Outbound ({passengers.length}{" "} {passengers.length === 1 ? "passenger": "passengers"})</span>
                  <span>{currency} {outbound.price.toFixed(2)}</span>
                </div>
                {returnFlight && (
                  <div className="flex justify-between text-gray-600">
                    <span>Return ({passengers.length} {passengers.length === 1 ? "passenger" : "passengers"})</span>
                    <span>{currency} {returnFlight.price.toFixed(2)}</span>
                  </div>
                )}
                {selectedSeatServices.length > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Seat selection ({selectedSeatServices.length} seat{selectedSeatServices.length > 1 ? "s" : ""})</span>
                    <span>{currency} {seatServicesTotal.toFixed(2)}</span>
                  </div>
                )}
                {extras.extraBaggage && (
                  <div className="flex justify-between text-gray-600">
                    <span>Extra Baggage</span>
                    <span>
                      {currency} {extraCosts.extraBaggage.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="h-px bg-gray-100 my-2" />
                <div className="flex justify-between font-bold text-gray-900 text-base">
                  <span>Total</span>
                  <span className="text-blue-600">
                    {currency} {grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleConfirmAndPay}
                disabled={loading}
                className="mt-5 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md shadow-blue-100"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Confirm & Pay {currency} {grandTotal.toFixed(2)}
                  </>
                )}
              </button>

              <p className="text-xs text-center text-gray-400 mt-3">
                By continuing you agree to our{" "}
                <span className="text-blue-500 cursor-pointer hover:underline">
                  Terms & Conditions
                </span>
              </p>
            </div>

            <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-blue-700 mb-0.5">Need help?</p>
                <p className="text-xs text-blue-600">
                  Call us at <span className="font-semibold">+234 800 123 4567</span> or use live chat.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightBooking;