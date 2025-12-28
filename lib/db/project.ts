import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { WeddingProject } from "./types";

const PROJECT_ID = "main";
const PROJECT_COLLECTION = "weddingProjects";

/**
 * Ensures the main wedding project exists. Creates it with defaults if missing.
 * Updates updatedAt timestamp on each call.
 */
export async function ensureMainProject(): Promise<WeddingProject & { id: string }> {
  console.log("ensureMainProject: Sprawdzam db:", !!db);
  
  if (!db) {
    // Czekaj chwilę - może Firebase jeszcze się inicjalizuje
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (!db) {
      throw new Error("Firebase Firestore nie jest zainicjalizowany. Sprawdź konfigurację Firebase.");
    }
  }

  try {
    console.log("ensureMainProject: Pobieram dokument...");
    const projectRef = doc(db, PROJECT_COLLECTION, PROJECT_ID);
    const projectSnap = await getDoc(projectRef);
    console.log("ensureMainProject: Dokument istnieje:", projectSnap.exists());

    const now = serverTimestamp();

    if (!projectSnap.exists()) {
      console.log("ensureMainProject: Tworzę nowy projekt...");
      // Create default project
      const defaultProject: Omit<WeddingProject, "createdAt" | "updatedAt"> & {
        createdAt: ReturnType<typeof serverTimestamp>;
        updatedAt: ReturnType<typeof serverTimestamp>;
      } = {
        name: "Michel 2027",
        weddingDate: null,
        ownersNote: "Private app - password gated",
        currency: "PLN",
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(projectRef, defaultProject);
      console.log("ensureMainProject: Projekt utworzony");

      // Return the created project (we'll fetch it to get actual timestamps)
      const createdSnap = await getDoc(projectRef);
      return {
        id: createdSnap.id,
        ...(createdSnap.data() as WeddingProject),
      };
    } else {
      console.log("ensureMainProject: Aktualizuję timestamp...");
      // Update updatedAt timestamp
      await setDoc(
        projectRef,
        { updatedAt: now },
        { merge: true }
      );

      // Return existing project
      const updatedSnap = await getDoc(projectRef);
      console.log("ensureMainProject: Projekt zwrócony");
      return {
        id: updatedSnap.id,
        ...(updatedSnap.data() as WeddingProject),
      };
    }
  } catch (error) {
    console.error("Błąd w ensureMainProject:", error);
    throw error;
  }
}

/**
 * Gets the main wedding project
 */
export async function getMainProject(): Promise<(WeddingProject & { id: string }) | null> {
  if (!db) {
    console.error("getMainProject: Firestore DB is not initialized.");
    throw new Error("Firestore DB is not available.");
  }
  
  const projectRef = doc(db, PROJECT_COLLECTION, PROJECT_ID);
  const projectSnap = await getDoc(projectRef);

  if (!projectSnap.exists()) {
    return null;
  }

  return {
    id: projectSnap.id,
    ...(projectSnap.data() as WeddingProject),
  };
}

/**
 * Updates the main wedding project
 */
export async function updateMainProject(
  updates: Partial<Omit<WeddingProject, "createdAt" | "updatedAt">>
): Promise<void> {
  if (!db) {
    console.error("updateMainProject: Firestore DB is not initialized.");
    throw new Error("Firestore DB is not available.");
  }
  
  const projectRef = doc(db, PROJECT_COLLECTION, PROJECT_ID);
  await setDoc(
    projectRef,
    {
      ...updates,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

