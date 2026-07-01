import {
  localGetCollection,
  localGetDoc,
  localAddDoc,
  localUpdateDoc,
  localDeleteDoc,
  localSubscribe,
} from "./localDb";
import {
  fsGetCollection,
  fsGetDoc,
  fsAddDoc,
  fsUpdateDoc,
  fsDeleteDoc,
  fsSubscribe,
  fsWarmupCollections,
} from "./firestoreDb";
import {
  isFirebaseInitialized,
  saveFirebaseConfig,
  initFirebase,
  resolveFirebaseConfig,
} from "./firebase";
import { SEEDS } from "./localDb";

export function isFirebaseConnected() {
  return isFirebaseInitialized();
}

export function getFirebaseConfig() {
  return resolveFirebaseConfig();
}

export { saveFirebaseConfig, initFirebase };

export function warmupFirebaseCollections() {
  if (isFirebaseInitialized()) {
    fsWarmupCollections(Object.keys(SEEDS));
  }
}

export function logSystemAction(userId, userEmail, action, module, oldValue = "", newValue = "") {
  const newLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    userEmail,
    action,
    module,
    oldValue: typeof oldValue === "object" ? JSON.stringify(oldValue) : String(oldValue),
    newValue: typeof newValue === "object" ? JSON.stringify(newValue) : String(newValue),
    date: new Date().toISOString(),
    ipAddress: "192.168.1.45",
    browser: navigator.userAgent.split(" ")[0] || "Edge Browser",
  };

  dbAddDoc("logs", newLog);
}

function getCurrentUser() {
  try {
    const cached = localStorage.getItem("aero_current_user");
    return cached ? JSON.parse(cached) : null;
  } catch (e) {
    return null;
  }
}

function filterCollectionForPassenger(collectionName, data) {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== "Passenger") {
    return data;
  }

  const passengers = isFirebaseConnected() ? fsGetCollection("passengers") : localGetCollection("passengers");
  const myPassenger = passengers.find(p => p.email === currentUser.email);
  const myPassengerId = myPassenger ? myPassenger.id : null;

  if (collectionName === "passengers") {
    return data.filter(p => p.email === currentUser.email);
  }
  if (collectionName === "complaints") {
    return data.filter(c => c.email === currentUser.email || (myPassengerId && c.passengerId === myPassengerId));
  }
  if (["tickets", "bookings", "baggage", "payments", "checkins", "boarding"].includes(collectionName)) {
    return data.filter(item => item.passengerId === myPassengerId);
  }
  return data;
}

export function dbGetCollection(collection) {
  const data = isFirebaseConnected() ? fsGetCollection(collection) : localGetCollection(collection);
  return filterCollectionForPassenger(collection, data);
}

export function dbGetDoc(collection, id) {
  const doc = isFirebaseConnected() ? fsGetDoc(collection, id) : localGetDoc(collection, id);
  if (!doc) return null;
  const filtered = filterCollectionForPassenger(collection, [doc]);
  return filtered.length > 0 ? filtered[0] : null;
}

export function dbAddDoc(collection, docData) {
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.role === "Passenger") {
    const passengers = isFirebaseConnected() ? fsGetCollection("passengers") : localGetCollection("passengers");
    const myPassenger = passengers.find(p => p.email === currentUser.email);
    const myPassengerId = myPassenger ? myPassenger.id : null;

    if (collection === "passengers") {
      docData.email = currentUser.email;
    } else if (collection === "complaints") {
      docData.email = currentUser.email;
      if (myPassengerId) docData.passengerId = myPassengerId;
    } else if (["tickets", "bookings", "baggage", "payments", "checkins", "boarding"].includes(collection)) {
      if (myPassengerId) docData.passengerId = myPassengerId;
    }
  }

  if (isFirebaseConnected()) {
    fsAddDoc(collection, docData).catch((err) =>
      console.error(`Firestore add failed (${collection}):`, err)
    );
    const newDoc = { ...docData };
    if (collection !== "settings" && !newDoc.id && !newDoc.uid) {
      newDoc.id = `${collection.slice(0, 3)}-${Date.now()}`;
    }
    return newDoc;
  }
  return localAddDoc(collection, docData);
}

export function dbUpdateDoc(collection, id, updatedFields) {
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.role === "Passenger") {
    const existing = dbGetDoc(collection, id);
    if (!existing) {
      console.error(`Unauthorized update attempt on ${collection} for ID ${id}`);
      return null;
    }
  }

  if (isFirebaseConnected()) {
    fsUpdateDoc(collection, id, updatedFields).catch((err) =>
      console.error(`Firestore update failed (${collection}):`, err)
    );
    const existing = fsGetDoc(collection, id);
    return existing ? { ...existing, ...updatedFields } : null;
  }
  return localUpdateDoc(collection, id, updatedFields);
}

export function dbDeleteDoc(collection, id) {
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.role === "Passenger") {
    const existing = dbGetDoc(collection, id);
    if (!existing) {
      console.error(`Unauthorized delete attempt on ${collection} for ID ${id}`);
      return false;
    }
  }

  if (isFirebaseConnected()) {
    fsDeleteDoc(collection, id).catch((err) =>
      console.error(`Firestore delete failed (${collection}):`, err)
    );
    return true;
  }
  return localDeleteDoc(collection, id);
}

export function dbSubscribe(collection, callback) {
  const filteredCallback = (newData) => {
    callback(filterCollectionForPassenger(collection, newData));
  };
  return isFirebaseConnected()
    ? fsSubscribe(collection, filteredCallback)
    : localSubscribe(collection, filteredCallback);
}
