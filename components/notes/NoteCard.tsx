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

interface NoteCardProps {
  note: WithId<Note>;
  onEdit: (note: WithId<Note>) => void;
  onDelete: (noteId: string) => void;
}

export default function NoteCard({
  note,
  onEdit,
  onDelete,
}: NoteCardProps) {
  const formatDate = (date: Timestamp) => {
    try {
      return format(date.toDate(), "dd.MM.yyyy HH:mm");
    } catch {
      return "";
    }
  };

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm hover:shadow-lg transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-2">
            {note.title}
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-2">
            {note.content}
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <FileText className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{formatDate(note.createdAt)}</span>
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

      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
          <Tag className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          {note.tags.map((tag, index) => (
            <Badge
              key={index}
              variant="outline"
              className="text-xs font-medium bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

