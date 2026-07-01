import React, { useState } from "react";
import { useCollection, useDB } from "../contexts/DBContext";
import { useAuth } from "../contexts/AuthContext";
import { sendSystemNotification } from "../services/notifier";
import { QRCodeSVG } from "qrcode.react";
import { FaSearch, FaCheckCircle, FaQrcode, FaSuitcase, FaPassport, FaTicketAlt } from "react-icons/fa";

const TABS = ["Counter Check-in", "Boarding Gate"];

export default function CheckInBoarding() {
  const { currentUser } = useAuth();
  const [tickets] = useCollection("tickets");
  const [passengers] = useCollection("passengers");
  const [flights] = useCollection("flights");
  const [checkins] = useCollection("checkins");
  const [boarding] = useCollection("boarding");
  const { addDoc, updateDoc, logSystemAction } = useDB();

  const [activeTab, setActiveTab] = useState("Counter Check-in");

  // Check-in state
  const [pnrSearch, setPnrSearch] = useState("");
  const [foundTicket, setFoundTicket] = useState(null);
  const [foundPassenger, setFoundPassenger] = useState(null);
  const [foundFlight, setFoundFlight] = useState(null);
  const [baggageWeight, setBaggageWeight] = useState(23);
  const [checkinDone, setCheckinDone] = useState(false);

  // Boarding state
  const [qrInput, setQrInput] = useState("");
  const [boardingResult, setBoardingResult] = useState(null);

  const searchByPNR = () => {
    const ticket = tickets.find(t => t.pnr.toLowerCase() === pnrSearch.toLowerCase() || t.id === pnrSearch);
    if (!ticket) { alert("No ticket found with this PNR."); return; }
    
    if (currentUser.role === "Passenger") {
      const passenger = passengers.find(p => p.id === ticket.passengerId);
      if (!passenger || passenger.email.toLowerCase() !== currentUser.email.toLowerCase()) {
        alert("Access Denied: This ticket does not belong to you.");
        return;
      }
    }

    const passenger = passengers.find(p => p.id === ticket.passengerId);
    const flight = flights.find(f => f.id === ticket.flightId);
    setFoundTicket(ticket);
    setFoundPassenger(passenger);
    setFoundFlight(flight);
    setCheckinDone(false);
  };

  const processCheckin = () => {
    if (!foundTicket) return;
    const existing = checkins.find(c => c.ticketId === foundTicket.id);
    if (existing) { alert("Passenger already checked in!"); return; }
    addDoc("checkins", {
      ticketId: foundTicket.id, bookingId: foundTicket.id, passportVerified: true,
      seatConfirmed: true, baggageTag: `BAG-${Date.now()}`, boardingPassGenerated: true
    });
    addDoc("baggage", {
      bookingId: foundTicket.id, passengerId: foundTicket.passengerId,
      weight: baggageWeight, status: "Checked In",
      extraCharges: baggageWeight > 23 ? (baggageWeight - 23) * 15 : 0
    });
    logSystemAction(currentUser.uid, currentUser.email, "Passenger Check-In", "Check-In", "", `Ticket: ${foundTicket.pnr}`);
    sendSystemNotification({
      title: "Check-In Complete",
      message: `${foundPassenger?.name || "Passenger"} checked in for flight ${foundFlight?.flightNumber}. Gate: ${foundFlight?.gate}.`,
      type: "success"
    });
    setCheckinDone(true);
  };

  const scanQRCode = () => {
    if (!qrInput.trim()) { alert("Enter a QR code or scan barcode."); return; }
    const ticket = tickets.find(t => t.qrCode === qrInput.trim() || t.pnr === qrInput.trim());
    if (!ticket) { setBoardingResult({ status: "NOT FOUND", message: "No valid ticket found for this QR code.", color: "var(--status-cancelled)" }); return; }
    const passenger = passengers.find(p => p.id === ticket.passengerId);
    const flight = flights.find(f => f.id === ticket.flightId);
    const alreadyBoarded = boarding.find(b => b.ticketId === ticket.id && b.status === "Boarded");

    if (alreadyBoarded) {
      setBoardingResult({ status: "ALREADY BOARDED", message: `${passenger?.name} already boarded. Duplicate scan detected.`, color: "var(--status-delayed)", ticket, passenger, flight });
      return;
    }

    if (ticket.status === "Cancelled") {
      setBoardingResult({ status: "CANCELLED TICKET", message: "This ticket has been cancelled and is not valid for boarding.", color: "var(--status-cancelled)", ticket, passenger, flight });
      return;
    }

    // Success - mark boarded
    addDoc("boarding", { ticketId: ticket.id, qrScanned: qrInput, status: "Boarded", boardedTime: new Date().toLocaleTimeString() });
    logSystemAction(currentUser.uid, currentUser.email, "Passenger Boarded", "Boarding", "", `${passenger?.name} - ${ticket.pnr}`);
    sendSystemNotification({
      title: "Passenger Boarded",
      message: `${passenger?.name} boarded flight ${flight?.flightNumber}. Seat ${ticket.seatNumber}.`,
      type: "success"
    });
    setBoardingResult({ status: "BOARDED ✓", message: `Boarding confirmed for ${passenger?.name}. Enjoy your flight!`, color: "var(--status-scheduled)", ticket, passenger, flight });
    setQrInput("");
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-title">
          <h2>Check-in & Boarding</h2>
          <p>Passenger counter check-in verification and gate boarding QR scanner.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", backgroundColor: "var(--bg-input)", padding: "4px", borderRadius: "10px", width: "fit-content" }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setFoundTicket(null); setBoardingResult(null); setQrInput(""); setPnrSearch(""); }}
            style={{ padding: "9px 20px", borderRadius: "7px", border: "none", backgroundColor: activeTab === tab ? "var(--bg-card)" : "transparent", color: activeTab === tab ? "var(--primary)" : "var(--text-secondary)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", boxShadow: activeTab === tab ? "var(--shadow-sm)" : "none" }}>
            {tab}
          </button>
        ))}
      </div>

      {/* COUNTER CHECK-IN */}
      {activeTab === "Counter Check-in" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", flexWrap: "wrap" }}>
          {/* Search Panel */}
          <div className="glass-card">
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <FaSearch style={{ color: "var(--primary)" }} /> PNR Search
            </h3>
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <input type="text" value={pnrSearch} onChange={e => setPnrSearch(e.target.value)} placeholder="Enter PNR or Ticket ID…" className="form-input" style={{ flex: 1 }} onKeyDown={e => e.key === "Enter" && searchByPNR()} />
              <button onClick={searchByPNR} style={{ padding: "0 18px", borderRadius: "6px", border: "none", backgroundColor: "var(--primary)", color: "white", fontWeight: 700, cursor: "pointer" }}>Search</button>
            </div>

            {/* Quick-search seeded tickets */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "8px", fontWeight: 600 }}>QUICK TEST PNRS:</div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {tickets.slice(0, 4).map(t => (
                  <button key={t.id} onClick={() => { setPnrSearch(t.pnr); }} style={{ padding: "5px 10px", borderRadius: "5px", border: "1px solid var(--primary)", backgroundColor: "transparent", color: "var(--primary)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
                    {t.pnr}
                  </button>
                ))}
              </div>
            </div>

            {foundTicket && (
              <div>
                <h4 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "400px", color: "var(--primary)" }}>Ticket Found</h4>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.82rem", backgroundColor: "var(--bg-input)", padding: "14px", borderRadius: "8px", marginBottom: "16px" }}>
                  <div><FaPassport style={{ color: "var(--primary)", marginRight: "6px" }} />Passenger: <strong>{foundPassenger?.name || "Unknown"}</strong></div>
                  <div>Passport: <strong>{foundPassenger?.passport || foundPassenger?.cnic}</strong></div>
                  <div><FaTicketAlt style={{ color: "var(--primary)", marginRight: "6px" }} />PNR: <strong>{foundTicket.pnr}</strong></div>
                  <div>Seat: <strong>{foundTicket.seatNumber} ({foundTicket.seatClass})</strong></div>
                  <div>Flight: <strong>{foundFlight?.flightNumber}</strong></div>
                  <div>Route: <strong>{foundFlight?.origin} → {foundFlight?.destination}</strong></div>
                  <div>Gate: <strong>{foundFlight?.gate}</strong></div>
                  <div>Boarding: <strong>{foundTicket.boardingTime}</strong></div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Baggage Weight (kg)</label>
                  <div style={{ display: "flex", gap: "10px", marginTop: "6px", alignItems: "center" }}>
                    <input type="number" value={baggageWeight} onChange={e => setBaggageWeight(parseFloat(e.target.value))} className="form-input" style={{ width: "100px" }} min={0} max={100} />
                    <span style={{ fontSize: "0.82rem", color: baggageWeight > 23 ? "var(--status-cancelled)" : "var(--status-scheduled)", fontWeight: 600 }}>
                      {baggageWeight > 23 ? `Extra baggage: +$${(baggageWeight - 23) * 15}` : "Within free allowance (23kg)"}
                    </span>
                  </div>
                </div>

                {checkinDone ? (
                  <div style={{ padding: "16px", backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "8px", color: "var(--status-scheduled)", fontWeight: 700, textAlign: "center" }}>
                    ✓ Check-in Complete! Boarding pass generated.
                  </div>
                ) : (
                  <button onClick={processCheckin} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "none", backgroundColor: "var(--primary)", color: "white", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <FaCheckCircle /> Complete Check-in & Print Boarding Pass
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Boarding Pass Preview */}
          <div className="glass-card">
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "20px" }}>Boarding Pass Preview</h3>
            {foundTicket && foundFlight && foundPassenger ? (
              <div style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)", borderRadius: "12px", padding: "20px", color: "white" }}>
                <div style={{ textAlign: "center", borderBottom: "1px dashed rgba(255,255,255,0.15)", paddingBottom: "14px", marginBottom: "14px" }}>
                  <div style={{ fontSize: "0.7rem", letterSpacing: "2px", color: "rgba(255,255,255,0.4)" }}>BOARDING PASS</div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--primary)", marginTop: "4px" }}>AEROERP AIRWAYS</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--primary)" }}>{foundFlight.origin}</div>
                    <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)" }}>DEPARTURE</div>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>✈</div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--primary)" }}>{foundFlight.destination}</div>
                    <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)" }}>ARRIVAL</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.78rem", marginBottom: "14px" }}>
                  <div><span style={{ color: "rgba(255,255,255,0.4)" }}>Passenger</span><div style={{ fontWeight: 600 }}>{foundPassenger.name}</div></div>
                  <div><span style={{ color: "rgba(255,255,255,0.4)" }}>PNR</span><div style={{ fontWeight: 600, color: "var(--primary)" }}>{foundTicket.pnr}</div></div>
                  <div><span style={{ color: "rgba(255,255,255,0.4)" }}>Seat</span><div style={{ fontWeight: 600 }}>{foundTicket.seatNumber} ({foundTicket.seatClass})</div></div>
                  <div><span style={{ color: "rgba(255,255,255,0.4)" }}>Gate</span><div style={{ fontWeight: 600 }}>{foundFlight.gate}</div></div>
                  <div><span style={{ color: "rgba(255,255,255,0.4)" }}>Boarding Time</span><div style={{ fontWeight: 600, color: "var(--status-scheduled)" }}>{foundTicket.boardingTime}</div></div>
                  <div><span style={{ color: "rgba(255,255,255,0.4)" }}>Flight</span><div style={{ fontWeight: 600 }}>{foundFlight.flightNumber}</div></div>
                </div>
                <div style={{ display: "flex", justifyContent: "center", padding: "8px", backgroundColor: "white", borderRadius: "6px", width: "fit-content", margin: "0 auto" }}>
                  <QRCodeSVG value={foundTicket.qrCode} size={80} />
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                <FaTicketAlt style={{ fontSize: "2rem", marginBottom: "12px", display: "block", margin: "0 auto 12px" }} />
                Search and verify a passenger PNR to see their boarding pass preview here.
              </div>
            )}
          </div>
        </div>
      )}

      {/* BOARDING GATE */}
      {activeTab === "Boarding Gate" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Scanner Panel */}
          <div className="glass-card">
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <FaQrcode style={{ color: "var(--primary)" }} /> Boarding Gate Scanner
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
              Scan the passenger's QR code or manually enter the barcode data to verify and approve boarding.
            </p>
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              <input type="text" value={qrInput} onChange={e => setQrInput(e.target.value)} placeholder="Scan QR code or enter PNR…" className="form-input" style={{ flex: 1 }} onKeyDown={e => e.key === "Enter" && scanQRCode()} autoFocus />
              <button onClick={scanQRCode} style={{ padding: "0 18px", borderRadius: "6px", border: "none", backgroundColor: "var(--primary)", color: "white", fontWeight: 700, cursor: "pointer" }}>Scan</button>
            </div>
            <div style={{ marginBottom: "14px" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "8px", fontWeight: 600 }}>TEST QR CODES (click to load):</div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {tickets.slice(0, 4).map(t => (
                  <button key={t.id} onClick={() => setQrInput(t.qrCode)} style={{ padding: "5px 10px", borderRadius: "5px", border: "1px solid var(--primary)", backgroundColor: "transparent", color: "var(--primary)", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.pnr}
                  </button>
                ))}
              </div>
            </div>

            {/* Boarding Status Results */}
            {boardingResult && (
              <div style={{ padding: "20px", borderRadius: "10px", border: `2px solid ${boardingResult.color}`, backgroundColor: `${boardingResult.color}18`, textAlign: "center" }}>
                <div style={{ fontSize: "2rem", marginBottom: "8px" }}>
                  {boardingResult.status.includes("BOARDED") ? "✅" : boardingResult.status.includes("ALREADY") ? "⚠️" : "❌"}
                </div>
                <div style={{ fontWeight: 800, fontSize: "1.1rem", color: boardingResult.color, marginBottom: "6px" }}>{boardingResult.status}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{boardingResult.message}</div>

                {boardingResult.ticket && (
                  <div style={{ marginTop: "14px", textAlign: "left", backgroundColor: "var(--bg-input)", borderRadius: "8px", padding: "12px", fontSize: "0.8rem" }}>
                    <div>Passenger: <strong>{boardingResult.passenger?.name}</strong></div>
                    <div>Seat: <strong>{boardingResult.ticket.seatNumber} ({boardingResult.ticket.seatClass})</strong></div>
                    <div>Flight: <strong>{boardingResult.flight?.flightNumber} | {boardingResult.flight?.origin} → {boardingResult.flight?.destination}</strong></div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Live Boarding Status Table */}
          <div className="glass-card">
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "20px" }}>Live Boarding Status</h3>
            <div className="table-container">
              <table className="custom-table" style={{ fontSize: "0.78rem" }}>
                <thead>
                  <tr><th>Passenger</th><th>Seat</th><th>Flight</th><th>Boarded At</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {boarding.slice(-10).reverse().map(b => {
                    const t = tickets.find(tk => tk.id === b.ticketId);
                    const p = t ? passengers.find(pa => pa.id === t.passengerId) : null;
                    const f = t ? flights.find(fl => fl.id === t.flightId) : null;
                    return (
                      <tr key={b.id}>
                        <td><strong>{p?.name || "Unknown"}</strong></td>
                        <td>{t?.seatNumber}</td>
                        <td>{f?.flightNumber}</td>
                        <td>{b.boardedTime || "—"}</td>
                        <td><span className={`badge badge-${b.status === "Boarded" ? "scheduled" : "delayed"}`}>{b.status}</span></td>
                      </tr>
                    );
                  })}
                  {boarding.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign: "center", padding: "24px", color: "var(--text-secondary)" }}>No boarding records yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
