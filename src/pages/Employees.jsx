import React, { useState } from "react";
import { useCollection, useDB } from "../contexts/DBContext";
import Modal, { ModalActions } from "../components/Modal";
import { useAuth } from "../contexts/AuthContext";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaClock, FaMoneyBillWave, FaUsers, FaCalendarCheck } from "react-icons/fa";

const DEPARTMENTS = ["Administration", "Reservation", "Finance", "HR", "Operations", "Maintenance", "IT", "Customer Support", "Security", "Cabin Crew", "Pilots"];
const ROLES = ["Super Admin", "Airline Admin", "Reservation Manager", "Flight Manager", "Pilot", "Cabin Crew", "HR Manager", "Finance Manager", "Customer Support", "Passenger"];
const TABS = ["Employees", "Attendance", "Leave Requests", "Payroll"];

export default function Employees() {
  const { currentUser } = useAuth();
  const [employees] = useCollection("employees");
  const [attendance] = useCollection("attendance");
  const [leaves] = useCollection("leaveRequests");
  const [payroll] = useCollection("payroll");
  const { addDoc, updateDoc, deleteDoc, logSystemAction } = useDB();

  const [activeTab, setActiveTab] = useState("Employees");
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    name: "", role: "Pilot", department: "Pilots", cnic: "", passport: "",
    phone: "", email: "", salary: 5000, joiningDate: "", qualification: "",
    experience: "", address: "", photo: "", emergencyContact: "", status: "Active"
  };
  const [formData, setFormData] = useState(emptyForm);

  // Attendance state
  const [attDate, setAttDate] = useState(new Date().toISOString().slice(0, 10));

  // Leave management
  const [leaveShowModal, setLeaveShowModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ employeeId: "", leaveType: "Sick Leave", startDate: "", endDate: "", reason: "" });

  // Payroll state
  const [payrollMonth, setPayrollMonth] = useState("June");
  const [payrollYear, setPayrollYear] = useState(2026);

  const filtered = employees.filter(e => {
    const matchSearch = e.name?.toLowerCase().includes(searchTerm.toLowerCase()) || e.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept = deptFilter === "All" || e.department === deptFilter;
    return matchSearch && matchDept;
  });

  const todayAttendance = attendance.filter(a => a.date === attDate);

  const handleCheckIn = (empId) => {
    const existing = attendance.find(a => a.employeeId === empId && a.date === attDate);
    if (existing) { alert("Employee already checked in today."); return; }
    addDoc("attendance", { employeeId: empId, date: attDate, checkIn: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), checkOut: "", workingHours: "", status: "Present" });
    logSystemAction(currentUser.uid, currentUser.email, "Employee Check-In", "Attendance", "", empId);
  };

  const handleCheckOut = (attId) => {
    const record = attendance.find(a => a.id === attId);
    if (!record) return;
    const checkOut = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const worked = "8h 00m"; // simplified
    updateDoc("attendance", attId, { checkOut, workingHours: worked, status: record.checkIn ? "Present" : "Absent" });
  };

  const handleLeaveSubmit = (e) => {
    e.preventDefault();
    addDoc("leaveRequests", { ...leaveForm, status: "Pending" });
    logSystemAction(currentUser.uid, currentUser.email, "Leave Request Submitted", "Leaves", "", leaveForm);
    setLeaveShowModal(false);
  };

  const handleLeaveAction = (id, status) => {
    updateDoc("leaveRequests", id, { status });
    logSystemAction(currentUser.uid, currentUser.email, `Leave ${status}`, "Leaves", "Pending", status);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      const old = employees.find(emp => emp.id === editingId);
      updateDoc("employees", editingId, formData);
      logSystemAction(currentUser.uid, currentUser.email, "Update Employee", "Employees", old, formData);
    } else {
      const newDoc = addDoc("employees", formData);
      logSystemAction(currentUser.uid, currentUser.email, "Add Employee", "Employees", "", newDoc);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this employee record?")) {
      const old = employees.find(e => e.id === id);
      deleteDoc("employees", id);
      logSystemAction(currentUser.uid, currentUser.email, "Delete Employee", "Employees", old, "Deleted");
    }
  };

  const generatePayroll = (empId) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;
    const existing = payroll.find(p => p.employeeId === empId && p.month === payrollMonth && p.year === payrollYear);
    if (existing) { alert("Payroll already generated for this period."); return; }
    const allowances = Math.round(emp.salary * 0.08);
    const bonuses = Math.round(emp.salary * 0.05);
    const tax = Math.round(emp.salary * 0.12);
    const netSalary = emp.salary + allowances + bonuses - tax;
    addDoc("payroll", { employeeId: empId, month: payrollMonth, year: payrollYear, salary: emp.salary, allowances, bonuses, tax, deduction: 0, netSalary });
    logSystemAction(currentUser.uid, currentUser.email, "Generate Payroll", "Payroll", "", `${emp.name} - ${payrollMonth} ${payrollYear}`);
    alert(`Payroll generated: Net Salary = $${netSalary.toLocaleString()}`);
  };

  const Inp = ({ label, fieldKey, type = "text", children }) => (
    <div>
      <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>{label}</label>
      {children || <input type={type} value={formData[fieldKey] || ""} onChange={e => setFormData({ ...formData, [fieldKey]: type === "number" ? parseFloat(e.target.value) : e.target.value })} className="form-input" style={{ marginTop: "4px" }} />}
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-title">
          <h2>HR & Personnel Center</h2>
          <p>Manage employees, attendance, leaves, and payroll in one place.</p>
        </div>
        {activeTab === "Employees" && (
          <button onClick={() => { setEditingId(null); setFormData(emptyForm); setShowModal(true); }} className="badge badge-completed" style={{ padding: "10px 18px", fontSize: "0.85rem", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
            <FaPlus /> Add Employee
          </button>
        )}
        {activeTab === "Leave Requests" && (
          <button onClick={() => setLeaveShowModal(true)} className="badge badge-delayed" style={{ padding: "10px 18px", fontSize: "0.85rem", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
            <FaPlus /> Submit Leave
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", backgroundColor: "var(--bg-input)", padding: "4px", borderRadius: "10px", width: "fit-content" }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "9px 18px", borderRadius: "7px", border: "none", backgroundColor: activeTab === tab ? "var(--bg-card)" : "transparent", color: activeTab === tab ? "var(--primary)" : "var(--text-secondary)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", boxShadow: activeTab === tab ? "var(--shadow-sm)" : "none" }}>
            {tab}
          </button>
        ))}
      </div>

      {/* EMPLOYEES TAB */}
      {activeTab === "Employees" && (
        <>

          <div style={{ display: "flex", gap: "12px", marginBottom: "400px", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
              <FaSearch style={{ position: "absolute", left: "12px", top: "12px", color: "var(--text-secondary)" }} />
              <input type="text" placeholder="Search employees…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="form-input" style={{ paddingLeft: "36px" }} />
            </div>
            <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="form-input" style={{ width: "180px" }}>
              <option value="All">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="glass-card" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Role / Department</th>
                    <th>Contact</th>
                    <th>Salary</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(emp => (
                    <tr key={emp.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <img src={emp.photo || `https://api.dicebear.com/7.x/adventurer/svg?seed=${emp.name}`} alt="" style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} />
                          <div>
                            <div style={{ fontWeight: 700 }}>{emp.name}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>ID: {emp.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{emp.role}</div>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{emp.department}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: "0.8rem" }}>
                          <div>{emp.email}</div>
                          <div style={{ color: "var(--text-secondary)" }}>{emp.phone}</div>
                        </div>
                      </td>
                      <td><strong>${emp.salary?.toLocaleString()}/mo</strong></td>
                      <td>{emp.joiningDate}</td>
                      <td><span className={`badge badge-${emp.status === "Active" ? "scheduled" : "cancelled"}`}>{emp.status}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button onClick={() => generatePayroll(emp.id)} className="icon-button" style={{ color: "var(--status-scheduled)", fontSize: "0.85rem" }} title="Generate Payroll"><FaMoneyBillWave /></button>
                          <button onClick={() => { setEditingId(emp.id); setFormData({ ...emp }); setShowModal(true); }} className="icon-button" title="Edit"><FaEdit /></button>
                          <button onClick={() => handleDelete(emp.id)} className="icon-button" style={{ color: "var(--status-cancelled)" }} title="Delete"><FaTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ATTENDANCE TAB */}
      {activeTab === "Attendance" && (
        <div>
          <div style={{ display: "flex", gap: "16px", marginBottom: "20px", alignItems: "center" }}>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>SELECT DATE</label>
              <input type="date" value={attDate} onChange={e => setAttDate(e.target.value)} className="form-input" style={{ marginTop: "4px", width: "200px" }} />
            </div>
            <div className="glass-card" style={{ padding: "12px 20px", display: "flex", gap: "20px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--status-scheduled)" }}>{todayAttendance.filter(a => a.status === "Present").length}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Present</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--status-delayed)" }}>{todayAttendance.filter(a => a.status === "Late").length}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Late</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--status-cancelled)" }}>{employees.length - todayAttendance.length}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Absent</div>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr><th>Employee</th><th>Department</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {employees.map(emp => {
                    const rec = todayAttendance.find(a => a.employeeId === emp.id);
                    return (
                      <tr key={emp.id}>
                        <td><strong>{emp.name}</strong></td>
                        <td>{emp.department}</td>
                        <td>{rec?.checkIn || "—"}</td>
                        <td>{rec?.checkOut || "—"}</td>
                        <td>{rec?.workingHours || "—"}</td>
                        <td>
                          {rec ? <span className={`badge badge-${rec.status === "Present" ? "scheduled" : rec.status === "Late" ? "delayed" : "cancelled"}`}>{rec.status}</span> : <span className="badge badge-cancelled">Absent</span>}
                        </td>
                        <td>
                          {!rec ? (
                            <button onClick={() => handleCheckIn(emp.id)} style={{ padding: "5px 12px", borderRadius: "5px", border: "none", backgroundColor: "var(--status-scheduled)", color: "white", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}>
                              <FaCheckCircle /> Check In
                            </button>
                          ) : !rec.checkOut ? (
                            <button onClick={() => handleCheckOut(rec.id)} style={{ padding: "5px 12px", borderRadius: "5px", border: "none", backgroundColor: "var(--status-cancelled)", color: "white", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}>
                              <FaTimesCircle /> Check Out
                            </button>
                          ) : <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Done</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* LEAVE REQUESTS TAB */}
      {activeTab === "Leave Requests" && (
        <div className="glass-card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr><th>Employee</th><th>Leave Type</th><th>Period</th><th>Reason</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {leaves.map(lv => {
                  const emp = employees.find(e => e.id === lv.employeeId);
                  return (
                    <tr key={lv.id}>
                      <td><strong>{emp?.name || lv.employeeId}</strong></td>
                      <td>{lv.leaveType}</td>
                      <td>{lv.startDate} → {lv.endDate}</td>
                      <td style={{ maxWidth: "200px" }}>{lv.reason}</td>
                      <td><span className={`badge badge-${lv.status === "Approved" ? "scheduled" : lv.status === "Rejected" ? "cancelled" : "delayed"}`}>{lv.status}</span></td>
                      <td>
                        {lv.status === "Pending" && (
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button onClick={() => handleLeaveAction(lv.id, "Approved")} style={{ padding: "5px 10px", borderRadius: "5px", border: "none", backgroundColor: "var(--status-scheduled)", color: "white", fontSize: "0.78rem", cursor: "pointer" }}>Approve</button>
                            <button onClick={() => handleLeaveAction(lv.id, "Rejected")} style={{ padding: "5px 10px", borderRadius: "5px", border: "none", backgroundColor: "var(--status-cancelled)", color: "white", fontSize: "0.78rem", cursor: "pointer" }}>Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAYROLL TAB */}
      {activeTab === "Payroll" && (
        <div>
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", alignItems: "flex-end" }}>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>MONTH</label>
              <select value={payrollMonth} onChange={e => setPayrollMonth(e.target.value)} className="form-input" style={{ marginTop: "4px", width: "140px" }}>
                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>YEAR</label>
              <input type="number" value={payrollYear} onChange={e => setPayrollYear(parseInt(e.target.value))} className="form-input" style={{ marginTop: "4px", width: "100px" }} />
            </div>
          </div>

          <div className="glass-card" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr><th>Employee</th><th>Basic Salary</th><th>Allowances</th><th>Bonuses</th><th>Tax</th><th>Deductions</th><th>Net Pay</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {employees.map(emp => {
                    const pr = payroll.find(p => p.employeeId === emp.id && p.month === payrollMonth && p.year === payrollYear);
                    return (
                      <tr key={emp.id}>
                        <td><strong>{emp.name}</strong><div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{emp.role}</div></td>
                        <td>${emp.salary?.toLocaleString()}</td>
                        <td style={{ color: "var(--status-scheduled)" }}>{pr ? `+$${pr.allowances}` : "—"}</td>
                        <td style={{ color: "var(--status-scheduled)" }}>{pr ? `+$${pr.bonuses}` : "—"}</td>
                        <td style={{ color: "var(--status-cancelled)" }}>{pr ? `-$${pr.tax}` : "—"}</td>
                        <td style={{ color: "var(--status-cancelled)" }}>{pr ? `-$${pr.deduction}` : "—"}</td>
                        <td><strong style={{ color: "var(--primary)", fontSize: "0.95rem" }}>{pr ? `$${pr.netSalary?.toLocaleString()}` : "—"}</strong></td>
                        <td>
                          {!pr ? (
                            <button onClick={() => generatePayroll(emp.id)} style={{ padding: "6px 12px", borderRadius: "5px", border: "none", backgroundColor: "var(--primary)", color: "white", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}>Generate</button>
                          ) : <span style={{ fontSize: "0.78rem", color: "var(--status-scheduled)" }}>✓ Generated</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Employee Add/Edit Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "20px" }}>
          <div className="animate-fade-in glass-card" style={{ backgroundColor: "var(--bg-card)", width: "100%", maxWidth: "640px", maxHeight: "90vh", overflowY: "auto", padding: "32px" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "20px" }}>{editingId ? "Edit Employee" : "Add Employee"}</h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <Inp label="Full Name" fieldKey="name" />
                <div>
                  <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Role</label>
                  <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="form-input" style={{ marginTop: "4px" }}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Department</label>
                  <select value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} className="form-input" style={{ marginTop: "4px" }}>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <Inp label="CNIC" fieldKey="cnic" />
                <Inp label="Passport" fieldKey="passport" />
                <Inp label="Phone" fieldKey="phone" />
                <Inp label="Email" fieldKey="email" type="email" />
                <Inp label="Salary (USD/mo)" fieldKey="salary" type="number" />
                <Inp label="Joining Date" fieldKey="joiningDate" type="date" />
                <Inp label="Qualification" fieldKey="qualification" />
                <Inp label="Experience" fieldKey="experience" />
              </div>
              <Inp label="Address" fieldKey="address" />
              <Inp label="Emergency Contact" fieldKey="emergencyContact" />
              <Inp label="Photo URL" fieldKey="photo" />
              <div>
                <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Status</label>
                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="form-input" style={{ marginTop: "4px" }}>
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
                <button type="button" onClick={() => setShowModal(false)} className="form-input" style={{ width: "auto", cursor: "pointer" }}>Cancel</button>
                <button type="submit" className="badge badge-completed" style={{ padding: "11px 22px", border: "none", cursor: "pointer", fontSize: "0.85rem" }}>Save Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave Submission Modal */}
      {leaveShowModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "20px" }}>
          <div className="animate-fade-in glass-card" style={{ backgroundColor: "var(--bg-card)", width: "100%", maxWidth: "460px", padding: "28px" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "20px" }}>Submit Leave Request</h3>
            <form onSubmit={handleLeaveSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Employee</label>
                <select value={leaveForm.employeeId} onChange={e => setLeaveForm({ ...leaveForm, employeeId: e.target.value })} className="form-input" style={{ marginTop: "4px" }} required>
                  <option value="">Select Employee</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Leave Type</label>
                <select value={leaveForm.leaveType} onChange={e => setLeaveForm({ ...leaveForm, leaveType: e.target.value })} className="form-input" style={{ marginTop: "4px" }}>
                  {["Sick Leave", "Casual Leave", "Annual Leave", "Emergency Leave", "Maternity/Paternity Leave"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Start Date</label>
                  <input type="date" required value={leaveForm.startDate} onChange={e => setLeaveForm({ ...leaveForm, startDate: e.target.value })} className="form-input" style={{ marginTop: "4px" }} />
                </div>
                <div>
                  <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>End Date</label>
                  <input type="date" required value={leaveForm.endDate} onChange={e => setLeaveForm({ ...leaveForm, endDate: e.target.value })} className="form-input" style={{ marginTop: "4px" }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Reason</label>
                <textarea required value={leaveForm.reason} onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })} className="form-input" style={{ marginTop: "4px", minHeight: "80px", resize: "vertical" }} />
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setLeaveShowModal(false)} className="form-input" style={{ width: "auto", cursor: "pointer" }}>Cancel</button>
                <button type="submit" className="badge badge-delayed" style={{ padding: "11px 22px", border: "none", cursor: "pointer", fontSize: "0.85rem" }}>Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
