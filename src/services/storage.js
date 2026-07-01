import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { firebaseStorage, isFirebaseInitialized } from "./firebase";

export async function uploadFile(storagePath, file) {
  if (!isFirebaseInitialized() || !firebaseStorage) {
    throw new Error("Firebase Storage is not configured. Add your Firebase credentials first.");
  }

  const storageRef = ref(firebaseStorage, storagePath);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}

export async function deleteFile(storagePath) {
  if (!isFirebaseInitialized() || !firebaseStorage) {
    throw new Error("Firebase Storage is not configured.");
  }

  await deleteObject(ref(firebaseStorage, storagePath));
}

export async function uploadProfilePhoto(userId, file) {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `profiles/${userId}/avatar.${ext}`;
  return uploadFile(path, file);
}

export async function uploadDocument(folder, id, file) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${folder}/${id}/${Date.now()}_${safeName}`;
  return uploadFile(path, file);
}
