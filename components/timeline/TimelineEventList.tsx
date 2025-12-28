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

interface TimelineEventListProps {
  events: WithId<TimelineEvent>[];
  onEdit: (event: WithId<TimelineEvent>) => void;
  onDelete: (eventId: string) => void;
}

export default function TimelineEventList({
  events,
  onEdit,
  onDelete,
}: TimelineEventListProps) {
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

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Tytuł
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Data
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                Godziny
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">
                Lokalizacja
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {events.map((event) => {
              const eventDateStr = formatEventDate(event.eventDate);
              const isPast = new Date(event.eventDate.toDate()) < new Date();

              return (
                <tr
                  key={event.id}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${
                    isPast ? "opacity-75" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {event.title}
                    </div>
                    {event.description && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                        {event.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span className="font-medium">{eventDateStr}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 hidden sm:table-cell">
                    {(event.startTime || event.endTime) ? (
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>
                          {formatTime(event.startTime) || "?"} - {formatTime(event.endTime) || "?"}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 text-xs">Brak</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell">
                    {event.location ? (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate max-w-[200px]">{event.location}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 text-xs">Brak</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

