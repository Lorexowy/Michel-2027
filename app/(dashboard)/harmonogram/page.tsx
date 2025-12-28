"use client";

import { useEffect, useState, useMemo } from "react";
import { WithId, TimelineEvent } from "@/lib/db/types";
import { listTimelineEvents, createTimelineEvent, updateTimelineEvent, deleteTimelineEvent } from "@/lib/db/timeline";
import { Button } from "@/components/ui/button";
import TimelineEventCard from "@/components/timeline/TimelineEventCard";
import TimelineEventList from "@/components/timeline/TimelineEventList";
import TimelineEventDialog from "@/components/timeline/TimelineEventDialog";
import TimelineEventFilters from "@/components/timeline/TimelineEventFilters";
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
import { Plus, Calendar, Clock, Grid3x3, List } from "lucide-react";
import { format } from "date-fns";

export default function HarmonogramPage() {
  const [events, setEvents] = useState<WithId<TimelineEvent>[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<WithId<TimelineEvent> | null>(null);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const allEvents = await listTimelineEvents();
      setEvents(allEvents);
    } catch (error) {
      console.error("Błąd podczas ładowania wydarzeń:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !event.title.toLowerCase().includes(query) &&
          !(event.description?.toLowerCase().includes(query) || false) &&
          !(event.location?.toLowerCase().includes(query) || false)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [events, searchQuery]);

  const handleCreateEvent = async (data: Omit<TimelineEvent, "createdAt" | "updatedAt">) => {
    try {
      await createTimelineEvent(data);
      await loadEvents();
    } catch (error) {
      console.error("Błąd podczas tworzenia wydarzenia:", error);
      throw error;
    }
  };

  const handleUpdateEvent = async (data: Omit<TimelineEvent, "createdAt" | "updatedAt">) => {
    if (!editingEvent) return;
    try {
      await updateTimelineEvent(editingEvent.id, data);
      await loadEvents();
      setEditingEvent(null);
    } catch (error) {
      console.error("Błąd podczas aktualizacji wydarzenia:", error);
      throw error;
    }
  };

  const handleDeleteEvent = async () => {
    if (!deleteEventId) return;
    await deleteTimelineEvent(deleteEventId);
    await loadEvents();
    setDeleteEventId(null);
  };

  const handleEdit = (event: WithId<TimelineEvent>) => {
    setEditingEvent(event);
    setDialogOpen(true);
  };

  const handleDialogSubmit = async (data: Omit<TimelineEvent, "createdAt" | "updatedAt">) => {
    try {
      if (editingEvent) {
        await handleUpdateEvent(data);
      } else {
        await handleCreateEvent(data);
      }
      setDialogOpen(false);
      setEditingEvent(null);
    } catch (error) {
      console.error("Błąd w handleDialogSubmit:", error);
      throw error;
    }
  };

  // Statistics
  const totalEvents = filteredEvents.length;
  const upcomingEvents = filteredEvents.filter(e => new Date(e.eventDate.toDate()) >= new Date()).length;
  const pastEvents = filteredEvents.filter(e => new Date(e.eventDate.toDate()) < new Date()).length;
  const nextEvent = filteredEvents.find(e => new Date(e.eventDate.toDate()) >= new Date());

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-600 dark:text-slate-400">Ładowanie wydarzeń...</div>
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
              <Calendar className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 truncate">
              Harmonogram
            </h1>
          </div>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Przeglądaj harmonogram wydarzeń ślubnych
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
              setEditingEvent(null);
              setDialogOpen(true);
            }}
            className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow"
          >
            <Plus className="h-4 w-4 mr-2" />
            Dodaj wydarzenie
          </Button>
        </div>
      </div>

      {/* Event Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Wszystkie wydarzenia</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalEvents}</p>
          </div>
          <Calendar className="w-8 h-8 text-slate-400 dark:text-slate-600" />
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Nadchodzące</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{upcomingEvents}</p>
          </div>
          <Clock className="w-8 h-8 text-blue-400 dark:text-blue-600" />
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Minione</p>
            <p className="text-2xl font-bold text-slate-600 dark:text-slate-400">{pastEvents}</p>
          </div>
          <Calendar className="w-8 h-8 text-slate-400 dark:text-slate-600" />
        </div>
        {nextEvent && (
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Następne wydarzenie</p>
              <p className="text-lg font-bold truncate">{nextEvent.title}</p>
              <p className="text-xs opacity-75 mt-1">
                {format(nextEvent.eventDate.toDate(), "dd.MM.yyyy")}
              </p>
            </div>
            <Calendar className="w-8 h-8 opacity-80" />
          </div>
        )}
      </div>

      <TimelineEventFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {filteredEvents.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center flex flex-col items-center justify-center">
          <Calendar className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
            Brak wydarzeń. Dodaj pierwsze wydarzenie.
          </p>
          <Button
            onClick={() => {
              setEditingEvent(null);
              setDialogOpen(true);
            }}
            className="mt-6 shadow-md hover:shadow-lg transition-shadow"
          >
            <Plus className="h-4 w-4 mr-2" />
            Dodaj wydarzenie
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((event) => (
            <TimelineEventCard
              key={event.id}
              event={event}
              onEdit={handleEdit}
              onDelete={setDeleteEventId}
            />
          ))}
        </div>
      ) : (
        <TimelineEventList
          events={filteredEvents}
          onEdit={handleEdit}
          onDelete={setDeleteEventId}
        />
      )}

      <TimelineEventDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingEvent(null);
          }
        }}
        event={editingEvent}
        onSubmit={handleDialogSubmit}
      />

      <AlertDialog
        open={deleteEventId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteEventId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usunąć wydarzenie?</AlertDialogTitle>
            <AlertDialogDescription>
              Tej operacji nie można cofnąć.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteEventId(null)}>
              Anuluj
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
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
