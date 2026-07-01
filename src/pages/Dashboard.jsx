import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useCollection } from "../contexts/DBContext";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import AuditLogsTable from "../components/AuditLogsTable";
import { NavLink } from "react-router-dom";
import { 
  FaPlane, FaClipboardList, FaUsers, FaUserGraduate, 
  FaCheckCircle, FaExclamationTriangle, FaTimesCircle, 
  FaDollarSign, FaTicketAlt, FaClock, FaHeartbeat, FaPhoneAlt
} from "react-icons/fa";

export default function Dashboard() {
  const { currentUser } = useAuth();
  
  const [flights] = useCollection("flights");
  const [employees] = useCollection("employees");
  const [aircrafts] = useCollection("aircrafts");
  const [bookings] = useCollection("bookings");
  const [payments] = useCollection("payments");
  const [attendance] = useCollection("attendance");
  const [leaves] = useCollection("leaveRequests");
  const [complaints] = useCollection("complaints");
  const [tickets] = useCollection("tickets");
  const [passengers] = useCollection("passengers");

  if (!currentUser) return null;

  // DYNAMIC METRICS CALCULATIONS
  const totalFlights = flights.length;
  const todayFlights = flights.filter(f => f.departureDate === "2026-06-25").length;
  const delayedFlights = flights.filter(f => f.status === "Delayed").length;
  const cancelledFlights = flights.filter(f => f.status === "Cancelled").length;
  const activeAircraft = aircrafts.filter(a => a.status === "Active").length;
  const totalEmployees = employees.length;
  
  const pilots = employees.filter(e => e.role === "Pilot");
  const cabinCrewCount = employees.filter(e => e.role === "Cabin Crew").length;
  
  // Financial Revenue
  const totalRevenue = payments
    .filter(p => p.status === "Completed")
    .reduce((sum, p) => sum + p.amount, 0);

  // Seat Availability calculation
  const totalAvailableSeats = flights.reduce((sum, f) => sum + (f.availableSeats || 0), 0);

  // CHART DATA GENERATORS
  const flightStatusData = {
    labels: ["Scheduled", "Delayed", "Cancelled", "Completed"],
    datasets: [{
      data: [
        flights.filter(f => f.status === "Scheduled").length,
        flights.filter(f => f.status === "Delayed").length,
        flights.filter(f => f.status === "Cancelled").length,
        flights.filter(f => f.status === "Completed").length,
      ],
      backgroundColor: ["#10b981", "#f59e0b", "#ef4444", "#3b82f6"],
      borderWidth: 1
    }]
  };

  const revenueTrendData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [{
      label: "Revenue (USD)",
      data: [12000, 18500, 24000, 31000, 28000, totalRevenue],
      borderColor: "#00b4d8",
      backgroundColor: "rgba(0, 180, 216, 0.1)",
      fill: true,
      tension: 0.4
    }]
  };

  const bookingsTrendData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [{
      label: "Monthly Bookings",
      data: [15, 24, 18, bookings.length],
      backgroundColor: "#7209b7",
      borderRadius: 6
    }]
  };

  const aircraftUtilizationData = {
    labels: ["Boeing 777", "Airbus A350", "Boeing 737"],
    datasets: [{
      label: "Hours Flown This Month",
      data: [180, 240, 95],
      backgroundColor: ["rgba(0, 180, 216, 0.75)", "rgba(114, 9, 183, 0.75)", "rgba(245, 158, 11, 0.75)"]
    }]
  };

  const employeeStatsData = {
    labels: ["Pilots", "Cabin Crew", "HR", "Finance", "Others"],
    datasets: [{
      data: [
        pilots.length,
        cabinCrewCount,
        employees.filter(e => e.department === "HR").length,
        employees.filter(e => e.department === "Finance").length,
        employees.filter(e => !["Pilots", "Cabin Crew", "HR", "Finance"].includes(e.department)).length
      ],
      backgroundColor: ["#00b4d8", "#c084fc", "#10b981", "#3b82f6", "#64748b"]
    }]
  };

  // 1. SUPER ADMIN DASHBOARD
  const renderSuperAdmin = () => (
    <div>
      <div className="dashboard-grid">
        <StatCard title="Total Flights" value={totalFlights} icon={<FaClipboardList />} color="var(--primary)" />
        <StatCard title="Today's Departures" value={todayFlights} icon={<FaPlane />} color="var(--status-completed)" />
        <StatCard title="Fleet Strength" value={aircrafts.length} icon={<FaPlane />} color="var(--status-maintenance)" />
        <StatCard title="Staff Directory" value={totalEmployees} icon={<FaUsers />} color="var(--status-scheduled)" />
      </div>
      <div className="charts-grid">
        <ChartCard title="Flight Schedule Status Overview" type="doughnut" data={flightStatusData} />
        <ChartCard title="Airline Enterprise Revenue Trend" type="line" data={revenueTrendData} />
      </div>
      <div style={{ marginTop: "24px" }}>
        <AuditLogsTable />
      </div>
    </div>
  );

  // 2. AIRLINE ADMIN DASHBOARD
  const renderAirlineAdmin = () => (
    <div>
      <div className="dashboard-grid">
        <StatCard title="Active Carriers" value={activeAircraft} icon={<FaCheckCircle />} color="var(--status-scheduled)" />
        <StatCard title="Total Booked revenue" value={`$${totalRevenue.toLocaleString()}`} icon={<FaDollarSign />} color="var(--primary)" />
        <StatCard title="Delayed Operations" value={delayedFlights} icon={<FaExclamationTriangle />} color="var(--status-delayed)" />
        <StatCard title="System Cancellations" value={cancelledFlights} icon={<FaTimesCircle />} color="var(--status-cancelled)" />
      </div>
      <div className="charts-grid">
        <ChartCard title="Aircraft Utilization Profile" type="bar" data={aircraftUtilizationData} />
        <ChartCard title="Total Booking Growth Profile" type="bar" data={bookingsTrendData} />
      </div>
    </div>
  );

  // 3. RESERVATION MANAGER DASHBOARD
  const renderReservationManager = () => (
    <div>
      <div className="dashboard-grid">
        <StatCard title="Total Booking Registry" value={bookings.length} icon={<FaTicketAlt />} color="var(--primary)" />
        <StatCard title="Available Seats Inventory" value={totalAvailableSeats} icon={<FaPlane />} color="var(--status-scheduled)" />
        <StatCard title="Issued Boarding Passes" value={tickets.filter(t => t.status === "Active").length} icon={<FaCheckCircle />} color="var(--status-completed)" />
        <StatCard title="Unassigned Bookings" value={bookings.filter(b => b.status === "Pending").length} icon={<FaClock />} color="var(--status-delayed)" />
      </div>
      <div className="charts-grid">
        <ChartCard title="Monthly Sales Curve" type="line" data={revenueTrendData} />
        <ChartCard title="Seated Booking Progress" type="bar" data={bookingsTrendData} />
      </div>
      <div style={{ marginTop: "24px", textAlign: "center" }}>
        <NavLink to="/bookings" className="badge badge-completed" style={{ padding: "12px 24px", fontSize: "0.9rem" }}>
          Launch Reservation Booker Console
        </NavLink>
      </div>
    </div>
  );

  // 4. FLIGHT MANAGER DASHBOARD
  const renderFlightManager = () => (
    <div>
      <div className="dashboard-grid">
        <StatCard title="Total Dispatch Flights" value={totalFlights} icon={<FaClipboardList />} color="var(--primary)" />
        <StatCard title="Operational Delayed" value={delayedFlights} icon={<FaExclamationTriangle />} color="var(--status-delayed)" />
        <StatCard title="Operational Cancelled" value={cancelledFlights} icon={<FaTimesCircle />} color="var(--status-cancelled)" />
        <StatCard title="Active Aircraft Assigned" value={activeAircraft} icon={<FaPlane />} color="var(--status-scheduled)" />
      </div>
      <div className="charts-grid">
        <ChartCard title="Status Statistics Chart" type="doughnut" data={flightStatusData} />
        <ChartCard title="Aircraft Fleet Availability Profiles" type="bar" data={aircraftUtilizationData} />
      </div>
    </div>
  );

  // 5. PILOT DASHBOARD
  const renderPilot = () => {
    // Robert Kane is Pilot ID emp-pilot1
    const myFlights = flights.filter(f => f.captainId === "emp-pilot1" || f.coPilotId === "emp-pilot1");
    return (
      <div>
        <div className="dashboard-grid">
          <StatCard title="Assigned Flight Roster" value={myFlights.length} icon={<FaClipboardList />} color="var(--primary)" />
          <StatCard title="Total Flight Hours Logging" value="7,420 Hours" icon={<FaClock />} color="var(--status-scheduled)" />
          <StatCard title="Medical Certificate Status" value="Class 1 Valid" icon={<FaHeartbeat />} color="var(--status-completed)" />
          <StatCard title="License Expiration" value="2027-05-12" icon={<FaCheckCircle />} color="var(--status-maintenance)" />
        </div>

        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "24px 0 12px 0", color: "var(--text-primary)" }}>My Active Flight Roster Schedule</h3>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Flight No</th>
                <th>Route</th>
                <th>Departure Time</th>
                <th>Arrival Time</th>
                <th>Aircraft</th>
                <th>Gate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {myFlights.map(f => (
                <tr key={f.id}>
                  <td style={{ fontWeight: 700 }}>{f.flightNumber}</td>
                  <td>{f.origin} → {f.destination}</td>
                  <td>{f.departureDate} @ {f.departureTime}</td>
                  <td>{f.arrivalDate} @ {f.arrivalTime}</td>
                  <td>{f.aircraftId}</td>
                  <td>Gate {f.gate}</td>
                  <td>
                    <span className={`badge badge-${f.status.toLowerCase()}`}>{f.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 6. CABIN CREW DASHBOARD
  const renderCabinCrew = () => {
    // Sarah Jenkins is emp-crew1
    const myFlights = flights.filter(f => f.crewIds && f.crewIds.includes("emp-crew1"));
    return (
      <div>
        <div className="dashboard-grid">
          <StatCard title="Assigned Roster Flights" value={myFlights.length} icon={<FaClipboardList />} color="var(--primary)" />
          <StatCard title="Assigned Duty Hours" value="120 Hours" icon={<FaClock />} color="var(--status-scheduled)" />
          <StatCard title="Staff Availability" value="Active Duty" icon={<FaCheckCircle />} color="var(--status-completed)" />
          <StatCard title="Upcoming Leaves" value="1 Sick Leave" icon={<FaExclamationTriangle />} color="var(--status-delayed)" />
        </div>

        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "24px 0 12px 0", color: "var(--text-primary)" }}>Crew Schedule</h3>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Flight No</th>
                <th>Route</th>
                <th>Departure Time</th>
                <th>Arrival Time</th>
                <th>Gate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {myFlights.map(f => (
                <tr key={f.id}>
                  <td style={{ fontWeight: 700 }}>{f.flightNumber}</td>
                  <td>{f.origin} → {f.destination}</td>
                  <td>{f.departureDate} @ {f.departureTime}</td>
                  <td>{f.arrivalDate} @ {f.arrivalTime}</td>
                  <td>Gate {f.gate}</td>
                  <td>
                    <span className={`badge badge-${f.status.toLowerCase()}`}>{f.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 7. HR MANAGER DASHBOARD
  const renderHRManager = () => (
    <div>
      <div className="dashboard-grid">
        <StatCard title="Total Operations Staff" value={totalEmployees} icon={<FaUsers />} color="var(--primary)" />
        <StatCard title="Pending Leave Approvals" value={leaves.filter(l => l.status === "Pending").length} icon={<FaClock />} color="var(--status-delayed)" />
        <StatCard title="Assigned Pilot Rosters" value={pilots.length} icon={<FaUserGraduate />} color="var(--status-completed)" />
        <StatCard title="Attendance Registry" value={attendance.filter(a => a.date === "2026-06-23").length} icon={<FaCheckCircle />} color="var(--status-scheduled)" />
      </div>
      <div className="charts-grid">
        <ChartCard title="Employee Department Profiles" type="doughnut" data={employeeStatsData} />
        <ChartCard title="Staff Scheduling Logs" type="bar" data={bookingsTrendData} />
      </div>
    </div>
  );

  // 8. FINANCE MANAGER DASHBOARD
  const renderFinanceManager = () => (
    <div>
      <div className="dashboard-grid">
        <StatCard title="Net Bookings revenue" value={`$${totalRevenue.toLocaleString()}`} icon={<FaDollarSign />} color="var(--primary)" />
        <StatCard title="Avg Net Ticket Pricing" value="$640" icon={<FaDollarSign />} color="var(--status-scheduled)" />
        <StatCard title="Refunds Settled Value" value="$2,450" icon={<FaExclamationTriangle />} color="var(--status-cancelled)" />
        <StatCard title="Calculated Net Payroll" value="$63,500" icon={<FaUsers />} color="var(--status-completed)" />
      </div>
      <div className="charts-grid">
        <ChartCard title="Enterprise Finance Curves" type="line" data={revenueTrendData} />
        <ChartCard title="Monthly Booking Sales" type="bar" data={bookingsTrendData} />
      </div>
    </div>
  );

  // 9. CUSTOMER SUPPORT DASHBOARD
  const renderCustomerSupport = () => (
    <div>
      <div className="dashboard-grid">
        <StatCard title="Open Help Tickets" value={complaints.filter(c => c.status === "Open").length} icon={<FaExclamationTriangle />} color="var(--status-delayed)" />
        <StatCard title="Resolved Support Cases" value={complaints.filter(c => c.status === "Resolved").length} icon={<FaCheckCircle />} color="var(--status-scheduled)" />
        <StatCard title="Average Case Rating" value="4.2 / 5.0" icon={<FaHeartbeat />} color="var(--primary)" />
        <StatCard title="Total Assisted Passengers" value="3,142" icon={<FaPhoneAlt />} color="var(--status-completed)" />
      </div>
      <div className="table-container" style={{ marginTop: "24px" }}>
        <h4 style={{ padding: "16px", fontSize: "1rem", fontWeight: 700 }}>Active Complaint Desk Filings</h4>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Passenger</th>
              <th>Category</th>
              <th>Complaint Details</th>
              <th>Priority Status</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600 }}>{c.name}</td>
                <td>{c.type}</td>
                <td>{c.message}</td>
                <td>
                  <span className={`badge badge-${c.status === "Resolved" ? "completed" : "delayed"}`}>{c.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // 10. PASSENGER DASHBOARD
  const renderPassenger = () => {
    const myPassenger = passengers.find(p => p.email === currentUser.email);
    const myPassengerId = myPassenger ? myPassenger.id : currentUser.uid;
    const myBookings = bookings.filter(b => b.passengerId === myPassengerId);
    return (
      <div>
        <div style={{ padding: "24px", backgroundColor: "linear-gradient(135deg, #00b4d810, #7209b710)", border: "1px solid var(--border-color)", borderRadius: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", marginBottom: "24px" }}>
          <div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700 }}>Plan Your Next Destination! ✈️</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "4px" }}>
              Explore availability across our airlines network and book tickets with live seat selection.
            </p>
          </div>
          <NavLink to="/bookings" className="badge badge-completed" style={{ padding: "12px 24px", fontSize: "0.85rem", textTransform: "none" }}>
            Book a Flight Ticket Now
          </NavLink>
        </div>

        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 12px 0", color: "var(--text-primary)" }}>My Active Reservations</h3>
        {myBookings.length === 0 ? (
          <div className="glass-card" style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
            No active flight reservations found in your portfolio.
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Booking PNR</th>
                  <th>Flight</th>
                  <th>Departure Date/Time</th>
                  <th>Seat Selection</th>
                  <th>Amount Paid</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myBookings.map(b => {
                  const flight = flights.find(f => f.id === b.flightId) || { flightNumber: "SL-MOCK", origin: "JFK", destination: "LHR", departureDate: "—", departureTime: "—" };
                  return (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 700, color: "var(--primary)" }}>{b.pnr}</td>
                      <td>
                        <strong>{flight.flightNumber}</strong> ({flight.origin} → {flight.destination})
                      </td>
                      <td>{flight.departureDate} @ {flight.departureTime}</td>
                      <td>Class: {b.seatClass} | Seat: {b.seatNumber}</td>
                      <td>${b.totalAmount}</td>
                      <td>
                        <span className={`badge badge-${b.status.toLowerCase()}`}>{b.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const getDashboardLayout = () => {
    switch (currentUser.role) {
      case "Super Admin":
        return renderSuperAdmin();
      case "Airline Admin":
        return renderAirlineAdmin();
      case "Reservation Manager":
        return renderReservationManager();
      case "Flight Manager":
        return renderFlightManager();
      case "Pilot":
        return renderPilot();
      case "Cabin Crew":
        return renderCabinCrew();
      case "HR Manager":
        return renderHRManager();
      case "Finance Manager":
        return renderFinanceManager();
      case "Customer Support":
        return renderCustomerSupport();
      case "Passenger":
      default:
        return renderPassenger();
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-title">
          <h2>Dashboard</h2>
          <p>Real-time enterprise metrics and active task lists.</p>
        </div>
      </div>
      {getDashboardLayout()}
    </div>
  );
}
