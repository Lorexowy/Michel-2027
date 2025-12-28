"use client";

import { useEffect, useState, useMemo } from "react";
import { WithId, Note } from "@/lib/db/types";
import { listNotes, createNote, updateNote, deleteNote } from "@/lib/db/notes";
import { Button } from "@/components/ui/button";
import NoteCard from "@/components/notes/NoteCard";
import NoteList from "@/components/notes/NoteList";
import NoteDialog from "@/components/notes/NoteDialog";
import NoteFilters from "@/components/notes/NoteFilters";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, FileText, Grid3x3, List } from "lucide-react";

export default function NotatkiPage() {
  const [notes, setNotes] = useState<WithId<Note>[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<WithId<Note> | null>(null);
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<string>("all");

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const allNotes = await listNotes();
      setNotes(allNotes);
    } catch (error) {
      console.error("Błąd podczas ładowania notatek:", error);
    } finally {
      setLoading(false);
    }
  };

  const availableTags = useMemo(() => {
    const allTags = notes.flatMap(note => note.tags || []);
    const uniqueTags = Array.from(new Set(allTags));
    return uniqueTags.sort();
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !note.title.toLowerCase().includes(query) &&
          !note.content.toLowerCase().includes(query) &&
          !(note.tags?.some(tag => tag.toLowerCase().includes(query)) || false)
        ) {
          return false;
        }
      }

      // Tag filter
      if (tagFilter !== "all" && (!note.tags || !note.tags.includes(tagFilter))) {
        return false;
      }

      return true;
    });
  }, [notes, searchQuery, tagFilter]);

  const handleCreateNote = async (data: Omit<Note, "createdAt" | "updatedAt">) => {
    try {
      await createNote(data);
      await loadNotes();
    } catch (error) {
      console.error("Błąd podczas tworzenia notatki:", error);
      throw error;
    }
  };

  const handleUpdateNote = async (data: Omit<Note, "createdAt" | "updatedAt">) => {
    if (!editingNote) return;
    try {
      await updateNote(editingNote.id, data);
      await loadNotes();
      setEditingNote(null);
    } catch (error) {
      console.error("Błąd podczas aktualizacji notatki:", error);
      throw error;
    }
  };

  const handleDeleteNote = async () => {
    if (!deleteNoteId) return;
    await deleteNote(deleteNoteId);
    await loadNotes();
    setDeleteNoteId(null);
  };

  const handleEdit = (note: WithId<Note>) => {
    setEditingNote(note);
    setDialogOpen(true);
  };

  const handleDialogSubmit = async (data: Omit<Note, "createdAt" | "updatedAt">) => {
    try {
      if (editingNote) {
        await handleUpdateNote(data);
      } else {
        await handleCreateNote(data);
      }
      setDialogOpen(false);
      setEditingNote(null);
    } catch (error) {
      console.error("Błąd w handleDialogSubmit:", error);
      throw error;
    }
  };

  // Statistics
  const totalNotes = filteredNotes.length;
  const notesWithTags = filteredNotes.filter(n => n.tags && n.tags.length > 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-600 dark:text-slate-400">Ładowanie notatek...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <FileText className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 truncate">
              Notatki
            </h1>
          </div>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Zapisz ważne notatki i pomysły
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" 
                ? "bg-white dark:bg-slate-700 shadow-sm" 
                : "hover:bg-slate-200 dark:hover:bg-slate-700"
              }
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" 
                ? "bg-white dark:bg-slate-700 shadow-sm" 
                : "hover:bg-slate-200 dark:hover:bg-slate-700"
              }
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={() => {
              setEditingNote(null);
              setDialogOpen(true);
            }}
            className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow"
          >
            <Plus className="h-4 w-4 mr-2" />
            Dodaj notatkę
          </Button>
        </div>
      </div>

      {/* Note Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Wszystkie notatki</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalNotes}</p>
          </div>
          <FileText className="w-8 h-8 text-slate-400 dark:text-slate-600" />
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Z tagami</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{notesWithTags}</p>
          </div>
          <FileText className="w-8 h-8 text-blue-400 dark:text-blue-600" />
        </div>
      </div>

      <NoteFilters
        searchQuery={searchQuery}
        tagFilter={tagFilter}
        onSearchChange={setSearchQuery}
        onTagFilterChange={setTagFilter}
        availableTags={availableTags}
      />

      {filteredNotes.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center flex flex-col items-center justify-center">
          <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
            Brak notatek. Dodaj pierwszą notatkę.
          </p>
          <Button
            onClick={() => {
              setEditingNote(null);
              setDialogOpen(true);
            }}
            className="mt-6 shadow-md hover:shadow-lg transition-shadow"
          >
            <Plus className="h-4 w-4 mr-2" />
            Dodaj notatkę
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={handleEdit}
              onDelete={setDeleteNoteId}
            />
          ))}
        </div>
      ) : (
        <NoteList
          notes={filteredNotes}
          onEdit={handleEdit}
          onDelete={setDeleteNoteId}
        />
      )}

      <NoteDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingNote(null);
          }
        }}
        note={editingNote}
        onSubmit={handleDialogSubmit}
      />

      <AlertDialog
        open={deleteNoteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteNoteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usunąć notatkę?</AlertDialogTitle>
            <AlertDialogDescription>
              Tej operacji nie można cofnąć.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteNoteId(null)}>
              Anuluj
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteNote}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
