import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import DownloadTicketButton from "../components/Downloadticketbutton";

const API_BASE = import.meta.env.VITE_BASE_URL;
const LITE_API_KEY = import.meta.env.VITE_LITE_KEY;

const TABS = ["All", "Confirmed", "Cancelled"];

const statusConfig = {
  pending:   { label: "Pending",   className: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Confirmed", className: "bg-blue-100 text-blue-700"  },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-600"    },
  failed:    { label: "Failed",    className: "bg-red-100 text-red-600"    },
};

function getAuthToken() {
  return localStorage.getItem("token");
}

async function fetchHotelImage(hotelId) {
  try {
    const res = await fetch(
      `https://api.liteapi.travel/v3.0/data/hotel?hotelId=${hotelId}`,
      { headers: { "X-API-Key": LITE_API_KEY, Accept: "application/json" } }
    );
    const json = await res.json();
    return json?.data?.images?.[0]?.url || null;
  } catch {
    return null;
  }
}

function carrierLogoUrl(carrierCode) {
  return carrierCode
    ? `https://pics.avs.io/200/80/${carrierCode}.png`
    : null;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function FlightIcon({ carrierCode }) {
  const [imgFailed, setImgFailed] = useState(false);
  const logoUrl = carrierLogoUrl(carrierCode);

  return (
    <div className="w-52px h-52px rounded-xl bg-blue-50 flex items-center justify-center shrink-0 overflow-hidden">
      {logoUrl && !imgFailed ? (
        <img
          src={logoUrl}
          alt={carrierCode}
          className="w-9 h-9 object-contain"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span className="text-base font-semibold text-blue-400">
          {carrierCode || "✈"}
        </span>
      )}
    </div>
  );
}

function HotelIcon({ hotelId }) {
  const [imgUrl, setImgUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hotelId || !LITE_API_KEY) {
      setLoading(false);
      return;
    }
    fetchHotelImage(hotelId).then((url) => {
      setImgUrl(url);
      setLoading(false);
    });
  }, [hotelId]);

  return (
    <div className="w-52px h-52px rounded-xl bg-blue-50 flex items-center justify-center shrink-0 overflow-hidden">
      {loading ? (
        <span className="text-xl animate-pulse">🏨</span>
      ) : imgUrl ? (
        <img src={imgUrl} alt="hotel" className="w-full h-full object-cover" />
      ) : (
        <span className="text-xl">🏨</span>
      )}
    </div>
  );
}

