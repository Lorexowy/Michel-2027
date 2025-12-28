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
import { Expense, WithId } from "./types";

const PROJECT_ID = "main";
const COLLECTION_NAME = "expenses";

function getCollectionPath() {
  return `weddingProjects/${PROJECT_ID}/${COLLECTION_NAME}`;
}

function docToExpense(docId: string, data: any): WithId<Expense> {
  return {
    id: docId,
    ...data,
  } as WithId<Expense>;
}

/**
 * Lists all expenses ordered by createdAt descending (newest first)
 */
export async function listExpenses(): Promise<WithId<Expense>[]> {
  if (!db) {
    console.error("listExpenses: Firestore DB is not initialized.");
    throw new Error("Firestore DB is not available.");
  }
  const expensesRef = collection(db, getCollectionPath());
  const q = query(expensesRef, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => docToExpense(doc.id, doc.data()));
}

/**
 * Gets a single expense by ID
 */
export async function getExpense(id: string): Promise<WithId<Expense> | null> {
  if (!db) {
    console.error("getExpense: Firestore DB is not initialized.");
    throw new Error("Firestore DB is not available.");
  }
  const expenseRef = doc(db, getCollectionPath(), id);
  const expenseSnap = await getDoc(expenseRef);

  if (!expenseSnap.exists()) {
    return null;
  }

  return docToExpense(expenseSnap.id, expenseSnap.data());
}

/**
 * Creates a new expense
 */
export async function createExpense(
  data: Omit<Expense, "createdAt" | "updatedAt">
): Promise<string> {
  if (!db) {
    console.error("createExpense: Firestore DB is not initialized.");
    throw new Error("Firestore DB is not available.");
  }
  const expensesRef = collection(db, getCollectionPath());
  const now = serverTimestamp();

  const docRef = await addDoc(expensesRef, {
    ...data,
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
}

/**
 * Updates an existing expense
 */
export async function updateExpense(
  id: string,
  updates: Partial<Omit<Expense, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  if (!db) {
    console.error("updateExpense: Firestore DB is not initialized.");
    throw new Error("Firestore DB is not available.");
  }
  const expenseRef = doc(db, getCollectionPath(), id);
  await updateDoc(expenseRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Deletes an expense
 */
export async function deleteExpense(id: string): Promise<void> {
  if (!db) {
    console.error("deleteExpense: Firestore DB is not initialized.");
    throw new Error("Firestore DB is not available.");
  }
  const expenseRef = doc(db, getCollectionPath(), id);
  await deleteDoc(expenseRef);
}

