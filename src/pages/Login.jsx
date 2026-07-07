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
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.08)",
    color: "#f8fafc",
    height: "46px",
    borderRadius: "12px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)"
  };

  const iconStyle = {
    position: "absolute",
    left: "13px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "rgba(248,250,252,0.72)",
    fontSize: "0.85rem",
    pointerEvents: "none"
  };

  const backgroundImageUrl = "https://images.unsplash.com/photo-1542296332-2e4473faf563?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YWlycG9ydHxlbnwwfHwwfHx8MA%3D%3D";

  return (
    <div className="login-shell" style={{
      height: "100vh",
      width: "100vw",
      display: "flex",
      backgroundColor: "#0f172a",
      color: "white",
      position: "fixed",
      inset: 0,
      overflow: "hidden",
      margin: 0,
      padding: 0
    }}>
      <img
        src={backgroundImageUrl}
        alt=""
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          zIndex: 0
        }}
      />
      <div style={{
        position: "fixed",
        inset: 0,
        background: "linear-gradient(135deg, rgba(2, 8, 23, 0.86) 0%, rgba(2, 6, 23, 0.72) 48%, rgba(2, 8, 23, 0.86) 100%)",
        zIndex: 0
      }} />

      <div style={{
        position: "relative",
        zIndex: 1,
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center"
      }}>
      {/* Left Branding Panel */}
      <div className="login-left-panel" style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "60px",
        background: "linear-gradient(135deg, rgba(14,165,233,0.16) 0%, rgba(2,8,23,0.08) 60%, transparent 100%)",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        minWidth: 0,
        minHeight: "100vh",
        backdropFilter: "blur(8px)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "56px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "linear-gradient(135deg, #00b4d8, #7209b7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FaPlane style={{ color: "white", fontSize: "1.1rem" }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#f8fafc" }}>AeroERP Systems</div>
            <div style={{ fontSize: "0.7rem", color: "rgba(248,250,252,0.7)", letterSpacing: "1.5px", textTransform: "uppercase" }}>Enterprise Aviation Platform</div>
          </div>
        </div>

        <div style={{ maxWidth: "400px" }}>
          <h1 style={{ fontSize: "2.4rem", fontWeight: 800, lineHeight: 1.15, marginBottom: "18px", color: "#f8fafc" }}>
            Flight Operations<br />
            <span style={{ background: "linear-gradient(90deg, #00b4d8, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Command Center
            </span>
          </h1>
          <p style={{ fontSize: "0.9rem", color: "rgba(248,250,252,0.72)", lineHeight: 1.8, marginBottom: "40px" }}>
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
              <span style={{ fontSize: "0.83rem", color: "rgba(248,250,252,0.82)", fontWeight: 500 }}>{f.label}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "auto", fontSize: "0.7rem", color: "rgba(255,255,255,0.18)" }}>
          © {new Date().getFullYear()} AeroERP Systems. All rights reserved.
        </div>
      </div>

      {/* Right Auth Panel */}
      <div className="login-panel" style={{
        width: "480px",
        maxWidth: "min(480px, 95vw)",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
        overflow: "hidden",
        minHeight: "100vh"
      }}>
        <div style={{
          width: "100%",
          maxWidth: "480px",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "rgba(15, 23, 42, 0.62)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.16)",
          borderRadius: "24px",
          boxShadow: "0 24px 80px rgba(2, 8, 23, 0.32)",
          padding: "36px 32px",
          color: "#f8fafc"
        }}>

        {/* ── STEP 1: Role Selection ── */}
        {step === "role" && (
          <div className="animate-fade-in">
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 6px 0", color: "#f8fafc" }}>Select Your Role</h2>
              <p style={{ fontSize: "0.82rem", color: "rgba(248,250,252,0.72)", margin: 0 }}>
                Choose how you're accessing the system to continue.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {Object.entries(ROLE_INFO).map(([role, info]) => (
                <button
                  key={role}
                  onClick={() => handleRoleSelect(role)}
                  className="login-role-button"
                  style={{
                    display: "flex", alignItems: "center", gap: "14px",
                    padding: "15px 16px", borderRadius: "14px",
                    border: selectedRole === role ? "1px solid rgba(96,165,250,0.75)" : "1px solid rgba(255,255,255,0.12)",
                    backgroundColor: selectedRole === role ? "rgba(59,130,246,0.18)" : "rgba(255,255,255,0.05)",
                    color: "#f8fafc", cursor: "pointer", textAlign: "left",
                    transition: "all 0.25s ease", width: "100%",
                    boxShadow: selectedRole === role ? "0 10px 30px rgba(59,130,246,0.18)" : "none",
                    transform: selectedRole === role ? "translateY(-2px)" : "none"
                  }}
                  onMouseOver={e => { e.currentTarget.style.backgroundColor = "rgba(59,130,246,0.16)"; e.currentTarget.style.borderColor = "rgba(96,165,250,0.75)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 30px rgba(59,130,246,0.18)"; }}
                  onMouseOut={e => { e.currentTarget.style.backgroundColor = selectedRole === role ? "rgba(59,130,246,0.18)" : "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = selectedRole === role ? "rgba(96,165,250,0.75)" : "rgba(255,255,255,0.12)"; e.currentTarget.style.transform = selectedRole === role ? "translateY(-2px)" : "none"; e.currentTarget.style.boxShadow = selectedRole === role ? "0 10px 30px rgba(59,130,246,0.18)" : "none"; }}
                >
                  <span style={{ fontSize: "1.4rem", width: "36px", textAlign: "center", flexShrink: 0 }}>{info.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="login-role-label" style={{ fontWeight: 700, fontSize: "0.88rem", color: "#f8fafc" }}>{role}</div>
                    <div style={{ fontSize: "0.73rem", color: "rgba(248,250,252,0.72)", marginTop: "2px", lineHeight: 1.4 }}>{info.desc}</div>
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
              <button onClick={handleBack} style={{ background: "none", border: "none", color: "rgba(248,250,252,0.74)", fontSize: "0.8rem", cursor: "pointer", padding: "0 0 16px 0", display: "flex", alignItems: "center", gap: "6px" }}>
                ← Back to role selection
              </button>

              {/* Role badge */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", backgroundColor: "rgba(59,130,246,0.14)", border: "1px solid rgba(96,165,250,0.28)", borderRadius: "10px", marginBottom: "20px" }}>
                <span style={{ fontSize: "1.2rem" }}>{ROLE_INFO[selectedRole]?.icon}</span>
                <div>
                  <div style={{ fontSize: "0.72rem", color: "rgba(248,250,252,0.7)", textTransform: "uppercase", letterSpacing: "0.8px" }}>Signing in as</div>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#e0f2fe" }}>{selectedRole}</div>
                </div>
              </div>

              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, margin: "0 0 4px 0", color: "#f8fafc" }}>
                {formMode === "forgot" ? "Reset Password" : formMode === "register" ? "Create Account" : "Sign In"}
              </h2>
              <p style={{ fontSize: "0.8rem", color: "rgba(248,250,252,0.72)", margin: 0 }}>
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
              <div style={{ padding: "11px 14px", backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.16)", borderRadius: "8px", fontSize: "0.78rem", color: "rgba(248,250,252,0.8)", marginBottom: "18px", display: "flex", gap: "8px", alignItems: "flex-start" }}>
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
                    <input type="text" placeholder="Full Name" required value={name} onChange={e => setName(e.target.value)} className="form-input auth-input" style={inputStyle} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div style={{ position: "relative" }}>
                      <FaPhone style={iconStyle} />
                      <input type="text" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} className="form-input auth-input" style={inputStyle} />
                    </div>
                    <div style={{ position: "relative" }}>
                      <FaPassport style={iconStyle} />
                      <input type="text" placeholder="Passport / CNIC" value={passport} onChange={e => setPassport(e.target.value)} className="form-input auth-input" style={inputStyle} />
                    </div>
                  </div>
                </>
              )}

              {/* Email */}
              <div style={{ position: "relative" }}>
                <FaEnvelope style={iconStyle} />
                <input type="email" placeholder="Email address" required value={email} onChange={e => setEmail(e.target.value)} className="form-input auth-input" style={inputStyle} />
              </div>

              {/* Password */}
              {formMode !== "forgot" && (
                <div style={{ position: "relative" }}>
                  <FaLock style={iconStyle} />
                  <input type={showPassword ? "text" : "password"} placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} className="form-input auth-input" style={{ ...inputStyle, paddingRight: "42px" }} />
                  <button type="button" onClick={() => setShowPassword(p => !p)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(248,250,252,0.72)", cursor: "pointer", padding: "4px" }}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              )}

              {/* Remember + Forgot */}
              {formMode === "login" && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "rgba(248,250,252,0.78)" }}>
                    <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} style={{ accentColor: "var(--primary)" }} />
                    Keep me signed in
                  </label>
                  <span onClick={() => { setFormMode("forgot"); setErrorMsg(""); setSuccessMsg(""); }} style={{ color: "var(--primary)", cursor: "pointer", fontWeight: 600 }}>
                    Forgot password?
                  </span>
                </div>
              )}

              {/* Submit */}
              <button type="submit" className="auth-submit-btn" disabled={loading} style={{
                marginTop: "4px", width: "100%", height: "46px", border: "none", borderRadius: "14px",
                background: loading ? "rgba(59,130,246,0.4)" : "linear-gradient(135deg, #38bdf8, #2563eb)",
                color: "white", fontSize: "0.9rem", fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 12px 30px rgba(37,99,235,0.24)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                transition: "all 0.25s ease"
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
              <div style={{ textAlign: "center", fontSize: "0.8rem", color: "rgba(248,250,252,0.7)" }}>
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
              <p style={{ margin: 0, fontSize: "0.7rem", color: "rgba(248,250,252,0.65)", lineHeight: 1.6 }}>
                Secured portal. All sessions are monitored and logged. Unauthorized access is recorded and reported.
              </p>
            </div>
          </div>
        )}
        </div>
      </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.35s ease both; }
        .auth-input::placeholder { color: rgba(248,250,252,0.56); }
        .auth-input:focus { outline: none; border-color: rgba(96,165,250,0.75); background-color: rgba(255,255,255,0.12); }
        .auth-submit-btn:hover { transform: translateY(-1px); box-shadow: 0 14px 32px rgba(37,99,235,0.24); filter: brightness(1.04); }
        .auth-submit-btn:disabled:hover { transform: none; box-shadow: 0 12px 30px rgba(37,99,235,0.24); filter: none; }
        .login-role-button:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(59,130,246,0.18); }
        @media (max-width: 900px) {
          .login-left-panel { display: none !important; }
          .login-shell { flex-direction: column; }
        }
        @media (max-width: 640px) {
          .login-shell { min-height: 100vh; }
          .login-panel { padding: 16px !important; width: 100% !important; max-width: 95vw !important; }
          .login-role-button { padding: 12px 14px !important; }
          .login-role-label { font-size: 0.8rem !important; }
        }
      `}</style>
    </div>
  );
}
