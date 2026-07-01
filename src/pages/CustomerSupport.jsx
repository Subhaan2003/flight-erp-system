import React, { useState, useRef, useEffect } from "react";
import { useCollection, useDB } from "../contexts/DBContext";
import { useAuth } from "../contexts/AuthContext";
import { sendSystemNotification } from "../services/notifier";
import { FaPlus, FaSearch, FaReply, FaHeadset, FaCommentDots, FaQuestionCircle } from "react-icons/fa";

const TABS = ["Complaints & Feedback", "Live Chat", "FAQs"];
const FAQS = [
  { q: "How do I cancel my booking?", a: "Go to the Booking page, search your PNR, click 'View Ticket', then select the 'Ticket Operations' tab to cancel." },
  { q: "What is the baggage allowance?", a: "Economy: 23kg, Business: 32kg, First Class: 40kg. Extra charges apply at $15 per kg over the limit." },
  { q: "How early should I arrive for check-in?", a: "We recommend arriving at least 2 hours before departure for domestic and 3 hours for international flights." },
  { q: "Can I change my seat after booking?", a: "Yes. Contact our reservation desk or use the self-service portal to modify your seat at least 24 hours before departure." },
  { q: "What is the refund policy for cancelled flights?", a: "Full refunds are processed within 5-7 business days to the original payment method for airline-initiated cancellations." },
  { q: "How do I get my frequent flyer number?", a: "Frequent flyer numbers are automatically generated upon your first booking and visible in your passenger profile." },
];
const BOT_RESPONSES = [
  { keywords: ["cancel", "cancellation"], response: "To cancel a booking, search your PNR in the Booking Engine, open the ticket, and use the 'Ticket Operations' tab. Refunds are processed within 5-7 business days." },
  { keywords: ["baggage", "luggage", "bag"], response: "Baggage allowances: Economy 23kg, Business 32kg, First Class 40kg. Extra baggage is charged at $15/kg." },
  { keywords: ["check-in", "checkin"], response: "Online check-in opens 48 hours before departure. Visit the Check-in Counter page and search your PNR to complete the process." },
  { keywords: ["delay", "delayed"], response: "Flight delay notifications are sent automatically via email and SMS. You can view live status on the Flight Schedules page." },
  { keywords: ["refund"], response: "Refunds for cancelled tickets are processed within 5-7 business days to the original payment method." },
  { keywords: ["hello", "hi", "hey"], response: "Hello! I'm AeroBot, your virtual assistant. How can I help you today? Ask me about bookings, baggage, check-in, or any other travel queries." },
];

