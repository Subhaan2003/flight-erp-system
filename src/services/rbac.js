export const PASSENGER_ROLE = "Passenger";

export const STAFF_ROLES = [
  "Super Admin",
  "Airline Admin",
  "Flight Manager",
  "Reservation Manager",
  "Pilot",
  "Cabin Crew",
  "HR Manager",
  "Finance Manager",
  "Customer Support",
];

export const ROLE_INFO = {
  Passenger: { icon: "🧳", desc: "Book flights, manage reservations & boarding passes" },
  "Super Admin": { icon: "⚙️", desc: "Full system access — all modules & configuration" },
  "Airline Admin": { icon: "🏢", desc: "Manage airline carriers, fleets & scheduling" },
  "Flight Manager": { icon: "🛫", desc: "Flight dispatch, aircraft & airport operations" },
  "Reservation Manager": { icon: "🎫", desc: "Bookings, check-in & passenger ticket management" },
  Pilot: { icon: "👨‍✈️", desc: "Flight assignments, logs & crew coordination" },
  "Cabin Crew": { icon: "💼", desc: "Passenger service, boarding & cargo operations" },
  "HR Manager": { icon: "👥", desc: "Employee records, payroll & leave management" },
  "Finance Manager": { icon: "📊", desc: "Revenue reports, payments & financial analytics" },
  "Customer Support": { icon: "🎧", desc: "Help desk, complaints & passenger assistance" },
};

export const ROLE_ACCESS = {
  "/dashboard": [
    "Super Admin",
    "Airline Admin",
    "Flight Manager",
    "Reservation Manager",
    "Pilot",
    "Cabin Crew",
    "HR Manager",
    "Finance Manager",
    "Customer Support",
    PASSENGER_ROLE,
  ],
  "/airlines": ["Super Admin", "Airline Admin"],
  "/airports": ["Super Admin", "Airline Admin", "Flight Manager"],
  "/aircrafts": ["Super Admin", "Airline Admin", "Flight Manager"],
  "/flights": ["Super Admin", "Airline Admin", "Flight Manager", "Pilot", "Cabin Crew"],
  "/bookings": ["Super Admin", "Reservation Manager", PASSENGER_ROLE],
  "/passengers": ["Super Admin", "Reservation Manager", "Customer Support"],
  "/employees": ["Super Admin", "HR Manager", "Finance Manager"],
  "/operations": ["Super Admin", "Flight Manager", "Pilot", "Cabin Crew"],
  "/check-in": ["Super Admin", "Reservation Manager", PASSENGER_ROLE],
  "/support": ["Super Admin", "Customer Support", PASSENGER_ROLE],
  "/reports": ["Super Admin", "Finance Manager", "Airline Admin"],
  "/settings": ["Super Admin"],
};

export function normalizeRole(role) {
  if (!role) return PASSENGER_ROLE;
  const normalized = String(role).trim();
  if (normalized === "Passenger") return PASSENGER_ROLE;
  return normalized;
}

export function getRoleLandingPath(role) {
  const normalized = normalizeRole(role);
  switch (normalized) {
    case "Pilot":
      return "/operations";
    case "Reservation Manager":
      return "/check-in";
    case "Cabin Crew":
      return "/operations";
    case "Customer Support":
      return "/support";
    case "HR Manager":
      return "/employees";
    case "Finance Manager":
      return "/reports";
    case PASSENGER_ROLE:
      return "/bookings";
    default:
      return "/dashboard";
  }
}

export function canAccessRoute(role, path) {
  const allowed = ROLE_ACCESS[path];
  if (!allowed) return true;
  return allowed.includes(normalizeRole(role));
}
