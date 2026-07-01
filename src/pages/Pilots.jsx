import React, { useState } from "react";
import { useCollection, useDB } from "../contexts/DBContext";
import { useAuth } from "../contexts/AuthContext";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaPlane, FaCertificate, FaClock } from "react-icons/fa";

export default function Pilots() {
  const { currentUser } = useAuth();
  const [pilots] = useCollection("pilots");
  const [employees] = useCollection("employees");
  const [flights] = useCollection("flights");
  const { addDoc, updateDoc, deleteDoc, logSystemAction } = useDB();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const emptyForm = {
    id: "", licenseNumber: "", licenseExpiry: "", medicalCertificate: "",
    experience: "", totalFlightHours: 0, aircraftCertified: [], assignedFlights: [], status: "Active"
  };
  const [formData, setFormData] = useState(emptyForm);
  const [certInput, setCertInput] = useState("");

  const allPilotEmployees = employees.filter(e => e.role === "Pilot");

  const enrichedPilots = pilots.map(p => ({
    ...p,
    employee: employees.find(e => e.id === p.id),
    flightDetails: (p.assignedFlights || []).map(fn => flights.find(f => f.flightNumber === fn)).filter(Boolean)
  }));

  const filtered = enrichedPilots.filter(p =>
    p.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLicenseExpiringSoon = (expiry) => {
    if (!expiry) return false;
    const days = (new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24);
    return days < 90 && days > 0;
  };
  const isExpired = (expiry) => expiry && new Date(expiry) < new Date();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      const old = pilots.find(p => p.id === editingId);
      updateDoc("pilots", editingId, formData);
      logSystemAction(currentUser.uid, currentUser.email, "Update Pilot Record", "Pilots", old, formData);
    } else {
      addDoc("pilots", formData);
      logSystemAction(currentUser.uid, currentUser.email, "Add Pilot Record", "Pilots", "", formData);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Remove this pilot record?")) {
      const old = pilots.find(p => p.id === id);
      deleteDoc("pilots", id);
      logSystemAction(currentUser.uid, currentUser.email, "Delete Pilot Record", "Pilots", old, "Deleted");
    }
  };

  const addCert = () => {
    if (certInput.trim()) {
      setFormData({ ...formData, aircraftCertified: [...(formData.aircraftCertified || []), certInput.trim()] });
      setCertInput("");
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-title">
          <h2>Pilot Roster</h2>
          <p>License tracking, medical certificates, flight hours log, and aircraft certifications.</p>
        </div>
        <button onClick={() => { setEditingId(null); setFormData(emptyForm); setCertInput(""); setShowModal(true); }} className="badge badge-completed" style={{ padding: "10px 18px", fontSize: "0.85rem", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
          <FaPlus /> Add Pilot Record
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div className="glass-card" style={{ padding: "16px", textAlign: "center" }}>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--primary)" }}>{pilots.length}</div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>Active Pilots</div>
        </div>
        <div className="glass-card" style={{ padding: "16px", textAlign: "center" }}>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--status-delayed)" }}>
            {pilots.filter(p => isLicenseExpiringSoon(p.licenseExpiry)).length}
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>License Expiring (90 days)</div>
        </div>
        <div className="glass-card" style={{ padding: "16px", textAlign: "center" }}>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--status-cancelled)" }}>
            {pilots.filter(p => isExpired(p.licenseExpiry)).length}
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>Expired Licenses</div>
        </div>
        <div className="glass-card" style={{ padding: "16px", textAlign: "center" }}>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--status-scheduled)" }}>
            {pilots.reduce((sum, p) => sum + (p.totalFlightHours || 0), 0).toLocaleString()}
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>Total Fleet Flight Hours</div>
        </div>
      </div>

      {/* Search */}
      <div className="glass-card" style={{ marginBottom: "20px", padding: "16px" }}>
        <div style={{ position: "relative", maxWidth: "360px" }}>
          <FaSearch style={{ position: "absolute", left: "12px", top: "12px", color: "var(--text-secondary)" }} />
          <input type="text" placeholder="Search pilot name or license…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="form-input" style={{ paddingLeft: "36px" }} />
        </div>
      </div>

      {/* Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "20px" }}>
        {filtered.map(p => {
          const emp = p.employee;
          const licExpiring = isLicenseExpiringSoon(p.licenseExpiry);
          const licExpired = isExpired(p.licenseExpiry);
          return (
            <div key={p.id} className="glass-card" style={{ position: "relative" }}>
              {(licExpiring || licExpired) && (
                <div style={{ position: "absolute", top: "12px", right: "12px", padding: "4px 10px", borderRadius: "20px", backgroundColor: licExpired ? "var(--status-cancelled-bg)" : "var(--status-delayed-bg)", color: licExpired ? "var(--status-cancelled)" : "var(--status-delayed)", fontSize: "0.7rem", fontWeight: 700, border: `1px solid ${licExpired ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)"}` }}>
                  {licExpired ? "⚠️ LICENSE EXPIRED" : "⚠️ EXPIRING SOON"}
                </div>
              )}

              <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
                <img src={emp?.photo || `https://api.dicebear.com/7.x/adventurer/svg?seed=${p.id}`} alt="" style={{ width: "56px", height: "56px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--primary)" }} />
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>{emp?.name || `Pilot ${p.id}`}</h3>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>Captain · {emp?.department}</div>
                  <span className={`badge badge-${p.status === "Active" ? "scheduled" : "cancelled"}`} style={{ marginTop: "4px" }}>{p.status}</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.82rem", borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                <div><FaCertificate style={{ color: "var(--primary)", marginRight: "5px" }} />License: <strong>{p.licenseNumber}</strong></div>
                <div><FaClock style={{ color: "var(--primary)", marginRight: "5px" }} />Expiry: <strong style={{ color: licExpired ? "var(--status-cancelled)" : licExpiring ? "var(--status-delayed)" : "inherit" }}>{p.licenseExpiry}</strong></div>
                <div>Medical: <strong>{p.medicalCertificate}</strong></div>
                <div>Experience: <strong>{p.experience}</strong></div>
                <div style={{ gridColumn: "span 2" }}>
                  <FaPlane style={{ color: "var(--primary)", marginRight: "5px" }} />
                  Total Flight Hours: <strong>{p.totalFlightHours?.toLocaleString()} hrs</strong>
                </div>
              </div>

              {p.aircraftCertified?.length > 0 && (
                <div style={{ marginTop: "10px" }}>
                  <div style={{ fontSize: "0.73rem", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "6px" }}>AIRCRAFT CERTIFIED</div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {p.aircraftCertified.map(ac => (
                      <span key={ac} style={{ padding: "3px 8px", backgroundColor: "rgba(0,180,216,0.1)", color: "var(--primary)", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, border: "1px solid rgba(0,180,216,0.2)" }}>{ac}</span>
                    ))}
                  </div>
                </div>
              )}

              {p.flightDetails?.length > 0 && (
                <div style={{ marginTop: "10px" }}>
                  <div style={{ fontSize: "0.73rem", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "6px" }}>ASSIGNED FLIGHTS</div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {p.flightDetails.map(f => (
                      <span key={f.id} style={{ padding: "3px 8px", backgroundColor: "var(--bg-input)", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600 }}>{f.flightNumber}</span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: "8px", marginTop: "16px", borderTop: "1px solid var(--border-color)", paddingTop: "12px", justifyContent: "flex-end" }}>
                <button onClick={() => { setEditingId(p.id); setFormData({ ...p }); setShowModal(true); }} className="icon-button" title="Edit"><FaEdit /></button>
                <button onClick={() => handleDelete(p.id)} className="icon-button" style={{ color: "var(--status-cancelled)" }} title="Delete"><FaTrash /></button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "20px" }}>
          <div className="animate-fade-in glass-card" style={{ backgroundColor: "var(--bg-card)", width: "100%", maxWidth: "560px", maxHeight: "90vh", overflowY: "auto", padding: "32px" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "400px" }}>{editingId ? "Edit Pilot Record" : "Add Pilot Record"}</h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Link to Employee</label>
                <select value={formData.id} onChange={e => setFormData({ ...formData, id: e.target.value })} className="form-input" style={{ marginTop: "4px" }} required>
                  <option value="">Select Pilot Employee</option>
                  {allPilotEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {[{ label: "License Number", key: "licenseNumber" }, { label: "License Expiry Date", key: "licenseExpiry", type: "date" }, { label: "Medical Certificate", key: "medicalCertificate" }, { label: "Experience", key: "experience" }, { label: "Total Flight Hours", key: "totalFlightHours", type: "number" }].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>{f.label}</label>
                    <input type={f.type || "text"} value={formData[f.key] || ""} onChange={e => setFormData({ ...formData, [f.key]: f.type === "number" ? parseInt(e.target.value) : e.target.value })} className="form-input" style={{ marginTop: "4px" }} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Status</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="form-input" style={{ marginTop: "4px" }}>
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Grounded">Grounded</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Aircraft Certifications</label>
                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  <input type="text" value={certInput} onChange={e => setCertInput(e.target.value)} placeholder="e.g. Boeing 777" className="form-input" style={{ flex: 1 }} />
                  <button type="button" onClick={addCert} style={{ padding: "0 14px", borderRadius: "6px", border: "none", backgroundColor: "var(--primary)", color: "white", cursor: "pointer", fontWeight: 700 }}>+</button>
                </div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                  {(formData.aircraftCertified || []).map((ac, i) => (
                    <span key={i} style={{ padding: "4px 10px", backgroundColor: "rgba(0,180,216,0.1)", borderRadius: "4px", fontSize: "0.8rem", color: "var(--primary)", cursor: "pointer" }} onClick={() => setFormData({ ...formData, aircraftCertified: formData.aircraftCertified.filter((_, j) => j !== i) })}>
                      {ac} ✕
                    </span>
                  ))}
                </div>
              </div>
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
