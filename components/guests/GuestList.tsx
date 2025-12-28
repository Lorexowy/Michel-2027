"use client";

import { WithId, Guest } from "@/lib/db/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Mail, Phone, MoreVertical, User, Heart, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface GuestListProps {
  guests: WithId<Guest>[];
  onEdit: (guest: WithId<Guest>) => void;
  onDelete: (guestId: string) => void;
}

const rsvpLabels: Record<Guest["rsvp"], string> = {
  not_sent: "Nie wysłane",
  sent: "Wysłane",
  yes: "Potwierdzony",
  no: "Odrzucony",
};

const rsvpStyles: Record<Guest["rsvp"], string> = {
  not_sent: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800",
  sent: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
  yes: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
  no: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
};

const sideLabels: Record<Guest["side"], string> = {
  bride: "Panna Młoda",
  groom: "Pan Młody",
};

const sideStyles: Record<Guest["side"], string> = {
  bride: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800",
  groom: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
};

export default function GuestList({
  guests,
  onEdit,
  onDelete,
}: GuestListProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Imię i nazwisko
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                Kontakt
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">
                Strona
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                RSVP
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                Ograniczenia dietetyczne
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {guests.map((guest) => (
              <tr
                key={guest.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {guest.firstName} {guest.lastName || ""}
                    </span>
                    {guest.hasCompanion && (
                      <Badge
                        variant="outline"
                        className="text-xs font-medium bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800 flex items-center gap-1"
                      >
                        <UserPlus className="h-3 w-3" />
                        +1
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell">
                  {guest.hasCompanion ? "2 osoby" : "1 osoba"}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 hidden sm:table-cell">
                  <div className="space-y-1">
                    {guest.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate max-w-[200px]">{guest.email}</span>
                      </div>
                    )}
                    {guest.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{guest.phone}</span>
                      </div>
                    )}
                    {!guest.email && !guest.phone && (
                      <span className="text-slate-400 dark:text-slate-500 text-xs">Brak kontaktu</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <Badge
                    variant="outline"
                    className={cn("text-xs font-medium", sideStyles[guest.side])}
                  >
                    {sideLabels[guest.side]}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant="outline"
                    className={cn("text-xs font-medium", rsvpStyles[guest.rsvp])}
                  >
                    {rsvpLabels[guest.rsvp]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 hidden lg:table-cell">
                  {guest.dietaryRestrictions ? (
                    <span className="truncate block max-w-[200px]">{guest.dietaryRestrictions}</span>
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
                        <DropdownMenuItem onClick={() => onEdit(guest)}>
                          Edytuj
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(guest.id)}
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

