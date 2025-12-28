"use client";

import { TaskStatus, TaskPriority } from "@/lib/db/types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface TaskFiltersProps {
  searchQuery: string;
  statusFilter: TaskStatus | "all";
  priorityFilter: TaskPriority | "all";
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: TaskStatus | "all") => void;
  onPriorityFilterChange: (value: TaskPriority | "all") => void;
}

export default function TaskFilters({
  searchQuery,
  statusFilter,
  priorityFilter,
  onSearchChange,
  onStatusFilterChange,
  onPriorityFilterChange,
}: TaskFiltersProps) {
  const hasActiveFilters = statusFilter !== "all" || priorityFilter !== "all";

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Filtry i wyszukiwanie</h3>
        {hasActiveFilters && (
          <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">
            Aktywne filtry
          </span>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Szukaj zadań..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800"
          />
        </div>

        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-full sm:w-[160px] h-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie</SelectItem>
            <SelectItem value="todo">Do zrobienia</SelectItem>
            <SelectItem value="doing">W trakcie</SelectItem>
            <SelectItem value="done">Zrobione</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={onPriorityFilterChange}>
          <SelectTrigger className="w-full sm:w-[160px] h-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700">
            <SelectValue placeholder="Priorytet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie</SelectItem>
            <SelectItem value="low">Niski</SelectItem>
            <SelectItem value="medium">Średni</SelectItem>
            <SelectItem value="high">Wysoki</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
