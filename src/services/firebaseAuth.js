import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { firebaseAuth, isFirebaseInitialized } from "./firebase";
import { fsSetUserProfile, fsGetUserProfile, fsUpdateDoc } from "./firestoreDb";
import { mapFirebaseAuthError } from "./authErrors";
import { DEFAULT_USERS } from "./mockData";

export function isUsingFirebaseAuth() {
  return isFirebaseInitialized() && !!firebaseAuth;
}

export async function firebaseLogin(email, password) {
  const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
  let profile = await fsGetUserProfile(cred.user.uid);

  if (!profile) {
    profile = {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName || email.split("@")[0],
      role: "Passenger",
      status: "Active",
      photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${email}`,
      createdAt: new Date().toISOString(),
    };
    await fsSetUserProfile(cred.user.uid, profile);
  }

  await fsUpdateDoc("users", cred.user.uid, { lastLogin: new Date().toISOString() });

  return {
    ...profile,
    uid: cred.user.uid,
    email: cred.user.email,
    lastLogin: new Date().toISOString(),
  };
}

export async function firebaseSignup(email, password, displayName, role = "Passenger", extraDetails = {}) {
  const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);

  const profile = {
    uid: cred.user.uid,
    email,
    role,
    displayName,
    phone: extraDetails.phone || "",
    cnicPassport: extraDetails.cnicPassport || "",
    status: "Active",
    photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${displayName}`,
    createdAt: new Date().toISOString(),
    ...extraDetails,
  };

  await fsSetUserProfile(cred.user.uid, profile);
  return profile;
}

export async function firebaseLogout() {
  await signOut(firebaseAuth);
}

export async function firebaseForgotPassword(email) {
  try {
    // Attempting the most foolproof, setting-free reset call first
    await sendPasswordResetEmail(firebaseAuth, email);
    console.log("Success! Password reset email dispatched.");
    return true;
  } catch (error) {
    console.error("🔴 FIREBASE RESET ERROR CODE:", error.code);
    console.error("🔴 FIREBASE RESET ERROR MESSAGE:", error.message);
    throw error;
  }
}

export async function firebaseChangePassword(oldPassword, newPassword, email) {
  const user = firebaseAuth.currentUser;
  if (!user) throw new Error("No active user session.");

  const credential = EmailAuthProvider.credential(email, oldPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}

export async function firebaseSeedDemoAuthUsers(password = "admin123") {
  const results = { created: [], skipped: [], failed: [] };

  for (const seedUser of DEFAULT_USERS) {
    try {
      const cred = await createUserWithEmailAndPassword(firebaseAuth, seedUser.email, password);
      await fsSetUserProfile(cred.user.uid, {
        ...seedUser,
        uid: cred.user.uid,
      });
      await signOut(firebaseAuth);
      results.created.push(seedUser.email);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        results.skipped.push(seedUser.email);
      } else {
        results.failed.push({ email: seedUser.email, error: mapFirebaseAuthError(err) });
      }
    }
  }

  return results;
}
