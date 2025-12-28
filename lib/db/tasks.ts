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
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Task, WithId } from "./types";

const PROJECT_ID = "main";
const COLLECTION_NAME = "tasks";

function getCollectionPath() {
  return `weddingProjects/${PROJECT_ID}/${COLLECTION_NAME}`;
}

function docToTask(docId: string, data: any): WithId<Task> {
  return {
    id: docId,
    ...data,
  } as WithId<Task>;
}

/**
 * Lists all tasks ordered by createdAt descending (newest first)
 */
export async function listTasks(): Promise<WithId<Task>[]> {
  if (!db) {
    throw new Error("Firebase Firestore nie jest zainicjalizowany. Sprawdź konfigurację Firebase.");
  }

  try {
    const tasksRef = collection(db, getCollectionPath());
    const q = query(tasksRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => docToTask(doc.id, doc.data()));
  } catch (error) {
    console.error("Błąd w listTasks:", error);
    throw error;
  }
}

/**
 * Gets a single task by ID
 */
export async function getTask(id: string): Promise<WithId<Task> | null> {
  const taskRef = doc(db, getCollectionPath(), id);
  const taskSnap = await getDoc(taskRef);

  if (!taskSnap.exists()) {
    return null;
  }

  return docToTask(taskSnap.id, taskSnap.data());
}

/**
 * Creates a new task
 */
export async function createTask(
  data: Omit<Task, "createdAt" | "updatedAt">
): Promise<string> {
  if (!db) {
    throw new Error("Firebase Firestore nie jest zainicjalizowany. Sprawdź konfigurację Firebase.");
  }

  try {
    const tasksRef = collection(db, getCollectionPath());
    const now = serverTimestamp();

    const docRef = await addDoc(tasksRef, {
      ...data,
      createdAt: now,
      updatedAt: now,
    });

    return docRef.id;
  } catch (error) {
    console.error("Błąd w createTask:", error);
    throw error;
  }
}

/**
 * Updates an existing task
 */
export async function updateTask(
  id: string,
  updates: Partial<Omit<Task, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  const taskRef = doc(db, getCollectionPath(), id);
  await updateDoc(taskRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Deletes a task
 */
export async function deleteTask(id: string): Promise<void> {
  const taskRef = doc(db, getCollectionPath(), id);
  await deleteDoc(taskRef);
}