export default function CustomerSupport() {
  const { currentUser } = useAuth();
  const [complaints] = useCollection("complaints");
  const [passengers] = useCollection("passengers");
  const { addDoc, updateDoc, logSystemAction } = useDB();

  const [activeTab, setActiveTab] = useState("Complaints & Feedback");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState("");

  const [complaintForm, setComplaintForm] = useState({ name: "", email: "", message: "", type: "General", rating: 5 });

  // Chat state
  const [chatMessages, setChatMessages] = useState([
    { from: "bot", text: "Hello! I'm AeroBot, your 24/7 virtual assistant. How can I help you today? Ask about bookings, baggage, check-in, or delays!" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef(null);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { from: "user", text: userMsg }]);
    setChatInput("");

    // Bot response logic
    setTimeout(() => {
      const lower = userMsg.toLowerCase();
      const match = BOT_RESPONSES.find(r => r.keywords.some(k => lower.includes(k)));
      const botReply = match ? match.response : "Thank you for your message. Our support team will review it and get back to you within 24 hours. Is there anything else I can help with?";
      setChatMessages(prev => [...prev, { from: "bot", text: botReply }]);
    }, 800);
  };

  const handleSubmitComplaint = (e) => {
    e.preventDefault();
    addDoc("complaints", { ...complaintForm, status: "Open", reply: "" });
    logSystemAction(currentUser.uid, currentUser.email, "Submit Complaint", "Customer Support", "", complaintForm.type);
    sendSystemNotification({ title: "New Support Case", message: `New ${complaintForm.type} complaint submitted by ${complaintForm.name}.`, type: "warning" });
    setShowComplaintModal(false);
    setComplaintForm({ name: "", email: "", message: "", type: "General", rating: 5 });
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    updateDoc("complaints", replyModal.id, { status: "Resolved", reply: replyText });
    logSystemAction(currentUser.uid, currentUser.email, "Reply to Complaint", "Customer Support", "Open", "Resolved");
    sendSystemNotification({ title: "Complaint Resolved", message: `Support case by ${replyModal.name} has been resolved.`, type: "success" });
    setReplyModal(null);
    setReplyText("");
  };

  const filtered = complaints.filter(c => {
    const match = c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || c.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const typeMatch = typeFilter === "All" || c.type === typeFilter;
    return match && typeMatch;
  });

  const types = ["All", ...new Set(complaints.map(c => c.type))];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-title">
          <h2>Customer Help Desk</h2>
          <p>Manage complaints, feedback, live chat support, and FAQs.</p>
        </div>
        {activeTab === "Complaints & Feedback" && (
          <button onClick={() => setShowComplaintModal(true)} className="badge badge-completed" style={{ padding: "10px 18px", fontSize: "0.85rem", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
            <FaPlus /> New Case
          </button>
        )}
      </div>

      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Open Cases", count: complaints.filter(c => c.status === "Open").length, color: "var(--status-delayed)" },
          { label: "Resolved", count: complaints.filter(c => c.status === "Resolved").length, color: "var(--status-scheduled)" },
          { label: "Avg Rating", count: complaints.length ? (complaints.reduce((s, c) => s + (c.rating || 0), 0) / complaints.length).toFixed(1) + " ★" : "—", color: "var(--primary)" },
          { label: "Total Cases", count: complaints.length, color: "var(--status-completed)" },
        ].map(stat => (
          <div key={stat.label} className="glass-card" style={{ padding: "16px", textAlign: "center" }}>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: stat.color }}>{stat.count}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", backgroundColor: "var(--bg-input)", padding: "4px", borderRadius: "10px", width: "fit-content" }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "9px 18px", borderRadius: "7px", border: "none", backgroundColor: activeTab === tab ? "var(--bg-card)" : "transparent", color: activeTab === tab ? "var(--primary)" : "var(--text-secondary)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", boxShadow: activeTab === tab ? "var(--shadow-sm)" : "none" }}>
            {tab}
          </button>
        ))}
      </div>

      {/* COMPLAINTS & FEEDBACK */}
      {activeTab === "Complaints & Feedback" && (
        <div>
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
              <FaSearch style={{ position: "absolute", left: "12px", top: "12px", color: "var(--text-secondary)" }} />
              <input type="text" placeholder="Search cases…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="form-input" style={{ paddingLeft: "36px" }} />
            </div>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="form-input" style={{ width: "160px" }}>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {filtered.map(c => (
              <div key={c.id} className="glass-card" style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                      <strong>{c.name}</strong>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{c.email}</span>
                      <span style={{ padding: "2px 8px", backgroundColor: "var(--bg-input)", borderRadius: "4px", fontSize: "0.72rem", fontWeight: 600 }}>{c.type}</span>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0 }}>{c.message}</p>
                    {c.reply && (
                      <div style={{ marginTop: "10px", padding: "10px 14px", backgroundColor: "rgba(0,180,216,0.05)", border: "1px solid rgba(0,180,216,0.15)", borderRadius: "6px", fontSize: "0.82rem" }}>
                        <strong style={{ color: "var(--primary)" }}>Staff Reply:</strong> {c.reply}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                    <span className={`badge badge-${c.status === "Resolved" ? "scheduled" : "delayed"}`}>{c.status}</span>
                    <div style={{ fontSize: "0.85rem", color: "var(--status-delayed)" }}>{"★".repeat(c.rating || 0)}{"☆".repeat(5 - (c.rating || 0))}</div>
                    {c.status === "Open" && (
                      <button onClick={() => { setReplyModal(c); setReplyText(""); }} style={{ padding: "6px 12px", borderRadius: "5px", border: "none", backgroundColor: "var(--primary)", color: "white", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
                        <FaReply /> Reply & Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="glass-card" style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>No support cases found.</div>
            )}
          </div>
        </div>
      )}

      {/* LIVE CHAT */}
      {activeTab === "Live Chat" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px", maxWidth: "700px" }}>
          <div className="glass-card" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
              <FaCommentDots style={{ color: "var(--primary)" }} /> AeroBot Assistant
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--status-scheduled)", display: "inline-block", boxShadow: "0 0 6px var(--status-scheduled)" }} />
            </h3>
            <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "16px" }}>AI-powered 24/7 passenger support. Type your question to get instant answers.</p>
            <div className="chat-window">
              <div className="chat-messages">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`chat-bubble ${msg.from === "user" ? "sent" : "received"}`}>
                    {msg.from === "bot" && <span style={{ fontSize: "0.7rem", color: "var(--primary)", fontWeight: 600, display: "block", marginBottom: "3px" }}>AeroBot 🤖</span>}
                    {msg.text}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="chat-input-area">
                <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSendChat()} placeholder="Type your message…" className="form-input" style={{ flex: 1 }} />
                <button onClick={handleSendChat} style={{ padding: "0 18px", borderRadius: "6px", border: "none", backgroundColor: "var(--primary)", color: "white", fontWeight: 700, cursor: "pointer" }}>Send</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQs */}
      {activeTab === "FAQs" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "800px" }}>
          {FAQS.map((faq, i) => (
            <FaqItem key={i} question={faq.q} answer={faq.a} />
          ))}
        </div>
      )}

      {/* Complaint Submit Modal */}
      {showComplaintModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "20px" }}>
          <div className="animate-fade-in glass-card" style={{ backgroundColor: "var(--bg-card)", width: "100%", maxWidth: "480px", padding: "30px" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "20px" }}>Submit Support Case</h3>
            <form onSubmit={handleSubmitComplaint} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Your Name</label>
                  <input required type="text" value={complaintForm.name} onChange={e => setComplaintForm({ ...complaintForm, name: e.target.value })} className="form-input" style={{ marginTop: "4px" }} />
                </div>
                <div>
                  <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Email</label>
                  <input required type="email" value={complaintForm.email} onChange={e => setComplaintForm({ ...complaintForm, email: e.target.value })} className="form-input" style={{ marginTop: "4px" }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Case Type</label>
                  <select value={complaintForm.type} onChange={e => setComplaintForm({ ...complaintForm, type: e.target.value })} className="form-input" style={{ marginTop: "4px" }}>
                    {["General", "Booking", "Baggage", "Flight Delay", "Staff Service", "Catering", "Refund", "Other"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Rating (1-5)</label>
                  <input type="number" min={1} max={5} value={complaintForm.rating} onChange={e => setComplaintForm({ ...complaintForm, rating: parseInt(e.target.value) })} className="form-input" style={{ marginTop: "4px" }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Message / Description</label>
                <textarea required value={complaintForm.message} onChange={e => setComplaintForm({ ...complaintForm, message: e.target.value })} className="form-input" style={{ marginTop: "4px", minHeight: "100px", resize: "vertical" }} />
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowComplaintModal(false)} className="form-input" style={{ width: "auto", cursor: "pointer" }}>Cancel</button>
                <button type="submit" className="badge badge-completed" style={{ padding: "11px 22px", border: "none", cursor: "pointer", fontSize: "0.85rem" }}>Submit Case</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {replyModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "20px" }}>
          <div className="animate-fade-in glass-card" style={{ backgroundColor: "var(--bg-card)", width: "100%", maxWidth: "480px", padding: "28px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "12px" }}>Reply to: {replyModal.name}</h3>
            <div style={{ padding: "12px", backgroundColor: "var(--bg-input)", borderRadius: "6px", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
              "{replyModal.message}"
            </div>
            <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Your Response</label>
            <textarea value={replyText} onChange={e => setReplyText(e.target.value)} className="form-input" style={{ marginTop: "4px", minHeight: "100px", resize: "vertical", width: "100%" }} placeholder="Type your response here…" />
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "16px" }}>
              <button onClick={() => setReplyModal(null)} className="form-input" style={{ width: "auto", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleSendReply} className="badge badge-completed" style={{ padding: "10px 20px", border: "none", cursor: "pointer", fontSize: "0.85rem" }}>Send & Resolve</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-card" style={{ padding: "0", cursor: "pointer", overflow: "hidden" }}>
      <div onClick={() => setOpen(!open)} style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: 600, fontSize: "0.9rem" }}>
          <FaQuestionCircle style={{ color: "var(--primary)", flexShrink: 0 }} />
          {question}
        </div>
        <span style={{ color: "var(--primary)", transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none", display: "block" }}>▼</span>
      </div>
      {open && (
        <div style={{ padding: "0 20px 16px 44px", fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6, borderTop: "1px solid var(--border-color)" }}>
          <div style={{ paddingTop: "12px" }}>{answer}</div>
        </div>
      )}
    </div>
  );
}
