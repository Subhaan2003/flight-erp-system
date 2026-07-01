import { SEEDS } from "./localDb";
import { fsSeedCollection, fsCollectionIsEmpty } from "./firestoreDb";
import { isFirebaseInitialized } from "./firebase";

export async function seedFirestoreDatabase({ force = false, includeUsers = false } = {}) {
  if (!isFirebaseInitialized()) {
    throw new Error("Firebase is not connected. Configure credentials first.");
  }

  const report = { seeded: [], skipped: [] };

  for (const [collectionName, data] of Object.entries(SEEDS)) {
    if (collectionName === "users" && !includeUsers) {
      report.skipped.push(`${collectionName} (use Create Demo Auth Accounts instead)`);
      continue;
    }

    const empty = await fsCollectionIsEmpty(collectionName);
    if (!empty && !force) {
      report.skipped.push(collectionName);
      continue;
    }

    await fsSeedCollection(collectionName, data);
    report.seeded.push(collectionName);
  }

  return report;
}
