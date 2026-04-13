import { useState } from "react";

const AIRCRAFT_CONFIGS = {
  widebody: {
    label: "Wide-body (e.g. Boeing 777 / A380)",
    cabins: {
      first: {
        label: "First Class",
        rowStart: 1,
        rowCount: 3,
        layout: ["A", null, "C", null, null, "G", null, "K"], // null = aisle
        seatLetters: ["A", "C", "G", "K"],
        color: "#c8a96e",
        accentColor: "#f5e6c8",
        icon: "✦",
      },
      business: {
        label: "Business",
        rowStart: 4,
        rowCount: 8,
        layout: ["A", "C", null, "D", "F", null, "G", "K"],
        seatLetters: ["A", "C", "D", "F", "G", "K"],
        color: "#7c9cbf",
        accentColor: "#dce9f5",
        icon: "◈",
      },
      premiumEconomy: {
        label: "Premium Economy",
        rowStart: 12,
        rowCount: 6,
        layout: ["A", "B", null, "D", "E", "F", null, "H", "K"],
        seatLetters: ["A", "B", "D", "E", "F", "H", "K"],
        color: "#82b89a",
        accentColor: "#d8f0e3",
        icon: "◇",
      },
      economy: {
        label: "Economy",
        rowStart: 18,
        rowCount: 32,
        layout: ["A", "B", "C", null, "D", "E", "F", null, "H", "J", "K"],
        seatLetters: ["A", "B", "C", "D", "E", "F", "H", "J", "K"],
        color: "#a09ab5",
        accentColor: "#ede8f7",
        icon: "○",
      },
    },
    exitRows: [18, 30],
  },

  narrowbody: {
    label: "Narrow-body (e.g. Boeing 737 / A320)",
    cabins: {
      business: {
        label: "Business",
        rowStart: 1,
        rowCount: 4,
        layout: ["A", "C", null, "D", "F"],
        seatLetters: ["A", "C", "D", "F"],
        color: "#7c9cbf",
        accentColor: "#dce9f5",
        icon: "◈",
      },
      premiumEconomy: {
        label: "Premium Economy",
        rowStart: 5,
        rowCount: 4,
        layout: ["A", "B", "C", null, "D", "E", "F"],
        seatLetters: ["A", "B", "C", "D", "E", "F"],
        color: "#82b89a",
        accentColor: "#d8f0e3",
        icon: "◇",
      },
      economy: {
        label: "Economy",
        rowStart: 9,
        rowCount: 24,
        layout: ["A", "B", "C", null, "D", "E", "F"],
        seatLetters: ["A", "B", "C", "D", "E", "F"],
        color: "#a09ab5",
        accentColor: "#ede8f7",
        icon: "○",
      },
    },
    exitRows: [9, 20],
  },

  regional: {
    label: "Regional (e.g. Embraer E175)",
    cabins: {
      business: {
        label: "Business",
        rowStart: 1,
        rowCount: 3,
        layout: ["A", "C", null, "D"],
        seatLetters: ["A", "C", "D"],
        color: "#7c9cbf",
        accentColor: "#dce9f5",
        icon: "◈",
      },
      economy: {
        label: "Economy",
        rowStart: 4,
        rowCount: 18,
        layout: ["A", "B", null, "C", "D"],
        seatLetters: ["A", "B", "C", "D"],
        color: "#a09ab5",
        accentColor: "#ede8f7",
        icon: "○",
      },
    },
    exitRows: [4, 14],
  },
};

// ─── Seat Status Mock ─────────────────────────────────────────────────────────
const getSeatStatus = (row, letter, aircraftType) => {
  const seed = (row * 31 + letter.charCodeAt(0) * 7 + aircraftType.length * 13) % 100;
  if (seed < 35) return "occupied";
  if (seed < 42) return "unavailable";
  return "available";
};

