import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_BASE_URL;

// Maps each seat element from Duffel's flat seat map into a usable seat object
const parseDuffelSeatMap = (seatMaps) => {
  if (!seatMaps || seatMaps.length === 0) return null;
  const firstMap = seatMaps[0];
  const cabin = firstMap.cabins?.[0];
  if (!cabin) return null;
  return { cabin, segmentId: firstMap.segment_id };
};

const SeatSelector = ({ offerId, passengers = [], onSeatsChange }) => {
  console.log("seatSelector received offerId:", offerId )
  const [seatMaps, setSeatMaps] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedSeats, setSelectedSeats] = useState({});

  useEffect(() => {
    if (!offerId) {
      console.warn("SeatSelector: offerId is empty/undefined. Waiting for valid ID.");
      return;
    }
    setLoading(true);
    setError("");
    fetch(`${API_BASE}/seat-map/${offerId}`)
    .then((r) => r.json())
    .then((json) => {
      if (json.success) {
        if (json.data && json.data.length > 0) {
          setSeatMaps(json.data);
        } else {
          setSeatMaps([]);
          setError("Seat map not available for this flight.");
        }
      } else {
        setError(json.error?.message || "Seat map unavailable for this flight.");
      }
    })
    .catch(() => setError("Could not load seat map."))
    .finally(() => setLoading(false));
}, [offerId]);

  // Notify parent whenever selection changes
  useEffect(() => {
    const services = Object.values(selectedSeats).map((s) => ({
      id: s.serviceId,
      quantity: 1,
      designator: s.designator,
      passengerId: s.passengerId,
      totalAmount: parseFloat(s.totalAmount || "0"),
      totalCurrency: s.totalCurrency,
    }));
    onSeatsChange?.(services);
  }, [selectedSeats]);

  const handleSeatClick = (element, passengerId) => {
    const service = element.available_services?.find(
      (s) => s.passenger_id === passengerId
    );
    if (!service) return; 

    setSelectedSeats((prev) => {
      const alreadySelected =
        prev[passengerId]?.designator === element.designator;
      if (alreadySelected) {
        const next = { ...prev };
        delete next[passengerId];
        return next;
      }
      return {
        ...prev,
        [passengerId]: {
          serviceId: service.id,
          designator: element.designator,
          passengerId,
          totalAmount: service.total_amount,
          totalCurrency: service.total_currency,
        },
      };
    });
  };

  if (!offerId) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-gray-500">
        Loading seat map…
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 text-sm text-amber-600 bg-amber-50 rounded-lg px-4">
        {error} Seat selection is optional — you can continue without selecting a seat.
      </div>
    );
  }

  if (!seatMaps || seatMaps.length === 0) {
    return (
      <div className="py-4 text-sm text-gray-500">
        Seat selection is not available for this flight.
      </div>
    );
  }

  const parsed = parseDuffelSeatMap(seatMaps);
  if (!parsed) return null;

  const { cabin } = parsed;

  return (
    <div className="space-y-6">
      <p className="text-xs text-gray-500">
        Cabin: <span className="font-medium capitalize">{cabin.cabin_class?.replace("_", " ")}</span>
        {" · "}Select a seat for each passenger. Unavailable seats are greyed out.
      </p>

      {/* Render one seat map per passenger */}
      {passengers.map((passenger, pIdx) => {
        const passengerId = passenger.id; 
        const selectedForPassenger = selectedSeats[passengerId];

        return (
          <div key={passengerId || pIdx} className="border border-gray-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Passenger {pIdx + 1}: {passenger.firstName || passenger.given_name}{" "}
              {passenger.lastName || passenger.family_name}
              {selectedForPassenger && (
                <span className="ml-2 text-blue-600 font-normal">
                  → Seat {selectedForPassenger.designator}
                  {parseFloat(selectedForPassenger.totalAmount) > 0
                    ? ` (+${selectedForPassenger.totalCurrency} ${selectedForPassenger.totalAmount})`
                    : " (free)"}
                </span>
              )}
            </p>

            {/* Seat grid */}
            <div className="overflow-x-auto">
              {cabin.rows?.map((row, rowIdx) => (
                <div key={rowIdx} className="flex gap-1 mb-1 items-center">
                  {row.sections?.map((section, sIdx) => (
                    <div key={sIdx} className="flex gap-1">
                      {section.elements?.map((el, eIdx) => {
                        if (el.type !== "seat") {
                          return (
                            <div
                              key={eIdx}
                              className="w-8 h-8 flex items-center justify-center text-xs text-gray-400"
                            >
                              {el.type === "exit_row" ? "⬌" : ""}
                            </div>
                          );
                        }
                        const svcForPassenger = el.available_services?.find(
                          (s) => s.passenger_id === passengerId
                        );
                        const isAvailable = !!svcForPassenger;
                        const isSelected =
                          selectedSeats[passengerId]?.designator === el.designator;
                        const isPaid =
                          isAvailable &&
                          parseFloat(svcForPassenger.total_amount) > 0;

                        return (
                          <button
                            key={eIdx}
                            disabled={!isAvailable}
                            onClick={() => handleSeatClick(el, passengerId)}
                            title={`${el.designator}${isPaid ? ` — ${svcForPassenger.total_currency} ${svcForPassenger.total_amount}` : isAvailable ? " — free" : " — unavailable"}`}
                            className={`w-8 h-8 rounded text-xs font-mono transition-all border
                              ${isSelected
                                ? "bg-blue-600 border-blue-700 text-white"
                                : isAvailable
                                ? isPaid
                                  ? "bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100"
                                  : "bg-green-50 border-green-300 text-green-800 hover:bg-green-100"
                                : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                              }`}
                          >
                            {el.designator}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-green-50 border border-green-300 inline-block"/>Free
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-amber-50 border border-amber-300 inline-block"/>Paid
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-blue-600 inline-block"/>Selected
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-200 inline-block"/>Unavailable
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SeatSelector;