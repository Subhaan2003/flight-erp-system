import React, { useState } from "react";
import BoardingPass from "./BoardingPass";
import Invoice from "./Invoice";
import { FaTimes, FaPassport, FaReceipt, FaUndo } from "react-icons/fa";
import { dbGetDoc, dbUpdateDoc, dbGetCollection, logSystemAction } from "../services/db";
import { sendSystemNotification } from "../services/notifier";

export default function TicketModal({ ticketId, onClose, onUpdate }) {
  const [activeTab, setActiveTab] = useState("pass");

  if (!ticketId) return null;

  const tickets = dbGetCollection("tickets");
  const ticket = tickets.find(t => t.id === ticketId);
  if (!ticket) return null;

  const flight = dbGetDoc("flights", ticket.flightId);
  const passenger = dbGetDoc("passengers", ticket.passengerId);
  
  // Find related payment
  const payments = dbGetCollection("payments");
  const payment = payments.find(p => p.bookingId === ticket.id || p.passengerId === ticket.passengerId);
  
  // Find related booking
  const bookings = dbGetCollection("bookings");
  const booking = bookings.find(b => b.id === ticket.id || (b.flightId === ticket.flightId && b.passengerId === ticket.passengerId)) || { pnr: ticket.pnr, seatClass: ticket.seatClass, seatNumber: ticket.seatNumber };

  const handleCancelTicket = () => {
    if (window.confirm("Are you sure you want to cancel this ticket and request a refund?")) {
      // 1. Update ticket status
      dbUpdateDoc("tickets", ticket.id, { status: "Cancelled" });
      
      // 2. Update booking status if exists
      const matchingBooking = bookings.find(b => b.pnr === ticket.pnr);
      if (matchingBooking) {
        dbUpdateDoc("bookings", matchingBooking.id, { status: "Cancelled" });
      }

      // 3. Update payment status to refunded
      if (payment) {
        dbUpdateDoc("payments", payment.id, { status: "Refunded" });
      }

      // 4. Log Action
      logSystemAction(passenger.id, passenger.email, "Cancel Ticket & Refund", "Reservation", ticket, "Status: Cancelled, Payment: Refunded");

      // 5. Send Notification
      sendSystemNotification({
        title: "Ticket Cancelled",
        message: `Reservation PNR ${ticket.pnr} has been successfully cancelled and refund initiated.`,
        type: "warning",
        userId: passenger.id
      });

      if (onUpdate) onUpdate();
      onClose();
    }
  };

  return (
    <div style={{ 
      position: "fixed", 
      top: 0, 
      left: 0, 
      width: "100%", 
      height: "100%", 
      backgroundColor: "rgba(0, 0, 0, 0.6)", 
      backdropFilter: "blur(4px)",
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      zIndex: 1000,
      padding: "20px"
    }}>
      <div className="animate-fade-in" style={{ 
        backgroundColor: "var(--bg-card)", 
        border: "1px solid var(--border-color)", 
        borderRadius: "16px", 
        width: "100%", 
        maxWidth: "680px", 
        maxHeight: "90vh", 
        overflowY: "auto", 
        display: "flex", 
        flexDirection: "column",
        boxShadow: "var(--shadow-lg)"
      }}>
        {/* Modal Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid var(--border-color)" }}>
          <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>Ticket Control File: {ticket.pnr}</h3>
          <button onClick={onClose} className="icon-button" style={{ color: "var(--text-secondary)" }}>
            <FaTimes />
          </button>
        </div>

        {/* Tab Selection */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", backgroundColor: "var(--bg-input)" }}>
          <button 
            onClick={() => setActiveTab("pass")}
            style={{ 
              flex: 1, 
              padding: "14px", 
              border: "none", 
              background: activeTab === "pass" ? "var(--bg-card)" : "none", 
              borderBottom: activeTab === "pass" ? "2px solid var(--primary)" : "none",
              color: activeTab === "pass" ? "var(--primary)" : "var(--text-secondary)",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            <FaPassport /> Boarding Pass
          </button>
          
          <button 
            onClick={() => setActiveTab("invoice")}
            style={{ 
              flex: 1, 
              padding: "14px", 
              border: "none", 
              background: activeTab === "invoice" ? "var(--bg-card)" : "none", 
              borderBottom: activeTab === "invoice" ? "2px solid var(--primary)" : "none",
              color: activeTab === "invoice" ? "var(--primary)" : "var(--text-secondary)",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            <FaReceipt /> Invoice Details
          </button>

          {ticket.status !== "Cancelled" && (
            <button 
              onClick={() => setActiveTab("actions")}
              style={{ 
                flex: 1, 
                padding: "14px", 
                border: "none", 
                background: activeTab === "actions" ? "var(--bg-card)" : "none", 
                borderBottom: activeTab === "actions" ? "2px solid var(--status-cancelled)" : "none",
                color: activeTab === "actions" ? "var(--status-cancelled)" : "var(--text-secondary)",
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              <FaUndo /> Ticket Operations
            </button>
          )}
        </div>

        {/* Tab Body */}
        <div style={{ padding: "24px", flex: 1 }}>
          {activeTab === "pass" && (
            <BoardingPass ticket={ticket} flight={flight} passenger={passenger} />
          )}

          {activeTab === "invoice" && (
            <Invoice payment={payment || { id: "PAY-TEMP", amount: ticket.price, method: "Stripe", transactionId: "TXN-MOCK", status: "Completed", date: ticket.bookingDate, tax: ticket.taxes, discount: ticket.discount }} booking={booking} flight={flight} passenger={passenger} />
          )}

          {activeTab === "actions" && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: "3rem", color: "var(--status-cancelled)", marginBottom: "16px" }}>⚠️</div>
              <h4 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "8px" }}>Cancel Reservation & Process Refund</h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", maxWidth: "400px", margin: "0 auto 24px auto" }}>
                Cancelling this reservation will release seat <strong>{ticket.seatNumber}</strong> back to the aircraft inventory and issue a full refund to the original payment method.
              </p>
              
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <button 
                  onClick={onClose}
                  style={{ 
                    padding: "10px 20px", 
                    borderRadius: "6px", 
                    border: "1px solid var(--border-color)", 
                    backgroundColor: "var(--bg-card)", 
                    color: "var(--text-primary)", 
                    fontWeight: 600,
                    cursor: "pointer" 
                  }}
                >
                  Keep Reservation
                </button>
                <button 
                  onClick={handleCancelTicket}
                  style={{ 
                    padding: "10px 20px", 
                    borderRadius: "6px", 
                    border: "none", 
                    backgroundColor: "var(--status-cancelled)", 
                    color: "white", 
                    fontWeight: 600,
                    cursor: "pointer" 
                  }}
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
