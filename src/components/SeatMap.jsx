import React from "react";

export default function SeatMap({ aircraft, selectedSeat, onSeatSelect, bookedSeats = [], blockedSeats = [], maintenanceSeats = [] }) {
  if (!aircraft) return null;

  // Let's generate rows based on aircraft capacity.
  // Standard aircraft: Boeing 777 has large capacity, but for UI display we can limit the rows
  // to a readable number (e.g., 3 rows business, 10 rows economy) to ensure it fits beautifully.
  const businessRows = [1, 2, 3];
  const economyRows = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  
  const columns = ["A", "B", "C", "D", "E", "F"];

  const getSeatStatus = (seatLabel) => {
    if (maintenanceSeats.includes(seatLabel)) return "maintenance";
    if (bookedSeats.includes(seatLabel)) return "booked";
    if (blockedSeats.includes(seatLabel)) return "blocked";
    if (selectedSeat === seatLabel) return "selected";
    return "available";
  };

  const renderRow = (rowNum, isBusiness) => {
    return (
      <div key={rowNum} style={{ display: "flex", gap: "8px", alignItems: "center", justifyContent: "center", marginBottom: "6px" }}>
        <span style={{ width: "24px", textAlign: "right", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", marginRight: "12px" }}>
          {rowNum}
        </span>
        {columns.map(col => {
          // If business class, we can block D and E to simulate wider seats (A, B, C, F)
          if (isBusiness && (col === "D" || col === "E")) {
            return <div key={col} style={{ width: "40px" }} />; // empty space
          }
          
          const label = `${rowNum}${col}`;
          const status = getSeatStatus(label);

          let className = "seat-item available";
          if (status === "booked") className = "seat-item booked";
          if (status === "selected") className = "seat-item selected";
          if (status === "maintenance") className = "seat-item maintenance";
          if (status === "blocked") className = "seat-item reserved";

          return (
            <button
              key={col}
              type="button"
              className={className}
              disabled={status === "booked" || status === "maintenance" || status === "blocked"}
              onClick={() => onSeatSelect(label)}
              title={`Seat ${label} (${status})`}
            >
              {label}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ textAlign: "center", padding: "10px" }}>
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem" }}>
          <span style={{ width: "16px", height: "16px", backgroundColor: "#e2e8f0", border: "1px solid #94a3b8", borderRadius: "3px" }} />
          <span>Available</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem" }}>
          <span style={{ width: "16px", height: "16px", backgroundColor: "var(--primary)", borderRadius: "3px" }} />
          <span>Selected</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem" }}>
          <span style={{ width: "16px", height: "16px", backgroundColor: "#64748b", borderRadius: "3px" }} />
          <span>Booked</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem" }}>
          <span style={{ width: "16px", height: "16px", backgroundColor: "#ef4444", borderRadius: "3px" }} />
          <span>Maintenance</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem" }}>
          <span style={{ width: "16px", height: "16px", backgroundColor: "#f59e0b", borderRadius: "3px" }} />
          <span>Blocked</span>
        </div>
      </div>

      <div style={{ 
        maxWidth: "400px", 
        margin: "0 auto", 
        padding: "24px 16px", 
        backgroundColor: "var(--bg-card)", 
        border: "2px solid var(--border-color)", 
        borderRadius: "40px 40px 16px 16px", // plane nose shape
        boxShadow: "var(--shadow-lg)"
      }}>
        {/* Cockpit Simulation */}
        <div style={{ 
          height: "50px", 
          borderBottom: "2px dashed var(--border-color)", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          color: "var(--text-secondary)", 
          fontWeight: 700, 
          fontSize: "0.8rem",
          textTransform: "uppercase",
          letterSpacing: "2px",
          marginBottom: "24px"
        }}>
          Cockpit 👨‍✈️
        </div>

        {/* Business Cabin */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", marginBottom: "10px", letterSpacing: "1px" }}>
            First & Business Class (Rows 1-3)
          </div>
          {businessRows.map(row => renderRow(row, true))}
        </div>

        <div style={{ height: "12px", borderBlock: "1.5px solid var(--border-color)", margin: "16px 0", backgroundColor: "var(--bg-app)" }} />

        {/* Economy Cabin */}
        <div>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "10px", letterSpacing: "1px" }}>
            Economy Class (Rows 4-13)
          </div>
          {economyRows.map(row => renderRow(row, false))}
        </div>
      </div>
    </div>
  );
}
