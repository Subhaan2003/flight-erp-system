import functions from "firebase-functions";
import admin from "firebase-admin";

admin.initializeApp();

const ALLOWED_ROLES = [
  "Airline Admin",
  "Flight Manager",
  "Reservation Manager",
  "Pilot",
  "Cabin Crew",
  "HR Manager",
  "Finance Manager",
  "Customer Support",
];

export const provisionStaffAccount = functions.https.onCall(async (request) => {
  const caller = request.auth;
  if (!caller) {
    throw new functions.https.HttpsError("unauthenticated", "Login required.");
  }

  if (caller.token.role !== "Super Admin") {
    throw new functions.https.HttpsError("permission-denied", "Only Super Admin can provision accounts.");
  }

  const { email, password, displayName, role, phone = "", metadata = {} } = request.data;

  if (!email || !password || !displayName || !role) {
    throw new functions.https.HttpsError("invalid-argument", "Missing required fields.");
  }

  if (!ALLOWED_ROLES.includes(role)) {
    throw new functions.https.HttpsError("invalid-argument", "Unsupported role.");
  }

  let userRecord;
  try {
    userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
      emailVerified: false,
    });
  } catch (error) {
    if (error.code === "auth/email-already-exists") {
      throw new functions.https.HttpsError("already-exists", "User already exists.");
    }
    throw new functions.https.HttpsError("internal", error.message);
  }

  await admin.auth().setCustomUserClaims(userRecord.uid, { role });

  await admin.firestore().collection("users").doc(userRecord.uid).set({
    uid: userRecord.uid,
    email,
    displayName,
    role,
    status: "Active",
    phone,
    photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${displayName}`,
    createdAt: new Date().toISOString(),
    metadata,
  });

  return {
    success: true,
    uid: userRecord.uid,
    email,
    role,
  };
});
