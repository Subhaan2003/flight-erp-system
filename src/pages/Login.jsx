import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { FaLock, FaEnvelope, FaUser, FaPhone, FaPassport, FaEye, FaEyeSlash, FaPlane, FaShieldAlt } from "react-icons/fa";

// Roles that can only LOGIN (no public registration)
const STAFF_ROLES = [
  "Super Admin",
  "Airline Admin",
  "Flight Manager",
  "Reservation Manager",
  "Pilot",
  "Cabin Crew",
  "HR Manager",
  "Finance Manager",
  "Customer Support"
];

// Role descriptions shown on login page
const ROLE_INFO = {
  "Passenger": { icon: "🧳", desc: "Book flights, manage reservations & boarding passes" },
  "Super Admin": { icon: "⚙️", desc: "Full system access — all modules & configuration" },
  "Airline Admin": { icon: "🏢", desc: "Manage airline carriers, fleets & scheduling" },
  "Flight Manager": { icon: "🛫", desc: "Flight dispatch, aircraft & airport operations" },
  "Reservation Manager": { icon: "🎫", desc: "Bookings, check-in & passenger ticket management" },
  "Pilot": { icon: "👨‍✈️", desc: "Flight assignments, logs & crew coordination" },
  "Cabin Crew": { icon: "💼", desc: "Passenger service, boarding & cargo operations" },
  "HR Manager": { icon: "👥", desc: "Employee records, payroll & leave management" },
  "Finance Manager": { icon: "📊", desc: "Revenue reports, payments & financial analytics" },
  "Customer Support": { icon: "🎧", desc: "Help desk, complaints & passenger assistance" },
};

