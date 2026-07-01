import React from "react";
import { FaDownload, FaPrint } from "react-icons/fa";
import { exportElementToPDF } from "../services/exporter";

export default function Invoice({ payment, booking, flight, passenger, containerId = "invoice-pane" }) {
  if (!payment || !booking || !flight || !passenger) return null;

  const handleDownload = () => {
    exportElementToPDF(containerId, `Invoice_${payment.transactionId}`);
  };

  const basePrice = flight.priceEconomy || 400;
  const discount = payment.discount || 0;
  const tax = payment.tax || (basePrice * 0.1);
  const total = payment.amount;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
      <div id={containerId} style={{ 
        width: "100%", 
        maxWidth: "600px", 
        backgroundColor: "var(--bg-card)", 
        border: "1px solid var(--border-color)", 
        borderRadius: "12px", 
        padding: "32px",
        boxShadow: "var(--shadow-md)",
        color: "var(--text-primary)"
      }}>
        {/* Invoice Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid var(--border-color)", paddingBottom: "20px", marginBottom: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "1.6rem" }}>✈️</span>
              <span style={{ fontSize: "1.4rem", fontWeight: 700, letterSpacing: "0.5px" }}>AEROERP SYSTEMS</span>
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "4px" }}>
              World Aviation Center, Houston, TX<br />
              support@aeroerp.com | +1-800-AERO-ERP
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--primary)", margin: 0 }}>INVOICE</h2>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "4px" }}>
              Invoice #: {payment.id}<br />
              Date: {payment.date}
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px", fontSize: "0.85rem" }}>
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase" }}>BILLED TO:</span>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", margin: "4px 0" }}>{passenger.name}</div>
            <div style={{ color: "var(--text-secondary)" }}>
              Email: {passenger.email}<br />
              Phone: {passenger.phone}<br />
              Passport/CNIC: {passenger.passport || passenger.cnic}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase" }}>PAYMENT SUMMARY:</span>
            <div style={{ margin: "4px 0" }}>
              Method: <strong>{payment.method}</strong><br />
              Transaction ID: <strong>{payment.transactionId}</strong><br />
              PNR Code: <strong>{booking.pnr}</strong>
            </div>
            <span className="badge badge-completed" style={{ marginTop: "6px" }}>{payment.status}</span>
          </div>
        </div>

        {/* Flight Details Block */}
        <div style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "12px 16px", marginBottom: "24px", fontSize: "0.85rem" }}>
          <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>Flight Ticket Reservation Details</div>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
            <span>Flight: <strong>{flight.flightNumber}</strong> ({flight.origin} → {flight.destination})</span>
            <span>Class: <strong>{booking.seatClass}</strong> | Seat: <strong>{booking.seatNumber}</strong></span>
          </div>
        </div>

        {/* Ledger Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border-color)" }}>
              <th style={{ textAlign: "left", paddingBottom: "10px", color: "var(--text-secondary)" }}>Description</th>
              <th style={{ textAlign: "center", paddingBottom: "10px", color: "var(--text-secondary)" }}>Seat Class</th>
              <th style={{ textAlign: "right", paddingBottom: "10px", color: "var(--text-secondary)" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
              <td style={{ padding: "12px 0", fontWeight: 600 }}>Flight Seat Reservation ({flight.flightNumber})</td>
              <td style={{ padding: "12px 0", textAlign: "center" }}>{booking.seatClass}</td>
              <td style={{ padding: "12px 0", textAlign: "right" }}>${basePrice.toFixed(2)}</td>
            </tr>
            {discount > 0 && (
              <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                <td style={{ padding: "12px 0", color: "var(--status-cancelled)" }}>Discount Applied</td>
                <td style={{ padding: "12px 0", textAlign: "center" }}>-</td>
                <td style={{ padding: "12px 0", textAlign: "right", color: "var(--status-cancelled)" }}>-${discount.toFixed(2)}</td>
              </tr>
            )}
            <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
              <td style={{ padding: "12px 0", color: "var(--text-secondary)" }}>Taxes & Regulatory Fees (10%)</td>
              <td style={{ padding: "12px 0", textAlign: "center" }}>-</td>
              <td style={{ padding: "12px 0", textAlign: "right", color: "var(--text-secondary)" }}>${tax.toFixed(2)}</td>
            </tr>
            <tr>
              <td style={{ padding: "12px 0", color: "var(--text-secondary)" }}>System Service Charge</td>
              <td style={{ padding: "12px 0", textAlign: "center" }}>-</td>
              <td style={{ padding: "12px 0", textAlign: "right", color: "var(--text-secondary)" }}>$5.00</td>
            </tr>
            <tr style={{ borderTop: "2px solid var(--border-color)", fontSize: "1rem", fontWeight: 700 }}>
              <td style={{ paddingTop: "12px" }}>Total Charged</td>
              <td style={{ paddingTop: "12px" }}>-</td>
              <td style={{ paddingTop: "12px", textAlign: "right", color: "var(--primary)" }}>${(total + 5).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        {/* Disclaimer */}
        <div style={{ textAlign: "center", borderTop: "1px solid var(--border-color)", paddingTop: "16px", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
          Thank you for choosing AeroERP Systems. Please retain this invoice for your records.<br />
          For cancellations or schedule adjustments, visit the Reservation desk or Support center.
        </div>
      </div>

      {/* Control Buttons */}
      <div style={{ display: "flex", gap: "12px" }}>
        <button 
          onClick={handleDownload}
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px", 
            padding: "8px 16px", 
            borderRadius: "6px", 
            border: "1px solid var(--border-color)", 
            backgroundColor: "var(--bg-card)", 
            color: "var(--text-primary)", 
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer" 
          }}
        >
          <FaDownload /> Download PDF
        </button>
        <button 
          onClick={() => window.print()}
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px", 
            padding: "8px 16px", 
            borderRadius: "6px", 
            border: "none", 
            backgroundColor: "var(--primary)", 
            color: "white", 
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer" 
          }}
        >
          <FaPrint /> Print Invoice
        </button>
      </div>
    </div>
  );
}
