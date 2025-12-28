"use client";

import { WithId, TimelineEvent } from "@/lib/db/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { MoreVertical, Calendar, Clock, MapPin } from "lucide-react";
import { Timestamp } from "firebase/firestore";

interface TimelineEventCardProps {
  event: WithId<TimelineEvent>;
  onEdit: (event: WithId<TimelineEvent>) => void;
  onDelete: (eventId: string) => void;
}

export default function TimelineEventCard({
  event,
  onEdit,
  onDelete,
}: TimelineEventCardProps) {
  const formatEventDate = (date: Timestamp) => {
    try {
      return format(date.toDate(), "dd.MM.yyyy");
    } catch {
      return "";
    }
  };

  const formatTime = (time: string | undefined) => {
    if (!time) return null;
    return time;
  };

  const eventDateStr = formatEventDate(event.eventDate);
  const isPast = new Date(event.eventDate.toDate()) < new Date();

  return (
    <div className={`group bg-white dark:bg-slate-800 rounded-xl border-2 p-4 shadow-sm hover:shadow-lg transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600 ${
      isPast ? "opacity-75 border-slate-300 dark:border-slate-600" : "border-slate-200 dark:border-slate-700"
    }`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-2">
            {event.title}
          </h4>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span className="font-medium">{eventDateStr}</span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onEdit(event)}>
              Edytuj
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(event.id)}
              className="text-destructive focus:text-destructive"
            >
              Usuń
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2">
        {(event.startTime || event.endTime) && (
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
            <span>
              {formatTime(event.startTime) || "?"} - {formatTime(event.endTime) || "?"}
            </span>
          </div>
        )}

        {event.location && (
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{event.location}</span>
          </div>
        )}

        {event.description && (
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
            {event.description}
          </p>
        )}
      </div>
    </div>
  );
}

