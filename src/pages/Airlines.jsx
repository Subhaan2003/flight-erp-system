import React, { useState } from "react";
import { useCollection, useDB } from "../contexts/DBContext";
import { useAuth } from "../contexts/AuthContext";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaBuilding } from "react-icons/fa";

export default function Airlines() {
  const { currentUser } = useAuth();
  const [airlines, loading] = useCollection("airlines");
  const { addDoc, updateDoc, deleteDoc, logSystemAction } = useDB();

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");

  // Modal / Form States
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    logo: "✈️",
    country: "",
    headOffice: "",
    website: "",
    email: "",
    phone: "",
    description: "",
    status: "Active"
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: "",
      logo: "✈️",
      country: "",
      headOffice: "",
      website: "",
      email: "",
      phone: "",
      description: "",
      status: "Active"
    });
    setShowModal(true);
  };

  const handleOpenEdit = (airline) => {
    setEditingId(airline.id);
    setFormData({
      name: airline.name,
      logo: airline.logo || "✈️",
      country: airline.country,
      headOffice: airline.headOffice,
      website: airline.website,
      email: airline.email,
      phone: airline.phone,
      description: airline.description,
      status: airline.status
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      const oldVal = airlines.find(a => a.id === editingId);
      updateDoc("airlines", editingId, formData);
      logSystemAction(currentUser.uid, currentUser.email, "Update Airline Profile", "Airlines", oldVal, formData);
    } else {
      const newDoc = addDoc("airlines", formData);
      logSystemAction(currentUser.uid, currentUser.email, "Add Airline", "Airlines", "", newDoc);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this airline? This action is irreversible.")) {
      const oldVal = airlines.find(a => a.id === id);
      deleteDoc("airlines", id);
      logSystemAction(currentUser.uid, currentUser.email, "Delete Airline Profile", "Airlines", oldVal, "Deleted");
    }
  };

  const filteredAirlines = airlines.filter(a =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-title">
          <h2>Airline Carriers</h2>
          <p>Register and manage international passenger and cargo carriers.</p>
        </div>
        <button onClick={handleOpenAdd} className="badge badge-completed" style={{ padding: "10px 18px", fontSize: "0.85rem", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
          <FaPlus /> Register Airline
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-card" style={{ marginBottom: "400px", padding: "16px" }}>
        <div style={{ position: "relative", width: "100%", maxWidth: "360px" }}>
          <FaSearch style={{ position: "absolute", left: "12px", top: "12px", color: "var(--text-secondary)" }} />
          <input
            type="text"
            placeholder="Search airline or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: "36px" }}
          />
        </div>
      </div>

      {/* Cards List Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
        {filteredAirlines.map(a => (
          <div key={a.id} className="glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "2rem", padding: "8px", backgroundColor: "var(--bg-input)", borderRadius: "8px" }}>
                    {a.logo}
                  </span>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>{a.name}</h3>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{a.country}</span>
                  </div>
                </div>
                <span className={`badge badge-${a.status.toLowerCase() === "active" ? "scheduled" : "cancelled"}`}>{a.status}</span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "12px" }}>
                {a.description}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.8rem", marginTop: "16px", borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                <div>📍 Head Office: <strong>{a.headOffice}</strong></div>
                <div>📧 Contact: <strong>{a.email}</strong></div>
                <div>📞 Phone: <strong>{a.phone}</strong></div>
                <div>🌐 Website: <a href={a.website} target="_blank" rel="noreferrer" style={{ fontWeight: 600 }}>{a.website.replace("https://", "")}</a></div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", borderTop: "1px solid var(--border-color)", paddingTop: "12px", justifyContent: "flex-end" }}>
              <button onClick={() => handleOpenEdit(a)} className="icon-button" title="Edit Properties"><FaEdit /></button>
              <button onClick={() => handleDelete(a.id)} className="icon-button" style={{ color: "var(--status-cancelled)" }} title="Delete Carrier"><FaTrash /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Editor Modal */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="glass-card animate-fade-in" style={{ backgroundColor: "var(--bg-card)", width: "100%", maxWidth: "500px", padding: "30px" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "20px" }}>{editingId ? "Edit Airline" : "Register New Airline"}</h3>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>AIRLINE NAME</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  style={{ marginTop: "4px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>LOGO ICON</label>
                  <input
                    type="text"
                    required
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
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

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>HEAD OFFICE LOCATION</label>
                <input
                  type="text"
                  required
                  value={formData.headOffice}
                  onChange={(e) => setFormData({ ...formData, headOffice: e.target.value })}
                  className="form-input"
                  style={{ marginTop: "4px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>WEBSITE URL</label>
                <input
                  type="url"
                  required
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="form-input"
                  style={{ marginTop: "4px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>EMAIL</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input"
                    style={{ marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>PHONE</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="form-input"
                    style={{ marginTop: "4px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>DESCRIPTION</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-input"
                  style={{ marginTop: "4px", minHeight: "60px", resize: "vertical" }}
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
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
                <button type="button" onClick={() => setShowModal(false)} className="form-input" style={{ width: "fit-content", cursor: "pointer" }}>Cancel</button>
                <button type="submit" className="badge badge-completed" style={{ padding: "12px 20px", fontSize: "0.85rem", border: "none", cursor: "pointer" }}>
                  Save Carrier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
