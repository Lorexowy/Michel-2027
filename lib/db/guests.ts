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
import { Guest, WithId } from "./types";

const PROJECT_ID = "main";
const COLLECTION_NAME = "guests";

function getCollectionPath() {
  return `weddingProjects/${PROJECT_ID}/${COLLECTION_NAME}`;
}

function docToGuest(docId: string, data: any): WithId<Guest> {
  return {
    id: docId,
    ...data,
  } as WithId<Guest>;
}

/**
 * Lists all guests ordered by firstName ascending
 */
export async function listGuests(): Promise<WithId<Guest>[]> {
  if (!db) {
    console.error("listGuests: Firestore DB is not initialized.");
    throw new Error("Firestore DB is not available.");
  }
  const guestsRef = collection(db, getCollectionPath());
  const q = query(guestsRef, orderBy("firstName", "asc"));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => docToGuest(doc.id, doc.data()));
}

/**
 * Gets a single guest by ID
 */
export async function getGuest(id: string): Promise<WithId<Guest> | null> {
  if (!db) {
    console.error("getGuest: Firestore DB is not initialized.");
    throw new Error("Firestore DB is not available.");
  }
  const guestRef = doc(db, getCollectionPath(), id);
  const guestSnap = await getDoc(guestRef);

  if (!guestSnap.exists()) {
    return null;
  }

  return docToGuest(guestSnap.id, guestSnap.data());
}

/**
 * Creates a new guest
 */
export async function createGuest(
  data: Omit<Guest, "createdAt" | "updatedAt">
): Promise<string> {
  if (!db) {
    console.error("createGuest: Firestore DB is not initialized.");
    throw new Error("Firestore DB is not available.");
  }
  const guestsRef = collection(db, getCollectionPath());
  const now = serverTimestamp();

  const docRef = await addDoc(guestsRef, {
    ...data,
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
}

/**
 * Updates an existing guest
 */
export async function updateGuest(
  id: string,
  updates: Partial<Omit<Guest, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  if (!db) {
    console.error("updateGuest: Firestore DB is not initialized.");
    throw new Error("Firestore DB is not available.");
  }
  const guestRef = doc(db, getCollectionPath(), id);
  await updateDoc(guestRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Deletes a guest
 */
export async function deleteGuest(id: string): Promise<void> {
  if (!db) {
    console.error("deleteGuest: Firestore DB is not initialized.");
    throw new Error("Firestore DB is not available.");
  }
  const guestRef = doc(db, getCollectionPath(), id);
  await deleteDoc(guestRef);
}

