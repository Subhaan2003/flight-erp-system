import {
  DEFAULT_USERS,
  DEFAULT_AIRLINES,
  DEFAULT_AIRPORTS,
  DEFAULT_AIRCRAFTS,
  DEFAULT_FLIGHTS,
  DEFAULT_PASSENGERS,
  DEFAULT_EMPLOYEES,
  DEFAULT_PILOTS,
  DEFAULT_CABIN_CREW,
  DEFAULT_ATTENDANCE,
  DEFAULT_LEAVES,
  DEFAULT_PAYROLL,
  DEFAULT_MAINTENANCE,
  DEFAULT_FUEL,
  DEFAULT_CARGO,
  DEFAULT_BAGGAGE,
  DEFAULT_BOOKINGS,
  DEFAULT_TICKETS,
  DEFAULT_PAYMENTS,
  DEFAULT_COMPLAINTS,
  DEFAULT_SETTINGS,
  DEFAULT_LOGS,
} from "./mockData";

const SEEDS = {
  users: DEFAULT_USERS,
  airlines: DEFAULT_AIRLINES,
  airports: DEFAULT_AIRPORTS,
  aircrafts: DEFAULT_AIRCRAFTS,
  flights: DEFAULT_FLIGHTS,
  flightSchedules: DEFAULT_FLIGHTS,
  flightStatus: DEFAULT_FLIGHTS,
  passengers: DEFAULT_PASSENGERS,
  employees: DEFAULT_EMPLOYEES,
  pilots: DEFAULT_PILOTS,
  cabinCrew: DEFAULT_CABIN_CREW,
  attendance: DEFAULT_ATTENDANCE,
  leaveRequests: DEFAULT_LEAVES,
  payroll: DEFAULT_PAYROLL,
  maintenance: DEFAULT_MAINTENANCE,
  fuel: DEFAULT_FUEL,
  cargo: DEFAULT_CARGO,
  baggage: DEFAULT_BAGGAGE,
  bookings: DEFAULT_BOOKINGS,
  tickets: DEFAULT_TICKETS,
  payments: DEFAULT_PAYMENTS,
  complaints: DEFAULT_COMPLAINTS,
  settings: DEFAULT_SETTINGS,
  logs: DEFAULT_LOGS,
};

Object.entries(SEEDS).forEach(([col, initialData]) => {
  const key = `aero_db_${col}`;
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, JSON.stringify(initialData));
  }
});

const listeners = {};

function notifySubscribers(collection) {
  if (listeners[collection]) {
    const data = localGetCollection(collection);
    listeners[collection].forEach((callback) => callback(data));
  }
}

function storageKey(collection) {
  return `aero_db_${collection}`;
}

export function localGetCollection(collection) {
  try {
    const raw = localStorage.getItem(storageKey(collection));
    const parsed = JSON.parse(raw);
    if (collection === "settings") {
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    }
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error(`Error loading collection ${collection}`, e);
    return collection === "settings" ? {} : [];
  }
}

export function localGetDoc(collection, id) {
  const data = localGetCollection(collection);
  if (collection === "settings") return data;
  return data.find((item) => item.id === id || item.uid === id || item.code === id);
}

export function localAddDoc(collection, docData) {
  let newDoc = { ...docData };

  if (collection === "settings") {
    localStorage.setItem(storageKey(collection), JSON.stringify(newDoc));
  } else {
    const current = localGetCollection(collection);
    if (!newDoc.id && !newDoc.uid) {
      newDoc.id = `${collection.slice(0, 3)}-${Date.now()}`;
    }
    current.push(newDoc);
    localStorage.setItem(storageKey(collection), JSON.stringify(current));
  }

  notifySubscribers(collection);
  return newDoc;
}

export function localUpdateDoc(collection, id, updatedFields) {
  if (collection === "settings") {
    const current = localGetCollection(collection);
    const updated = { ...current, ...updatedFields };
    localStorage.setItem(storageKey(collection), JSON.stringify(updated));
    notifySubscribers(collection);
    return updated;
  }

  const current = localGetCollection(collection);
  let updatedDoc = null;

  const updatedList = current.map((item) => {
    const matchId = item.id === id || item.uid === id || item.code === id;
    if (matchId) {
      updatedDoc = { ...item, ...updatedFields };
      return updatedDoc;
    }
    return item;
  });

  localStorage.setItem(storageKey(collection), JSON.stringify(updatedList));
  notifySubscribers(collection);
  return updatedDoc;
}

export function localDeleteDoc(collection, id) {
  const current = localGetCollection(collection);
  const filtered = current.filter(
    (item) => !(item.id === id || item.uid === id || item.code === id)
  );
  localStorage.setItem(storageKey(collection), JSON.stringify(filtered));
  notifySubscribers(collection);
  return true;
}

export function localSubscribe(collection, callback) {
  if (!listeners[collection]) {
    listeners[collection] = [];
  }
  listeners[collection].push(callback);
  callback(localGetCollection(collection));

  return () => {
    listeners[collection] = listeners[collection].filter((cb) => cb !== callback);
  };
}

export { SEEDS };
