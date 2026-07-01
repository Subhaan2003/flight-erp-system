import React, { useState } from "react";
import { useCollection, useDB } from "../contexts/DBContext";
import { useAuth } from "../contexts/AuthContext";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaGlobe } from "react-icons/fa";

export default function Airports() {
  const { currentUser } = useAuth();
  const [airports] = useCollection("airports");
  const { addDoc, updateDoc, deleteDoc, logSystemAction } = useDB();

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    country: "",
    city: "",
    latitude: 0,
    longitude: 0,
    runways: 2,
    terminalCount: 2,
    operatingHours: "24 Hours",
    status: "Active"
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      code: "",
      name: "",
      country: "",
      city: "",
      latitude: 0,
      longitude: 0,
      runways: 2,
      terminalCount: 2,
      operatingHours: "24 Hours",
      status: "Active"
    });
    setShowModal(true);
  };

  const handleOpenEdit = (airport) => {
    setEditingId(airport.code);
    setFormData({
      code: airport.code,
      name: airport.name,
      country: airport.country,
      city: airport.city,
      latitude: airport.latitude,
      longitude: airport.longitude,
      runways: airport.runways,
      terminalCount: airport.terminalCount,
      operatingHours: airport.operatingHours,
      status: airport.status
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      const oldVal = airports.find(ap => ap.code === editingId);
      updateDoc("airports", editingId, formData);
      logSystemAction(currentUser.uid, currentUser.email, "Update Airport Data", "Airports", oldVal, formData);
    } else {
      const newDoc = addDoc("airports", formData);
      logSystemAction(currentUser.uid, currentUser.email, "Add Airport", "Airports", "", newDoc);
    }
    setShowModal(false);
  };

  const handleDelete = (code) => {
    if (window.confirm(`Delete airport code ${code}? This will remove it from scheduling choices.`)) {
      const oldVal = airports.find(ap => ap.code === code);
      deleteDoc("airports", code);
      logSystemAction(currentUser.uid, currentUser.email, "Delete Airport", "Airports", oldVal, "Deleted");
    }
  };

  const filteredAirports = airports.filter(ap =>
    ap.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ap.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ap.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-title">
          <h2>Airport Hubs</h2>
          <p>Configure flight terminals, runways, and geographical anchor coordinates.</p>
        </div>
        <button onClick={handleOpenAdd} className="badge badge-completed" style={{ padding: "10px 18px", fontSize: "0.85rem", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
          <FaPlus /> Add Airport Hub
        </button>
      </div>

      {/* Filter Options */}
      <div className="glass-card" style={{ marginBottom: "400px", padding: "16px" }}>
        <div style={{ position: "relative", width: "100%", maxWidth: "360px" }}>
          <FaSearch style={{ position: "absolute", left: "12px", top: "12px", color: "var(--text-secondary)" }} />
          <input
            type="text"
            placeholder="Search airport code, name, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: "36px" }}
          />
        </div>
      </div>

      {/* Cards List Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "20px" }}>
        {filteredAirports.map(ap => (
          <div key={ap.code} className="glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "1.8rem", padding: "8px", backgroundColor: "rgba(0,180,216,0.1)", borderRadius: "8px", color: "var(--primary)" }}>
                    <FaGlobe />
                  </span>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
                      {ap.city} ({ap.code})
                    </h3>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{ap.name}</span>
                  </div>
                </div>
                <span className={`badge badge-${ap.status.toLowerCase() === "active" ? "scheduled" : "cancelled"}`}>{ap.status}</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "0.8rem", marginTop: "16px", borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                <div>🌍 Country: <strong>{ap.country}</strong></div>
                <div>🛤️ Runways count: <strong>{ap.runways}</strong></div>
                <div>🏢 Terminals count: <strong>{ap.terminalCount}</strong></div>
                <div>🕒 Hours: <strong>{ap.operatingHours}</strong></div>
                <div style={{ gridColumn: "span 2", color: "var(--text-secondary)", fontSize: "0.75rem", fontStyle: "italic" }}>
                  Co-ords: {ap.latitude}° N, {ap.longitude}° E
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", borderTop: "1px solid var(--border-color)", paddingTop: "12px", justifyContent: "flex-end" }}>
              <button onClick={() => handleOpenEdit(ap)} className="icon-button" title="Edit Hub Details"><FaEdit /></button>
              <button onClick={() => handleDelete(ap.code)} className="icon-button" style={{ color: "var(--status-cancelled)" }} title="Delete Hub"><FaTrash /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Editor Modal */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="glass-card animate-fade-in" style={{ backgroundColor: "var(--bg-card)", width: "100%", maxWidth: "500px", padding: "30px" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "20px" }}>{editingId ? "Edit Airport details" : "Register Airport Hub"}</h3>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>IATA CODE</label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    placeholder="JFK"
                    disabled={!!editingId}
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="form-input"
                    style={{ marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>AIRPORT NAME</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                    style={{ marginTop: "4px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>CITY</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="form-input"
                    style={{ marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>COUNTRY</label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="form-input"
                    style={{ marginTop: "4px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>LATITUDE</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                    className="form-input"
                    style={{ marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>LONGITUDE</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                    className="form-input"
                    style={{ marginTop: "4px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>RUNWAYS</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.runways}
                    onChange={(e) => setFormData({ ...formData, runways: parseInt(e.target.value) })}
                    className="form-input"
                    style={{ marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>TERMINALS</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.terminalCount}
                    onChange={(e) => setFormData({ ...formData, terminalCount: parseInt(e.target.value) })}
                    className="form-input"
                    style={{ marginTop: "4px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>OPERATING HOURS</label>
                  <input
                    type="text"
                    required
                    value={formData.operatingHours}
                    onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                    className="form-input"
                    style={{ marginTop: "4px" }}
                  />
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
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
                <button type="button" onClick={() => setShowModal(false)} className="form-input" style={{ width: "fit-content", cursor: "pointer" }}>Cancel</button>
                <button type="submit" className="badge badge-completed" style={{ padding: "12px 20px", fontSize: "0.85rem", border: "none", cursor: "pointer" }}>
                  Save Airport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
