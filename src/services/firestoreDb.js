import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from "firebase/firestore";
import { firebaseDb } from "./firebase";

const cache = {};
const snapshotUnsubs = {};
const collectionCallbacks = {};

function resolveDocId(item) {
  return item.id || item.uid || item.code;
}

function normalizeSnapshotData(collectionName, snapshot) {
  if (collectionName === "settings") {
    const first = snapshot.docs[0];
    cache[collectionName] = first ? first.data() : {};
    return cache[collectionName];
  }

  cache[collectionName] = snapshot.docs.map((d) => ({
    ...d.data(),
    id: d.data().id || d.id,
    uid: d.data().uid || (collectionName === "users" ? d.id : d.data().uid),
  }));
  return cache[collectionName];
}

function notifyCollectionCallbacks(collectionName) {
  const data = cache[collectionName] ?? (collectionName === "settings" ? {} : []);
  (collectionCallbacks[collectionName] || []).forEach((cb) => cb(data));
}

function ensureSnapshotListener(collectionName) {
  if (!firebaseDb || snapshotUnsubs[collectionName]) return;

  if (collectionName === "settings") {
    const settingsRef = doc(firebaseDb, "settings", "global");
    snapshotUnsubs[collectionName] = onSnapshot(
      settingsRef,
      (snap) => {
        cache[collectionName] = snap.exists() ? snap.data() : {};
        notifyCollectionCallbacks(collectionName);
      },
      (err) => console.error(`Firestore settings listener error:`, err)
    );
    return;
  }

  const colRef = collection(firebaseDb, collectionName);
  snapshotUnsubs[collectionName] = onSnapshot(
    colRef,
    (snap) => {
      normalizeSnapshotData(collectionName, snap);
      notifyCollectionCallbacks(collectionName);
    },
    (err) => console.error(`Firestore listener error (${collectionName}):`, err)
  );
}

export function fsWarmupCollections(collectionNames) {
  collectionNames.forEach((name) => ensureSnapshotListener(name));
}

export function fsGetCollection(collectionName) {
  ensureSnapshotListener(collectionName);
  if (collectionName === "settings") {
    return cache[collectionName] ?? {};
  }
  return cache[collectionName] ?? [];
}

export async function fsGetDocById(collectionName, id) {
  if (!firebaseDb) return null;

  if (collectionName === "settings") {
    const snap = await getDoc(doc(firebaseDb, "settings", "global"));
    return snap.exists() ? snap.data() : {};
  }

  const snap = await getDoc(doc(firebaseDb, collectionName, id));
  return snap.exists() ? { ...snap.data(), id: snap.id } : null;
}

export function fsGetDoc(collectionName, id) {
  if (collectionName === "settings") {
    return fsGetCollection("settings");
  }
  return fsGetCollection(collectionName).find(
    (item) => item.id === id || item.uid === id || item.code === id
  );
}

export async function fsAddDoc(collectionName, docData) {
  if (!firebaseDb) throw new Error("Firestore not initialized");

  let newDoc = { ...docData };

  if (collectionName === "settings") {
    await setDoc(doc(firebaseDb, "settings", "global"), newDoc, { merge: true });
    cache[collectionName] = { ...(cache[collectionName] || {}), ...newDoc };
    notifyCollectionCallbacks(collectionName);
    return newDoc;
  }

  const docId = resolveDocId(newDoc) || `${collectionName.slice(0, 3)}-${Date.now()}`;
  if (!newDoc.id && !newDoc.uid) newDoc.id = docId;

  const docRef = doc(firebaseDb, collectionName, collectionName === "users" ? (newDoc.uid || docId) : docId);
  await setDoc(docRef, newDoc);
  return newDoc;
}

export async function fsUpdateDoc(collectionName, id, updatedFields) {
  if (!firebaseDb) throw new Error("Firestore not initialized");

  if (collectionName === "settings") {
    await setDoc(doc(firebaseDb, "settings", "global"), updatedFields, { merge: true });
    cache[collectionName] = { ...(cache[collectionName] || {}), ...updatedFields };
    notifyCollectionCallbacks(collectionName);
    return cache[collectionName];
  }

  const existing = fsGetDoc(collectionName, id);
  if (!existing) return null;

  const docId = existing.uid || existing.id || existing.code || id;
  const docRef = doc(firebaseDb, collectionName, docId);
  await updateDoc(docRef, updatedFields);

  const updatedDoc = { ...existing, ...updatedFields };
  if (cache[collectionName]) {
    cache[collectionName] = cache[collectionName].map((item) =>
      item.id === docId || item.uid === docId || item.code === docId ? updatedDoc : item
    );
    notifyCollectionCallbacks(collectionName);
  }
  return updatedDoc;
}

export async function fsDeleteDoc(collectionName, id) {
  if (!firebaseDb) throw new Error("Firestore not initialized");

  const existing = fsGetDoc(collectionName, id);
  if (!existing) return true;

  const docId = existing.uid || existing.id || existing.code || id;
  await deleteDoc(doc(firebaseDb, collectionName, docId));

  if (cache[collectionName]) {
    cache[collectionName] = cache[collectionName].filter(
      (item) => !(item.id === docId || item.uid === docId || item.code === docId)
    );
    notifyCollectionCallbacks(collectionName);
  }
  return true;
}

export function fsSubscribe(collectionName, callback) {
  ensureSnapshotListener(collectionName);

  if (!collectionCallbacks[collectionName]) {
    collectionCallbacks[collectionName] = [];
  }
  collectionCallbacks[collectionName].push(callback);

  callback(fsGetCollection(collectionName));

  return () => {
    collectionCallbacks[collectionName] = (collectionCallbacks[collectionName] || []).filter(
      (cb) => cb !== callback
    );
  };
}

export async function fsSeedCollection(collectionName, items) {
  if (!firebaseDb) throw new Error("Firestore not initialized");

  if (collectionName === "settings") {
    await setDoc(doc(firebaseDb, "settings", "global"), items, { merge: true });
    return;
  }

  const batch = writeBatch(firebaseDb);
  items.forEach((item) => {
    const docId = resolveDocId(item) || `${collectionName.slice(0, 3)}-${Math.random().toString(36).slice(2, 9)}`;
    const ref = doc(firebaseDb, collectionName, collectionName === "users" ? (item.uid || docId) : docId);
    batch.set(ref, { ...item, id: item.id || docId });
  });
  await batch.commit();
}

export async function fsCollectionIsEmpty(collectionName) {
  if (!firebaseDb) return true;

  if (collectionName === "settings") {
    const snap = await getDoc(doc(firebaseDb, "settings", "global"));
    return !snap.exists();
  }

  const snap = await getDocs(collection(firebaseDb, collectionName));
  return snap.empty;
}

export async function fsGetUserProfile(uid) {
  return fsGetDocById("users", uid);
}

export async function fsSetUserProfile(uid, profile) {
  await setDoc(doc(firebaseDb, "users", uid), { ...profile, uid }, { merge: true });
}
