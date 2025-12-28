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
import { Note, WithId } from "./types";

const PROJECT_ID = "main";
const COLLECTION_NAME = "notes";

function getCollectionPath() {
  return `weddingProjects/${PROJECT_ID}/${COLLECTION_NAME}`;
}

function docToNote(docId: string, data: any): WithId<Note> {
  return {
    id: docId,
    ...data,
  } as WithId<Note>;
}

/**
 * Lists all notes ordered by createdAt descending (newest first)
 */
export async function listNotes(): Promise<WithId<Note>[]> {
  if (!db) {
    console.error("listNotes: Firestore DB is not initialized.");
    throw new Error("Firestore DB is not available.");
  }
  const notesRef = collection(db, getCollectionPath());
  const q = query(notesRef, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => docToNote(doc.id, doc.data()));
}

/**
 * Gets a single note by ID
 */
export async function getNote(id: string): Promise<WithId<Note> | null> {
  if (!db) {
    console.error("getNote: Firestore DB is not initialized.");
    throw new Error("Firestore DB is not available.");
  }
  const noteRef = doc(db, getCollectionPath(), id);
  const noteSnap = await getDoc(noteRef);

  if (!noteSnap.exists()) {
    return null;
  }

  return docToNote(noteSnap.id, noteSnap.data());
}

/**
 * Creates a new note
 */
export async function createNote(
  data: Omit<Note, "createdAt" | "updatedAt">
): Promise<string> {
  if (!db) {
    console.error("createNote: Firestore DB is not initialized.");
    throw new Error("Firestore DB is not available.");
  }
  const notesRef = collection(db, getCollectionPath());
  const now = serverTimestamp();

  const docRef = await addDoc(notesRef, {
    ...data,
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
}

/**
 * Updates an existing note
 */
export async function updateNote(
  id: string,
  updates: Partial<Omit<Note, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  if (!db) {
    console.error("updateNote: Firestore DB is not initialized.");
    throw new Error("Firestore DB is not available.");
  }
  const noteRef = doc(db, getCollectionPath(), id);
  await updateDoc(noteRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Deletes a note
 */
export async function deleteNote(id: string): Promise<void> {
  if (!db) {
    console.error("deleteNote: Firestore DB is not initialized.");
    throw new Error("Firestore DB is not available.");
  }
  const noteRef = doc(db, getCollectionPath(), id);
  await deleteDoc(noteRef);
}

