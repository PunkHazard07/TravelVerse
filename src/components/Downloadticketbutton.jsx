import { Download } from "lucide-react";

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(dateStr) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function buildFlightTicket(booking) {
  const itineraries = booking.flightData?.itineraries || [];
  const currency = booking.flightData?.price?.currency || "USD";
  const price = `${currency} ${Number(booking.totalPrice).toLocaleString()}`;

  const divider = "=".repeat(50);
  const thin = "-".repeat(50);

  const lines = [
    divider,
    "           ✈  FLIGHT TICKET",
    divider,
    "",
    `  Booking Ref   : ${booking.bookingReference}`,
    `  Status        : ${booking.status?.toUpperCase()}`,
    `  Payment Ref   : ${booking.paymentReference || "N/A"}`,
    `  Total Paid    : ${price}`,
    `  Booked On     : ${formatDate(booking.createdAt)}`,
    "",
  ];

  itineraries.forEach((itin, idx) => {
    const segments = itin.segments || [];
    const first = segments[0] || {};
    const last = segments[segments.length - 1] || {};
    const stops = segments.length === 1 ? "Direct" : `${segments.length - 1} stop(s)`;
    const label = itineraries.length > 1
      ? idx === 0 ? "OUTBOUND FLIGHT" : "RETURN FLIGHT"
      : "FLIGHT DETAILS";

    lines.push(thin);
    lines.push(`  ${label}`);
    lines.push(thin);
    lines.push(`  Route         : ${first.departure?.iataCode || ""} → ${last.arrival?.iataCode || ""}`);
    lines.push(`  Carrier       : ${first.carrierCode || ""}${first.number ? " · " + first.carrierCode + first.number : ""}`);
    lines.push(`  Departure     : ${formatDate(first.departure?.at)} at ${formatTime(first.departure?.at)}`);
    lines.push(`  Arrival       : ${formatDate(last.arrival?.at)} at ${formatTime(last.arrival?.at)}`);
    lines.push(`  Duration      : ${itin.duration || "N/A"}`);
    lines.push(`  Stops         : ${stops}`);
    lines.push("");
  });

  const passengers = booking.flightData?.passengers || [];
  if (passengers.length > 0) {
    lines.push(thin);
    lines.push("  PASSENGERS");
    lines.push(thin);
    passengers.forEach((p, i) => {
      lines.push(`  ${i + 1}. ${p.firstName || ""} ${p.lastName || ""}`.trimEnd());
    });
    lines.push("");
  }

  lines.push(divider);
  lines.push("  Thank you for booking with us. Have a great flight!");
  lines.push(divider);

  return lines.join("\n");
}

function buildHotelTicket(booking) {
  const hotel = booking.hotelData || {};
  const currency = "USD";
  const price = `${currency} ${Number(booking.totalPrice).toLocaleString()}`;

  const checkIn = booking.checkInDate || booking.checkIn;
  const checkOut = booking.checkOutDate || booking.checkOut;

  const nights = (() => {
    if (!checkIn || !checkOut) return 1;
    const diff = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
    return diff > 0 ? Math.round(diff) : 1;
  })();

  const divider = "=".repeat(50);
  const thin = "-".repeat(50);

  const lines = [
    divider,
    "        🏨  HOTEL RESERVATION TICKET",
    divider,
    "",
    `  Booking Ref   : ${booking.bookingReference}`,
    `  Status        : ${booking.status?.toUpperCase()}`,
    `  Payment Ref   : ${booking.paymentReference || "N/A"}`,
    `  Total Paid    : ${price}`,
    `  Booked On     : ${formatDate(booking.createdAt)}`,
    "",
    thin,
    "  HOTEL DETAILS",
    thin,
    `  Hotel         : ${hotel.hotelName || "N/A"}`,
    `  Location      : ${[hotel.address, hotel.city, hotel.country].filter(Boolean).join(", ") || "N/A"}`,
    "",
    thin,
    "  STAY DETAILS",
    thin,
    `  Check-in      : ${formatDate(checkIn)} (from 3:00 PM)`,
    `  Check-out     : ${formatDate(checkOut)} (until 12:00 PM)`,
    `  Duration      : ${nights} night${nights !== 1 ? "s" : ""}`,
    `  Guests        : ${hotel.guests || 1}`,
    "",
    divider,
    "  Thank you for booking with us. Enjoy your stay!",
    divider,
  ];

  return lines.join("\n");
}

/**
 * DownloadTicketButton
 *
 * Props:
 *   booking  — the full booking object from your API
 *   className — optional extra Tailwind classes to override styling
 *   label     — optional button label (defaults to "Download")
 *   size      — icon size passed to lucide Download (default 12)
 */
export default function DownloadTicketButton({
  booking,
  className = "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer",
  label = "Download",
  size = 12,
}) {
  function handleDownload() {
    if (!booking) return;

    const isHotel = booking.bookingType === "hotel";
    const content = isHotel ? buildHotelTicket(booking) : buildFlightTicket(booking);
    const filename = `ticket-${booking.bookingReference}.txt`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button onClick={handleDownload} className={className}>
      <Download size={size} />
      {label}
    </button>
  );
}