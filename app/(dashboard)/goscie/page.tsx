"use client";

import { useEffect, useState, useMemo } from "react";
import { WithId, Guest, GuestSide, GuestRSVP } from "@/lib/db/types";
import { listGuests, createGuest, updateGuest, deleteGuest } from "@/lib/db/guests";
import { Button } from "@/components/ui/button";
import GuestCard from "@/components/guests/GuestCard";
import GuestList from "@/components/guests/GuestList";
import GuestDialog from "@/components/guests/GuestDialog";
import GuestFilters from "@/components/guests/GuestFilters";
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
import { Plus, Users, UserCheck, UserX, Clock, Heart, Grid3x3, List } from "lucide-react";

export default function GosciePage() {
  const [guests, setGuests] = useState<WithId<Guest>[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<WithId<Guest> | null>(null);
  const [deleteGuestId, setDeleteGuestId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [sideFilter, setSideFilter] = useState<GuestSide | "all">("all");
  const [rsvpFilter, setRsvpFilter] = useState<GuestRSVP | "all">("all");

  useEffect(() => {
    loadGuests();
  }, []);

  const loadGuests = async () => {
    try {
      setLoading(true);
      const allGuests = await listGuests();
      setGuests(allGuests);
    } catch (error) {
      console.error("Błąd podczas ładowania gości:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGuests = useMemo(() => {
    return guests.filter((guest) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const fullName = `${guest.firstName} ${guest.lastName || ""}`.toLowerCase().trim();
        const email = guest.email?.toLowerCase() || "";
        if (!fullName.includes(query) && !email.includes(query)) {
          return false;
        }
      }

      // Side filter
      if (sideFilter !== "all" && guest.side !== sideFilter) {
        return false;
      }

      // RSVP filter
      if (rsvpFilter !== "all" && guest.rsvp !== rsvpFilter) {
        return false;
      }

      return true;
    });
  }, [guests, searchQuery, sideFilter, rsvpFilter]);

  const handleCreateGuest = async (data: Omit<Guest, "createdAt" | "updatedAt">) => {
    try {
      await createGuest(data);
      await loadGuests();
    } catch (error) {
      console.error("Błąd podczas tworzenia gościa:", error);
      throw error;
    }
  };

  const handleUpdateGuest = async (data: Omit<Guest, "createdAt" | "updatedAt">) => {
    if (!editingGuest) return;
    try {
      await updateGuest(editingGuest.id, data);
      await loadGuests();
      setEditingGuest(null);
    } catch (error) {
      console.error("Błąd podczas aktualizacji gościa:", error);
      throw error;
    }
  };

  const handleDeleteGuest = async () => {
    if (!deleteGuestId) return;
    await deleteGuest(deleteGuestId);
    await loadGuests();
    setDeleteGuestId(null);
  };

  const handleEdit = (guest: WithId<Guest>) => {
    setEditingGuest(guest);
    setDialogOpen(true);
  };

  const handleDialogSubmit = async (data: Omit<Guest, "createdAt" | "updatedAt">) => {
    try {
      if (editingGuest) {
        await handleUpdateGuest(data);
      } else {
        await handleCreateGuest(data);
      }
      setDialogOpen(false);
      setEditingGuest(null);
    } catch (error) {
      console.error("Błąd w handleDialogSubmit:", error);
      throw error;
    }
  };

  const totalGuests = filteredGuests.length;
  const confirmedGuests = filteredGuests.filter(g => g.rsvp === "yes").length;
  const sentGuests = filteredGuests.filter(g => g.rsvp === "sent").length;
  const notSentGuests = filteredGuests.filter(g => g.rsvp === "not_sent").length;
  const declinedGuests = filteredGuests.filter(g => g.rsvp === "no").length;
  const brideSide = filteredGuests.filter(g => g.side === "bride").length;
  const groomSide = filteredGuests.filter(g => g.side === "groom").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-600 dark:text-slate-400">Ładowanie gości...</div>
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
              <Users className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 truncate">
              Goście
            </h1>
          </div>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Zarządzaj listą gości ślubnych
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
              setEditingGuest(null);
              setDialogOpen(true);
            }}
            className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow"
          >
            <Plus className="h-4 w-4 mr-2" />
            Dodaj gościa
          </Button>
        </div>
      </div>

      {/* Guest Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Wszyscy goście</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalGuests}</p>
          </div>
          <Users className="w-8 h-8 text-slate-400 dark:text-slate-600" />
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Nie wysłane</p>
            <p className="text-2xl font-bold text-slate-600 dark:text-slate-400">{notSentGuests}</p>
          </div>
          <Clock className="w-8 h-8 text-slate-400 dark:text-slate-600" />
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Wysłane</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{sentGuests}</p>
          </div>
          <Clock className="w-8 h-8 text-amber-400 dark:text-amber-600" />
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Potwierdzeni</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{confirmedGuests}</p>
          </div>
          <UserCheck className="w-8 h-8 text-green-400 dark:text-green-600" />
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Odrzuceni</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{declinedGuests}</p>
          </div>
          <UserX className="w-8 h-8 text-red-400 dark:text-red-600" />
        </div>
      </div>

      {/* Side Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/20 dark:to-pink-900/10 rounded-xl shadow-sm p-4 border border-pink-200 dark:border-pink-900/30 flex items-center justify-between">
          <div>
            <p className="text-sm text-pink-600 dark:text-pink-400 font-medium">Strona Panny Młodej</p>
            <p className="text-2xl font-bold text-pink-700 dark:text-pink-300">{brideSide}</p>
          </div>
          <Heart className="w-8 h-8 text-pink-400 dark:text-pink-600" />
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/10 rounded-xl shadow-sm p-4 border border-blue-200 dark:border-blue-900/30 flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Strona Pana Młodego</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{groomSide}</p>
          </div>
          <Heart className="w-8 h-8 text-blue-400 dark:text-blue-600" />
        </div>
      </div>

      <GuestFilters
        searchQuery={searchQuery}
        sideFilter={sideFilter}
        rsvpFilter={rsvpFilter}
        onSearchChange={setSearchQuery}
        onSideFilterChange={setSideFilter}
        onRsvpFilterChange={setRsvpFilter}
      />

      {filteredGuests.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center flex flex-col items-center justify-center">
          <Users className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
            Brak gości. Dodaj pierwszego gościa.
          </p>
          <Button
            onClick={() => {
              setEditingGuest(null);
              setDialogOpen(true);
            }}
            className="mt-6 shadow-md hover:shadow-lg transition-shadow"
          >
            <Plus className="h-4 w-4 mr-2" />
            Dodaj gościa
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGuests.map((guest) => (
            <GuestCard
              key={guest.id}
              guest={guest}
              onEdit={handleEdit}
              onDelete={setDeleteGuestId}
            />
          ))}
        </div>
      ) : (
        <GuestList
          guests={filteredGuests}
          onEdit={handleEdit}
          onDelete={setDeleteGuestId}
        />
      )}

      <GuestDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingGuest(null);
          }
        }}
        guest={editingGuest}
        onSubmit={handleDialogSubmit}
      />

      <AlertDialog
        open={deleteGuestId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteGuestId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usunąć gościa?</AlertDialogTitle>
            <AlertDialogDescription>
              Tej operacji nie można cofnąć.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteGuestId(null)}>
              Anuluj
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGuest}
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
