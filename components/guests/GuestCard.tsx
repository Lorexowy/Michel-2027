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

interface GuestCardProps {
  guest: WithId<Guest>;
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

export default function GuestCard({
  guest,
  onEdit,
  onDelete,
}: GuestCardProps) {
  return (
    <div className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm hover:shadow-lg transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
              {guest.firstName} {guest.lastName || ""}
            </h4>
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
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className={cn("text-xs font-medium", sideStyles[guest.side])}
            >
              {sideLabels[guest.side]}
            </Badge>
            <Badge
              variant="outline"
              className={cn("text-xs font-medium", rsvpStyles[guest.rsvp])}
            >
              {rsvpLabels[guest.rsvp]}
            </Badge>
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

      <div className="space-y-2">
        {guest.email && (
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{guest.email}</span>
          </div>
        )}

        {guest.phone && (
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Phone className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{guest.phone}</span>
          </div>
        )}

        {guest.dietaryRestrictions && (
          <div className="text-xs text-slate-600 dark:text-slate-400">
            <span className="font-medium">Dieta: </span>
            {guest.dietaryRestrictions}
          </div>
        )}

        {guest.notes && (
          <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
            <span className="font-medium">Notatki: </span>
            {guest.notes}
          </div>
        )}
      </div>
    </div>
  );
}

