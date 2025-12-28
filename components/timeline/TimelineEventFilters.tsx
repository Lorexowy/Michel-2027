"use client";

import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";

interface TimelineEventFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function TimelineEventFilters({
  searchQuery,
  onSearchChange,
}: TimelineEventFiltersProps) {
  const hasActiveFilters = searchQuery !== "";

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
          <Filter className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        </div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">
          Wyszukiwanie
        </h3>
        {hasActiveFilters && (
          <span className="ml-auto text-xs font-medium text-blue-600 dark:text-blue-400">
            Aktywne filtry
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Szukaj wydarzeń..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-10 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus-visible:ring-blue-500 focus-visible:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