// ─── Seat Component ───────────────────────────────────────────────────────────
const Seat = ({ row, letter, cabinConfig, aircraftType, onSelect, passengerCount, selectedSeats }) => {
  const status = getSeatStatus(row, letter, aircraftType);
  const seatId = `${row}${letter}`;
  const isCurrentlySelected = selectedSeats.includes(seatId);
  const isDisabled = status === "occupied" || status === "unavailable";
  const isMaxReached = selectedSeats.length >= passengerCount && !isCurrentlySelected;

  const handleClick = () => {
    if (isDisabled || isMaxReached) return;
    onSelect(seatId);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled || isMaxReached}
      title={isDisabled ? `${seatId} — ${status}` : `${seatId} — ${cabinConfig.label}`}
      style={{
        width: 32,
        height: 36,
        borderRadius: "10px",
        border: isCurrentlySelected
          ? `2px solid ${cabinConfig.color}`
          : "1px solid #d1d5db",
        borderColor: isCurrentlySelected
          ? cabinConfig.color
          : "#d1d5db",
        background: isCurrentlySelected
          ? cabinConfig.accentColor
          : status === "occupied"
          ? "#f8fafc"
          : status === "unavailable"
          ? "#f1f5f9"
          : "#ffffff",
        cursor: isDisabled || isMaxReached ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 10,
        fontFamily: "'DM Mono', monospace",
        color: isCurrentlySelected
          ? "#0f172a"
          : isDisabled
          ? "#94a3b8"
          : "#0f172a",
        position: "relative",
        transition: "all 0.15s ease",
        outline: "none",
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        if (!isDisabled && !isMaxReached && !isCurrentlySelected) {
          e.currentTarget.style.background = "#f8fafc";
          e.currentTarget.style.borderColor = "#94a3b8";
        }
      }}
      onMouseLeave={e => {
        if (!isDisabled && !isMaxReached && !isCurrentlySelected) {
          e.currentTarget.style.background = "#ffffff";
          e.currentTarget.style.borderColor = "#d1d5db";
        }
      }}
    >
      {isCurrentlySelected ? "✓" : status === "occupied" ? "✕" : letter}
      {/* Headrest nub */}
      <span style={{
        position: "absolute",
        top: -4,
        left: "50%",
        transform: "translateX(-50%)",
        width: 10,
        height: 4,
        background: isCurrentlySelected ? cabinConfig.color : "#2a2a38",
        borderRadius: "3px 3px 0 0",
        border: `1px solid ${isCurrentlySelected ? cabinConfig.color : "#3d3d50"}`,
        borderBottom: "none",
      }} />
    </button>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const SeatSelector = () => {
  const [aircraftType, setAircraftType] = useState("narrowbody");
  const [activeCabin, setActiveCabin] = useState("business");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengerCount, setPassengerCount] = useState(1);

  const config = AIRCRAFT_CONFIGS[aircraftType];
  const cabins = config.cabins;

  // Ensure activeCabin is valid for current aircraft
  const validCabin = cabins[activeCabin] ? activeCabin : Object.keys(cabins)[0];
  const cabin = cabins[validCabin];

  const handleSeatSelect = (seatId) => {
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) return prev.filter(s => s !== seatId);
      if (prev.length >= passengerCount) return prev;
      return [...prev, seatId];
    });
  };

  const handleAircraftChange = (type) => {
    setAircraftType(type);
    setSelectedSeats([]);
    const firstCabin = Object.keys(AIRCRAFT_CONFIGS[type].cabins)[0];
    setActiveCabin(firstCabin);
  };

  const handleCabinChange = (key) => {
    setActiveCabin(key);
    setSelectedSeats([]);
  };

  const rows = Array.from({ length: cabin.rowCount }, (_, i) => cabin.rowStart + i);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

      <div className="space-y-2 mb-6">
        <h2 className="text-2xl font-semibold text-slate-900">Choose your seat</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.4fr_0.95fr]">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 mb-2">Aircraft Type</label>
          <select
            value={aircraftType}
            onChange={(e) => handleAircraftChange(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          >
            {Object.entries(AIRCRAFT_CONFIGS).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 mb-2">Passengers</label>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => {
                  setPassengerCount(count);
                  setSelectedSeats([]);
                }}
                className={`h-9 min-w-8.5 rounded-xl border px-3 text-sm font-medium transition ${
                  passengerCount === count
                    ? "border-sky-500 bg-sky-50 text-sky-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 py-4">
        {Object.entries(cabins).map(([key, cab]) => (
          <button
            key={key}
            type="button"
            onClick={() => handleCabinChange(key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              validCabin === key
                ? "border-sky-500 bg-sky-50 text-sky-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
            style={{ borderColor: validCabin === key ? cab.color : undefined }}
          >
            <span className="mr-2 text-xs">{cab.icon}</span>
            {cab.label}
          </button>
        ))}
      </div>

      {/* Main Layout: Seat Map + Summary */}
      <div style={{ width: "100%", maxWidth: 760, display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white p-5">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>{cabin.icon}</span>
              <div>
                <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 18, color: cabin.color }}>
                  {cabin.label}
                </div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#44446a", marginTop: 2 }}>
                  Rows {cabin.rowStart}–{cabin.rowStart + cabin.rowCount - 1}
                </div>
              </div>
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#44446a" }}>
              {selectedSeats.length}/{passengerCount} selected
            </div>
          </div>

          {/* Seat Map Scroll Area */}
          <div style={{ overflowY: "auto", maxHeight: 480, padding: "16px 12px" }}>

            {/* Nose indicator */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <div style={{
                width: 60,
                height: 20,
                borderRadius: "50% 50% 0 0",
                border: "1px solid #2a2a3d",
                borderBottom: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <span style={{ fontSize: 8, color: "#33334d", fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>FWD</span>
              </div>
            </div>

            {/* Column letter headers */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: 8, paddingLeft: 36 }}>
              {cabin.layout.map((letter, i) =>
                letter === null ? (
                  <div key={`aisle-${i}`} style={{ width: 16, flexShrink: 0 }} />
                ) : (
                  <div key={letter} style={{
                    width: 32,
                    textAlign: "center",
                    fontSize: 9,
                    fontFamily: "'DM Mono', monospace",
                    color: "#333355",
                    flexShrink: 0,
                    marginRight: 4,
                  }}>
                    {letter}
                  </div>
                )
              )}
            </div>

            {/* Rows */}
            <div className="seat-map-enter" key={`${aircraftType}-${validCabin}`}>
              {rows.map(row => {
                const isExit = config.exitRows.includes(row);
                return (
                  <div key={row}>
                    {/* Exit row label */}
                    {isExit && (
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        margin: "8px 0",
                        paddingLeft: 36,
                      }}>
                        <div style={{ flex: 1, height: 1, background: "#1e3a2a" }} />
                        <span style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#2a6a3a", letterSpacing: 1 }}>
                          ⬌ EXIT
                        </span>
                        <div style={{ flex: 1, height: 1, background: "#1e3a2a" }} />
                      </div>
                    )}

                    {/* Row */}
                    <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
                      {/* Row number */}
                      <div style={{
                        width: 28,
                        textAlign: "right",
                        paddingRight: 8,
                        fontSize: 10,
                        fontFamily: "'DM Mono', monospace",
                        color: "#2e2e4a",
                        flexShrink: 0,
                      }}>
                        {row}
                      </div>

                      {/* Seats + Aisles */}
                      {cabin.layout.map((letter, i) =>
                        letter === null ? (
                          <div key={`aisle-${i}`} style={{ width: 16, flexShrink: 0 }} />
                        ) : (
                          <div key={letter} style={{ marginRight: 4, flexShrink: 0 }}>
                            <Seat
                              row={row}
                              letter={letter}
                              cabinKey={validCabin}
                              cabinConfig={cabin}
                              aircraftType={aircraftType}
                              selectedSeats={selectedSeats}
                              passengerCount={passengerCount}
                              onSelect={handleSeatSelect}
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tail indicator */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
              <div style={{
                width: 60,
                height: 20,
                borderRadius: "0 0 50% 50%",
                border: "1px solid #2a2a3d",
                borderTop: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <span style={{ fontSize: 8, color: "#33334d", fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>AFT</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full max-w-65 flex flex-col gap-4">

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#44446a", letterSpacing: 2, textTransform: "uppercase", margin: "0 0 12px" }}>
              Legend
            </p>
            {[
              { label: "Selected", color: cabin.color, fill: cabin.accentColor },
              { label: "Available", color: "#94a3b8", fill: "#f8fafc" },
              { label: "Occupied", color: "#64748b", fill: "#f1f5f9" },
              { label: "Unavailable", color: "#cbd5e1", fill: "#f8fafc" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 22,
                  height: 24,
                  borderRadius: "6px",
                  background: item.fill,
                  border: `1px solid ${item.color}`,
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: 12, color: "#475569" }}>{item.label}</span>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, paddingTop: 10, borderTop: "1px solid #e2e8f0" }}>
              <div style={{ flex: 1, height: 1, background: "#1e3a2a" }} />
              <span style={{ fontSize: 10, color: "#2a6a3a", fontFamily: "'DM Mono', monospace" }}>EXIT</span>
              <div style={{ flex: 1, height: 1, background: "#1e3a2a" }} />
            </div>
            <p style={{ fontSize: 11, color: "#444460", margin: "6px 0 0", textAlign: "center" }}>Emergency exit row</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#44446a", letterSpacing: 2, textTransform: "uppercase", margin: "0 0 12px" }}>
              Your Seats
            </p>
            {selectedSeats.length === 0 ? (
              <p style={{ fontSize: 12, color: "#333350", fontStyle: "italic" }}>No seats selected yet</p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {selectedSeats.map(seat => (
                  <div
                    key={seat}
                    style={{
                      background: `${cabin.color}20`,
                      border: `1px solid ${cabin.color}60`,
                      borderRadius: 6,
                      padding: "4px 10px",
                      fontSize: 13,
                      fontFamily: "'DM Mono', monospace",
                      color: cabin.color,
                    }}
                  >
                    {seat}
                  </div>
                ))}
              </div>
            )}

            {selectedSeats.length === passengerCount && (
              <div style={{
                marginTop: 12,
                paddingTop: 12,
                borderTop: "1px solid #1e1e30",
                fontSize: 11,
                color: "#4a9a6a",
                fontFamily: "'DM Mono', monospace",
                textAlign: "center",
              }}>
                ✓ All seats selected
              </div>
            )}

            {selectedSeats.length > 0 && (
              <button
                onClick={() => setSelectedSeats([])}
                style={{
                  marginTop: 12,
                  width: "100%",
                  padding: "8px",
                  background: "transparent",
                  border: "1px solid #2e2e45",
                  borderRadius: 7,
                  color: "#444460",
                  fontSize: 11,
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#cc4444"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#2e2e45"}
              >
                Clear selection
              </button>
            )}
          </div>

          {/* Confirm Button */}
          <button
            disabled={selectedSeats.length < passengerCount}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 10,
              border: "none",
              background: selectedSeats.length >= passengerCount
                ? `linear-gradient(135deg, ${cabin.color}, ${cabin.color}bb)`
                : "#1a1a28",
              color: selectedSeats.length >= passengerCount ? "#0d0d16" : "#333350",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: 14,
              cursor: selectedSeats.length >= passengerCount ? "pointer" : "not-allowed",
              transition: "all 0.2s",
              letterSpacing: 0.3,
            }}
          >
            {selectedSeats.length >= passengerCount ? "Confirm Seats →" : `Select ${passengerCount - selectedSeats.length} more`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatSelector;