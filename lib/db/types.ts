import { Timestamp } from "firebase/firestore";

export type TaskStatus = "todo" | "doing" | "done";
export type TaskPriority = "low" | "medium" | "high";
export type TaskAssignedTo = "me" | "partner" | "both";

export type GuestSide = "bride" | "groom";
export type GuestRSVP = "not_sent" | "sent" | "yes" | "no";

export type ExpenseStatus = "planned" | "deposit" | "paid";

export type VendorStatus = "considering" | "booked" | "rejected";

export interface WeddingProject {
  name: string;
  weddingDate: Timestamp | null;
  ownersNote: string;
  currency: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Task {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: TaskAssignedTo;
  dueDate?: Timestamp | null;
  category?: string;
  completedAt?: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Guest {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  side: GuestSide;
  rsvp: GuestRSVP;
  hasCompanion?: boolean;
  dietaryRestrictions?: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Expense {
  title: string;
  description?: string;
  category: string;
  amount: number;
  status: ExpenseStatus;
  vendorId?: string;
  dueDate?: Timestamp | null;
  paidAt?: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Vendor {
  name: string;
  category: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  status: VendorStatus;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TimelineEvent {
  title: string;
  description?: string;
  eventDate: Timestamp;
  startTime?: string;
  endTime?: string;
  location?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Note {
  title: string;
  content: string;
  tags?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Helper type for documents with ID
export type WithId<T> = T & { id: string };

