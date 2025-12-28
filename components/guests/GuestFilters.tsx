"use client";

import { GuestSide, GuestRSVP } from "@/lib/db/types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface GuestFiltersProps {
  searchQuery: string;
  sideFilter: GuestSide | "all";
  rsvpFilter: GuestRSVP | "all";
  onSearchChange: (value: string) => void;
  onSideFilterChange: (value: GuestSide | "all") => void;
  onRsvpFilterChange: (value: GuestRSVP | "all") => void;
}

export default function GuestFilters({
  searchQuery,
  sideFilter,
  rsvpFilter,
  onSearchChange,
  onSideFilterChange,
  onRsvpFilterChange,
}: GuestFiltersProps) {
  const hasActiveFilters = searchQuery !== "" || sideFilter !== "all" || rsvpFilter !== "all";

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
          <Filter className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        </div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">
          Filtry i wyszukiwanie
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
            placeholder="Szukaj gości..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-10 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus-visible:ring-blue-500 focus-visible:border-blue-500"
          />
        </div>

        <Select value={sideFilter} onValueChange={onSideFilterChange}>
          <SelectTrigger className="w-full sm:w-[180px] h-10 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500">
            <SelectValue placeholder="Strona" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie strony</SelectItem>
            <SelectItem value="bride">Panna Młoda</SelectItem>
            <SelectItem value="groom">Pan Młody</SelectItem>
          </SelectContent>
        </Select>

        <Select value={rsvpFilter} onValueChange={onRsvpFilterChange}>
          <SelectTrigger className="w-full sm:w-[180px] h-10 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500">
            <SelectValue placeholder="RSVP" />
          </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie</SelectItem>
              <SelectItem value="not_sent">Nie wysłane</SelectItem>
              <SelectItem value="sent">Wysłane</SelectItem>
              <SelectItem value="yes">Potwierdzony</SelectItem>
              <SelectItem value="no">Odrzucony</SelectItem>
            </SelectContent>
        </Select>
      </div>
    </div>
  );
}

