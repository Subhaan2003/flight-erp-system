import React, { useState } from "react";
import { useCollection, useDB } from "../contexts/DBContext";
import { useAuth } from "../contexts/AuthContext";
import TicketModal from "../components/TicketModal";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye, FaPassport, FaHistory } from "react-icons/fa";

export default function Passengers() {
  const { currentUser } = useAuth();
  const [passengers] = useCollection("passengers");
  const [tickets] = useCollection("tickets");
  const [flights] = useCollection("flights");
  const { addDoc, updateDoc, deleteDoc, logSystemAction } = useDB();

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewHistoryId, setViewHistoryId] = useState(null);
  const [ticketModalId, setTicketModalId] = useState(null);

  const emptyForm = {
    name: "", fatherName: "", cnic: "", passport: "", nationality: "", gender: "Male",
    dob: "", email: "", phone: "", emergencyContact: "", address: "",
    visaDetails: "", frequentFlyerNumber: "", profilePhoto: ""
  };
  const [formData, setFormData] = useState(emptyForm);

  const filtered = passengers.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.passport?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cnic?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => { setEditingId(null); setFormData(emptyForm); setShowModal(true); };
  const handleOpenEdit = (p) => { setEditingId(p.id); setFormData({ ...p }); setShowModal(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      const old = passengers.find(p => p.id === editingId);
      updateDoc("passengers", editingId, formData);
      logSystemAction(currentUser.uid, currentUser.email, "Update Passenger", "Passengers", old, formData);
    } else {
      const newDoc = addDoc("passengers", formData);
      logSystemAction(currentUser.uid, currentUser.email, "Add Passenger", "Passengers", "", newDoc);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this passenger profile permanently?")) {
      const old = passengers.find(p => p.id === id);
      deleteDoc("passengers", id);
      logSystemAction(currentUser.uid, currentUser.email, "Delete Passenger", "Passengers", old, "Deleted");
    }
  };

  const getPassengerTickets = (pasId) => tickets.filter(t => t.passengerId === pasId);

  const viewingPassenger = viewHistoryId ? passengers.find(p => p.id === viewHistoryId) : null;
  const viewingTickets = viewHistoryId ? getPassengerTickets(viewHistoryId) : [];

  const FieldRow = ({ label, value, fieldKey, type = "text" }) => (
    <div>
      <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>{label}</label>
      <input type={type} value={formData[fieldKey] || ""} onChange={e => setFormData({ ...formData, [fieldKey]: e.target.value })} className="form-input" style={{ marginTop: "4px" }} />
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-title">
          <h2>Passenger Profiles</h2>
          <p>Manage passenger identities, documents, bookings history, and frequent flyer numbers.</p>
        </div>
        <button onClick={handleOpenAdd} className="badge badge-completed" style={{ padding: "10px 18px", fontSize: "0.85rem", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
          <FaPlus /> Add Passenger
        </button>
      </div>

      {/* Search */}
      <div className="glass-card" style={{ marginBottom: "400px", padding: "16px" }}>
        <div style={{ position: "relative", maxWidth: "400px" }}>
          <FaSearch style={{ position: "absolute", left: "12px", top: "12px", color: "var(--text-secondary)" }} />
          <input type="text" placeholder="Search by name, email, passport…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="form-input" style={{ paddingLeft: "36px" }} />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Passenger</th>
                <th>Documents</th>
                <th>Nationality</th>
                <th>Contact</th>
                <th>Frequent Flyer</th>
                <th>Bookings</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <img src={p.profilePhoto || `https://api.dicebear.com/7.x/adventurer/svg?seed=${p.name}`} alt="" style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} />
                      <div>
                        <div style={{ fontWeight: 700 }}>{p.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{p.gender} · {p.dob}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: "0.8rem" }}>
                      {p.passport && <div>🛂 {p.passport}</div>}
                      {p.cnic && <div>🪪 {p.cnic}</div>}
                    </div>
                  </td>
                  <td>{p.nationality}</td>
                  <td>
                    <div style={{ fontSize: "0.8rem" }}>
                      <div>{p.email}</div>
                      <div style={{ color: "var(--text-secondary)" }}>{p.phone}</div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "var(--primary)", fontWeight: 600 }}>{p.frequentFlyerNumber || "—"}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700 }}>{getPassengerTickets(p.id).length}</span>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.78rem" }}> tickets</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button onClick={() => setViewHistoryId(p.id)} className="icon-button" title="View History" style={{ color: "var(--primary)" }}><FaHistory /></button>
                      <button onClick={() => handleOpenEdit(p)} className="icon-button" title="Edit"><FaEdit /></button>
                      <button onClick={() => handleDelete(p.id)} className="icon-button" style={{ color: "var(--status-cancelled)" }} title="Delete"><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Passenger History Side Panel */}
      {viewHistoryId && viewingPassenger && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", justifyContent: "flex-end" }}>
          <div className="animate-fade-in" style={{ width: "100%", maxWidth: "500px", backgroundColor: "var(--bg-card)", height: "100%", overflowY: "auto", padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>{viewingPassenger.name}</h3>
              <button onClick={() => setViewHistoryId(null)} style={{ background: "none", border: "none", fontSize: "1.3rem", cursor: "pointer", color: "var(--text-secondary)" }}>✕</button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px", padding: "16px", backgroundColor: "var(--bg-input)", borderRadius: "10px" }}>
              <img src={viewingPassenger.profilePhoto || `https://api.dicebear.com/7.x/adventurer/svg?seed=${viewingPassenger.name}`} alt="" style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover" }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: "1rem" }}>{viewingPassenger.name}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{viewingPassenger.email} · {viewingPassenger.nationality}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 600, marginTop: "2px" }}>{viewingPassenger.frequentFlyerNumber}</div>
              </div>
            </div>

            <h4 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "12px" }}>Travel History ({viewingTickets.length} tickets)</h4>
            {viewingTickets.length === 0 ? (
              <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem", padding: "16px", textAlign: "center" }}>No travel history found.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {viewingTickets.map(t => {
                  const fl = flights.find(f => f.id === t.flightId);
                  return (
                    <div key={t.id} style={{ border: "1px solid var(--border-color)", borderRadius: "8px", padding: "12px 16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <strong style={{ color: "var(--primary)" }}>{t.pnr}</strong>
                        <span className={`badge badge-${t.status === "Active" ? "scheduled" : "cancelled"}`}>{t.status}</span>
                      </div>
                      <div style={{ fontSize: "0.82rem", marginTop: "6px", color: "var(--text-secondary)" }}>
                        {fl ? `${fl.flightNumber}: ${fl.origin} → ${fl.destination}` : t.flightId}
                      </div>
                      <div style={{ fontSize: "0.8rem", marginTop: "4px" }}>
                        Seat: <strong>{t.seatNumber} ({t.seatClass})</strong> · Booked: {t.bookingDate} · ${t.price}
                      </div>
                      <button onClick={() => { setViewHistoryId(null); setTicketModalId(t.id); }} style={{ marginTop: "8px", background: "none", border: "1px solid var(--primary)", color: "var(--primary)", borderRadius: "5px", padding: "5px 12px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}>
                        View Boarding Pass
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "20px" }}>
          <div className="animate-fade-in glass-card" style={{ backgroundColor: "var(--bg-card)", width: "100%", maxWidth: "640px", maxHeight: "90vh", overflowY: "auto", padding: "32px" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "20px" }}>{editingId ? "Edit Passenger" : "Add New Passenger"}</h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <FieldRow label="Full Name" fieldKey="name" />
                <FieldRow label="Father's Name" fieldKey="fatherName" />
                <FieldRow label="CNIC" fieldKey="cnic" />
                <FieldRow label="Passport Number" fieldKey="passport" />
                <FieldRow label="Nationality" fieldKey="nationality" />
                <div>
                  <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Gender</label>
                  <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="form-input" style={{ marginTop: "4px" }}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <FieldRow label="Date of Birth" fieldKey="dob" type="date" />
                <FieldRow label="Email" fieldKey="email" type="email" />
                <FieldRow label="Phone" fieldKey="phone" />
                <FieldRow label="Emergency Contact" fieldKey="emergencyContact" />
              </div>
              <FieldRow label="Address" fieldKey="address" />
              <FieldRow label="Visa Details" fieldKey="visaDetails" />
              <FieldRow label="Frequent Flyer Number" fieldKey="frequentFlyerNumber" />
              <FieldRow label="Profile Photo URL" fieldKey="profilePhoto" />
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
                <button type="button" onClick={() => setShowModal(false)} className="form-input" style={{ width: "auto", cursor: "pointer" }}>Cancel</button>
                <button type="submit" className="badge badge-completed" style={{ padding: "11px 22px", border: "none", cursor: "pointer", fontSize: "0.85rem" }}>Save Passenger</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {ticketModalId && <TicketModal ticketId={ticketModalId} onClose={() => setTicketModalId(null)} />}
    </div>
  );
}
