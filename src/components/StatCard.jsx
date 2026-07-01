import React from "react";

export default function StatCard({ title, value, icon, trend, trendType = "up", color = "var(--primary)" }) {
  return (
    <div className="glass-card" style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", overflow: "hidden" }}>
      {/* Background glow decoration */}
      <div 
        style={{ 
          position: "absolute", 
          top: "-20px", 
          right: "-20px", 
          width: "80px", 
          height: "80px", 
          borderRadius: "50%", 
          background: color, 
          opacity: 0.05, 
          filter: "blur(20px)" 
        }} 
      />
      
      <div>
        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {title}
        </span>
        <h3 style={{ fontSize: "1.8rem", fontWeight: 700, margin: "6px 0 0 0", color: "var(--text-primary)" }}>
          {value}
        </h3>
        {trend && (
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", fontWeight: 600, marginTop: "8px" }}>
            <span style={{ color: trendType === "up" ? "var(--status-scheduled)" : "var(--status-cancelled)" }}>
              {trendType === "up" ? "▲" : "▼"} {trend}
            </span>
            <span style={{ color: "var(--text-secondary)" }}>vs last month</span>
          </div>
        )}
      </div>

      <div 
        style={{ 
          width: "48px", 
          height: "48px", 
          borderRadius: "12px", 
          backgroundColor: `${color}15`, 
          color: color, 
          display: "flex", 
          alignItems: "center", 
          justify: "center", 
          justifyContent: "center", 
          fontSize: "1.4rem" 
        }}
      >
        {icon}
      </div>
    </div>
  );
}