function BookingCard({ booking, onCancelClick }) {
  const isHotel = booking.bookingType === "hotel";
  const sc = statusConfig[booking.status] || statusConfig.confirmed;
  const canCancel = booking.status === "confirmed" || booking.status === "pending";

  const segments = booking.flightData?.itineraries?.[0]?.segments || [];
  const firstSeg = segments[0] || {};
  const lastSeg = segments[segments.length - 1] || {};
  const carrierCode = firstSeg?.carrierCode || "";

  const flightTitle = segments.length
    ? `${firstSeg.departure?.iataCode || ""} → ${lastSeg.arrival?.iataCode || ""}`
    : "Flight";

  const flightSub = segments.length
    ? `${carrierCode}${firstSeg.number ? " · " + carrierCode + firstSeg.number : ""} · ${
        segments.length === 1 ? "Non-stop" : `${segments.length - 1} stop${segments.length > 2 ? "s" : ""}`
      }`
    : "";

  const currency = booking.flightData?.price?.currency || "USD";
  const price = `${currency} ${Number(booking.totalPrice).toLocaleString()}`;

  let detail1 = "";
  let detail2 = "";

  if (isHotel) {
    detail1 = booking.checkInDate ? `Check-in: ${formatDate(booking.checkInDate)}` : "";
    detail2 = booking.checkOutDate ? `Check-out: ${formatDate(booking.checkOutDate)}` : "";
  } else {
    detail1 = firstSeg.departure?.at ? formatDate(firstSeg.departure.at) : "";
    detail2 = booking.flightData?.itineraries?.[0]?.duration || "";
  }

  return (
    <div
      className={`bg-white border border-blue-100 rounded-2xl p-4 grid grid-cols-[52px_1fr_auto] gap-3 items-start hover:shadow-md transition-shadow duration-200 ${
        booking.status === "cancelled" ? "opacity-60" : ""
      }`}
    >
      {isHotel ? (
        <HotelIcon hotelId={booking.hotelData?.hotelId} />
      ) : (
        <FlightIcon carrierCode={carrierCode} />
      )}

      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
          {booking.bookingType}
        </p>
        <p className="text-[15px] font-semibold text-blue-950 mb-0.5">
          {isHotel ? booking.hotelData?.hotelName || "Hotel" : flightTitle}
        </p>
        <p className="text-sm text-gray-400 mb-3">
          {isHotel
            ? [booking.hotelData?.city, booking.hotelData?.country]
                .filter(Boolean)
                .join(", ")
            : flightSub}
        </p>
        <div className="flex flex-wrap gap-2">
          {detail1 && (
            <span className="text-xs text-gray-500 bg-blue-50 px-3 py-1 rounded-md">
              {detail1}
            </span>
          )}
          {detail2 && (
            <span className="text-xs text-gray-500 bg-blue-50 px-3 py-1 rounded-md">
              {detail2}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 min-w-110px">
        <span className={`text-[11px] font-semibold px-3 py-1 rounded-full ${sc.className}`}>
          {sc.label}
        </span>
        <div className="text-right">
          <p className="text-base font-bold text-blue-950">{price}</p>
          <p className="text-[11px] text-gray-400">{booking.bookingReference}</p>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <DownloadTicketButton booking={booking} />
          {canCancel && (
            <button
              onClick={() => onCancelClick(booking._id)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
            >
              <X size={12} /> Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CancelModal({ onConfirm, onClose, loading }) {
  return (
    <div
      className="fixed inset-0 bg-blue-950/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-8 max-w-sm w-[90%] border border-blue-100 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-blue-950 mb-2">Cancel Booking</h3>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Are you sure you want to cancel this booking? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="text-sm font-medium px-4 py-2 rounded-lg border border-blue-100 text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Keep Booking
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="text-sm font-semibold px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {loading && (
              <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {loading ? "Cancelling..." : "Yes, Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to fetch bookings");
      setBookings(json.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const filtered = bookings.filter((b) => {
    if (activeTab === "All") return true;
    return b.status === activeTab.toLowerCase();
  });

  const upcomingCount = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "pending"
  ).length;

  async function handleConfirmCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const res = await fetch(`${API_BASE}/bookings/${cancelTarget}/cancel`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: "User requested cancellation" }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to cancel booking");

      setBookings((prev) =>
        prev.map((b) => (b._id === cancelTarget ? { ...b, status: "cancelled" } : b))
      );
      setCancelTarget(null);
    } catch (err) {
      alert(`Cancellation failed: ${err.message}`);
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="min-h-screen bg-blue-50 px-6 py-10">
      <div className="max-w-3xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-950 tracking-tight">My Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track all your reservations</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { label: "Total Bookings", value: bookings.length },
            { label: "Upcoming", value: upcomingCount },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-blue-100 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-black mb-1">
                {stat.label}
              </p>
              <p className="text-3xl font-bold text-black">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-1 border-b border-blue-100 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm border-b-2 -mb-px transition-colors duration-150 cursor-pointer bg-transparent ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600 font-semibold"
                  : "border-transparent text-gray-400 font-normal hover:text-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {loading && (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-blue-100 rounded-2xl p-4 h-28 animate-pulse" />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-12">
              <p className="text-red-500 text-sm mb-3">{error}</p>
              <button
                onClick={loadBookings}
                className="text-sm text-blue-600 underline cursor-pointer bg-transparent border-none"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-12">
              No bookings in this category.
            </p>
          )}

          {!loading &&
            !error &&
            filtered.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onCancelClick={(id) => setCancelTarget(id)}
              />
            ))}
        </div>
      </div>

      {cancelTarget && (
        <CancelModal
          onConfirm={handleConfirmCancel}
          onClose={() => !cancelling && setCancelTarget(null)}
          loading={cancelling}
        />
      )}
    </div>
  );
}