import React, { useState } from "react";
import { useCollection, useDB } from "../contexts/DBContext";
import { useAuth } from "../contexts/AuthContext";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaSuitcase, FaBox, FaExclamationTriangle } from "react-icons/fa";

const TABS = ["Baggage", "Cargo", "Maintenance", "Fuel"];

export default function Operations() {
  const { currentUser } = useAuth();
  const [baggage] = useCollection("baggage");
  const [cargo] = useCollection("cargo");
  const [maintenance] = useCollection("maintenance");
  const [fuel] = useCollection("fuel");
  const [passengers] = useCollection("passengers");
  const [aircrafts] = useCollection("aircrafts");
  const [flights] = useCollection("flights");
  const { addDoc, updateDoc, deleteDoc, logSystemAction } = useDB();

  const [activeTab, setActiveTab] = useState("Baggage");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingId(item?.id || null);
    if (type === "Baggage") setFormData(item || { bookingId: "", passengerId: "", weight: 0, status: "Checked In", extraCharges: 0 });
    if (type === "Cargo") setFormData(item || { weight: 0, customer: "", origin: "", destination: "", status: "In Warehouse", charges: 0 });
    if (type === "Maintenance") setFormData(item || { aircraftId: "", type: "", engineer: "", startDate: "", endDate: "", cost: 0, remarks: "", status: "Scheduled" });
    if (type === "Fuel") setFormData(item || { flightId: "", aircraftId: "", fuelConsumption: 0, fuelCost: 0, refuelDate: "", quantity: 0 });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const col = modalType === "Baggage" ? "baggage" : modalType === "Cargo" ? "cargo" : modalType === "Maintenance" ? "maintenance" : "fuel";
    if (editingId) {
      updateDoc(col, editingId, formData);
      logSystemAction(currentUser.uid, currentUser.email, `Update ${modalType}`, "Operations", "", formData);
    } else {
      addDoc(col, formData);
      logSystemAction(currentUser.uid, currentUser.email, `Add ${modalType}`, "Operations", "", formData);
    }
    setShowModal(false);
  };

  const handleDelete = (col, id) => {
    if (window.confirm("Delete this record?")) {
      deleteDoc(col, id);
      logSystemAction(currentUser.uid, currentUser.email, `Delete from ${col}`, "Operations", id, "Deleted");
    }
  };

  const Inp = ({ label, fieldKey, type = "text", children }) => (
    <div>
      <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>{label}</label>
      {children || <input type={type} value={formData[fieldKey] ?? ""} onChange={e => setFormData({ ...formData, [fieldKey]: type === "number" ? parseFloat(e.target.value) : e.target.value })} className="form-input" style={{ marginTop: "4px" }} />}
    </div>
  );

  const bagStatusColor = s => s === "Delivered" ? "scheduled" : s === "Lost" ? "cancelled" : "delayed";

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-title">
          <h2>Cargo & Operations</h2>
          <p>Track baggage, cargo, aircraft maintenance, and fuel consumption.</p>
        </div>
        <button onClick={() => openModal(activeTab === "Maintenance" ? "Maintenance" : activeTab === "Fuel" ? "Fuel" : activeTab === "Cargo" ? "Cargo" : "Baggage")}
          className="badge badge-completed" style={{ padding: "10px 18px", fontSize: "0.85rem", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
          <FaPlus /> Add Record
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "400px", backgroundColor: "var(--bg-input)", padding: "4px", borderRadius: "10px", width: "fit-content" }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "9px 18px", borderRadius: "7px", border: "none", backgroundColor: activeTab === tab ? "var(--bg-card)" : "transparent", color: activeTab === tab ? "var(--primary)" : "var(--text-secondary)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", boxShadow: activeTab === tab ? "var(--shadow-sm)" : "none" }}>
            {tab}
          </button>
        ))}
      </div>

      {/* BAGGAGE */}
      {activeTab === "Baggage" && (
        <div className="glass-card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr><th>Bag ID</th><th>Passenger</th><th>Booking</th><th>Weight (kg)</th><th>Extra Charges</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {baggage.map(b => {
                  const pas = passengers.find(p => p.id === b.passengerId);
                  return (
                    <tr key={b.id}>
                      <td><strong style={{ fontFamily: "monospace", color: "var(--primary)" }}>{b.id}</strong></td>
                      <td>{pas?.name || b.passengerId}</td>
                      <td>{b.bookingId}</td>
                      <td>{b.weight} kg</td>
                      <td style={{ color: b.extraCharges > 0 ? "var(--status-cancelled)" : "var(--status-scheduled)" }}>
                        {b.extraCharges > 0 ? `+$${b.extraCharges}` : "None"}
                      </td>
                      <td><span className={`badge badge-${bagStatusColor(b.status)}`}>{b.status}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button onClick={() => openModal("Baggage", b)} className="icon-button" title="Edit">✏️</button>
                          <button onClick={() => handleDelete("baggage", b.id)} className="icon-button" style={{ color: "var(--status-cancelled)" }} title="Delete"><FaTrash /></button>
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

      {/* CARGO */}
      {activeTab === "Cargo" && (
        <div className="glass-card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr><th>Cargo ID</th><th>Customer</th><th>Route</th><th>Weight (kg)</th><th>Charges</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {cargo.map(c => (
                  <tr key={c.id}>
                    <td><strong style={{ fontFamily: "monospace", color: "var(--primary)" }}>{c.id}</strong></td>
                    <td>{c.customer}</td>
                    <td>{c.origin} → {c.destination}</td>
                    <td>{c.weight} kg</td>
                    <td><strong>${c.charges}</strong></td>
                    <td><span className={`badge badge-${c.status === "Delivered" ? "scheduled" : c.status === "Loaded" ? "completed" : "delayed"}`}>{c.status}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button onClick={() => openModal("Cargo", c)} className="icon-button" title="Edit">✏️</button>
                        <button onClick={() => handleDelete("cargo", c.id)} className="icon-button" style={{ color: "var(--status-cancelled)" }} title="Delete"><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MAINTENANCE */}
      {activeTab === "Maintenance" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: "16px", marginBottom: "20px" }}>
            <div className="glass-card" style={{ padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--status-delayed)" }}>{maintenance.filter(m => m.status === "In Progress").length}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>In Progress</div>
            </div>
            <div className="glass-card" style={{ padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--status-scheduled)" }}>{maintenance.filter(m => m.status === "Completed").length}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>Completed</div>
            </div>
            <div className="glass-card" style={{ padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--primary)" }}>${maintenance.reduce((s, m) => s + (m.cost || 0), 0).toLocaleString()}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>Total Maintenance Cost</div>
            </div>
          </div>
          <div className="glass-card" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr><th>Aircraft</th><th>Type</th><th>Engineer</th><th>Period</th><th>Cost</th><th>Remarks</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {maintenance.map(m => {
                    const ac = aircrafts.find(a => a.id === m.aircraftId);
                    return (
                      <tr key={m.id}>
                        <td><strong>{ac?.name || m.aircraftId}</strong><div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{ac?.regNumber}</div></td>
                        <td>{m.type}</td>
                        <td>{m.engineer}</td>
                        <td style={{ fontSize: "0.8rem" }}>{m.startDate} → {m.endDate}</td>
                        <td><strong>${m.cost?.toLocaleString()}</strong></td>
                        <td style={{ maxWidth: "180px", fontSize: "0.8rem" }}>{m.remarks}</td>
                        <td><span className={`badge badge-${m.status === "Completed" ? "scheduled" : m.status === "In Progress" ? "delayed" : "maintenance"}`}>{m.status}</span></td>
                        <td>
                          <div style={{ display: "flex", gap: "4px" }}>
                            <button onClick={() => openModal("Maintenance", m)} className="icon-button">✏️</button>
                            <button onClick={() => handleDelete("maintenance", m.id)} className="icon-button" style={{ color: "var(--status-cancelled)" }}><FaTrash /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FUEL */}
      {activeTab === "Fuel" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: "16px", marginBottom: "20px" }}>
            <div className="glass-card" style={{ padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--primary)" }}>{fuel.reduce((s, f) => s + (f.quantity || 0), 0).toLocaleString()} L</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>Total Refueled</div>
            </div>
            <div className="glass-card" style={{ padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--status-cancelled)" }}>${fuel.reduce((s, f) => s + (f.fuelCost || 0), 0).toLocaleString()}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>Total Fuel Cost</div>
            </div>
            <div className="glass-card" style={{ padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--status-delayed)" }}>{fuel.reduce((s, f) => s + (f.fuelConsumption || 0), 0).toLocaleString()} L</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>Total Consumed</div>
            </div>
          </div>
          <div className="glass-card" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr><th>Aircraft</th><th>Flight</th><th>Refuel Date</th><th>Quantity (L)</th><th>Consumed (L)</th><th>Cost</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {fuel.map(f => {
                    const ac = aircrafts.find(a => a.id === f.aircraftId);
                    const fl = flights.find(fl => fl.id === f.flightId);
                    return (
                      <tr key={f.id}>
                        <td><strong>{ac?.name || f.aircraftId}</strong></td>
                        <td>{fl?.flightNumber || f.flightId}</td>
                        <td>{f.refuelDate}</td>
                        <td style={{ color: "var(--status-scheduled)" }}>{f.quantity?.toLocaleString()}</td>
                        <td style={{ color: "var(--status-delayed)" }}>{f.fuelConsumption?.toLocaleString()}</td>
                        <td><strong>${f.fuelCost?.toLocaleString()}</strong></td>
                        <td>
                          <div style={{ display: "flex", gap: "4px" }}>
                            <button onClick={() => openModal("Fuel", f)} className="icon-button">✏️</button>
                            <button onClick={() => handleDelete("fuel", f.id)} className="icon-button" style={{ color: "var(--status-cancelled)" }}><FaTrash /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Generic Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "20px" }}>
          <div className="animate-fade-in glass-card" style={{ backgroundColor: "var(--bg-card)", width: "100%", maxWidth: "500px", padding: "30px" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "20px" }}>{editingId ? `Edit ${modalType}` : `Add ${modalType}`}</h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
              {modalType === "Baggage" && (
                <>
                  <Inp label="Booking ID" fieldKey="bookingId" />
                  <div>
                    <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Passenger</label>
                    <select value={formData.passengerId || ""} onChange={e => setFormData({ ...formData, passengerId: e.target.value })} className="form-input" style={{ marginTop: "4px" }}>
                      <option value="">Select Passenger</option>
                      {passengers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <Inp label="Weight (kg)" fieldKey="weight" type="number" />
                  <Inp label="Extra Charges ($)" fieldKey="extraCharges" type="number" />
                  <div>
                    <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Status</label>
                    <select value={formData.status || ""} onChange={e => setFormData({ ...formData, status: e.target.value })} className="form-input" style={{ marginTop: "4px" }}>
                      {["Checked In", "Loaded", "In Transit", "Delivered", "Lost", "Found"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </>
              )}
              {modalType === "Cargo" && (
                <>
                  <Inp label="Customer Name" fieldKey="customer" />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <Inp label="Origin (IATA)" fieldKey="origin" />
                    <Inp label="Destination (IATA)" fieldKey="destination" />
                    <Inp label="Weight (kg)" fieldKey="weight" type="number" />
                    <Inp label="Charges ($)" fieldKey="charges" type="number" />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Status</label>
                    <select value={formData.status || ""} onChange={e => setFormData({ ...formData, status: e.target.value })} className="form-input" style={{ marginTop: "4px" }}>
                      {["In Warehouse", "Loaded", "In Transit", "Delivered", "Returned"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </>
              )}
              {modalType === "Maintenance" && (
                <>
                  <div>
                    <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Aircraft</label>
                    <select value={formData.aircraftId || ""} onChange={e => setFormData({ ...formData, aircraftId: e.target.value })} className="form-input" style={{ marginTop: "4px" }}>
                      <option value="">Select Aircraft</option>
                      {aircrafts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <Inp label="Maintenance Type" fieldKey="type" />
                    <Inp label="Lead Engineer" fieldKey="engineer" />
                    <Inp label="Start Date" fieldKey="startDate" type="date" />
                    <Inp label="End Date" fieldKey="endDate" type="date" />
                    <Inp label="Cost ($)" fieldKey="cost" type="number" />
                    <div>
                      <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Status</label>
                      <select value={formData.status || ""} onChange={e => setFormData({ ...formData, status: e.target.value })} className="form-input" style={{ marginTop: "4px" }}>
                        {["Scheduled", "In Progress", "Completed", "Cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Remarks</label>
                    <textarea value={formData.remarks || ""} onChange={e => setFormData({ ...formData, remarks: e.target.value })} className="form-input" style={{ marginTop: "4px", minHeight: "60px", resize: "vertical" }} />
                  </div>
                </>
              )}
              {modalType === "Fuel" && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Aircraft</label>
                      <select value={formData.aircraftId || ""} onChange={e => setFormData({ ...formData, aircraftId: e.target.value })} className="form-input" style={{ marginTop: "4px" }}>
                        <option value="">Select Aircraft</option>
                        {aircrafts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Flight</label>
                      <select value={formData.flightId || ""} onChange={e => setFormData({ ...formData, flightId: e.target.value })} className="form-input" style={{ marginTop: "4px" }}>
                        <option value="">Select Flight</option>
                        {flights.map(f => <option key={f.id} value={f.id}>{f.flightNumber}</option>)}
                      </select>
                    </div>
                    <Inp label="Refuel Date" fieldKey="refuelDate" type="date" />
                    <Inp label="Quantity (L)" fieldKey="quantity" type="number" />
                    <Inp label="Consumption (L)" fieldKey="fuelConsumption" type="number" />
                    <Inp label="Fuel Cost ($)" fieldKey="fuelCost" type="number" />
                  </div>
                </>
              )}
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
                <button type="button" onClick={() => setShowModal(false)} className="form-input" style={{ width: "auto", cursor: "pointer" }}>Cancel</button>
                <button type="submit" className="badge badge-completed" style={{ padding: "11px 22px", border: "none", cursor: "pointer", fontSize: "0.85rem" }}>Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
