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
  where,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BudgetScenario, WithId } from "./types";

const PROJECT_ID = "main";
const COLLECTION_NAME = "budgetScenarios";

function getCollectionPath() {
  return `weddingProjects/${PROJECT_ID}/${COLLECTION_NAME}`;
}

function docToScenario(docId: string, data: any): WithId<BudgetScenario> {
  return {
    id: docId,
    ...data,
  } as WithId<BudgetScenario>;
}

/**
 * Lists all budget scenarios ordered by createdAt descending (newest first)
 */
export async function listScenarios(): Promise<WithId<BudgetScenario>[]> {
  if (!db) {
    console.error("listScenarios: Firestore DB is not initialized.");
    throw new Error("Firestore DB is not available.");
  }
  const scenariosRef = collection(db, getCollectionPath());
  const q = query(scenariosRef, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => docToScenario(doc.id, doc.data()));
}

/**
 * Gets a single scenario by ID
 */
export async function getScenario(id: string): Promise<WithId<BudgetScenario> | null> {
  if (!db) {
    console.error("getScenario: Firestore DB is not initialized.");
    throw new Error("Firestore DB is not available.");
  }
  const scenarioRef = doc(db, getCollectionPath(), id);
  const scenarioSnap = await getDoc(scenarioRef);

  if (!scenarioSnap.exists()) {
    return null;
  }

  return docToScenario(scenarioSnap.id, scenarioSnap.data());
}

/**
 * Gets the active scenario
 * Note: We filter in code instead of using a composite index to avoid requiring Firestore index setup
 */
export async function getActiveScenario(): Promise<WithId<BudgetScenario> | null> {
  if (!db) {
    console.error("getActiveScenario: Firestore DB is not initialized.");
    throw new Error("Firestore DB is not available.");
  }
  // Get all scenarios and filter in code to avoid needing a composite index
  const allScenarios = await listScenarios();
  const activeScenarios = allScenarios.filter((s) => s.isActive);
  
  if (activeScenarios.length === 0) {
    return null;
  }

  // Return the most recently created active scenario
  return activeScenarios.sort((a, b) => {
    const aTime = a.createdAt?.toMillis() || 0;
    const bTime = b.createdAt?.toMillis() || 0;
    return bTime - aTime;
  })[0];
}

/**
 * Creates a new scenario
 */
export async function createScenario(
  data: Omit<BudgetScenario, "createdAt" | "updatedAt">
): Promise<string> {
  if (!db) {
    console.error("createScenario: Firestore DB is not initialized.");
    throw new Error("Firestore DB is not available.");
  }
  const scenariosRef = collection(db, getCollectionPath());
  const now = serverTimestamp();

  // If this scenario is set as active, deactivate all others
  if (data.isActive) {
    await deactivateAllScenarios();
  }

  // Build document data, excluding undefined values
  const docData: any = {
    name: data.name,
    isActive: data.isActive,
    createdAt: now,
    updatedAt: now,
  };
  
  // Add description only if it has a value
  if (data.description && data.description.trim()) {
    docData.description = data.description;
  }

  const docRef = await addDoc(scenariosRef, docData);

  return docRef.id;
}

/**
 * Updates an existing scenario
 */
export async function updateScenario(
  id: string,
  updates: Partial<Omit<BudgetScenario, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  if (!db) {
    console.error("updateScenario: Firestore DB is not initialized.");
    throw new Error("Firestore DB is not available.");
  }
  const scenarioRef = doc(db, getCollectionPath(), id);
  
  // If this scenario is being set as active, deactivate all others
  if (updates.isActive === true) {
    await deactivateAllScenarios();
  }

  // Build update data, excluding undefined values
  const updateData: any = {
    updatedAt: serverTimestamp(),
  };
  
  if (updates.name !== undefined) {
    updateData.name = updates.name;
  }
  if (updates.isActive !== undefined) {
    updateData.isActive = updates.isActive;
  }
  // Only include description if it's explicitly provided and not undefined
  if (updates.description !== undefined) {
    if (updates.description && updates.description.trim()) {
      updateData.description = updates.description;
    } else {
      // If description is explicitly set to empty/null, remove it from Firestore
      updateData.description = null;
    }
  }

  await updateDoc(scenarioRef, updateData);
}

/**
 * Deletes a scenario
 */
export async function deleteScenario(id: string): Promise<void> {
  if (!db) {
    console.error("deleteScenario: Firestore DB is not initialized.");
    throw new Error("Firestore DB is not available.");
  }
  const scenarioRef = doc(db, getCollectionPath(), id);
  await deleteDoc(scenarioRef);
}

/**
 * Deactivates all scenarios
 */
async function deactivateAllScenarios(): Promise<void> {
  if (!db) {
    return;
  }
  const scenariosRef = collection(db, getCollectionPath());
  const q = query(scenariosRef, where("isActive", "==", true));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return;
  }

  const batch = writeBatch(db);
  querySnapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { isActive: false, updatedAt: serverTimestamp() });
  });
  await batch.commit();
}

/**
 * Clones a scenario with all its expenses
 */
export async function cloneScenario(
  sourceScenarioId: string,
  newScenarioName: string
): Promise<string> {
  if (!db) {
    console.error("cloneScenario: Firestore DB is not initialized.");
    throw new Error("Firestore DB is not available.");
  }

  // Get source scenario
  const sourceScenario = await getScenario(sourceScenarioId);
  if (!sourceScenario) {
    throw new Error("Source scenario not found");
  }

  // Create new scenario
  const newScenarioData: Omit<BudgetScenario, "createdAt" | "updatedAt"> = {
    name: newScenarioName,
    isActive: false,
  };
  
  // Add description only if it has a value
  if (sourceScenario.description && sourceScenario.description.trim()) {
    newScenarioData.description = sourceScenario.description;
  }
  
  const newScenarioId = await createScenario(newScenarioData);

  // Clone expenses (we'll need to import listExpenses and createExpense)
  const { listExpenses, createExpense } = await import("./expenses");
  const sourceExpenses = await listExpenses();
  const expensesToClone = sourceExpenses.filter((e) => e.scenarioId === sourceScenarioId);

  // Create all expenses in batch
  const expensesRef = collection(db, `weddingProjects/${PROJECT_ID}/expenses`);
  const batch = writeBatch(db);
  const now = serverTimestamp();

  expensesToClone.forEach((expense) => {
    const { id, createdAt, updatedAt, ...expenseData } = expense;
    const newExpenseRef = doc(expensesRef);
    batch.set(newExpenseRef, {
      ...expenseData,
      scenarioId: newScenarioId,
      createdAt: now,
      updatedAt: now,
    });
  });

  await batch.commit();

  return newScenarioId;
}

