import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useCollection } from "../contexts/DBContext";
import { FaBell, FaSun, FaMoon, FaChevronDown, FaSignOutAlt, FaBars } from "react-icons/fa";
import { useLocation } from "react-router-dom";

export default function Navbar({ onToggleSidebar }) {
  const { currentUser, logout } = useAuth();
  const [notifications] = useCollection("notifications");
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = () => { setShowNotifMenu(false); setShowUserMenu(false); };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  if (!currentUser) return null;

  const getPageTitle = () => {
    const path = location.pathname;
    const titles = {
      "/dashboard": "Operations Control Center",
      "/airlines": "Airline Carrier Registry",
      "/airports": "Airport Terminals & Gates",
      "/aircrafts": "Aircraft Fleets Inventory",
      "/flights": "Schedules & Dispatch",
      "/bookings": "Ticket Booking Engine",
      "/passengers": "Passenger Portfolio",
      "/employees": "HR & Personnel Center",
      "/operations": "Cargo & Baggage Loading",
      "/check-in": "Boarding Counter",
      "/support": "Customer Help Desk",
      "/reports": "Analytics & Audit Reports",
      "/settings": "Global Configuration Settings",
    };
    return titles[path] || "ERP Control Center";
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const recentNotifs = [...notifications]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const roleBadgeColor = {
    "Super Admin": "#7c3aed",
    "Airline Admin": "#0077b6",
    "Flight Manager": "#0369a1",
    "Reservation Manager": "#0d9488",
    "Pilot": "#b45309",
    "Cabin Crew": "#be185d",
    "HR Manager": "#15803d",
    "Finance Manager": "#1d4ed8",
    "Customer Support": "#6d28d9",
    "Passenger": "#374151",
  }[currentUser.role] || "#374151";

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button type="button" className="icon-button mobile-menu-toggle" onClick={onToggleSidebar} title="Toggle navigation">
          <FaBars />
        </button>
        <div>
          <h1 style={{ fontSize: "1.3rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
            {getPageTitle()}
          </h1>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>
            Flight ERP System / {currentUser.role}
          </p>
        </div>
      </div>

      <div className="navbar-right">
        {/* Theme Toggle */}
        <button onClick={() => setTheme(t => t === "light" ? "dark" : "light")} className="icon-button" title="Toggle Theme">
          {theme === "light" ? <FaMoon /> : <FaSun />}
        </button>

        {/* Notifications */}
        <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
          <button onClick={() => { setShowNotifMenu(p => !p); setShowUserMenu(false); }} className="icon-button" title="Notifications">
            <FaBell />
            {unreadCount > 0 && (
              <span style={{ position: "absolute", top: "2px", right: "2px", width: "16px", height: "16px", backgroundColor: "var(--status-cancelled)", borderRadius: "50%", fontSize: "0.6rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", color: "white", border: "1px solid var(--bg-card)" }}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div style={{ position: "absolute", top: "48px", right: "0", width: "min(340px, calc(100vw - 24px))", maxWidth: "340px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px", boxShadow: "var(--shadow-lg)", zIndex: 200, overflow: "hidden" }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>Notifications</span>
                {unreadCount > 0 && <span style={{ fontSize: "0.72rem", color: "var(--primary)", fontWeight: 600 }}>{unreadCount} new</span>}
              </div>
              <div style={{ maxHeight: "280px", overflowY: "auto" }}>
                {recentNotifs.length === 0 ? (
                  <div style={{ padding: "24px", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.85rem" }}>No notifications</div>
                ) : recentNotifs.map(n => (
                  <div key={n.id} style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-color)", fontSize: "0.8rem" }}>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: "2px" }}>{n.title}</div>
                    <div style={{ color: "var(--text-secondary)", lineHeight: 1.4 }}>{n.message}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--primary)", marginTop: "4px" }}>
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
          <button onClick={() => { setShowUserMenu(p => !p); setShowNotifMenu(false); }} style={{ display: "flex", alignItems: "center", gap: "10px", background: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "6px 12px 6px 6px", cursor: "pointer", maxWidth: "100%" }}>
            <img
              src={currentUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${currentUser.displayName}`}
              alt="Profile"
              style={{ width: "32px", height: "32px", borderRadius: "50%", border: "2px solid var(--primary)", objectFit: "cover" }}
            />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>{currentUser.displayName}</div>
              <div style={{ fontSize: "0.68rem", fontWeight: 600, color: "white", backgroundColor: roleBadgeColor, padding: "1px 6px", borderRadius: "4px", display: "inline-block", marginTop: "2px" }}>
                {currentUser.role}
              </div>
            </div>
            <FaChevronDown style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginLeft: "2px" }} />
          </button>

          {showUserMenu && (
            <div style={{ position: "absolute", top: "52px", right: "0", width: "min(220px, calc(100vw - 24px))", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px", boxShadow: "var(--shadow-lg)", zIndex: 200, overflow: "hidden" }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-color)" }}>
                <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-primary)" }}>{currentUser.displayName}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "2px" }}>{currentUser.email}</div>
              </div>
              <div style={{ padding: "8px" }}>
                <button onClick={logout} style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", border: "none", background: "none", color: "var(--status-cancelled)", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", textAlign: "left" }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.08)"}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <FaSignOutAlt /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
