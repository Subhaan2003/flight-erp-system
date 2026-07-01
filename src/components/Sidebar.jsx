import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  FaPlane, 
  FaChartLine, 
  FaBuilding, 
  FaMapMarkerAlt, 
  FaClipboardList, 
  FaTicketAlt, 
  FaUsers, 
  FaUserTie, 
  FaTools, 
  FaSuitcase, 
  FaCheckSquare, 
  FaHeadset, 
  FaFileInvoiceDollar, 
  FaCog,
  FaSignOutAlt
} from "react-icons/fa";

export default function Sidebar() {
  const { currentUser, logout } = useAuth();
  
  if (!currentUser) return null;

  const role = currentUser.role;

  // Define sidebar menu items configuration
  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: <FaChartLine />, roles: ["*"] },
    { path: "/airlines", label: "Airlines", icon: <FaBuilding />, roles: ["Super Admin", "Airline Admin"] },
    { path: "/airports", label: "Airports", icon: <FaMapMarkerAlt />, roles: ["Super Admin", "Airline Admin", "Flight Manager"] },
    { path: "/aircrafts", label: "Aircrafts", icon: <FaPlane />, roles: ["Super Admin", "Airline Admin", "Flight Manager"] },
    { path: "/flights", label: "Flight Schedules", icon: <FaClipboardList />, roles: ["Super Admin", "Airline Admin", "Flight Manager", "Pilot", "Cabin Crew"] },
    { path: "/bookings", label: "Book Tickets", icon: <FaTicketAlt />, roles: ["Super Admin", "Reservation Manager", "Passenger"] },
    { path: "/passengers", label: "Passengers", icon: <FaUsers />, roles: ["Super Admin", "Reservation Manager", "Customer Support"] },
    { path: "/employees", label: "Employee & HR", icon: <FaUserTie />, roles: ["Super Admin", "HR Manager", "Finance Manager"] },
    { path: "/operations", label: "Baggage & Cargo", icon: <FaSuitcase />, roles: ["Super Admin", "Flight Manager", "Pilot", "Cabin Crew"] },
    { path: "/check-in", label: "Check-in & Boarding", icon: <FaCheckSquare />, roles: ["Super Admin", "Reservation Manager", "Passenger"] },
    { path: "/support", label: "Help Desk", icon: <FaHeadset />, roles: ["Super Admin", "Customer Support", "Passenger"] },
    { path: "/reports", label: "Reports & Analytics", icon: <FaFileInvoiceDollar />, roles: ["Super Admin", "Finance Manager", "Airline Admin"] },
    { path: "/settings", label: "Settings & Logs", icon: <FaCog />, roles: ["Super Admin"] }
  ];

  const visibleItems = menuItems.filter(item => 
    item.roles.includes("*") || item.roles.includes(role)
  );

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <span style={{ fontSize: "1.6rem" }}>✈️</span>
        <div className="sidebar-brand">AeroERP Systems</div>
      </div>
      
      <div className="sidebar-menu">
        {visibleItems.map(item => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-link-icon" style={{ fontSize: '1.1rem', display: 'flex' }}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px' }}>
          <img 
            src={currentUser.photoURL || "https://api.dicebear.com/7.x/adventurer/svg?seed=Aero"} 
            alt="profile" 
            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }} 
          />
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {currentUser.displayName}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {currentUser.role}
            </div>
          </div>
        </div>
        <button 
          onClick={logout} 
          className="sidebar-link" 
          style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', marginTop: '8px' }}
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
