// ============================================================
// AeroERP Systems — Complete Mock Seed Data
// ============================================================

export const DEFAULT_USERS = [
  { uid: "u-001", email: "admin@flight.com", displayName: "Alex Reynolds", role: "Super Admin", phone: "+1-555-0001", status: "Active", photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=Alex", createdAt: "2024-01-01T00:00:00Z", lastLogin: "2025-06-01T08:00:00Z" },
  { uid: "u-002", email: "airline@flight.com", displayName: "Sarah Mitchell", role: "Airline Admin", phone: "+1-555-0002", status: "Active", photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sarah", createdAt: "2024-01-02T00:00:00Z", lastLogin: "2025-06-01T09:00:00Z" },
  { uid: "u-003", email: "flight@flight.com", displayName: "Marcus Chen", role: "Flight Manager", phone: "+1-555-0003", status: "Active", photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=Marcus", createdAt: "2024-01-03T00:00:00Z", lastLogin: "2025-06-01T10:00:00Z" },
  { uid: "u-004", email: "reservation@flight.com", displayName: "Emily Foster", role: "Reservation Manager", phone: "+1-555-0004", status: "Active", photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=Emily", createdAt: "2024-01-04T00:00:00Z", lastLogin: "2025-06-01T11:00:00Z" },
  { uid: "u-005", email: "hr@flight.com", displayName: "David Kim", role: "HR Manager", phone: "+1-555-0005", status: "Active", photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=David", createdAt: "2024-01-05T00:00:00Z", lastLogin: "2025-06-01T12:00:00Z" },
  { uid: "u-006", email: "finance@flight.com", displayName: "Rachel Torres", role: "Finance Manager", phone: "+1-555-0006", status: "Active", photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=Rachel", createdAt: "2024-01-06T00:00:00Z", lastLogin: "2025-06-01T13:00:00Z" },
  { uid: "u-007", email: "pilot@flight.com", displayName: "Capt. James Wright", role: "Pilot", phone: "+1-555-0007", status: "Active", photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=James", createdAt: "2024-01-07T00:00:00Z", lastLogin: "2025-06-01T14:00:00Z" },
  { uid: "u-008", email: "crew@flight.com", displayName: "Linda Park", role: "Cabin Crew", phone: "+1-555-0008", status: "Active", photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=Linda", createdAt: "2024-01-08T00:00:00Z", lastLogin: "2025-06-01T15:00:00Z" },
  { uid: "u-009", email: "support@flight.com", displayName: "Omar Hassan", role: "Customer Support", phone: "+1-555-0009", status: "Active", photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=Omar", createdAt: "2024-01-09T00:00:00Z", lastLogin: "2025-06-01T16:00:00Z" },
  { uid: "u-010", email: "passenger@flight.com", displayName: "Nina Patel", role: "Passenger", phone: "+1-555-0010", status: "Active", photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=Nina", createdAt: "2024-01-10T00:00:00Z", lastLogin: "2025-06-01T17:00:00Z" }
];

export const DEFAULT_AIRLINES = [
  { id: "al-001", name: "AeroERP Airways", logo: "✈️", country: "United States", headOffice: "Houston, TX", website: "https://aeroerp.com", email: "ops@aeroerp.com", phone: "+1-800-AERO-ERP", description: "The flagship carrier of AeroERP Systems, operating transcontinental and international routes.", status: "Active" },
  { id: "al-002", name: "Pacific Jet Lines", logo: "🛩️", country: "Japan", headOffice: "Tokyo, Japan", website: "https://pacificjet.jp", email: "info@pacificjet.jp", phone: "+81-3-5555-1234", description: "Asia-Pacific regional and long-haul carrier serving 40+ destinations.", status: "Active" },
  { id: "al-003", name: "Euro Sky Connect", logo: "🌍", country: "Germany", headOffice: "Frankfurt, Germany", website: "https://euroskyconnect.de", email: "contact@euroskyconnect.de", phone: "+49-69-5555-7890", description: "European carrier specializing in intra-EU and transatlantic routes.", status: "Active" },
  { id: "al-004", name: "Desert Wings", logo: "🦅", country: "UAE", headOffice: "Dubai, UAE", website: "https://desertwings.ae", email: "ops@desertwings.ae", phone: "+971-4-555-3456", description: "Middle East premium carrier with luxury first-class offerings.", status: "Active" }
];

export const DEFAULT_AIRPORTS = [
  { id: "JFK", code: "JFK", name: "John F. Kennedy International Airport", city: "New York", country: "USA", latitude: 40.6413, longitude: -73.7781, runways: 4, terminalCount: 6, operatingHours: "24 Hours", status: "Active" },
  { id: "LAX", code: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "USA", latitude: 33.9425, longitude: -118.4081, runways: 4, terminalCount: 9, operatingHours: "24 Hours", status: "Active" },
  { id: "LHR", code: "LHR", name: "Heathrow Airport", city: "London", country: "UK", latitude: 51.4700, longitude: -0.4543, runways: 2, terminalCount: 4, operatingHours: "24 Hours", status: "Active" },
  { id: "DXB", code: "DXB", name: "Dubai International Airport", city: "Dubai", country: "UAE", latitude: 25.2532, longitude: 55.3657, runways: 2, terminalCount: 3, operatingHours: "24 Hours", status: "Active" },
  { id: "NRT", code: "NRT", name: "Narita International Airport", city: "Tokyo", country: "Japan", latitude: 35.7647, longitude: 140.3864, runways: 2, terminalCount: 3, operatingHours: "24 Hours", status: "Active" },
  { id: "CDG", code: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "France", latitude: 49.0097, longitude: 2.5479, runways: 4, terminalCount: 3, operatingHours: "24 Hours", status: "Active" },
  { id: "ISB", code: "ISB", name: "Islamabad International Airport", city: "Islamabad", country: "Pakistan", latitude: 33.5487, longitude: 72.8216, runways: 1, terminalCount: 1, operatingHours: "24 Hours", status: "Active" },
  { id: "KHI", code: "KHI", name: "Jinnah International Airport", city: "Karachi", country: "Pakistan", latitude: 24.9008, longitude: 67.1681, runways: 2, terminalCount: 2, operatingHours: "24 Hours", status: "Active" }
];

export const DEFAULT_AIRCRAFTS = [
  { id: "ac-001", registrationNumber: "N-AE001", model: "Boeing 777-300ER", type: "Wide Body", manufacturer: "Boeing", airlineId: "al-001", capacity: 396, businessSeats: 42, economySeats: 354, range: "13,650 km", speed: "905 km/h", status: "Active", lastMaintenance: "2025-04-10", nextMaintenance: "2025-10-10", age: 6, engineType: "GE90-115B" },
  { id: "ac-002", registrationNumber: "N-AE002", model: "Airbus A380-800", type: "Wide Body", manufacturer: "Airbus", airlineId: "al-001", capacity: 555, businessSeats: 76, economySeats: 479, range: "15,200 km", speed: "903 km/h", status: "Active", lastMaintenance: "2025-03-20", nextMaintenance: "2025-09-20", age: 8, engineType: "Rolls-Royce Trent 970" },
  { id: "ac-003", registrationNumber: "JA-PJ003", model: "Boeing 787 Dreamliner", type: "Wide Body", manufacturer: "Boeing", airlineId: "al-002", capacity: 296, businessSeats: 48, economySeats: 248, range: "14,140 km", speed: "903 km/h", status: "Active", lastMaintenance: "2025-05-01", nextMaintenance: "2025-11-01", age: 4, engineType: "GEnx-1B" },
  { id: "ac-004", registrationNumber: "D-EU004", model: "Airbus A350-900", type: "Wide Body", manufacturer: "Airbus", airlineId: "al-003", capacity: 369, businessSeats: 54, economySeats: 315, range: "15,000 km", speed: "910 km/h", status: "Maintenance", lastMaintenance: "2025-06-01", nextMaintenance: "2025-12-01", age: 3, engineType: "Rolls-Royce Trent XWB" },
  { id: "ac-005", registrationNumber: "A6-DW005", model: "Boeing 777X", type: "Wide Body", manufacturer: "Boeing", airlineId: "al-004", capacity: 426, businessSeats: 60, economySeats: 366, range: "16,090 km", speed: "905 km/h", status: "Active", lastMaintenance: "2025-02-14", nextMaintenance: "2025-08-14", age: 2, engineType: "GE9X" }
];

export const DEFAULT_FLIGHTS = [
  { id: "fl-001", flightNumber: "AE-101", airlineId: "al-001", aircraftId: "ac-001", origin: "JFK", destination: "LHR", departureDate: "2025-07-15", departureTime: "22:00", arrivalDate: "2025-07-16", arrivalTime: "10:30", duration: "7h 30m", gate: "B12", status: "Scheduled", priceEconomy: 850, priceBusiness: 3200, availableSeats: 210 },
  { id: "fl-002", flightNumber: "AE-202", airlineId: "al-001", aircraftId: "ac-002", origin: "LAX", destination: "DXB", departureDate: "2025-07-16", departureTime: "01:00", arrivalDate: "2025-07-16", arrivalTime: "23:45", duration: "16h 45m", gate: "A4", status: "Scheduled", priceEconomy: 1100, priceBusiness: 4800, availableSeats: 320 },
  { id: "fl-003", flightNumber: "PJ-303", airlineId: "al-002", aircraftId: "ac-003", origin: "NRT", destination: "LAX", departureDate: "2025-07-14", departureTime: "14:00", arrivalDate: "2025-07-14", arrivalTime: "09:00", duration: "11h 00m", gate: "C8", status: "Delayed", priceEconomy: 780, priceBusiness: 2900, availableSeats: 150 },
  { id: "fl-004", flightNumber: "EU-404", airlineId: "al-003", aircraftId: "ac-004", origin: "CDG", destination: "JFK", departureDate: "2025-07-13", departureTime: "10:30", arrivalDate: "2025-07-13", arrivalTime: "13:15", duration: "8h 45m", gate: "D3", status: "Completed", priceEconomy: 720, priceBusiness: 2600, availableSeats: 0 },
  { id: "fl-005", flightNumber: "DW-505", airlineId: "al-004", aircraftId: "ac-005", origin: "DXB", destination: "LHR", departureDate: "2025-07-17", departureTime: "08:00", arrivalDate: "2025-07-17", arrivalTime: "12:20", duration: "7h 20m", gate: "E7", status: "Scheduled", priceEconomy: 650, priceBusiness: 2400, availableSeats: 280 },
  { id: "fl-006", flightNumber: "AE-606", airlineId: "al-001", aircraftId: "ac-001", origin: "LHR", destination: "ISB", departureDate: "2025-07-18", departureTime: "16:00", arrivalDate: "2025-07-18", arrivalTime: "23:30", duration: "7h 30m", gate: "F2", status: "Scheduled", priceEconomy: 580, priceBusiness: 2100, availableSeats: 190 },
  { id: "fl-007", flightNumber: "AE-707", airlineId: "al-001", aircraftId: "ac-002", origin: "JFK", destination: "CDG", departureDate: "2025-07-12", departureTime: "20:00", arrivalDate: "2025-07-13", arrivalTime: "09:45", duration: "6h 45m", gate: "B5", status: "Cancelled", priceEconomy: 700, priceBusiness: 2800, availableSeats: 0 }
];

export const DEFAULT_PASSENGERS = [
  { id: "pas-001", name: "Nina Patel", fatherName: "Raj Patel", cnic: "35202-1234567-8", passport: "P-1234567", nationality: "Pakistani", gender: "Female", dob: "1990-03-15", email: "passenger@flight.com", phone: "+92-300-1234567", emergencyContact: "+92-300-9876543", address: "123 Gulberg, Lahore", visaDetails: "UK Tier 2 Visa", frequentFlyerNumber: "AE-FF-001234", profilePhoto: "" },
  { id: "pas-002", name: "James Harrison", fatherName: "Robert Harrison", cnic: "", passport: "US-7654321", nationality: "American", gender: "Male", dob: "1985-07-22", email: "james.harrison@email.com", phone: "+1-555-2345678", emergencyContact: "+1-555-8765432", address: "456 Fifth Ave, New York", visaDetails: "", frequentFlyerNumber: "AE-FF-002345", profilePhoto: "" },
  { id: "pas-003", name: "Aisha Al-Rashid", fatherName: "Khalid Al-Rashid", cnic: "", passport: "AE-4321098", nationality: "Emirati", gender: "Female", dob: "1995-11-08", email: "aisha.rashid@email.ae", phone: "+971-50-3456789", emergencyContact: "+971-50-9876541", address: "789 Sheikh Zayed Rd, Dubai", visaDetails: "Multi-Entry Visa", frequentFlyerNumber: "AE-FF-003456", profilePhoto: "" },
  { id: "pas-004", name: "Hiroshi Tanaka", fatherName: "Kenji Tanaka", cnic: "", passport: "JP-8765432", nationality: "Japanese", gender: "Male", dob: "1978-04-30", email: "h.tanaka@gmail.jp", phone: "+81-90-4567890", emergencyContact: "+81-90-0987654", address: "101 Shinjuku, Tokyo", visaDetails: "", frequentFlyerNumber: "AE-FF-004567", profilePhoto: "" },
  { id: "pas-005", name: "Sophie Laurent", fatherName: "Pierre Laurent", cnic: "", passport: "FR-3456789", nationality: "French", gender: "Female", dob: "1992-09-14", email: "sophie.l@email.fr", phone: "+33-6-5678901", emergencyContact: "+33-6-1098765", address: "22 Rue de Rivoli, Paris", visaDetails: "Schengen Visa", frequentFlyerNumber: "AE-FF-005678", profilePhoto: "" }
];

export const DEFAULT_EMPLOYEES = [
  { id: "emp-001", name: "Capt. James Wright", role: "Pilot", department: "Flight Operations", email: "pilot@flight.com", phone: "+1-555-0007", salary: 18000, status: "Active", joinDate: "2020-03-01", photo: "https://api.dicebear.com/7.x/adventurer/svg?seed=James", address: "789 Skyway Blvd, Houston" },
  { id: "emp-002", name: "Linda Park", role: "Cabin Crew", department: "Cabin Services", email: "crew@flight.com", phone: "+1-555-0008", salary: 4800, status: "Active", joinDate: "2021-06-15", photo: "https://api.dicebear.com/7.x/adventurer/svg?seed=Linda", address: "321 Cloud Ave, Los Angeles" },
  { id: "emp-003", name: "David Kim", role: "HR Manager", department: "Human Resources", email: "hr@flight.com", phone: "+1-555-0005", salary: 9500, status: "Active", joinDate: "2019-11-20", photo: "https://api.dicebear.com/7.x/adventurer/svg?seed=David", address: "654 Meadow St, New York" },
  { id: "emp-004", name: "Rachel Torres", role: "Finance Manager", department: "Finance", email: "finance@flight.com", phone: "+1-555-0006", salary: 10500, status: "Active", joinDate: "2018-08-10", photo: "https://api.dicebear.com/7.x/adventurer/svg?seed=Rachel", address: "987 River Rd, Chicago" },
  { id: "emp-005", name: "Omar Hassan", role: "Customer Support", department: "Customer Relations", email: "support@flight.com", phone: "+1-555-0009", salary: 3800, status: "Active", joinDate: "2022-01-05", photo: "https://api.dicebear.com/7.x/adventurer/svg?seed=Omar", address: "246 Ocean Dr, Miami" },
  { id: "emp-006", name: "Emily Foster", role: "Reservation Manager", department: "Reservations", email: "reservation@flight.com", phone: "+1-555-0004", salary: 7200, status: "Active", joinDate: "2020-09-12", photo: "https://api.dicebear.com/7.x/adventurer/svg?seed=Emily", address: "135 Maple Ave, Dallas" },
  { id: "emp-007", name: "Capt. Sofia Navarro", role: "Pilot", department: "Flight Operations", email: "sofia.navarro@flight.com", phone: "+1-555-0011", salary: 17500, status: "Active", joinDate: "2019-04-22", photo: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sofia", address: "753 Runway Rd, Atlanta" }
];

export const DEFAULT_PILOTS = [
  { id: "emp-001", licenseNumber: "FAA-CPL-00178", licenseExpiry: "2026-03-01", medicalCertificate: "Class 1 — Valid", experience: "15 years", totalFlightHours: 12400, aircraftCertified: ["Boeing 777", "Boeing 787", "Airbus A320"], assignedFlights: ["AE-101", "AE-606"], status: "Active" },
  { id: "emp-007", licenseNumber: "FAA-CPL-00294", licenseExpiry: "2025-08-15", medicalCertificate: "Class 1 — Valid", experience: "11 years", totalFlightHours: 8750, aircraftCertified: ["Airbus A380", "Boeing 777X"], assignedFlights: ["AE-202", "AE-707"], status: "Active" }
];

export const DEFAULT_CABIN_CREW = [
  { id: "cc-001", employeeId: "emp-002", name: "Linda Park", certifications: ["Safety Procedures", "First Aid", "Emergency Evacuation"], assignedFlight: "fl-001", seniority: "Senior", status: "Active" }
];

export const DEFAULT_ATTENDANCE = [
  { id: "att-001", employeeId: "emp-001", date: "2025-06-01", checkIn: "08:00", checkOut: "17:00", status: "Present" },
  { id: "att-002", employeeId: "emp-002", date: "2025-06-01", checkIn: "09:00", checkOut: "18:00", status: "Present" },
  { id: "att-003", employeeId: "emp-003", date: "2025-06-01", checkIn: "08:30", checkOut: "17:30", status: "Present" },
  { id: "att-004", employeeId: "emp-004", date: "2025-06-01", checkIn: null, checkOut: null, status: "Absent" },
  { id: "att-005", employeeId: "emp-005", date: "2025-06-02", checkIn: "08:00", checkOut: "16:00", status: "Present" },
  { id: "att-006", employeeId: "emp-001", date: "2025-06-02", checkIn: "08:15", checkOut: "17:00", status: "Present" }
];

export const DEFAULT_LEAVES = [
  { id: "lv-001", employeeId: "emp-002", employeeName: "Linda Park", type: "Annual Leave", startDate: "2025-07-01", endDate: "2025-07-05", days: 5, reason: "Family vacation", status: "Approved", appliedOn: "2025-06-10" },
  { id: "lv-002", employeeId: "emp-005", employeeName: "Omar Hassan", type: "Sick Leave", startDate: "2025-06-20", endDate: "2025-06-21", days: 2, reason: "Illness", status: "Approved", appliedOn: "2025-06-20" },
  { id: "lv-003", employeeId: "emp-006", employeeName: "Emily Foster", type: "Emergency Leave", startDate: "2025-06-25", endDate: "2025-06-26", days: 2, reason: "Family emergency", status: "Pending", appliedOn: "2025-06-24" }
];

export const DEFAULT_PAYROLL = [
  { id: "pay-001", employeeId: "emp-001", employeeName: "Capt. James Wright", month: "June 2025", baseSalary: 18000, allowances: 2500, deductions: 1800, netPay: 18700, status: "Paid", paidOn: "2025-06-30" },
  { id: "pay-002", employeeId: "emp-002", employeeName: "Linda Park", month: "June 2025", baseSalary: 4800, allowances: 600, deductions: 480, netPay: 4920, status: "Paid", paidOn: "2025-06-30" },
  { id: "pay-003", employeeId: "emp-003", employeeName: "David Kim", month: "June 2025", baseSalary: 9500, allowances: 1000, deductions: 950, netPay: 9550, status: "Pending", paidOn: null },
  { id: "pay-004", employeeId: "emp-004", employeeName: "Rachel Torres", month: "June 2025", baseSalary: 10500, allowances: 1200, deductions: 1050, netPay: 10650, status: "Pending", paidOn: null }
];

export const DEFAULT_MAINTENANCE = [
  { id: "mnt-001", aircraftId: "ac-001", aircraftModel: "Boeing 777-300ER", type: "Routine Inspection", scheduledDate: "2025-10-10", completedDate: null, technician: "Jake Simmons", status: "Scheduled", notes: "Full C-check scheduled", cost: 45000 },
  { id: "mnt-002", aircraftId: "ac-004", aircraftModel: "Airbus A350-900", type: "Engine Overhaul", scheduledDate: "2025-06-01", completedDate: null, technician: "Maria Kovacs", status: "In Progress", notes: "Trent XWB engine fan blade replacement", cost: 120000 },
  { id: "mnt-003", aircraftId: "ac-003", aircraftModel: "Boeing 787 Dreamliner", type: "Avionics Check", scheduledDate: "2025-05-15", completedDate: "2025-05-20", technician: "Tom Bradley", status: "Completed", notes: "All navigation systems cleared", cost: 18000 }
];

export const DEFAULT_FUEL = [
  { id: "fuel-001", aircraftId: "ac-001", flightId: "fl-001", fuelType: "Jet-A1", quantity: 85000, unit: "liters", pricePerLiter: 0.72, totalCost: 61200, supplier: "AeroFuel Corp", date: "2025-07-14", status: "Loaded" },
  { id: "fuel-002", aircraftId: "ac-002", flightId: "fl-002", fuelType: "Jet-A1", quantity: 120000, unit: "liters", pricePerLiter: 0.70, totalCost: 84000, supplier: "GlobalFuel Ltd", date: "2025-07-15", status: "Loaded" },
  { id: "fuel-003", aircraftId: "ac-003", flightId: "fl-003", fuelType: "Jet-A", quantity: 60000, unit: "liters", pricePerLiter: 0.75, totalCost: 45000, supplier: "PacificFuel Inc", date: "2025-07-13", status: "Loaded" }
];

export const DEFAULT_CARGO = [
  { id: "cgo-001", flightId: "fl-001", shipmentId: "SHP-10001", description: "Medical Equipment", weight: 2400, weightUnit: "kg", sender: "MedSupply USA", receiver: "NHS UK", status: "Loaded", specialHandling: "Fragile" },
  { id: "cgo-002", flightId: "fl-002", shipmentId: "SHP-10002", description: "Electronics Shipment", weight: 3800, weightUnit: "kg", sender: "TechCorp Inc", receiver: "Dubai Electronics Zone", status: "Pending", specialHandling: "Temperature Controlled" },
  { id: "cgo-003", flightId: "fl-004", shipmentId: "SHP-10003", description: "Fashion Goods", weight: 1200, weightUnit: "kg", sender: "Paris Boutique", receiver: "Macys NY", status: "Delivered", specialHandling: "None" }
];

export const DEFAULT_BAGGAGE = [
  { id: "bag-001", ticketId: "tkt-001", passengerId: "pas-001", flightId: "fl-001", tagNumber: "AE-BAG-00101", weight: 23, status: "Loaded", type: "Check-in", description: "Black suitcase" },
  { id: "bag-002", ticketId: "tkt-002", passengerId: "pas-002", flightId: "fl-001", tagNumber: "AE-BAG-00102", weight: 18, status: "Loaded", type: "Check-in", description: "Blue trolley" },
  { id: "bag-003", ticketId: "tkt-003", passengerId: "pas-003", flightId: "fl-002", tagNumber: "AE-BAG-00201", weight: 25, status: "In Transit", type: "Check-in", description: "Red suitcase" }
];

export const DEFAULT_BOOKINGS = [
  { id: "bkg-001", passengerId: "pas-001", flightId: "fl-001", pnr: "AE7F2K", seatClass: "Economy", seatNumber: "14C", bookingDate: "2025-06-15", status: "Confirmed", paymentStatus: "Paid" },
  { id: "bkg-002", passengerId: "pas-002", flightId: "fl-001", pnr: "AE8G3L", seatClass: "Business", seatNumber: "2A", bookingDate: "2025-06-16", status: "Confirmed", paymentStatus: "Paid" },
  { id: "bkg-003", passengerId: "pas-003", flightId: "fl-002", pnr: "AE9H4M", seatClass: "Economy", seatNumber: "22F", bookingDate: "2025-06-17", status: "Confirmed", paymentStatus: "Paid" },
  { id: "bkg-004", passengerId: "pas-004", flightId: "fl-003", pnr: "AE1I5N", seatClass: "Economy", seatNumber: "33B", bookingDate: "2025-06-18", status: "Confirmed", paymentStatus: "Pending" },
  { id: "bkg-005", passengerId: "pas-005", flightId: "fl-004", pnr: "AE2J6O", seatClass: "Business", seatNumber: "1B", bookingDate: "2025-06-10", status: "Cancelled", paymentStatus: "Refunded" }
];

export const DEFAULT_TICKETS = [
  { id: "tkt-001", passengerId: "pas-001", flightId: "fl-001", pnr: "AE7F2K", seatClass: "Economy", seatNumber: "14C", seatType: "Window", price: 850, taxes: 85, discount: 0, bookingDate: "2025-06-15", boardingTime: "21:30", gate: "B12", status: "Active", qrCode: "AE7F2K-fl001-pas001-14C" },
  { id: "tkt-002", passengerId: "pas-002", flightId: "fl-001", pnr: "AE8G3L", seatClass: "Business", seatNumber: "2A", seatType: "Window", price: 3200, taxes: 320, discount: 200, bookingDate: "2025-06-16", boardingTime: "21:15", gate: "B12", status: "Active", qrCode: "AE8G3L-fl001-pas002-2A" },
  { id: "tkt-003", passengerId: "pas-003", flightId: "fl-002", pnr: "AE9H4M", seatClass: "Economy", seatNumber: "22F", seatType: "Aisle", price: 1100, taxes: 110, discount: 50, bookingDate: "2025-06-17", boardingTime: "00:30", gate: "A4", status: "Active", qrCode: "AE9H4M-fl002-pas003-22F" },
  { id: "tkt-004", passengerId: "pas-004", flightId: "fl-003", pnr: "AE1I5N", seatClass: "Economy", seatNumber: "33B", seatType: "Middle", price: 780, taxes: 78, discount: 0, bookingDate: "2025-06-18", boardingTime: "13:30", gate: "C8", status: "Active", qrCode: "AE1I5N-fl003-pas004-33B" },
  { id: "tkt-005", passengerId: "pas-005", flightId: "fl-004", pnr: "AE2J6O", seatClass: "Business", seatNumber: "1B", seatType: "Window", price: 2600, taxes: 260, discount: 0, bookingDate: "2025-06-10", boardingTime: null, gate: "D3", status: "Cancelled", qrCode: "AE2J6O-fl004-pas005-1B" }
];

export const DEFAULT_PAYMENTS = [
  { id: "pmt-001", bookingId: "bkg-001", passengerId: "pas-001", amount: 850, tax: 85, discount: 0, method: "Visa Card", transactionId: "TXN-9A1B2C3D", status: "Completed", date: "2025-06-15" },
  { id: "pmt-002", bookingId: "bkg-002", passengerId: "pas-002", amount: 3000, tax: 320, discount: 200, method: "MasterCard", transactionId: "TXN-4E5F6G7H", status: "Completed", date: "2025-06-16" },
  { id: "pmt-003", bookingId: "bkg-003", passengerId: "pas-003", amount: 1100, tax: 110, discount: 50, method: "PayPal", transactionId: "TXN-8I9J0K1L", status: "Completed", date: "2025-06-17" },
  { id: "pmt-004", bookingId: "bkg-004", passengerId: "pas-004", amount: 780, tax: 78, discount: 0, method: "Stripe", transactionId: "TXN-2M3N4O5P", status: "Pending", date: "2025-06-18" },
  { id: "pmt-005", bookingId: "bkg-005", passengerId: "pas-005", amount: 2600, tax: 260, discount: 0, method: "Amex", transactionId: "TXN-6Q7R8S9T", status: "Refunded", date: "2025-06-10" }
];

export const DEFAULT_COMPLAINTS = [
  { id: "cmp-001", passengerId: "pas-001", passengerName: "Nina Patel", subject: "Delayed Baggage", category: "Baggage", priority: "High", description: "My baggage was delayed by 6 hours on flight AE-101.", status: "Open", createdAt: "2025-06-20T10:00:00Z", assignedTo: "support@flight.com", resolvedAt: null, resolution: "" },
  { id: "cmp-002", passengerId: "pas-002", passengerName: "James Harrison", subject: "Seat Recline Broken", category: "In-Flight Service", priority: "Medium", description: "The seat recline mechanism was broken during my business class flight.", status: "In Progress", createdAt: "2025-06-18T14:30:00Z", assignedTo: "support@flight.com", resolvedAt: null, resolution: "Maintenance team notified." },
  { id: "cmp-003", passengerId: "pas-003", passengerName: "Aisha Al-Rashid", subject: "Refund Not Received", category: "Billing", priority: "High", description: "Cancelled ticket refund has not been processed after 2 weeks.", status: "Resolved", createdAt: "2025-06-05T09:00:00Z", assignedTo: "finance@flight.com", resolvedAt: "2025-06-12T11:00:00Z", resolution: "Refund processed to original payment method." }
];

export const DEFAULT_SETTINGS = {
  systemName: "AeroERP Systems",
  timezone: "UTC",
  currency: "USD",
  dateFormat: "MM/DD/YYYY",
  defaultLanguage: "English",
  maxBookingDays: 365,
  cancellationWindowHours: 24,
  refundPolicy: "Full refund if cancelled 24+ hours before departure.",
  emailNotifications: true,
  smsNotifications: true,
  twoFactorAuth: false,
  maintenanceMode: false,
  firebaseConfig: null,
  supportEmail: "support@aeroerp.com",
  supportPhone: "+1-800-AERO-ERP"
};

export const DEFAULT_LOGS = [
  { id: "log-001", userId: "u-001", userEmail: "admin@flight.com", action: "System Initialized", module: "System", oldValue: "", newValue: "AeroERP Boot", date: "2025-06-01T08:00:00Z", ipAddress: "192.168.1.1", browser: "Chrome/125" },
  { id: "log-002", userId: "u-001", userEmail: "admin@flight.com", action: "Add Airline", module: "Airlines", oldValue: "", newValue: "AeroERP Airways", date: "2025-06-01T08:15:00Z", ipAddress: "192.168.1.1", browser: "Chrome/125" },
  { id: "log-003", userId: "u-004", userEmail: "reservation@flight.com", action: "Create Booking", module: "Bookings", oldValue: "", newValue: "PNR: AE7F2K", date: "2025-06-15T10:30:00Z", ipAddress: "192.168.1.45", browser: "Edge/124" },
  { id: "log-004", userId: "u-006", userEmail: "finance@flight.com", action: "Process Payment", module: "Payments", oldValue: "Pending", newValue: "Completed — $850", date: "2025-06-15T10:35:00Z", ipAddress: "192.168.1.22", browser: "Firefox/126" },
  { id: "log-005", userId: "u-001", userEmail: "admin@flight.com", action: "Cancel Flight", module: "Flights", oldValue: "Scheduled", newValue: "Cancelled — AE-707", date: "2025-06-20T14:00:00Z", ipAddress: "192.168.1.1", browser: "Chrome/125" }
];
