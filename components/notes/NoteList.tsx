"use client";

import { WithId, Note } from "@/lib/db/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { MoreVertical, FileText, Tag } from "lucide-react";
import { Timestamp } from "firebase/firestore";

interface NoteListProps {
  notes: WithId<Note>[];
  onEdit: (note: WithId<Note>) => void;
  onDelete: (noteId: string) => void;
}

export default function NoteList({
  notes,
  onEdit,
  onDelete,
}: NoteListProps) {
  const formatDate = (date: Timestamp) => {
    try {
      return format(date.toDate(), "dd.MM.yyyy HH:mm");
    } catch {
      return "";
    }
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
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">
                Treść
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                Tagi
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Data
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {notes.map((note) => (
              <tr
                key={note.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {note.title}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell">
                  <div className="line-clamp-2 max-w-[300px]">
                    {note.content}
                  </div>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  {note.tags && note.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 3).map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs font-medium bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          +{note.tags.length - 3}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500 text-xs">Brak</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{formatDate(note.createdAt)}</span>
                  </div>
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
                        <DropdownMenuItem onClick={() => onEdit(note)}>
                          Edytuj
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(note.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          Usuń
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

