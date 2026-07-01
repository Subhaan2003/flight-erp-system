import React, { useState } from "react";
import { useDB } from "../contexts/DBContext";
import { useAuth } from "../contexts/AuthContext";
import AuditLogsTable from "../components/AuditLogsTable";
import { FaSave, FaCog, FaDatabase, FaShieldAlt, FaBell, FaTrash, FaCloud, FaSync } from "react-icons/fa";
import { initFirebase, saveFirebaseConfig, isFirebaseConnected, getFirebaseConfig } from "../services/db";
import { seedFirestoreDatabase } from "../services/seedFirebase";
import { firebaseSeedDemoAuthUsers } from "../services/firebaseAuth";

const EMPTY_FIREBASE_FORM = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};

export default function Settings() {
  const { currentUser } = useAuth();
  const { getDoc, updateDoc, logSystemAction } = useDB();
  const settings = getDoc("settings") || {};
  const firebaseConnected = isFirebaseConnected();
  const savedConfig = getFirebaseConfig();

  const [form, setForm] = useState({
    systemName: settings.systemName || "AeroERP Systems",
    timezone: settings.timezone || "UTC",
    currency: settings.currency || "USD",
    dateFormat: settings.dateFormat || "MM/DD/YYYY",
    cancellationWindowHours: settings.cancellationWindowHours || 24,
    refundPolicy: settings.refundPolicy || "",
    emailNotifications: settings.emailNotifications ?? true,
    smsNotifications: settings.smsNotifications ?? true,
    twoFactorAuth: settings.twoFactorAuth ?? false,
    supportEmail: settings.supportEmail || "",
    supportPhone: settings.supportPhone || "",
    ...EMPTY_FIREBASE_FORM,
    ...(savedConfig || {}),
  });

  const [savedMsg, setSavedMsg] = useState("");
  const [activeTab, setActiveTab] = useState("general");
  const [busy, setBusy] = useState("");

  const flash = (msg) => {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(""), 5000);
  };

  const handleSave = () => {
    const { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId, ...settingsToSave } = form;
    updateDoc("settings", null, settingsToSave);
    logSystemAction(currentUser.uid, currentUser.email, "Update System Settings", "Settings", settings, settingsToSave);
    flash("Settings saved successfully.");
  };

  const handleConnectFirebase = () => {
    const config = {
      apiKey: form.apiKey.trim(),
      authDomain: form.authDomain.trim(),
      projectId: form.projectId.trim(),
      storageBucket: form.storageBucket.trim(),
      messagingSenderId: form.messagingSenderId.trim(),
      appId: form.appId.trim(),
    };

    if (!config.apiKey || !config.projectId || !config.authDomain) {
      flash("API Key, Auth Domain, and Project ID are required.");
      return;
    }

    saveFirebaseConfig(config);
    const ok = initFirebase(config);
    if (ok) {
      flash("Firebase connected! Reloading to activate cloud database and auth...");
      setTimeout(() => window.location.reload(), 1200);
    } else {
      flash("Failed to connect Firebase. Check your credentials.");
    }
  };

  const handleSeedFirestore = async () => {
    if (!window.confirm("Upload all demo ERP data to Firestore? Existing collections will be skipped.")) return;
    setBusy("seed");
    try {
      const report = await seedFirestoreDatabase();
      flash(`Firestore seeded: ${report.seeded.length} collections. Skipped: ${report.skipped.join(", ") || "none"}.`);
    } catch (err) {
      flash(err.message);
    } finally {
      setBusy("");
    }
  };

  const handleSeedAuthUsers = async () => {
    if (!window.confirm("Create demo login accounts in Firebase Auth? Password will be admin123 for all.")) return;
    setBusy("auth");
    try {
      const report = await firebaseSeedDemoAuthUsers("admin123");
      flash(
        `Auth accounts — created: ${report.created.length}, already exist: ${report.skipped.length}, failed: ${report.failed.length}`
      );
    } catch (err) {
      flash(err.message);
    } finally {
      setBusy("");
    }
  };

  const handleClearData = (collection) => {
    if (window.confirm(`Clear all ${collection} data from local storage? This cannot be undone.`)) {
      localStorage.removeItem(`aero_db_${collection}`);
      logSystemAction(currentUser.uid, currentUser.email, `Clear Collection: ${collection}`, "Settings", "Data Present", "Cleared");
      flash(`${collection} local data cleared. Refresh to see changes.`);
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: <FaCog /> },
    { id: "notifications", label: "Notifications", icon: <FaBell /> },
    { id: "security", label: "Security", icon: <FaShieldAlt /> },
    { id: "database", label: "Firebase", icon: <FaDatabase /> },
    { id: "logs", label: "Audit Logs", icon: <FaDatabase /> },
  ];

  const Field = ({ label, type = "text", fieldKey, options, placeholder }) => (
    <div>
      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>{label}</label>
      {type === "select" ? (
        <select value={form[fieldKey]} onChange={(e) => setForm({ ...form, [fieldKey]: e.target.value })} className="form-input" style={{ marginTop: "4px" }}>
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea value={form[fieldKey]} onChange={(e) => setForm({ ...form, [fieldKey]: e.target.value })} className="form-input" style={{ marginTop: "4px", minHeight: "70px", resize: "vertical" }} />
      ) : (
        <input type={type} value={form[fieldKey]} placeholder={placeholder} onChange={(e) => setForm({ ...form, [fieldKey]: type === "number" ? parseInt(e.target.value) : e.target.value })} className="form-input" style={{ marginTop: "4px" }} />
      )}
    </div>
  );

  const Toggle = ({ label, desc, fieldKey }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid var(--border-color)" }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{label}</div>
        <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "2px" }}>{desc}</div>
      </div>
      <button
        onClick={() => setForm({ ...form, [fieldKey]: !form[fieldKey] })}
        style={{
          width: "48px", height: "26px", borderRadius: "13px", border: "none", cursor: "pointer",
          backgroundColor: form[fieldKey] ? "var(--primary)" : "var(--border-color)",
          position: "relative", transition: "background 0.2s ease", flexShrink: 0,
        }}
      >
        <span style={{
          position: "absolute", top: "3px", left: form[fieldKey] ? "25px" : "3px",
          width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "white",
          transition: "left 0.2s ease", display: "block",
        }} />
      </button>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-title">
          <h2>System Settings</h2>
          <p>Configure global ERP parameters, Firebase cloud services, and review audit trails.</p>
        </div>
        {activeTab !== "logs" && activeTab !== "database" && (
          <button onClick={handleSave} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", borderRadius: "8px", border: "none", backgroundColor: "var(--primary)", color: "white", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", boxShadow: "0 4px 12px var(--primary-glow)" }}>
            <FaSave /> Save Settings
          </button>
        )}
      </div>

      {savedMsg && (
        <div style={{ padding: "12px 16px", backgroundColor: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "var(--status-scheduled)", borderRadius: "8px", fontWeight: 600, fontSize: "0.85rem", marginBottom: "20px" }}>
          ✓ {savedMsg}
        </div>
      )}

      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", borderBottom: "1px solid var(--border-color)", overflowX: "auto" }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ display: "flex", alignItems: "center", gap: "7px", padding: "12px 18px", border: "none", background: "none", borderBottom: activeTab === t.id ? "2px solid var(--primary)" : "2px solid transparent", color: activeTab === t.id ? "var(--primary)" : "var(--text-secondary)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", whiteSpace: "nowrap" }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {activeTab === "general" && (
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>General Configuration</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Field label="System Name" fieldKey="systemName" />
            <Field label="Support Email" fieldKey="supportEmail" type="email" />
            <Field label="Support Phone" fieldKey="supportPhone" />
            <Field label="Currency" fieldKey="currency" type="select" options={["USD", "EUR", "GBP", "AED", "JPY", "PKR"]} />
            <Field label="Timezone" fieldKey="timezone" type="select" options={["UTC", "UTC+1", "UTC+5", "UTC+5:30", "UTC+8", "UTC-5", "UTC-8"]} />
            <Field label="Date Format" fieldKey="dateFormat" type="select" options={["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]} />
            <Field label="Cancellation Window (hours)" fieldKey="cancellationWindowHours" type="number" />
          </div>
          <Field label="Refund Policy" fieldKey="refundPolicy" type="textarea" />
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="glass-card">
          <h3 style={{ fontSize: "1rem", fontWeight: 700, borderBottom: "1px solid var(--border-color)", paddingBottom: "10px", marginBottom: "4px" }}>Notification Channels</h3>
          <Toggle label="Email Notifications" desc="Send booking confirmations, alerts, and updates via email." fieldKey="emailNotifications" />
          <Toggle label="SMS Notifications" desc="Send SMS alerts for flight status changes and check-in reminders." fieldKey="smsNotifications" />
        </div>
      )}

      {activeTab === "security" && (
        <div className="glass-card">
          <h3 style={{ fontSize: "1rem", fontWeight: 700, borderBottom: "1px solid var(--border-color)", paddingBottom: "10px", marginBottom: "4px" }}>Security Settings</h3>
          <Toggle label="Two-Factor Authentication" desc="Require 2FA for all admin and staff logins." fieldKey="twoFactorAuth" />
          <div style={{ marginTop: "24px", padding: "16px", backgroundColor: "rgba(239,68,68,0.06)", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.2)" }}>
            <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--status-cancelled)", marginBottom: "6px" }}>⚠️ Danger Zone (Local Cache)</div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "12px" }}>Clears offline simulator data only. Does not affect Firestore when connected.</p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {["logs", "notifications", "bookings"].map((col) => (
                <button key={col} onClick={() => handleClearData(col)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "6px", border: "1px solid var(--status-cancelled)", backgroundColor: "transparent", color: "var(--status-cancelled)", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                  <FaTrash /> Clear {col}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "database" && (
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>Firebase Cloud Setup</h3>

          <div style={{ padding: "14px", backgroundColor: firebaseConnected ? "rgba(16,185,129,0.08)" : "rgba(0,180,216,0.06)", borderRadius: "8px", border: `1px solid ${firebaseConnected ? "rgba(16,185,129,0.3)" : "rgba(0,180,216,0.2)"}`, fontSize: "0.82rem", color: "var(--text-secondary)" }}>
            {firebaseConnected ? (
              <>
                <FaCloud style={{ marginRight: "6px", color: "var(--status-scheduled)" }} />
                <strong style={{ color: "var(--status-scheduled)" }}>Firebase Connected</strong> — using Firestore, Authentication, and Storage.
                {savedConfig?.projectId && <> Project: <strong>{savedConfig.projectId}</strong></>}
              </>
            ) : (
              <>
                ℹ️ Running in <strong style={{ color: "var(--primary)" }}>offline simulator mode</strong>. Add Firebase credentials below or set <code>VITE_FIREBASE_*</code> in a <code>.env</code> file, then reload.
              </>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Field label="API Key" fieldKey="apiKey" placeholder="AIzaSy..." />
            <Field label="Auth Domain" fieldKey="authDomain" placeholder="your-app.firebaseapp.com" />
            <Field label="Project ID" fieldKey="projectId" placeholder="flight-erp-system" />
            <Field label="Storage Bucket" fieldKey="storageBucket" placeholder="your-app.appspot.com" />
            <Field label="Messaging Sender ID" fieldKey="messagingSenderId" placeholder="123456789" />
            <Field label="App ID" fieldKey="appId" placeholder="1:123:web:abc" />
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button onClick={handleConnectFirebase} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", borderRadius: "8px", border: "none", backgroundColor: "var(--primary)", color: "white", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
              <FaCloud /> Connect Firebase
            </button>
            {firebaseConnected && (
              <>
                <button disabled={busy === "seed"} onClick={handleSeedFirestore} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", borderRadius: "8px", border: "1px solid var(--primary)", backgroundColor: "transparent", color: "var(--primary)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>
                  <FaSync /> {busy === "seed" ? "Seeding..." : "Seed Firestore Data"}
                </button>
                <button disabled={busy === "auth"} onClick={handleSeedAuthUsers} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", borderRadius: "8px", border: "1px solid var(--status-scheduled)", backgroundColor: "transparent", color: "var(--status-scheduled)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>
                  <FaSync /> {busy === "auth" ? "Creating..." : "Create Demo Auth Accounts"}
                </button>
              </>
            )}
          </div>

          <div style={{ padding: "14px", backgroundColor: "var(--bg-input)", borderRadius: "8px", fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            <strong>Setup checklist (Firebase Console):</strong>
            <ol style={{ margin: "8px 0 0 18px" }}>
              <li>Create a Firebase project → add a Web app → copy config values above.</li>
              <li>Enable <strong>Authentication → Email/Password</strong> sign-in method.</li>
              <li>Create a <strong>Firestore Database</strong> (production or test mode).</li>
              <li>Enable <strong>Storage</strong> for file uploads (profile photos, documents).</li>
              <li>Click <strong>Create Demo Auth Accounts</strong> first (password: admin123), then <strong>Seed Firestore Data</strong>.</li>
              <li>Deploy security rules from the <code>firebase/</code> folder in this project.</li>
            </ol>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 1, padding: "16px", backgroundColor: "var(--bg-input)", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "1.6rem", fontWeight: 700, color: firebaseConnected ? "var(--status-scheduled)" : "var(--primary)" }}>
                {firebaseConnected ? "Cloud" : "Local"}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>Database Mode</div>
            </div>
            <div style={{ flex: 1, padding: "16px", backgroundColor: "var(--bg-input)", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "1.6rem", fontWeight: 700, color: firebaseConnected ? "var(--status-scheduled)" : "var(--text-secondary)" }}>
                {firebaseConnected ? "Active" : "Mock"}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>Auth Provider</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "logs" && <AuditLogsTable />}
    </div>
  );
}
