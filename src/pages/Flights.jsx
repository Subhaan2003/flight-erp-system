import React, { useState, useEffect } from "react";
import { useCollection, useDB } from "../contexts/DBContext";
import { useAuth } from "../contexts/AuthContext";
import { sendSystemNotification } from "../services/notifier";
import Modal, { ModalActions } from "../components/Modal";
import {
  getLiveFlights, getAirportDepartures, searchBookableFlights, getAPIStatus
} from "../services/flightAPI";
import {
  FaPlus, FaSearch, FaEdit, FaTrash, FaPlane, FaClock,
  FaTimesCircle, FaCheckCircle, FaExclamationTriangle,
  FaCalendarAlt, FaList, FaWifi, FaSync, FaGlobe, FaInfoCircle
} from "react-icons/fa";

const STATUS_COLORS = {
  Scheduled: "scheduled", Delayed: "delayed",
  Cancelled: "cancelled", Completed: "completed", "In Air": "completed"
};

export default function Flights() {
  const { currentUser } = useAuth();
  const [flights] = useCollection("flights");
  const [airlines] = useCollection("airlines");
  const [aircrafts] = useCollection("aircrafts");
  const [employees] = useCollection("employees");
  const { addDoc, updateDoc, deleteDoc, logSystemAction } = useDB();

  // ── UI State ──────────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewMode, setViewMode] = useState("list"); // list | calendar | live
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // ── Live API State ─────────────────────────────────────────────────────────
  const [liveFlights, setLiveFlights] = useState([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState("");
  const [apiStatus] = useState(getAPIStatus());
  const [searchFrom, setSearchFrom] = useState("JFK");
  const [searchTo, setSearchTo] = useState("LHR");
  const [searchDate, setSearchDate] = useState(new Date().toISOString().split("T")[0]);
  const [lastFetched, setLastFetched] = useState(null);

  // ── Form State ─────────────────────────────────────────────────────────────
  const emptyForm = {
    flightNumber: "", airlineId: "", aircraftId: "",
    origin: "", destination: "",
    departureDate: "", departureTime: "", arrivalDate: "", arrivalTime: "",
    duration: "", distance: 0, status: "Scheduled",
    gate: "", terminal: "",
    captainId: "", coPilotId: "",
    availableSeats: 200, bookedSeats: 0,
    priceEconomy: 0, priceBusiness: 0, priceFirst: 0
  };
  const [formData, setFormData] = useState(emptyForm);

  const pilots = employees.filter(e => e.role === "Pilot");

  // ── Fetch live flights from API ────────────────────────────────────────────
  const fetchLiveFlights = async () => {
    setLiveLoading(true);
    setLiveError("");
    try {
      const data = await searchBookableFlights(searchFrom.toUpperCase(), searchTo.toUpperCase(), searchDate);
      setLiveFlights(data);
      setLastFetched(new Date().toLocaleTimeString());
    } catch (err) {
      setLiveError(err.message);
      setLiveFlights([]);
    } finally {
      setLiveLoading(false);
    }
  };

  // Import a live flight into your local DB
  const importLiveFlight = (lf) => {
    const doc = {
      flightNumber: lf.flightNumber,
      airlineId: lf.airlineIata,
      aircraftId: lf.aircraft || "",
      origin: lf.origin,
      destination: lf.destination,
      departureDate: lf.departureDate,
      departureTime: lf.departureTime,
      arrivalDate: lf.departureDate,
      arrivalTime: lf.arrivalTime,
      duration: "",
      gate: lf.gate,
      terminal: lf.terminal,
      status: lf.status,
      availableSeats: 180,
      bookedSeats: 0,
      priceEconomy: lf.priceEconomy || 0,
      priceBusiness: lf.priceBusiness || 0,
      priceFirst: 0,
      source: "live-api"
    };
    addDoc("flights", doc);
    logSystemAction(currentUser.uid, currentUser.email, "Import Live Flight", "Flights", "", doc);
    sendSystemNotification({ title: "Flight Imported", message: `${lf.flightNumber} added to schedule.`, type: "success" });
  };

  // ── CRUD handlers ──────────────────────────────────────────────────────────
  const handleOpenAdd = () => { setEditingId(null); setFormData(emptyForm); setShowModal(true); };
  const handleOpenEdit = (f) => { setEditingId(f.id); setFormData({ ...f }); setShowModal(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      const old = flights.find(f => f.id === editingId);
      updateDoc("flights", editingId, formData);
      logSystemAction(currentUser.uid, currentUser.email, "Update Flight", "Flights", old, formData);
    } else {
      const newDoc = addDoc("flights", { ...formData, id: `fl-${Date.now()}` });
      logSystemAction(currentUser.uid, currentUser.email, "Add Flight", "Flights", "", newDoc);
    }
    setShowModal(false);
  };

  const handleStatusChange = (flightId, newStatus) => {
    const flight = flights.find(f => f.id === flightId);
    if (!flight) return;
    updateDoc("flights", flightId, { status: newStatus });
    logSystemAction(currentUser.uid, currentUser.email, `Flight ${newStatus}`, "Flights", flight.status, newStatus);
    const msgs = {
      Delayed: { title: "Flight Delayed", msg: `Flight ${flight.flightNumber} has been delayed.`, type: "warning" },
      Cancelled: { title: "Flight Cancelled", msg: `Flight ${flight.flightNumber} has been cancelled.`, type: "error" },
      Completed: { title: "Flight Completed", msg: `Flight ${flight.flightNumber} landed successfully.`, type: "success" }
    };
    if (msgs[newStatus]) sendSystemNotification({ title: msgs[newStatus].title, message: msgs[newStatus].msg, type: msgs[newStatus].type });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this flight permanently?")) return;
    const old = flights.find(f => f.id === id);
    deleteDoc("flights", id);
    logSystemAction(currentUser.uid, currentUser.email, "Delete Flight", "Flights", old, "Deleted");
  };

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = flights.filter(f => {
    const matchSearch =
      f.flightNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.destination?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "All" || f.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const byDate = {};
  filtered.forEach(f => {
    const d = f.departureDate || "Unknown";
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(f);
  });

  const Field = ({ label, children, required }) => (
    <div>
      <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
        {label}{required && <span style={{ color: "var(--status-cancelled)" }}> *</span>}
      </label>
      {children}
    </div>
  );

  // ── API status badge ───────────────────────────────────────────────────────
  const APIBadge = ({ connected, label }) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 10px", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 600, backgroundColor: connected ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: connected ? "var(--status-scheduled)" : "var(--status-cancelled)", border: `1px solid ${connected ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}` }}>
      <FaWifi style={{ fontSize: "0.65rem" }} /> {label}: {connected ? "Connected" : "No Key"}
    </span>
  );

  return (
    <div className="animate-fade-in">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="page-header-title">
          <h2>Flight Schedules</h2>
          <p>Manage, dispatch, and import real-world flights across the global network.</p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {[
            { mode: "list", label: "List View", icon: <FaList /> },
            { mode: "calendar", label: "Calendar", icon: <FaCalendarAlt /> },
            { mode: "live", label: "Live API", icon: <FaGlobe /> }
          ].map(v => (
            <button key={v.mode} onClick={() => setViewMode(v.mode)}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 14px", borderRadius: "8px", border: `1px solid ${viewMode === v.mode ? "var(--primary)" : "var(--border-color)"}`, backgroundColor: viewMode === v.mode ? "var(--primary)" : "transparent", color: viewMode === v.mode ? "white" : "var(--text-secondary)", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer" }}>
              {v.icon} {v.label}
            </button>
          ))}
          <button onClick={handleOpenAdd}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", borderRadius: "8px", border: "none", backgroundColor: "var(--primary)", color: "white", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", boxShadow: "0 4px 12px var(--primary-glow)" }}>
            <FaPlus /> Schedule Flight
          </button>
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: "14px", marginBottom: "24px" }}>
        {[
          { label: "Total", count: flights.length, color: "var(--primary)", icon: <FaPlane /> },
          { label: "Scheduled", count: flights.filter(f => f.status === "Scheduled").length, color: "var(--status-scheduled)", icon: <FaClock /> },
          { label: "Delayed", count: flights.filter(f => f.status === "Delayed").length, color: "var(--status-delayed)", icon: <FaExclamationTriangle /> },
          { label: "Cancelled", count: flights.filter(f => f.status === "Cancelled").length, color: "var(--status-cancelled)", icon: <FaTimesCircle /> },
          { label: "Completed", count: flights.filter(f => f.status === "Completed").length, color: "var(--status-completed)", icon: <FaCheckCircle /> },
        ].map(s => (
          <div key={s.label} className="glass-card" style={{ padding: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ color: s.color, fontSize: "1.3rem" }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{s.count}</div>
              <div style={{ fontSize: "0.73rem", color: "var(--text-secondary)" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters (shown on list & calendar) ── */}
      {viewMode !== "live" && (
        <div className="glass-card" style={{ marginBottom: "400px", padding: "14px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
            <FaSearch style={{ position: "absolute", left: "12px", top: "12px", color: "var(--text-secondary)" }} />
            <input type="text" placeholder="Search flight, origin, destination…" value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)} className="form-input" style={{ paddingLeft: "36px" }} />
          </div>
          {["All", "Scheduled", "Delayed", "Cancelled", "Completed"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              style={{ padding: "7px 14px", borderRadius: "20px", border: `1px solid ${statusFilter === s ? "var(--primary)" : "var(--border-color)"}`, backgroundColor: statusFilter === s ? "var(--primary)" : "transparent", color: statusFilter === s ? "white" : "var(--text-secondary)", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          VIEW: LIST
      ══════════════════════════════════════════════════════════════════════ */}
      {viewMode === "list" && (
        <div className="glass-card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Flight</th>
                  <th>Route</th>
                  <th>Departure</th>
                  <th>Arrival</th>
                  <th>Aircraft</th>
                  <th>Gate / Term</th>
                  <th>Seats</th>
                  <th>Prices (E/B/F)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={10} style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>No flights found.</td></tr>
                ) : filtered.map(f => {
                  const ac = aircrafts.find(a => a.id === f.aircraftId);
                  return (
                    <tr key={f.id}>
                      <td><strong style={{ color: "var(--primary)" }}>{f.flightNumber}</strong>
                        {f.source === "live-api" && <span style={{ marginLeft: "6px", fontSize: "0.65rem", color: "var(--status-scheduled)", backgroundColor: "rgba(16,185,129,0.1)", padding: "2px 6px", borderRadius: "4px" }}>LIVE</span>}
                      </td>
                      <td><strong>{f.origin}</strong> → <strong>{f.destination}</strong></td>
                      <td>{f.departureDate}<br /><span style={{ color: "var(--text-secondary)", fontSize: "0.78rem" }}>{f.departureTime}</span></td>
                      <td>{f.arrivalDate}<br /><span style={{ color: "var(--text-secondary)", fontSize: "0.78rem" }}>{f.arrivalTime}</span></td>
                      <td style={{ fontSize: "0.82rem" }}>{ac ? `${ac.model}` : f.aircraftId || "—"}</td>
                      <td style={{ fontSize: "0.82rem" }}>G{f.gate} / T{f.terminal}</td>
                      <td style={{ fontSize: "0.78rem" }}>
                        <span style={{ color: "var(--status-scheduled)" }}>✓{f.availableSeats}</span>
                        {" / "}
                        <span style={{ color: "var(--status-cancelled)" }}>✗{f.bookedSeats || 0}</span>
                      </td>
                      <td style={{ fontSize: "0.78rem", fontFamily: "monospace" }}>
                        ${f.priceEconomy} / ${f.priceBusiness} / ${f.priceFirst || 0}
                      </td>
                      <td><span className={`badge badge-${STATUS_COLORS[f.status] || "scheduled"}`}>{f.status}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: "3px", flexWrap: "wrap" }}>
                          <button onClick={() => handleOpenEdit(f)} className="icon-button" title="Edit"><FaEdit /></button>
                          {f.status === "Scheduled" && <>
                            <button onClick={() => handleStatusChange(f.id, "Delayed")} className="icon-button" style={{ color: "var(--status-delayed)" }} title="Delay"><FaExclamationTriangle /></button>
                            <button onClick={() => handleStatusChange(f.id, "Cancelled")} className="icon-button" style={{ color: "var(--status-cancelled)" }} title="Cancel"><FaTimesCircle /></button>
                            <button onClick={() => handleStatusChange(f.id, "Completed")} className="icon-button" style={{ color: "var(--status-completed)" }} title="Complete"><FaCheckCircle /></button>
                          </>}
                          {f.status === "Delayed" && <>
                            <button onClick={() => handleStatusChange(f.id, "Scheduled")} className="icon-button" style={{ color: "var(--status-scheduled)" }} title="Reschedule"><FaClock /></button>
                            <button onClick={() => handleStatusChange(f.id, "Cancelled")} className="icon-button" style={{ color: "var(--status-cancelled)" }} title="Cancel"><FaTimesCircle /></button>
                          </>}
                          <button onClick={() => handleDelete(f.id)} className="icon-button" style={{ color: "var(--status-cancelled)" }} title="Delete"><FaTrash /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          VIEW: CALENDAR
      ══════════════════════════════════════════════════════════════════════ */}
      {viewMode === "calendar" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {Object.keys(byDate).length === 0 && (
            <div className="glass-card" style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>No flights to display.</div>
          )}
          {Object.keys(byDate).sort().map(date => (
            <div key={date} className="glass-card">
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                <FaCalendarAlt style={{ color: "var(--primary)" }} />
                {date === "Unknown" ? "Unscheduled" : new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 400 }}>({byDate[date].length} flights)</span>
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: "12px" }}>
                {byDate[date].map(f => (
                  <div key={f.id} style={{ padding: "14px", border: "1px solid var(--border-color)", borderRadius: "10px", backgroundColor: "var(--bg-input)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <strong style={{ color: "var(--primary)" }}>{f.flightNumber}</strong>
                      <span className={`badge badge-${STATUS_COLORS[f.status] || "scheduled"}`}>{f.status}</span>
                    </div>
                    <div style={{ fontSize: "1.05rem", fontWeight: 700 }}>{f.origin} ✈ {f.destination}</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                      {f.departureTime} → {f.arrivalTime} | Gate {f.gate} T{f.terminal}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          VIEW: LIVE API
      ══════════════════════════════════════════════════════════════════════ */}
      {viewMode === "live" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* API Status Banner */}
          <div className="glass-card" style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <FaInfoCircle style={{ color: "var(--primary)", flexShrink: 0 }} />
            <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", flex: 1 }}>
              Real-time flight data via AviationStack & AeroDataBox. Add keys to your <code style={{ backgroundColor: "var(--bg-input)", padding: "1px 6px", borderRadius: "4px" }}>.env</code> file to activate.
            </span>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <APIBadge connected={apiStatus.aviationstack} label="AviationStack" />
              <APIBadge connected={apiStatus.aerodatabox} label="AeroDataBox" />
              <APIBadge connected={apiStatus.weather} label="Weather" />
            </div>
          </div>

          {/* Search Panel */}
          <div className="glass-card" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <FaGlobe style={{ color: "var(--primary)" }} /> Search Real-World Flights
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "12px", alignItems: "end" }}>
              <div>
                <label style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>From (IATA)</label>
                <input type="text" maxLength={3} value={searchFrom} onChange={e => setSearchFrom(e.target.value.toUpperCase())} className="form-input" placeholder="JFK" />
              </div>
              <div>
                <label style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>To (IATA)</label>
                <input type="text" maxLength={3} value={searchTo} onChange={e => setSearchTo(e.target.value.toUpperCase())} className="form-input" placeholder="LHR" />
              </div>
              <div>
                <label style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Date</label>
                <input type="date" value={searchDate} onChange={e => setSearchDate(e.target.value)} className="form-input" />
              </div>
              <button onClick={fetchLiveFlights} disabled={liveLoading}
                style={{ height: "42px", padding: "0 20px", borderRadius: "8px", border: "none", backgroundColor: "var(--primary)", color: "white", fontWeight: 700, fontSize: "0.85rem", cursor: liveLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "8px", opacity: liveLoading ? 0.7 : 1 }}>
                <FaSync style={{ animation: liveLoading ? "spin 1s linear infinite" : "none" }} />
                {liveLoading ? "Fetching…" : "Search"}
              </button>
            </div>
            {lastFetched && <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "10px" }}>Last updated: {lastFetched}</div>}
          </div>

          {/* Error */}
          {liveError && (
            <div style={{ padding: "14px 16px", backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", color: "var(--status-cancelled)", fontSize: "0.85rem", display: "flex", gap: "10px" }}>
              <FaExclamationTriangle style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong>API Error:</strong> {liveError}
                <div style={{ marginTop: "6px", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                  Make sure your keys are in <code>.env</code> and you have API quota remaining.
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {!liveLoading && liveFlights.length === 0 && !liveError && (
            <div className="glass-card" style={{ textAlign: "center", padding: "48px", color: "var(--text-secondary)" }}>
              <FaGlobe style={{ fontSize: "2.5rem", marginBottom: "12px", opacity: 0.3 }} />
              <div style={{ fontWeight: 600, marginBottom: "6px" }}>No results yet</div>
              <div style={{ fontSize: "0.82rem" }}>Enter airports and date above, then click Search to fetch live flights.</div>
            </div>
          )}

          {liveFlights.length > 0 && (
            <div className="glass-card" style={{ padding: 0 }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{liveFlights.length} flights found — {searchFrom} → {searchTo}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Click "Import" to add to your schedule</span>
              </div>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Flight</th>
                      <th>Airline</th>
                      <th>Route</th>
                      <th>Departure</th>
                      <th>Arrival</th>
                      <th>Aircraft</th>
                      <th>Gate</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveFlights.map((lf, i) => (
                      <tr key={`${lf.flightNumber}-${i}`}>
                        <td><strong style={{ color: "var(--primary)" }}>{lf.flightNumber}</strong></td>
                        <td style={{ fontSize: "0.82rem" }}>{lf.airlineName}</td>
                        <td><strong>{lf.origin}</strong> → <strong>{lf.destination}</strong></td>
                        <td>{lf.departureTime}<br /><span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>{lf.departureDate}</span></td>
                        <td>{lf.arrivalTime}</td>
                        <td style={{ fontSize: "0.8rem" }}>{lf.aircraft}</td>
                        <td style={{ fontSize: "0.8rem" }}>{lf.gate || "TBA"}</td>
                        <td><span className={`badge badge-${STATUS_COLORS[lf.status] || "scheduled"}`}>{lf.status}</span>
                          {lf.delay > 0 && <span style={{ marginLeft: "6px", fontSize: "0.7rem", color: "var(--status-delayed)" }}>+{lf.delay}m</span>}
                        </td>
                        <td>
                          <button onClick={() => importLiveFlight(lf)}
                            style={{ padding: "5px 12px", borderRadius: "6px", border: "none", backgroundColor: "rgba(0,180,216,0.1)", color: "var(--primary)", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", border: "1px solid rgba(0,180,216,0.25)" }}>
                            + Import
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ADD / EDIT MODAL — uses Modal component (no more cut-off fields)
      ══════════════════════════════════════════════════════════════════════ */}
      {showModal && (
        <Modal
          title={editingId ? "Edit Flight" : "Schedule New Flight"}
          onClose={() => setShowModal(false)}
          maxWidth="720px"
        >
          <form onSubmit={handleSubmit}>
            {/* Row 1 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "14px" }}>
              <Field label="Flight Number" required>
                <input type="text" required value={formData.flightNumber} onChange={e => setFormData({ ...formData, flightNumber: e.target.value })} className="form-input" placeholder="AE-101" />
              </Field>
              <Field label="Airline" required>
                <select value={formData.airlineId} onChange={e => setFormData({ ...formData, airlineId: e.target.value })} className="form-input" required>
                  <option value="">Select Airline</option>
                  {airlines.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </Field>
              <Field label="Aircraft" required>
                <select value={formData.aircraftId} onChange={e => setFormData({ ...formData, aircraftId: e.target.value })} className="form-input" required>
                  <option value="">Select Aircraft</option>
                  {aircrafts.filter(a => a.status === "Active").map(a => (
                    <option key={a.id} value={a.id}>{a.model} ({a.registrationNumber})</option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Row 2 — Route */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
              <Field label="Origin IATA Code" required>
                <input type="text" required maxLength={3} value={formData.origin} onChange={e => setFormData({ ...formData, origin: e.target.value.toUpperCase() })} className="form-input" placeholder="JFK" />
              </Field>
              <Field label="Destination IATA Code" required>
                <input type="text" required maxLength={3} value={formData.destination} onChange={e => setFormData({ ...formData, destination: e.target.value.toUpperCase() })} className="form-input" placeholder="LHR" />
              </Field>
            </div>

            {/* Row 3 — Times */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "14px", marginBottom: "14px" }}>
              <Field label="Dep. Date" required><input type="date" required value={formData.departureDate} onChange={e => setFormData({ ...formData, departureDate: e.target.value })} className="form-input" /></Field>
              <Field label="Dep. Time" required><input type="time" required value={formData.departureTime} onChange={e => setFormData({ ...formData, departureTime: e.target.value })} className="form-input" /></Field>
              <Field label="Arr. Date" required><input type="date" required value={formData.arrivalDate} onChange={e => setFormData({ ...formData, arrivalDate: e.target.value })} className="form-input" /></Field>
              <Field label="Arr. Time" required><input type="time" required value={formData.arrivalTime} onChange={e => setFormData({ ...formData, arrivalTime: e.target.value })} className="form-input" /></Field>
            </div>

            {/* Row 4 — Details */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "14px", marginBottom: "14px" }}>
              <Field label="Duration"><input type="text" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} className="form-input" placeholder="7h 30m" /></Field>
              <Field label="Distance (km)"><input type="number" min={0} value={formData.distance} onChange={e => setFormData({ ...formData, distance: parseInt(e.target.value) || 0 })} className="form-input" /></Field>
              <Field label="Gate"><input type="text" value={formData.gate} onChange={e => setFormData({ ...formData, gate: e.target.value })} className="form-input" placeholder="B12" /></Field>
              <Field label="Terminal"><input type="text" value={formData.terminal} onChange={e => setFormData({ ...formData, terminal: e.target.value })} className="form-input" placeholder="4" /></Field>
            </div>

            {/* Row 5 — Crew */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
              <Field label="Captain">
                <select value={formData.captainId} onChange={e => setFormData({ ...formData, captainId: e.target.value })} className="form-input">
                  <option value="">Select Captain</option>
                  {pilots.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </Field>
              <Field label="Co-Pilot">
                <select value={formData.coPilotId} onChange={e => setFormData({ ...formData, coPilotId: e.target.value })} className="form-input">
                  <option value="">Select Co-Pilot</option>
                  {pilots.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </Field>
            </div>

            {/* Row 6 — Pricing */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "14px" }}>
              <Field label="Economy Price ($)" required><input type="number" required min={0} value={formData.priceEconomy} onChange={e => setFormData({ ...formData, priceEconomy: parseFloat(e.target.value) || 0 })} className="form-input" /></Field>
              <Field label="Business Price ($)" required><input type="number" required min={0} value={formData.priceBusiness} onChange={e => setFormData({ ...formData, priceBusiness: parseFloat(e.target.value) || 0 })} className="form-input" /></Field>
              <Field label="First Class ($)"><input type="number" min={0} value={formData.priceFirst || 0} onChange={e => setFormData({ ...formData, priceFirst: parseFloat(e.target.value) || 0 })} className="form-input" /></Field>
            </div>

            {/* Row 7 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "4px" }}>
              <Field label="Available Seats" required><input type="number" required min={1} value={formData.availableSeats} onChange={e => setFormData({ ...formData, availableSeats: parseInt(e.target.value) || 0 })} className="form-input" /></Field>
              <Field label="Status">
                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="form-input">
                  {["Scheduled", "Delayed", "Cancelled", "Completed", "In Air"].map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
            </div>

            <ModalActions onCancel={() => setShowModal(false)} submitLabel={editingId ? "Update Flight" : "Schedule Flight"} />
          </form>
        </Modal>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