export default function Login() {
  const { login, signup, forgotPassword } = useAuth();

  // Step 1: role selection. Step 2: auth form
  const [step, setStep] = useState("role"); // "role" | "form"
  const [selectedRole, setSelectedRole] = useState(null);

  // Form mode
  const [formMode, setFormMode] = useState("login"); // "login" | "register" | "forgot"

  // Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [passport, setPassport] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const isPassenger = selectedRole === "Passenger";
  const isStaff = STAFF_ROLES.includes(selectedRole);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setFormMode("login");
    setErrorMsg("");
    setSuccessMsg("");
    setStep("form");
  };

  const handleBack = () => {
    setStep("role");
    setSelectedRole(null);
    setErrorMsg("");
    setSuccessMsg("");
    setEmail("");
    setPassword("");
    setName("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);
    try {
      if (formMode === "forgot") {
        await forgotPassword(email);
        setSuccessMsg("Password reset instructions have been sent to your email.");
        setFormMode("login");
      } else if (formMode === "register") {
        await signup(email, password, name, selectedRole, { phone, cnicPassport: passport });
      } else {
        await login(email, password, rememberMe);
      }
    } catch (err) {
      setErrorMsg(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    paddingLeft: "40px",
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.04)",
    color: "white",
    height: "46px"
  };

  const iconStyle = {
    position: "absolute",
    left: "13px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "rgba(255,255,255,0.35)",
    fontSize: "0.85rem",
    pointerEvents: "none"
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      background: "linear-gradient(135deg, #060a12 0%, #0a1628 50%, #060a12 100%)",
      color: "white",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Left Branding Panel */}
      <div className="login-left-panel" style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "60px",
        background: "linear-gradient(160deg, rgba(0,180,216,0.07) 0%, transparent 60%)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        minWidth: 0
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "56px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "linear-gradient(135deg, #00b4d8, #7209b7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FaPlane style={{ color: "white", fontSize: "1.1rem" }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>AeroERP Systems</div>
            <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", letterSpacing: "1.5px", textTransform: "uppercase" }}>Enterprise Aviation Platform</div>
          </div>
        </div>

        <div style={{ maxWidth: "400px" }}>
          <h1 style={{ fontSize: "2.4rem", fontWeight: 800, lineHeight: 1.15, marginBottom: "18px" }}>
            Flight Operations<br />
            <span style={{ background: "linear-gradient(90deg, #00b4d8, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Command Center
            </span>
          </h1>
          <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.8, marginBottom: "40px" }}>
            A unified platform for airlines, flight scheduling, passenger reservations, crew management, and real-time analytics.
          </p>
          {[
            { icon: "🛫", label: "Flight Schedule Management" },
            { icon: "🎫", label: "Passenger Booking & Check-in" },
            { icon: "👥", label: "Crew & HR Operations" },
            { icon: "📊", label: "Revenue & Analytics Reporting" },
          ].map(f => (
            <div key={f.label} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "7px", backgroundColor: "rgba(0,180,216,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", flexShrink: 0 }}>{f.icon}</div>
              <span style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>{f.label}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "auto", fontSize: "0.7rem", color: "rgba(255,255,255,0.18)" }}>
          © {new Date().getFullYear()} AeroERP Systems. All rights reserved.
        </div>
      </div>

      {/* Right Auth Panel */}
      <div style={{
        width: "480px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "48px 40px",
        backgroundColor: "rgba(8,12,22,0.97)",
        borderLeft: "1px solid rgba(255,255,255,0.06)",
        overflowY: "auto"
      }}>

        {/* ── STEP 1: Role Selection ── */}
        {step === "role" && (
          <div className="animate-fade-in">
            <div style={{ marginBottom: "32px" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 6px 0" }}>Select Your Role</h2>
              <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", margin: 0 }}>
                Choose how you're accessing the system to continue.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {Object.entries(ROLE_INFO).map(([role, info]) => (
                <button
                  key={role}
                  onClick={() => handleRoleSelect(role)}
                  style={{
                    display: "flex", alignItems: "center", gap: "14px",
                    padding: "14px 16px", borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backgroundColor: "rgba(255,255,255,0.03)",
                    color: "white", cursor: "pointer", textAlign: "left",
                    transition: "all 0.15s ease", width: "100%"
                  }}
                  onMouseOver={e => { e.currentTarget.style.backgroundColor = "rgba(0,180,216,0.08)"; e.currentTarget.style.borderColor = "rgba(0,180,216,0.3)"; }}
                  onMouseOut={e => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                >
                  <span style={{ fontSize: "1.4rem", width: "36px", textAlign: "center", flexShrink: 0 }}>{info.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>{role}</div>
                    <div style={{ fontSize: "0.73rem", color: "rgba(255,255,255,0.38)", marginTop: "2px" }}>{info.desc}</div>
                  </div>
                  {STAFF_ROLES.includes(role) && (
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.65rem", color: "rgba(255,255,255,0.25)", flexShrink: 0 }}>
                      <FaShieldAlt /> Staff
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 2: Auth Form ── */}
        {step === "form" && (
          <div className="animate-fade-in">
            {/* Back + Header */}
            <div style={{ marginBottom: "28px" }}>
              <button onClick={handleBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: "0.8rem", cursor: "pointer", padding: "0 0 16px 0", display: "flex", alignItems: "center", gap: "6px" }}>
                ← Back to role selection
              </button>

              {/* Role badge */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", backgroundColor: "rgba(0,180,216,0.06)", border: "1px solid rgba(0,180,216,0.15)", borderRadius: "8px", marginBottom: "20px" }}>
                <span style={{ fontSize: "1.2rem" }}>{ROLE_INFO[selectedRole]?.icon}</span>
                <div>
                  <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.8px" }}>Signing in as</div>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--primary)" }}>{selectedRole}</div>
                </div>
              </div>

              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, margin: "0 0 4px 0" }}>
                {formMode === "forgot" ? "Reset Password" : formMode === "register" ? "Create Account" : "Sign In"}
              </h2>
              <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.38)", margin: 0 }}>
                {formMode === "forgot"
                  ? "Enter your email to receive reset instructions."
                  : formMode === "register"
                    ? "Create your passenger account to start booking."
                    : isStaff
                      ? "Use your staff credentials issued by the system administrator."
                      : "Sign in to your account to manage bookings and reservations."}
              </p>
            </div>

            {/* Alerts */}
            {errorMsg && (
              <div style={{ padding: "11px 14px", backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", borderRadius: "8px", fontSize: "0.8rem", marginBottom: "18px", display: "flex", gap: "8px" }}>
                <span style={{ flexShrink: 0 }}>⚠</span> {errorMsg}
              </div>
            )}
            {successMsg && (
              <div style={{ padding: "11px 14px", backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "#34d399", borderRadius: "8px", fontSize: "0.8rem", marginBottom: "18px", display: "flex", gap: "8px" }}>
                <span style={{ flexShrink: 0 }}>✓</span> {successMsg}
              </div>
            )}

            {/* Staff notice */}
            {isStaff && formMode === "login" && (
              <div style={{ padding: "11px 14px", backgroundColor: "rgba(114,9,183,0.08)", border: "1px solid rgba(114,9,183,0.2)", borderRadius: "8px", fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", marginBottom: "18px", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <FaShieldAlt style={{ color: "#c084fc", flexShrink: 0, marginTop: "1px" }} />
                Staff accounts are provisioned by the system administrator. Contact your IT department if you need access.
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

              {/* Register fields (Passenger only) */}
              {formMode === "register" && isPassenger && (
                <>
                  <div style={{ position: "relative" }}>
                    <FaUser style={iconStyle} />
                    <input type="text" placeholder="Full Name" required value={name} onChange={e => setName(e.target.value)} className="form-input" style={inputStyle} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div style={{ position: "relative" }}>
                      <FaPhone style={iconStyle} />
                      <input type="text" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} className="form-input" style={inputStyle} />
                    </div>
                    <div style={{ position: "relative" }}>
                      <FaPassport style={iconStyle} />
                      <input type="text" placeholder="Passport / CNIC" value={passport} onChange={e => setPassport(e.target.value)} className="form-input" style={inputStyle} />
                    </div>
                  </div>
                </>
              )}

              {/* Email */}
              <div style={{ position: "relative" }}>
                <FaEnvelope style={iconStyle} />
                <input type="email" placeholder="Email address" required value={email} onChange={e => setEmail(e.target.value)} className="form-input" style={inputStyle} />
              </div>

              {/* Password */}
              {formMode !== "forgot" && (
                <div style={{ position: "relative" }}>
                  <FaLock style={iconStyle} />
                  <input type={showPassword ? "text" : "password"} placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} className="form-input" style={{ ...inputStyle, paddingRight: "42px" }} />
                  <button type="button" onClick={() => setShowPassword(p => !p)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer", padding: "4px" }}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              )}

              {/* Remember + Forgot */}
              {formMode === "login" && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "rgba(255,255,255,0.45)" }}>
                    <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} style={{ accentColor: "var(--primary)" }} />
                    Keep me signed in
                  </label>
                  <span onClick={() => { setFormMode("forgot"); setErrorMsg(""); setSuccessMsg(""); }} style={{ color: "var(--primary)", cursor: "pointer", fontWeight: 600 }}>
                    Forgot password?
                  </span>
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading} style={{
                marginTop: "4px", width: "100%", height: "46px", border: "none", borderRadius: "8px",
                background: loading ? "rgba(0,180,216,0.4)" : "linear-gradient(135deg, #00b4d8, #0077b6)",
                color: "white", fontSize: "0.9rem", fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 16px rgba(0,180,216,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                transition: "all 0.2s ease"
              }}>
                {loading ? (
                  <>
                    <span style={{ width: "15px", height: "15px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                    Processing...
                  </>
                ) : formMode === "forgot" ? "Send Reset Instructions"
                  : formMode === "register" ? "Create Account"
                    : "Sign In to Portal"}
              </button>

              {/* Mode switchers */}
              <div style={{ textAlign: "center", fontSize: "0.8rem", color: "rgba(255,255,255,0.3)" }}>
                {formMode === "forgot" ? (
                  <span onClick={() => { setFormMode("login"); setErrorMsg(""); setSuccessMsg(""); }} style={{ color: "var(--primary)", cursor: "pointer", fontWeight: 600 }}>
                    ← Back to Sign In
                  </span>
                ) : formMode === "register" ? (
                  <>Already have an account?{" "}
                    <span onClick={() => { setFormMode("login"); setErrorMsg(""); }} style={{ color: "var(--primary)", cursor: "pointer", fontWeight: 600 }}>Sign In</span>
                  </>
                ) : isPassenger ? (
                  <>Don't have an account?{" "}
                    <span onClick={() => { setFormMode("register"); setErrorMsg(""); }} style={{ color: "var(--primary)", cursor: "pointer", fontWeight: 600 }}>Create Account</span>
                  </>
                ) : null}
              </div>
            </form>

            {/* Security notice */}
            <div style={{ marginTop: "28px", padding: "12px 14px", backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", display: "flex", gap: "10px" }}>
              <span style={{ flexShrink: 0 }}>🔒</span>
              <p style={{ margin: 0, fontSize: "0.7rem", color: "rgba(255,255,255,0.22)", lineHeight: 1.6 }}>
                Secured portal. All sessions are monitored and logged. Unauthorized access is recorded and reported.
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) { .login-left-panel { display: none !important; } }
      `}</style>
    </div>
  );
}
