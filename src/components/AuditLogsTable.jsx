import React, { useState } from "react";
import { useCollection } from "../contexts/DBContext";
import { FaSearch, FaHistory } from "react-icons/fa";

export default function AuditLogsTable() {
  const [logs] = useCollection("logs");
  const [searchTerm, setSearchTerm] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All");

  const filteredLogs = logs
    .filter(log => {
      const matchSearch = 
        log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.ipAddress && log.ipAddress.includes(searchTerm));
      
      const matchModule = moduleFilter === "All" || log.module === moduleFilter;
      
      return matchSearch && matchModule;
    })
    // Sort descending by date
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Extract unique modules for filtering dropdown
  const modules = ["All", ...new Set(logs.map(log => log.module))];

  return (
    <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FaHistory style={{ color: "var(--primary)", fontSize: "1.2rem" }} />
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>System Audit Logs</h3>
        </div>
        
        {/* Controls */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ position: "relative", width: "220px" }}>
            <FaSearch style={{ position: "absolute", left: "10px", top: "12px", color: "var(--text-secondary)", fontSize: "0.85rem" }} />
            <input
              type="text"
              placeholder="Search email/action/IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px" }}
            />
          </div>
          
          <select 
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="form-input"
            style={{ width: "160px" }}
          >
            {modules.map(mod => (
              <option key={mod} value={mod}>{mod}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-container">
        {filteredLogs.length === 0 ? (
          <div style={{ padding: "32px", textAlign: "center", color: "var(--text-secondary)" }}>
            No matching audit logs found.
          </div>
        ) : (
          <table className="custom-table" style={{ fontSize: "0.8rem" }}>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Operator</th>
                <th>Action</th>
                <th>Module</th>
                <th>Old Value</th>
                <th>New Value</th>
                <th>Origin IP / Agent</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>
                      {new Date(log.date).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      {new Date(log.date).toLocaleTimeString()}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{log.userEmail}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>ID: {log.userId}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: "var(--primary)" }}>{log.action}</span>
                  </td>
                  <td>
                    <span style={{ padding: "4px 8px", borderRadius: "4px", backgroundColor: "var(--bg-input)", fontWeight: 600, fontSize: "0.75rem" }}>
                      {log.module}
                    </span>
                  </td>
                  <td style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "monospace", fontSize: "0.75rem", color: "var(--status-cancelled)" }}>
                    {log.oldValue || "—"}
                  </td>
                  <td style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "monospace", fontSize: "0.75rem", color: "var(--status-scheduled)" }}>
                    {log.newValue || "—"}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{log.ipAddress}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={log.browser}>
                      {log.browser}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
