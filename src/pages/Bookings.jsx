import React, { useState } from "react";
import { useCollection, useDB } from "../contexts/DBContext";
import { useAuth } from "../contexts/AuthContext";
import { sendSystemNotification } from "../services/notifier";
import SeatMap from "../components/SeatMap";
import { FaSearch, FaPlane, FaUser, FaCouch, FaCreditCard, FaCheckCircle, FaArrowRight, FaArrowLeft } from "react-icons/fa";

const STEPS = ["Search Flights", "Select Flight", "Passenger Details", "Choose Seat", "Payment", "Confirmation"];

export default function Bookings() {
  const { currentUser } = useAuth();
  const [flights] = useCollection("flights");
  const [passengers] = useCollection("passengers");
  const [tickets] = useCollection("tickets");
  const { addDoc, updateDoc, logSystemAction } = useDB();

  const [step, setStep] = useState(0);
  const [searchForm, setSearchForm] = useState({ from: "", to: "", date: "", returnDate: "", passengers: 1, seatClass: "Economy" });
  const [availableFlights, setAvailableFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [passengerForm, setPassengerForm] = useState({ name: "", email: "", phone: "", passport: "", nationality: "", dob: "", gender: "Male" });
  const [selectedSeat, setSelectedSeat] = useState("");
  const [paymentForm, setPaymentForm] = useState({ method: "Credit Card", cardNumber: "", expiry: "", cvv: "", name: "" });
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);

  const searchFlights = (e) => {
    e.preventDefault();
    const results = flights.filter(f =>
      f.origin.toLowerCase() === searchForm.from.toUpperCase() &&
      f.destination.toLowerCase() === searchForm.to.toUpperCase() &&
      f.status === "Scheduled" &&
      f.availableSeats > 0 &&
      (!searchForm.date || f.departureDate === searchForm.date)
    );
    setAvailableFlights(results.length > 0 ? results : flights.filter(f => f.status === "Scheduled"));
    setStep(1);
  };

  const selectFlight = (flight) => {
    setSelectedFlight(flight);
    // Pre-fill passenger from current user if passenger role
    if (currentUser.role === "Passenger") {
      const myPassenger = passengers.find(p => p.email === currentUser.email);
      if (myPassenger) {
        setPassengerForm({
          name: myPassenger.name, email: myPassenger.email,
          phone: myPassenger.phone, passport: myPassenger.passport || myPassenger.cnic,
          nationality: myPassenger.nationality, dob: myPassenger.dob, gender: myPassenger.gender
        });
      }
    }
    setStep(2);
  };

  const getPrice = () => {
    if (!selectedFlight) return 0;
    const cls = searchForm.seatClass;
    if (cls === "Business") return selectedFlight.priceBusiness;
    if (cls === "First") return selectedFlight.priceFirst;
    return selectedFlight.priceEconomy;
  };

  const bookedSeatsForFlight = tickets
    .filter(t => t.flightId === selectedFlight?.id)
    .map(t => t.seatNumber);

  const processPayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500)); // simulate gateway

    const pnr = `PNR-${Date.now().toString(36).toUpperCase()}`;
    const price = getPrice();
    const tax = Math.round(price * 0.1);

    // Create or find passenger
    let pasId = `pas-${Date.now()}`;
    const existingPas = passengers.find(p => p.email === passengerForm.email);
    if (existingPas) {
      pasId = existingPas.id;
    } else {
      addDoc("passengers", { id: pasId, ...passengerForm, address: "", emergencyContact: "", frequentFlyerNumber: `FF-${Math.random().toString(36).slice(2, 8).toUpperCase()}` });
    }

    // Create ticket
    const ticketData = {
      id: `tk-${Date.now()}`, pnr, passengerId: pasId,
      flightId: selectedFlight.id, seatNumber: selectedSeat,
      seatClass: searchForm.seatClass, bookingDate: new Date().toISOString().slice(0, 10),
      price, taxes: tax, discount: 0, status: "Active",
      boardingTime: selectedFlight.departureTime, gate: selectedFlight.gate,
      qrCode: `TICKET-${selectedFlight.flightNumber}-${selectedSeat}-${passengerForm.name.replace(" ", "-").toUpperCase()}`
    };
    addDoc("tickets", ticketData);

    // Create booking
    const bookingData = {
      id: `bk-${Date.now()}`, pnr, passengerId: pasId,
      flightId: selectedFlight.id, status: "Confirmed",
      totalAmount: price + tax, paymentMethod: paymentForm.method,
      seatClass: searchForm.seatClass, seatNumber: selectedSeat,
      date: new Date().toISOString()
    };
    addDoc("bookings", bookingData);

    // Create payment record
    addDoc("payments", {
      id: `pay-${Date.now()}`, bookingId: bookingData.id, passengerId: pasId,
      amount: price + tax, tax, discount: 0, method: paymentForm.method,
      transactionId: `TXN-${Date.now().toString(36).toUpperCase()}`,
      status: "Completed", date: new Date().toISOString().slice(0, 10)
    });

    // Update available seats on flight
    updateDoc("flights", selectedFlight.id, {
      availableSeats: selectedFlight.availableSeats - 1,
      bookedSeats: selectedFlight.bookedSeats + 1
    });

    logSystemAction(currentUser.uid, currentUser.email, "Book Ticket", "Bookings", "", `PNR: ${pnr}`);
    sendSystemNotification({
      title: "Booking Confirmed!",
      message: `Reservation ${pnr} confirmed. Flight ${selectedFlight.flightNumber} | Seat ${selectedSeat}.`,
      type: "success", userId: currentUser.uid
    });

    setBooking({ ...ticketData, pnr, passengerName: passengerForm.name, flightNumber: selectedFlight.flightNumber, origin: selectedFlight.origin, destination: selectedFlight.destination });
    setLoading(false);
    setStep(5);
  };

  const resetBooking = () => {
    setStep(0); setSelectedFlight(null); setSelectedSeat(""); setBooking(null);
    setSearchForm({ from: "", to: "", date: "", returnDate: "", passengers: 1, seatClass: "Economy" });
    setPassengerForm({ name: "", email: "", phone: "", passport: "", nationality: "", dob: "", gender: "Male" });
    setPaymentForm({ method: "Credit Card", cardNumber: "", expiry: "", cvv: "", name: "" });
  };

  const StepIndicator = () => (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "32px", overflowX: "auto", padding: "4px 0" }}>
      {STEPS.map((s, i) => (
        <React.Fragment key={s}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "80px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: i <= step ? "var(--primary)" : "var(--border-color)", color: i <= step ? "white" : "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem", transition: "all 0.3s" }}>
              {i < step ? "✓" : i + 1}
            </div>
            <div style={{ fontSize: "0.7rem", marginTop: "4px", color: i === step ? "var(--primary)" : "var(--text-secondary)", fontWeight: i === step ? 700 : 400, textAlign: "center", whiteSpace: "nowrap" }}>{s}</div>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ flex: 1, height: "2px", backgroundColor: i < step ? "var(--primary)" : "var(--border-color)", margin: "0 4px", marginBottom: "20px", transition: "background-color 0.3s" }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-title">
          <h2>Book a Ticket</h2>
          <p>Search flights, select seats, and generate boarding passes in minutes.</p>
        </div>
      </div>

      <div className="glass-card">
        <StepIndicator />

        {/* STEP 0: Search */}
        {step === 0 && (
          <form onSubmit={searchFlights} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "4px" }}>Search Available Flights</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>FROM (IATA)</label>
                <input type="text" required placeholder="JFK" maxLength={3} value={searchForm.from} onChange={e => setSearchForm({ ...searchForm, from: e.target.value.toUpperCase() })} className="form-input" style={{ marginTop: "4px" }} />
              </div>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>TO (IATA)</label>
                <input type="text" required placeholder="LHR" maxLength={3} value={searchForm.to} onChange={e => setSearchForm({ ...searchForm, to: e.target.value.toUpperCase() })} className="form-input" style={{ marginTop: "4px" }} />
              </div>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>DEPARTURE DATE</label>
                <input type="date" value={searchForm.date} onChange={e => setSearchForm({ ...searchForm, date: e.target.value })} className="form-input" style={{ marginTop: "4px" }} />
              </div>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>RETURN DATE</label>
                <input type="date" value={searchForm.returnDate} onChange={e => setSearchForm({ ...searchForm, returnDate: e.target.value })} className="form-input" style={{ marginTop: "4px" }} />
              </div>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>PASSENGERS</label>
                <input type="number" min={1} max={9} value={searchForm.passengers} onChange={e => setSearchForm({ ...searchForm, passengers: parseInt(e.target.value) })} className="form-input" style={{ marginTop: "4px" }} />
              </div>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>SEAT CLASS</label>
                <select value={searchForm.seatClass} onChange={e => setSearchForm({ ...searchForm, seatClass: e.target.value })} className="form-input" style={{ marginTop: "4px" }}>
                  <option value="Economy">Economy</option>
                  <option value="Business">Business</option>
                  <option value="First">First Class</option>
                </select>
              </div>
            </div>
            <button type="submit" style={{ alignSelf: "flex-start", padding: "12px 28px", borderRadius: "8px", border: "none", backgroundColor: "var(--primary)", color: "white", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
              <FaSearch /> Search Flights
            </button>
          </form>
        )}

        {/* STEP 1: Select Flight */}
        {step === 1 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Available Flights ({availableFlights.length})</h3>
              <button onClick={() => setStep(0)} style={{ background: "none", border: "1px solid var(--border-color)", padding: "8px 14px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                <FaArrowLeft /> Modify Search
              </button>
            </div>
            {availableFlights.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>No flights found matching your search. Try different dates or routes.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {availableFlights.map(f => {
                  const price = searchForm.seatClass === "Business" ? f.priceBusiness : searchForm.seatClass === "First" ? f.priceFirst : f.priceEconomy;
                  return (
                    <div key={f.id} onClick={() => selectFlight(f)} style={{ border: "1px solid var(--border-color)", borderRadius: "12px", padding: "20px", cursor: "pointer", transition: "all 0.2s", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}
                      onMouseOver={e => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 2px var(--primary-glow)"; }}
                      onMouseOut={e => { e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.boxShadow = "none"; }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)" }}>{f.origin}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{f.departureTime}</div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{f.duration}</div>
                            <div style={{ width: "80px", height: "2px", backgroundColor: "var(--border-color)", position: "relative" }}>
                              <FaPlane style={{ position: "absolute", top: "-6px", left: "50%", transform: "translateX(-50%)", color: "var(--primary)", fontSize: "0.8rem" }} />
                            </div>
                            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "2px" }}>Direct</div>
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)" }}>{f.destination}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{f.arrivalTime}</div>
                          </div>
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "8px" }}>
                          Flight {f.flightNumber} · {f.departureDate} · Gate {f.gate} T{f.terminal} · {f.availableSeats} seats left
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)" }}>${price}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{searchForm.seatClass}</div>
                        <span className={`badge badge-${STATUS_COLORS[f.status] || "scheduled"}`} style={{ marginTop: "6px" }}>{f.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Passenger Details */}
        {step === 2 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Passenger Information</h3>
              <button onClick={() => setStep(1)} style={{ background: "none", border: "1px solid var(--border-color)", padding: "8px 14px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                <FaArrowLeft /> Back
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
              {[
                { label: "Full Name", key: "name", type: "text" },
                { label: "Email", key: "email", type: "email" },
                { label: "Phone", key: "phone", type: "text" },
                { label: "Passport / CNIC", key: "passport", type: "text" },
                { label: "Nationality", key: "nationality", type: "text" },
                { label: "Date of Birth", key: "dob", type: "date" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>{f.label}</label>
                  <input type={f.type} required value={passengerForm[f.key]} onChange={e => setPassengerForm({ ...passengerForm, [f.key]: e.target.value })} className="form-input" style={{ marginTop: "4px" }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Gender</label>
                <select value={passengerForm.gender} onChange={e => setPassengerForm({ ...passengerForm, gender: e.target.value })} className="form-input" style={{ marginTop: "4px" }}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
            </div>
            <button onClick={() => { if (passengerForm.name && passengerForm.email) setStep(3); else alert("Please fill all required fields"); }}
              style={{ marginTop: "24px", padding: "12px 28px", borderRadius: "8px", border: "none", backgroundColor: "var(--primary)", color: "white", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
              Continue to Seat Selection <FaArrowRight />
            </button>
          </div>
        )}

        {/* STEP 3: Seat Selection */}
        {step === 3 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Select Your Seat</h3>
              <button onClick={() => setStep(2)} style={{ background: "none", border: "1px solid var(--border-color)", padding: "8px 14px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                <FaArrowLeft /> Back
              </button>
            </div>
            {selectedSeat && (
              <div style={{ marginBottom: "16px", padding: "12px 20px", backgroundColor: "rgba(0,180,216,0.1)", border: "1px solid var(--primary)", borderRadius: "8px", color: "var(--primary)", fontWeight: 700 }}>
                Selected Seat: <strong>{selectedSeat}</strong> ({searchForm.seatClass}) — Click "Continue" to proceed.
              </div>
            )}
            <SeatMap aircraft={selectedFlight} selectedSeat={selectedSeat} onSeatSelect={setSelectedSeat} bookedSeats={bookedSeatsForFlight} />
            <button disabled={!selectedSeat} onClick={() => setStep(4)}
              style={{ marginTop: "24px", padding: "12px 28px", borderRadius: "8px", border: "none", backgroundColor: selectedSeat ? "var(--primary)" : "var(--border-color)", color: selectedSeat ? "white" : "var(--text-secondary)", fontWeight: 700, fontSize: "0.9rem", cursor: selectedSeat ? "pointer" : "not-allowed", display: "flex", alignItems: "center", gap: "8px" }}>
              Continue to Payment <FaArrowRight />
            </button>
          </div>
        )}

        {/* STEP 4: Payment */}
        {step === 4 && (
          <form onSubmit={processPayment}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Payment & Confirmation</h3>
              <button type="button" onClick={() => setStep(3)} style={{ background: "none", border: "1px solid var(--border-color)", padding: "8px 14px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                <FaArrowLeft /> Back
              </button>
            </div>

            {/* Order Summary */}
            <div style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "16px 20px", marginBottom: "24px" }}>
              <h4 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "12px", color: "var(--primary)" }}>Order Summary</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.85rem" }}>
                <div>Flight: <strong>{selectedFlight?.flightNumber}</strong></div>
                <div>Route: <strong>{selectedFlight?.origin} → {selectedFlight?.destination}</strong></div>
                <div>Date: <strong>{selectedFlight?.departureDate}</strong></div>
                <div>Seat: <strong>{selectedSeat} ({searchForm.seatClass})</strong></div>
                <div>Passenger: <strong>{passengerForm.name}</strong></div>
                <div>Base Price: <strong>${getPrice()}</strong></div>
                <div>Taxes (10%): <strong>${Math.round(getPrice() * 0.1)}</strong></div>
                <div style={{ fontWeight: 700, color: "var(--primary)", fontSize: "1rem" }}>
                  Total: <strong>${getPrice() + Math.round(getPrice() * 0.1)}</strong>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Payment Method</label>
              <div style={{ display: "flex", gap: "10px", marginTop: "8px", flexWrap: "wrap" }}>
                {["Credit Card", "Debit Card", "PayPal", "EasyPaisa", "JazzCash", "Stripe"].map(m => (
                  <button key={m} type="button" onClick={() => setPaymentForm({ ...paymentForm, method: m })}
                    style={{ padding: "8px 14px", borderRadius: "6px", border: `1px solid ${paymentForm.method === m ? "var(--primary)" : "var(--border-color)"}`, backgroundColor: paymentForm.method === m ? "rgba(0,180,216,0.1)" : "transparent", color: paymentForm.method === m ? "var(--primary)" : "var(--text-secondary)", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Card Details (if applicable) */}
            {["Credit Card", "Debit Card", "Stripe"].includes(paymentForm.method) && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Card Holder Name</label>
                  <input type="text" required value={paymentForm.name} onChange={e => setPaymentForm({ ...paymentForm, name: e.target.value })} className="form-input" style={{ marginTop: "4px" }} placeholder="As appears on card" />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Card Number</label>
                  <input type="text" required maxLength={19} value={paymentForm.cardNumber} onChange={e => setPaymentForm({ ...paymentForm, cardNumber: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim() })} className="form-input" style={{ marginTop: "4px" }} placeholder="XXXX XXXX XXXX XXXX" />
                </div>
                <div>
                  <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Expiry Date</label>
                  <input type="text" required maxLength={5} value={paymentForm.expiry} onChange={e => setPaymentForm({ ...paymentForm, expiry: e.target.value })} className="form-input" style={{ marginTop: "4px" }} placeholder="MM/YY" />
                </div>
                <div>
                  <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>CVV</label>
                  <input type="text" required maxLength={4} value={paymentForm.cvv} onChange={e => setPaymentForm({ ...paymentForm, cvv: e.target.value })} className="form-input" style={{ marginTop: "4px" }} placeholder="123" />
                </div>
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ padding: "14px 32px", borderRadius: "8px", border: "none", backgroundColor: "var(--primary)", color: "white", fontWeight: 700, fontSize: "1rem", cursor: loading ? "wait" : "pointer", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 4px 14px var(--primary-glow)" }}>
              {loading ? "Processing Payment…" : <><FaCreditCard /> Pay ${getPrice() + Math.round(getPrice() * 0.1)} Now</>}
            </button>
          </form>
        )}

        {/* STEP 5: Confirmation */}
        {step === 5 && booking && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "4rem", marginBottom: "16px" }}>🎉</div>
            <h3 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--status-scheduled)", marginBottom: "8px" }}>Booking Confirmed!</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "24px" }}>
              Your reservation has been placed. A boarding pass has been generated.
            </p>
            <div style={{ display: "inline-block", padding: "20px 32px", backgroundColor: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: "12px", marginBottom: "24px", textAlign: "left" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "4px" }}>PNR NUMBER</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--primary)", letterSpacing: "2px" }}>{booking.pnr}</div>
              <div style={{ marginTop: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.85rem" }}>
                <div>Passenger: <strong>{booking.passengerName}</strong></div>
                <div>Flight: <strong>{booking.flightNumber}</strong></div>
                <div>Route: <strong>{booking.origin} → {booking.destination}</strong></div>
                <div>Seat: <strong>{booking.seatNumber} ({booking.seatClass})</strong></div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button onClick={resetBooking} style={{ padding: "11px 22px", borderRadius: "6px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-card)", color: "var(--text-primary)", fontWeight: 600, cursor: "pointer" }}>
                Book Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const STATUS_COLORS = { Scheduled: "scheduled", Delayed: "delayed", Cancelled: "cancelled", Completed: "completed" };
