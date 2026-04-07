import { Plane, Luggage, Clock } from "lucide-react";

const formatTime = (dateStr) => {
  if (!dateStr) return "--:--";
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
};

const formatDate = (dateStr) => {
  if (!dateStr) return "---";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });
};

const FlightSummaryCard = ({ flight, label, icon }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </span>
    </div>
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
        <Plane className="w-4 h-4 text-blue-600" />
      </div>
      <div>
        <p className="font-semibold text-gray-900 text-sm">{flight.airlineName}</p>
        <p className="text-xs text-gray-500">{flight.flightNumber} · Economy</p>
      </div>
    </div>
    <div className="grid grid-cols-3 items-center gap-3">
      <div>
        <p className="text-2xl font-bold text-gray-900">{formatTime(flight.departureTime)}</p>
        <p className="text-sm font-medium text-gray-600 mt-0.5">{flight.departureAirport}</p>
        <p className="text-xs text-gray-400">{formatDate(flight.departureTime)}</p>
      </div>
      <div className="text-center">
        <p className="text-xs text-gray-400 mb-1">{flight.duration}</p>
        <div className="flex items-center gap-1">
          <div className="h-px bg-gray-300 flex-1" />
          <Plane className="w-3 h-3 text-gray-400 rotate-90" />
          <div className="h-px bg-gray-300 flex-1" />
        </div>
        <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full mt-1 inline-block">
          {flight.stops}
        </span>
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold text-gray-900">{formatTime(flight.arrivalTime)}</p>
        <p className="text-sm font-medium text-gray-600 mt-0.5">{flight.arrivalAirport}</p>
        <p className="text-xs text-gray-400">{formatDate(flight.arrivalTime)}</p>
      </div>
    </div>
    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Luggage className="w-3.5 h-3.5" /> 23kg baggage
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> On-time 87%
        </span>
      </div>
      <p className="text-blue-600 font-bold text-sm">
        {flight.currency} {flight.price.toFixed(2)}
      </p>
    </div>
  </div>
);

export default FlightSummaryCard;