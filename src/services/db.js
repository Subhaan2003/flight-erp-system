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

export function dbGetCollection(collection) {
  return isFirebaseConnected() ? fsGetCollection(collection) : localGetCollection(collection);
}

export function dbGetDoc(collection, id) {
  return isFirebaseConnected() ? fsGetDoc(collection, id) : localGetDoc(collection, id);
}

export function dbAddDoc(collection, docData) {
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
  if (isFirebaseConnected()) {
    fsDeleteDoc(collection, id).catch((err) =>
      console.error(`Firestore delete failed (${collection}):`, err)
    );
    return true;
  }
  return localDeleteDoc(collection, id);
}

export function dbSubscribe(collection, callback) {
  return isFirebaseConnected()
    ? fsSubscribe(collection, callback)
    : localSubscribe(collection, callback);
}
