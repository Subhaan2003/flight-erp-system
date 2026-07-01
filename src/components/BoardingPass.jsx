import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { FaPlaneDeparture, FaDownload, FaPrint } from "react-icons/fa";
import { exportElementToPDF } from "../services/exporter";

export default function BoardingPass({ ticket, flight, passenger, containerId = "boarding-pass" }) {
  if (!ticket || !flight || !passenger) return null;

  const handleDownload = () => {
    exportElementToPDF(containerId, `BoardingPass_${ticket.pnr}`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
      <div id={containerId} className="boarding-pass-card">
        {/* Pass Header */}
        <div className="boarding-pass-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "1.4rem" }}>✈️</span>
            <div>
              <div style={{ fontSize: "0.9rem", fontWeight: 700, letterSpacing: "1px" }}>AEROERP AIRWAYS</div>
              <div style={{ fontSize: "0.65rem", color: "var(--primary)", fontWeight: 600 }}>BOARDING PASS</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.5)" }}>PNR NUMBER</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--primary)" }}>{ticket.pnr}</div>
          </div>
        </div>

        {/* Airport Core Details */}
        <div className="boarding-pass-body">
          <div>
            <div className="airport-big">{flight.origin}</div>
            <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>ORIGIN DEPARTURE</div>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 600 }}>{flight.flightNumber}</div>
            <div style={{ width: "100%", height: "2px", borderTop: "2px dashed rgba(255,255,255,0.2)", margin: "8px 0", position: "relative" }}>
              <FaPlaneDeparture style={{ position: "absolute", top: "-8px", left: "calc(50% - 8px)", color: "var(--primary)" }} />
            </div>
            <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.5)" }}>{flight.duration}</div>
          </div>

          <div>
            <div className="airport-big">{flight.destination}</div>
            <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>DESTINATION ARRIVAL</div>
          </div>
        </div>

        {/* Details Table */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(2, 1fr)", 
          gap: "12px", 
          padding: "16px", 
          backgroundColor: "rgba(255,255,255,0.03)", 
          borderRadius: "8px", 
          border: "1px solid rgba(255,255,255,0.05)",
          marginBottom: "16px",
          fontSize: "0.8rem"
        }}>
          <div>
            <span style={{ color: "rgba(255,255,255,0.4)" }}>PASSENGER NAME</span>
            <div style={{ fontWeight: 600, color: "white", marginTop: "2px" }}>{passenger.name}</div>
          </div>
          <div>
            <span style={{ color: "rgba(255,255,255,0.4)" }}>PASSPORT / CNIC</span>
            <div style={{ fontWeight: 600, color: "white", marginTop: "2px" }}>{passenger.passport || passenger.cnic}</div>
          </div>
          <div>
            <span style={{ color: "rgba(255,255,255,0.4)" }}>CLASS & SEAT</span>
            <div style={{ fontWeight: 600, color: "var(--primary)", marginTop: "2px" }}>{ticket.seatClass} / {ticket.seatNumber}</div>
          </div>
          <div>
            <span style={{ color: "rgba(255,255,255,0.4)" }}>DATE & DEPARTURE TIME</span>
            <div style={{ fontWeight: 600, color: "white", marginTop: "2px" }}>{flight.departureDate} @ {flight.departureTime}</div>
          </div>
        </div>

        {/* Boarding Footer QR */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          borderTop: "1px dashed rgba(255,255,255,0.15)", 
          paddingTop: "16px" 
        }}>
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
              <div>
                <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Gate</span>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "white" }}>{ticket.gate || flight.gate}</div>
              </div>
              <div>
                <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Boarding Time</span>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--status-scheduled)" }}>{ticket.boardingTime}</div>
              </div>
            </div>
            <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", marginTop: "8px" }}>
              * Boarding gates close 20 minutes prior to departure.
            </div>
          </div>

          <div style={{ padding: "6px", backgroundColor: "white", borderRadius: "6px", display: "flex" }}>
            <QRCodeSVG value={ticket.qrCode} size={65} />
          </div>
        </div>
      </div>

      {/* Control Actions */}
      <div style={{ display: "flex", gap: "12px" }}>
        <button 
          onClick={handleDownload}
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px", 
            padding: "8px 16px", 
            borderRadius: "6px", 
            border: "1px solid var(--border-color)", 
            backgroundColor: "var(--bg-card)", 
            color: "var(--text-primary)", 
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer" 
          }}
        >
          <FaDownload /> Download PDF
        </button>
        <button 
          onClick={() => window.print()}
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px", 
            padding: "8px 16px", 
            borderRadius: "6px", 
            border: "none", 
            backgroundColor: "var(--primary)", 
            color: "white", 
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer" 
          }}
        >
          <FaPrint /> Print Pass
        </button>
      </div>
    </div>
  );
}
