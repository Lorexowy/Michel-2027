import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Vendor, WithId } from "./types";

const PROJECT_ID = "main";
const COLLECTION_NAME = "vendors";

function getCollectionPath() {
  return `weddingProjects/${PROJECT_ID}/${COLLECTION_NAME}`;
}

function docToVendor(docId: string, data: any): WithId<Vendor> {
  return {
    id: docId,
    ...data,
  } as WithId<Vendor>;
}

/**
 * Lists all vendors ordered by createdAt descending (newest first)
 */
export async function listVendors(): Promise<WithId<Vendor>[]> {
  if (!db) {
    console.error("listVendors: Firestore DB is not initialized.");
    throw new Error("Firestore DB is not available.");
  }
  const vendorsRef = collection(db, getCollectionPath());
  const q = query(vendorsRef, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => docToVendor(doc.id, doc.data()));
}

/**
 * Gets a single vendor by ID
 */
export async function getVendor(id: string): Promise<WithId<Vendor> | null> {
  if (!db) {
    console.error("getVendor: Firestore DB is not initialized.");
    throw new Error("Firestore DB is not available.");
  }
  const vendorRef = doc(db, getCollectionPath(), id);
  const vendorSnap = await getDoc(vendorRef);

  if (!vendorSnap.exists()) {
    return null;
  }

  return docToVendor(vendorSnap.id, vendorSnap.data());
}

/**
 * Creates a new vendor
 */
export async function createVendor(
  data: Omit<Vendor, "createdAt" | "updatedAt">
): Promise<string> {
  if (!db) {
    console.error("createVendor: Firestore DB is not initialized.");
    throw new Error("Firestore DB is not available.");
  }
  const vendorsRef = collection(db, getCollectionPath());
  const now = serverTimestamp();

  const docRef = await addDoc(vendorsRef, {
    ...data,
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
}

/**
 * Updates an existing vendor
 */
export async function updateVendor(
  id: string,
  updates: Partial<Omit<Vendor, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  if (!db) {
    console.error("updateVendor: Firestore DB is not initialized.");
    throw new Error("Firestore DB is not available.");
  }
  const vendorRef = doc(db, getCollectionPath(), id);
  await updateDoc(vendorRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Deletes a vendor
 */
export async function deleteVendor(id: string): Promise<void> {
  if (!db) {
    console.error("deleteVendor: Firestore DB is not initialized.");
    throw new Error("Firestore DB is not available.");
  }
  const vendorRef = doc(db, getCollectionPath(), id);
  await deleteDoc(vendorRef);
}

