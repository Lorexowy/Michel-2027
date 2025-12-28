"use client";

import { WithId, Task, TaskPriority } from "@/lib/db/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { MoreVertical, Calendar, GripVertical } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: WithId<Task>;
  onEdit: (task: WithId<Task>) => void;
  onDelete: (taskId: string) => void;
  onMoveStatus: (taskId: string, newStatus: Task["status"]) => void;
}

const priorityCardStyles: Record<TaskPriority, string> = {
  low: "bg-gradient-to-br from-blue-50/40 via-white to-white dark:from-blue-950/20 dark:via-slate-800 dark:to-slate-800 border-blue-200/50 dark:border-blue-900/40",
  medium: "bg-gradient-to-br from-amber-50/40 via-white to-white dark:from-amber-950/20 dark:via-slate-800 dark:to-slate-800 border-amber-200/50 dark:border-amber-900/40",
  high: "bg-gradient-to-br from-rose-50/40 via-white to-white dark:from-rose-950/20 dark:via-slate-800 dark:to-slate-800 border-rose-200/50 dark:border-rose-900/40",
};

const priorityExclamation: Record<TaskPriority, string> = {
  low: "!",
  medium: "!!",
  high: "!!!",
};

const priorityExclamationStyles: Record<TaskPriority, string> = {
  low: "text-blue-600 dark:text-blue-400",
  medium: "text-amber-600 dark:text-amber-400",
  high: "text-rose-600 dark:text-rose-400",
};

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onMoveStatus,
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDueDate = (dueDate: Timestamp | null | undefined) => {
    if (!dueDate) return null;
    try {
      return format(dueDate.toDate(), "dd.MM.yyyy");
    } catch {
      return null;
    }
  };

  const dueDateStr = formatDueDate(task.dueDate);
  const isOverdue = dueDateStr && new Date(task.dueDate!.toDate()) < new Date() && task.status !== "done";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-xl border-2 p-4 shadow-sm hover:shadow-lg transition-all duration-200 cursor-grab active:cursor-grabbing relative",
        priorityCardStyles[task.priority],
        isDragging && "ring-2 ring-blue-500 ring-offset-2"
      )}
    >
      {/* Priority Exclamation in top-right corner */}
      <div className={cn(
        "absolute top-2 right-2 font-bold text-lg leading-none",
        priorityExclamationStyles[task.priority]
      )}>
        {priorityExclamation[task.priority]}
      </div>

      <div className="flex items-start justify-between gap-3 mb-3 pr-6">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="mt-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex-shrink-0"
            aria-label="Przeciągnij zadanie"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          
          <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex-1 text-sm leading-snug">
            {task.title}
          </h4>
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
            {task.status !== "todo" && (
              <DropdownMenuItem onClick={() => onMoveStatus(task.id, "todo")}>
                Przenieś do: Do zrobienia
              </DropdownMenuItem>
            )}
            {task.status !== "doing" && (
              <DropdownMenuItem onClick={() => onMoveStatus(task.id, "doing")}>
                Przenieś do: W trakcie
              </DropdownMenuItem>
            )}
            {task.status !== "done" && (
              <DropdownMenuItem onClick={() => onMoveStatus(task.id, "done")}>
                Przenieś do: Zrobione
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onEdit(task)}>
              Edytuj
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(task.id)}
              className="text-destructive focus:text-destructive"
            >
              Usuń
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {task.description && (
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {dueDateStr && (
        <div className={`flex items-center gap-1.5 text-xs font-medium ${
          isOverdue 
            ? "text-rose-600 dark:text-rose-400" 
            : "text-slate-500 dark:text-slate-400"
        }`}>
          <Calendar className={`h-3.5 w-3.5 ${isOverdue ? "text-rose-600 dark:text-rose-400" : ""}`} />
          <span>{dueDateStr}</span>
          {isOverdue && (
            <span className="ml-1 px-1.5 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded text-[10px] font-semibold">
              Przeterminowane
            </span>
          )}
        </div>
      )}
    </div>
  );
}
