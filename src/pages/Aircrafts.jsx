import React, { useState } from "react";
import { useCollection, useDB } from "../contexts/DBContext";
import { useAuth } from "../contexts/AuthContext";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaPlane } from "react-icons/fa";

export default function Aircrafts() {
  const { currentUser } = useAuth();
  const [aircrafts] = useCollection("aircrafts");
  const { addDoc, updateDoc, deleteDoc, logSystemAction } = useDB();

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    model: "",
    manufacturer: "Boeing",
    regNumber: "",
    year: 2022,
    capacity: 200,
    economySeats: 160,
    businessSeats: 30,
    firstSeats: 10,
    fuelCapacity: 50000,
    range: 8000,
    maintenanceDate: "",
    insurance: "",
    status: "Active",
    image: ""
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: "",
      model: "",
      manufacturer: "Boeing",
      regNumber: "",
      year: 2022,
      capacity: 200,
      economySeats: 160,
      businessSeats: 30,
      firstSeats: 10,
      fuelCapacity: 50000,
      range: 8000,
      maintenanceDate: "",
      insurance: "",
      status: "Active",
      image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&fit=crop&q=80"
    });
    setShowModal(true);
  };

  const handleOpenEdit = (aircraft) => {
    setEditingId(aircraft.id);
    setFormData({
      name: aircraft.name,
      model: aircraft.model,
      manufacturer: aircraft.manufacturer,
      regNumber: aircraft.regNumber,
      year: aircraft.year,
      capacity: aircraft.capacity,
      economySeats: aircraft.economySeats,
      businessSeats: aircraft.businessSeats,
      firstSeats: aircraft.firstSeats,
      fuelCapacity: aircraft.fuelCapacity,
      range: aircraft.range,
      maintenanceDate: aircraft.maintenanceDate,
      insurance: aircraft.insurance,
      status: aircraft.status,
      image: aircraft.image || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&fit=crop&q=80"
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const capacitySum = parseInt(formData.economySeats) + parseInt(formData.businessSeats) + parseInt(formData.firstSeats);
    const finalData = { ...formData, capacity: capacitySum };

    if (editingId) {
      const oldVal = aircrafts.find(a => a.id === editingId);
      updateDoc("aircrafts", editingId, finalData);
      logSystemAction(currentUser.uid, currentUser.email, "Update Aircraft Details", "Aircraft", oldVal, finalData);
    } else {
      const newDoc = addDoc("aircrafts", finalData);
      logSystemAction(currentUser.uid, currentUser.email, "Add Aircraft", "Aircraft", "", newDoc);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this aircraft from fleet listings?")) {
      const oldVal = aircrafts.find(a => a.id === id);
      deleteDoc("aircrafts", id);
      logSystemAction(currentUser.uid, currentUser.email, "Delete Aircraft", "Aircraft", oldVal, "Deleted");
    }
  };

  const filteredAircrafts = aircrafts.filter(a =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.regNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-title">
          <h2>Aircraft Fleets</h2>
          <p>Supervise airworthiness status, configuration capacities, and insurance certificates.</p>
        </div>
        <button onClick={handleOpenAdd} className="badge badge-completed" style={{ padding: "10px 18px", fontSize: "0.85rem", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
          <FaPlus /> Commission Aircraft
        </button>
      </div>

      {/* Filter Options */}
      <div className="glass-card" style={{ marginBottom: "400px", padding: "16px" }}>
        <div style={{ position: "relative", width: "100%", maxWidth: "360px" }}>
          <FaSearch style={{ position: "absolute", left: "12px", top: "12px", color: "var(--text-secondary)" }} />
          <input
            type="text"
            placeholder="Search fleet name, model, or reg number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: "36px" }}
          />
        </div>
      </div>

      {/* Cards List Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
        {filteredAircrafts.map(a => (
          <div key={a.id} className="glass-card" style={{ display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
            <div style={{ height: "180px", position: "relative" }}>
              <img
                src={a.image || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&fit=crop&q=80"}
                alt={a.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <span className={`badge badge-${a.status.toLowerCase() === "active" ? "scheduled" : a.status.toLowerCase() === "maintenance" ? "maintenance" : "cancelled"}`} style={{ position: "absolute", top: "12px", right: "12px", border: "1px solid rgba(255,255,255,0.25)", boxShadow: "var(--shadow-md)" }}>
                {a.status}
              </span>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between", gap: "16px" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0 }}>{a.name}</h3>
                  <span style={{ fontFamily: "monospace", fontSize: "0.85rem", padding: "2px 6px", backgroundColor: "var(--bg-input)", borderRadius: "4px", fontWeight: 600 }}>{a.regNumber}</span>
                </div>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginTop: "2px" }}>
                  {a.manufacturer} {a.model} ({a.year})
                </span>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.8rem", marginTop: "16px", borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                  <div>👥 Seats Capacity: <strong>{a.capacity}</strong></div>
                  <div>✈️ Max Range: <strong>{a.range.toLocaleString()} km</strong></div>
                  <div>⛽ Fuel capacity: <strong>{a.fuelCapacity.toLocaleString()} L</strong></div>
                  <div>📜 Insurance Cert: <strong style={{ fontSize: "0.75rem" }}>{a.insurance}</strong></div>
                  <div style={{ gridColumn: "span 2", color: "var(--primary)", fontWeight: 600 }}>
                    🛠️ Next Maintenance Date: {a.maintenanceDate || "Not Scheduled"}
                  </div>
                </div>

                {/* Seats Configuration breakdown */}
                <div style={{ backgroundColor: "var(--bg-input)", padding: "10px", borderRadius: "8px", marginTop: "12px", fontSize: "0.75rem", display: "flex", justifyContent: "space-around" }}>
                  <div>First: <strong>{a.firstSeats}</strong></div>
                  <div>Business: <strong>{a.businessSeats}</strong></div>
                  <div>Economy: <strong>{a.economySeats}</strong></div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", borderTop: "1px solid var(--border-color)", paddingTop: "12px", justifyContent: "flex-end" }}>
                <button onClick={() => handleOpenEdit(a)} className="icon-button" title="Modify Aircraft Fleet"><FaEdit /></button>
                <button onClick={() => handleDelete(a.id)} className="icon-button" style={{ color: "var(--status-cancelled)" }} title="Decommission Fleet"><FaTrash /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Editor Modal */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="glass-card animate-fade-in" style={{ backgroundColor: "var(--bg-card)", width: "100%", maxWidth: "560px", padding: "30px", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "20px" }}>{editingId ? "Edit Aircraft" : "Commission New Aircraft"}</h3>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>AIRCRAFT CALLSIGN / NAME</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                    style={{ marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>AIRCRAFT MODEL</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 777-300ER"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="form-input"
                    style={{ marginTop: "4px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>MANUFACTURER</label>
                  <select
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="form-input"
                    style={{ marginTop: "4px" }}
                  >
                    <option value="Boeing">Boeing</option>
                    <option value="Airbus">Airbus</option>
                    <option value="Bombardier">Bombardier</option>
                    <option value="Embraer">Embraer</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>REGISTRATION CODE</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. N777SL"
                    value={formData.regNumber}
                    onChange={(e) => setFormData({ ...formData, regNumber: e.target.value })}
                    className="form-input"
                    style={{ marginTop: "4px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>MANUFACTURING YEAR</label>
                  <input
                    type="number"
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="form-input"
                    style={{ marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>FLEET IMAGE URL</label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="form-input"
                    style={{ marginTop: "4px" }}
                  />
                </div>
              </div>

              <h4 style={{ fontSize: "0.85rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px", color: "var(--primary)", marginTop: "10px" }}>Cabin Seating Capacity Configuration</h4>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>FIRST CLASS</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.firstSeats}
                    onChange={(e) => setFormData({ ...formData, firstSeats: parseInt(e.target.value) })}
                    className="form-input"
                    style={{ marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>BUSINESS CLASS</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.businessSeats}
                    onChange={(e) => setFormData({ ...formData, businessSeats: parseInt(e.target.value) })}
                    className="form-input"
                    style={{ marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>ECONOMY CLASS</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.economySeats}
                    onChange={(e) => setFormData({ ...formData, economySeats: parseInt(e.target.value) })}
                    className="form-input"
                    style={{ marginTop: "4px" }}
                  />
                </div>
              </div>

              <h4 style={{ fontSize: "0.85rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px", color: "var(--primary)", marginTop: "10px" }}>Fuel, Range, & Certifications</h4>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>FUEL CAPACITY (LITRES)</label>
                  <input
                    type="number"
                    required
                    value={formData.fuelCapacity}
                    onChange={(e) => setFormData({ ...formData, fuelCapacity: parseInt(e.target.value) })}
                    className="form-input"
                    style={{ marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>MAX RANGE (KM)</label>
                  <input
                    type="number"
                    required
                    value={formData.range}
                    onChange={(e) => setFormData({ ...formData, range: parseInt(e.target.value) })}
                    className="form-input"
                    style={{ marginTop: "4px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>MAINTENANCE DUE DATE</label>
                  <input
                    type="date"
                    required
                    value={formData.maintenanceDate}
                    onChange={(e) => setFormData({ ...formData, maintenanceDate: e.target.value })}
                    className="form-input"
                    style={{ marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>INSURANCE POLICY</label>
                  <input
                    type="text"
                    required
                    value={formData.insurance}
                    onChange={(e) => setFormData({ ...formData, insurance: e.target.value })}
                    className="form-input"
                    style={{ marginTop: "4px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>STATUS</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="form-input"
                  style={{ marginTop: "4px" }}
                >
                  <option value="Active">Active</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Awaiting Parts">Awaiting Parts</option>
                  <option value="Decommissioned">Decommissioned</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
                <button type="button" onClick={() => setShowModal(false)} className="form-input" style={{ width: "fit-content", cursor: "pointer" }}>Cancel</button>
                <button type="submit" className="badge badge-completed" style={{ padding: "12px 20px", fontSize: "0.85rem", border: "none", cursor: "pointer" }}>
                  Save Aircraft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
