import React, { useState } from "react";
import { useCollection } from "../contexts/DBContext";
import { exportToCSV, exportElementToPDF } from "../services/exporter";
import {
  FaChartBar, FaFileDownload, FaFilePdf, FaFileCsv,
  FaPlane, FaMoneyBillWave, FaUsers, FaChartLine
} from "react-icons/fa";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from "chart.js";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const REPORT_TABS = ["Revenue", "Flight Analytics", "Passenger Traffic", "Employee HR"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const CHART_OPTIONS = {
  responsive: true,
  plugins: { legend: { labels: { color: "#94a3b8", font: { size: 11 } } } },
  scales: {
    x: { ticks: { color: "#64748b" }, grid: { color: "rgba(255,255,255,0.04)" } },
    y: { ticks: { color: "#64748b" }, grid: { color: "rgba(255,255,255,0.04)" } }
  }
};

const PIE_OPTIONS = {
  responsive: true,
  plugins: { legend: { labels: { color: "#94a3b8", font: { size: 11 } } } }
};

export default function Reports() {
  const [tickets] = useCollection("tickets");
  const [payments] = useCollection("payments");
  const [flights] = useCollection("flights");
  const [employees] = useCollection("employees");
  const [passengers] = useCollection("passengers");
  const [payroll] = useCollection("payroll");
  const [bookings] = useCollection("bookings");
  const [airlines] = useCollection("airlines");
  const [maintenance] = useCollection("maintenance");

  const [activeTab, setActiveTab] = useState("Revenue");
  const [dateRange, setDateRange] = useState({ from: "2026-01-01", to: "2026-12-31" });

  // Revenue by Month
  const revenueByMonth = MONTHS.map((_, i) => {
    return payments.filter(p => new Date(p.date).getMonth() === i).reduce((s, p) => s + (p.amount || 0), 0);
  });

  // Flight status breakdown
  const flightStatuses = ["Scheduled", "Delayed", "Cancelled", "Completed"];
  const flightStatusCounts = flightStatuses.map(s => flights.filter(f => f.status === s).length);

  // Revenue by class
  const classes = ["Economy", "Business", "First"];
  const classRevenue = classes.map(cls =>
    tickets.filter(t => t.seatClass === cls).reduce((s, t) => s + (t.price || 0), 0)
  );

  // Passenger growth (simulated)
  const passengersByMonth = MONTHS.map((_, i) => Math.round((i + 1) * 18 + Math.random() * 30));

  // Employee by department
  const deptCounts = {};
  employees.forEach(e => { deptCounts[e.department] = (deptCounts[e.department] || 0) + 1; });
  const depts = Object.keys(deptCounts);
  const deptValues = depts.map(d => deptCounts[d]);

  // Payroll total by month
  const payrollByMonth = MONTHS.map((m) => payroll.filter(p => p.month === m).reduce((s, p) => s + (p.netSalary || 0), 0));

  // KPIs
  const totalRevenue = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const totalTickets = tickets.length;
  const avgRevPerTicket = totalTickets ? Math.round(totalRevenue / totalTickets) : 0;
  const loadFactor = flights.length ? Math.round((flights.reduce((s, f) => s + (f.bookedSeats || 0), 0) / flights.reduce((s, f) => s + (f.availableSeats || 200), 0)) * 100) : 0;

  const downloadReport = (format) => {
    const data = format === "revenue"
      ? payments.map(p => ({ ID: p.id, Date: p.date, Amount: p.amount, Tax: p.tax, Method: p.method, Status: p.status }))
      : format === "flights"
      ? flights.map(f => ({ ID: f.id, FlightNo: f.flightNumber, Origin: f.origin, Destination: f.destination, Date: f.departureDate, Status: f.status, BookedSeats: f.bookedSeats }))
      : format === "passengers"
      ? passengers.map(p => ({ ID: p.id, Name: p.name, Nationality: p.nationality, Email: p.email, Phone: p.phone }))
      : employees.map(e => ({ ID: e.id, Name: e.name, Role: e.role, Department: e.department, Salary: e.salary, JoinDate: e.joiningDate, Status: e.status }));

    exportToCSV(data, `${format}_report_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const primaryColor = "#00b4d8";
  const COLORS = ["#00b4d8", "#a855f7", "#f59e0b", "#10b981", "#ef4444", "#3b82f6", "#ec4899", "#84cc16"];

  const chartBtnStyle = (active) => ({
    padding: "7px 14px", borderRadius: "6px", border: "1px solid var(--border-color)",
    backgroundColor: active ? "var(--primary)" : "transparent",
    color: active ? "white" : "var(--text-secondary)",
    fontWeight: 600, fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px"
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-title">
          <h2>Analytics & Reports</h2>
          <p>Revenue analytics, flight metrics, passenger traffic, and HR payroll intelligence.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => downloadReport("revenue")} style={chartBtnStyle(false)}><FaFileCsv /> Revenue CSV</button>
          <button onClick={() => downloadReport("flights")} style={chartBtnStyle(false)}><FaFileCsv /> Flights CSV</button>
          <button onClick={() => exportElementToPDF("reports-root", "reports.pdf")} style={{ ...chartBtnStyle(false), borderColor: "var(--status-cancelled)", color: "var(--status-cancelled)" }}><FaFilePdf /> Export PDF</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: "16px", marginBottom: "28px" }}>
        {[
          { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: <FaMoneyBillWave />, color: "var(--primary)" },
          { label: "Total Tickets Sold", value: totalTickets.toLocaleString(), icon: <FaChartLine />, color: "#a855f7" },
          { label: "Avg Revenue / Ticket", value: `$${avgRevPerTicket.toLocaleString()}`, icon: <FaChartBar />, color: "#f59e0b" },
          { label: "Load Factor", value: `${loadFactor}%`, icon: <FaPlane />, color: "#10b981" },
          { label: "Total Employees", value: employees.length, icon: <FaUsers />, color: "#3b82f6" },
          { label: "Total Flights", value: flights.length, icon: <FaPlane />, color: "#ec4899" },
        ].map(kpi => (
          <div key={kpi.label} className="glass-card" style={{ padding: "18px", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "10px", backgroundColor: `${kpi.color}18`, color: kpi.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>
              {kpi.icon}
            </div>
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{kpi.value}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", backgroundColor: "var(--bg-input)", padding: "4px", borderRadius: "10px", width: "fit-content" }}>
        {REPORT_TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "9px 18px", borderRadius: "7px", border: "none", backgroundColor: activeTab === tab ? "var(--bg-card)" : "transparent", color: activeTab === tab ? "var(--primary)" : "var(--text-secondary)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", boxShadow: activeTab === tab ? "var(--shadow-sm)" : "none" }}>
            {tab}
          </button>
        ))}
      </div>

      <div id="reports-root">
        {/* REVENUE TAB */}
        {activeTab === "Revenue" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div className="glass-card">
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "16px", color: "var(--text-secondary)" }}>MONTHLY REVENUE</h3>
              <Bar data={{
                labels: MONTHS,
                datasets: [{ label: "Revenue ($)", data: revenueByMonth, backgroundColor: `${primaryColor}80`, borderColor: primaryColor, borderWidth: 2, borderRadius: 6 }]
              }} options={CHART_OPTIONS} />
            </div>
            <div className="glass-card">
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "16px", color: "var(--text-secondary)" }}>REVENUE BY CLASS</h3>
              <Doughnut data={{
                labels: classes,
                datasets: [{ data: classRevenue, backgroundColor: [primaryColor, "#a855f7", "#f59e0b"], borderWidth: 0 }]
              }} options={PIE_OPTIONS} />
            </div>
            <div className="glass-card">
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "16px", color: "var(--text-secondary)" }}>REVENUE TREND (CUMULATIVE)</h3>
              <Line data={{
                labels: MONTHS,
                datasets: [{ label: "Cumulative Revenue", data: revenueByMonth.map((_, i) => revenueByMonth.slice(0, i + 1).reduce((a, b) => a + b, 0)), borderColor: primaryColor, fill: true, backgroundColor: `${primaryColor}15`, tension: 0.4, pointBackgroundColor: primaryColor }]
              }} options={CHART_OPTIONS} />
            </div>
            <div className="glass-card">
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "16px", color: "var(--text-secondary)" }}>PAYMENT METHODS</h3>
              <Pie data={{
                labels: [...new Set(payments.map(p => p.method))],
                datasets: [{ data: [...new Set(payments.map(p => p.method))].map(m => payments.filter(p => p.method === m).length), backgroundColor: COLORS, borderWidth: 0 }]
              }} options={PIE_OPTIONS} />
            </div>
          </div>
        )}

        {/* FLIGHT ANALYTICS */}
        {activeTab === "Flight Analytics" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div className="glass-card">
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "16px", color: "var(--text-secondary)" }}>FLIGHT STATUS DISTRIBUTION</h3>
              <Doughnut data={{
                labels: flightStatuses,
                datasets: [{ data: flightStatusCounts, backgroundColor: ["#00b4d8", "#f59e0b", "#ef4444", "#10b981"], borderWidth: 0 }]
              }} options={PIE_OPTIONS} />
            </div>
            <div className="glass-card">
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "16px", color: "var(--text-secondary)" }}>FLIGHTS PER MONTH (SIMULATED)</h3>
              <Bar data={{
                labels: MONTHS,
                datasets: [{ label: "Flights", data: MONTHS.map((_, i) => Math.round(30 + i * 5 + Math.random() * 15)), backgroundColor: "#a855f780", borderColor: "#a855f7", borderWidth: 2, borderRadius: 6 }]
              }} options={CHART_OPTIONS} />
            </div>
            <div className="glass-card" style={{ gridColumn: "span 2" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "16px", color: "var(--text-secondary)" }}>LOAD FACTOR PER MONTH</h3>
              <Line data={{
                labels: MONTHS,
                datasets: [{ label: "Load Factor (%)", data: MONTHS.map(() => Math.round(60 + Math.random() * 30)), borderColor: "#10b981", fill: true, backgroundColor: "#10b98115", tension: 0.4, pointBackgroundColor: "#10b981" }]
              }} options={CHART_OPTIONS} />
            </div>
          </div>
        )}

        {/* PASSENGER TRAFFIC */}
        {activeTab === "Passenger Traffic" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div className="glass-card">
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "16px", color: "var(--text-secondary)" }}>PASSENGER TRAFFIC BY MONTH</h3>
              <Line data={{
                labels: MONTHS,
                datasets: [{ label: "Passengers", data: passengersByMonth, borderColor: "#f59e0b", fill: true, backgroundColor: "#f59e0b15", tension: 0.4, pointBackgroundColor: "#f59e0b" }]
              }} options={CHART_OPTIONS} />
            </div>
            <div className="glass-card">
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "16px", color: "var(--text-secondary)" }}>NATIONALITY BREAKDOWN</h3>
              <Pie data={{
                labels: [...new Set(passengers.map(p => p.nationality))].slice(0, 6),
                datasets: [{ data: [...new Set(passengers.map(p => p.nationality))].slice(0, 6).map(n => passengers.filter(p => p.nationality === n).length), backgroundColor: COLORS, borderWidth: 0 }]
              }} options={PIE_OPTIONS} />
            </div>
            <div className="glass-card">
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "16px", color: "var(--text-secondary)" }}>SEAT CLASS POPULARITY</h3>
              <Bar data={{
                labels: classes,
                datasets: [{ label: "Tickets", data: classes.map(c => tickets.filter(t => t.seatClass === c).length), backgroundColor: ["#00b4d880", "#a855f780", "#f59e0b80"], borderColor: ["#00b4d8", "#a855f7", "#f59e0b"], borderWidth: 2, borderRadius: 6 }]
              }} options={CHART_OPTIONS} />
            </div>
            <div className="glass-card">
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "16px", color: "var(--text-secondary)" }}>GENDER DISTRIBUTION</h3>
              <Doughnut data={{
                labels: ["Male", "Female", "Other"],
                datasets: [{ data: [passengers.filter(p => p.gender === "Male").length, passengers.filter(p => p.gender === "Female").length, passengers.filter(p => p.gender === "Other").length], backgroundColor: ["#3b82f6", "#ec4899", "#84cc16"], borderWidth: 0 }]
              }} options={PIE_OPTIONS} />
            </div>
          </div>
        )}

        {/* EMPLOYEE HR */}
        {activeTab === "Employee HR" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div className="glass-card">
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "16px", color: "var(--text-secondary)" }}>EMPLOYEES BY DEPARTMENT</h3>
              <Bar data={{
                labels: depts,
                datasets: [{ label: "Employees", data: deptValues, backgroundColor: depts.map((_, i) => COLORS[i % COLORS.length] + "80"), borderColor: depts.map((_, i) => COLORS[i % COLORS.length]), borderWidth: 2, borderRadius: 6 }]
              }} options={{ ...CHART_OPTIONS, indexAxis: "y" }} />
            </div>
            <div className="glass-card">
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "16px", color: "var(--text-secondary)" }}>EMPLOYEE STATUS</h3>
              <Pie data={{
                labels: ["Active", "On Leave", "Terminated"],
                datasets: [{ data: [employees.filter(e => e.status === "Active").length, employees.filter(e => e.status === "On Leave").length, employees.filter(e => e.status === "Terminated").length], backgroundColor: ["#10b981", "#f59e0b", "#ef4444"], borderWidth: 0 }]
              }} options={PIE_OPTIONS} />
            </div>
            <div className="glass-card" style={{ gridColumn: "span 2" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "16px", color: "var(--text-secondary)" }}>MONTHLY PAYROLL EXPENDITURE</h3>
              <Bar data={{
                labels: MONTHS,
                datasets: [{ label: "Payroll ($)", data: payrollByMonth, backgroundColor: "#6366f180", borderColor: "#6366f1", borderWidth: 2, borderRadius: 6 }]
              }} options={CHART_OPTIONS} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
