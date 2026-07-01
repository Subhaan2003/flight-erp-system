import React, { createContext, useContext, useState, useEffect } from "react";
import {
  dbGetCollection,
  dbGetDoc,
  dbAddDoc,
  dbUpdateDoc,
  dbDeleteDoc,
  dbSubscribe,
  isFirebaseConnected,
  logSystemAction,
  warmupFirebaseCollections,
} from "../services/db";
import { uploadFile, uploadProfilePhoto, uploadDocument, deleteFile } from "../services/storage";

const DBContext = createContext();

export function DBProvider({ children }) {
  useEffect(() => {
    if (isFirebaseConnected()) {
      warmupFirebaseCollections();
    }
  }, []);

  const value = {
    getCollection: dbGetCollection,
    getDoc: dbGetDoc,
    addDoc: dbAddDoc,
    updateDoc: dbUpdateDoc,
    deleteDoc: dbDeleteDoc,
    subscribe: dbSubscribe,
    isFirebaseConnected,
    logSystemAction,
    uploadFile,
    uploadProfilePhoto,
    uploadDocument,
    deleteFile,
  };

  return <DBContext.Provider value={value}>{children}</DBContext.Provider>;
}

export function useDB() {
  return useContext(DBContext);
}

export function useCollection(collectionName) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = dbSubscribe(collectionName, (newData) => {
      setData(newData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [collectionName]);

  return [data, loading];
}
