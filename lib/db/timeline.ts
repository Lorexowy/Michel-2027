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
import { TimelineEvent, WithId } from "./types";

const PROJECT_ID = "main";
const COLLECTION_NAME = "timeline";

function getCollectionPath() {
  return `weddingProjects/${PROJECT_ID}/${COLLECTION_NAME}`;
}

function docToTimelineEvent(docId: string, data: any): WithId<TimelineEvent> {
  return {
    id: docId,
    ...data,
  } as WithId<TimelineEvent>;
}

/**
 * Lists all timeline events ordered by eventDate ascending (earliest first)
 */
export async function listTimelineEvents(): Promise<WithId<TimelineEvent>[]> {
  if (!db) {
    console.error("listTimelineEvents: Firestore DB is not initialized.");
    throw new Error("Firestore DB is not available.");
  }
  const timelineRef = collection(db, getCollectionPath());
  const q = query(timelineRef, orderBy("eventDate", "asc"));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => docToTimelineEvent(doc.id, doc.data()));
}

/**
 * Gets a single timeline event by ID
 */
export async function getTimelineEvent(id: string): Promise<WithId<TimelineEvent> | null> {
  if (!db) {
    console.error("getTimelineEvent: Firestore DB is not initialized.");
    throw new Error("Firestore DB is not available.");
  }
  const eventRef = doc(db, getCollectionPath(), id);
  const eventSnap = await getDoc(eventRef);

  if (!eventSnap.exists()) {
    return null;
  }

  return docToTimelineEvent(eventSnap.id, eventSnap.data());
}

/**
 * Creates a new timeline event
 */
export async function createTimelineEvent(
  data: Omit<TimelineEvent, "createdAt" | "updatedAt">
): Promise<string> {
  if (!db) {
    console.error("createTimelineEvent: Firestore DB is not initialized.");
    throw new Error("Firestore DB is not available.");
  }
  const timelineRef = collection(db, getCollectionPath());
  const now = serverTimestamp();

  const docRef = await addDoc(timelineRef, {
    ...data,
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
}

/**
 * Updates an existing timeline event
 */
export async function updateTimelineEvent(
  id: string,
  updates: Partial<Omit<TimelineEvent, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  if (!db) {
    console.error("updateTimelineEvent: Firestore DB is not initialized.");
    throw new Error("Firestore DB is not available.");
  }
  const eventRef = doc(db, getCollectionPath(), id);
  await updateDoc(eventRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Deletes a timeline event
 */
export async function deleteTimelineEvent(id: string): Promise<void> {
  if (!db) {
    console.error("deleteTimelineEvent: Firestore DB is not initialized.");
    throw new Error("Firestore DB is not available.");
  }
  const eventRef = doc(db, getCollectionPath(), id);
  await deleteDoc(eventRef);
}

