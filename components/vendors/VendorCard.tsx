"use client";

import { WithId, Vendor } from "@/lib/db/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Mail, Phone, Globe, MoreVertical, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

interface VendorCardProps {
  vendor: WithId<Vendor>;
  onEdit: (vendor: WithId<Vendor>) => void;
  onDelete: (vendorId: string) => void;
}

const statusLabels: Record<Vendor["status"], string> = {
  considering: "Rozważany",
  booked: "Zarezerwowany",
  rejected: "Odrzucony",
};

const statusStyles: Record<Vendor["status"], string> = {
  considering: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
  booked: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
  rejected: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
};

export default function VendorCard({
  vendor,
  onEdit,
  onDelete,
}: VendorCardProps) {
  return (
    <div className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm hover:shadow-lg transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-1">
            {vendor.name}
          </h4>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className={cn("text-xs font-medium", statusStyles[vendor.status])}
            >
              {statusLabels[vendor.status]}
            </Badge>
            <Badge variant="outline" className="text-xs font-medium bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600">
              {vendor.category}
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
            <DropdownMenuItem onClick={() => onEdit(vendor)}>
              Edytuj
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(vendor.id)}
              className="text-destructive focus:text-destructive"
            >
              Usuń
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2">
        {vendor.contactName && (
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Briefcase className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{vendor.contactName}</span>
          </div>
        )}

        {vendor.email && (
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{vendor.email}</span>
          </div>
        )}

        {vendor.phone && (
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Phone className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{vendor.phone}</span>
          </div>
        )}

        {vendor.website && (
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Globe className="h-3.5 w-3.5 flex-shrink-0" />
            <a
              href={vendor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate hover:underline"
            >
              {vendor.website}
            </a>
          </div>
        )}

        {vendor.notes && (
          <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
            <span className="font-medium">Notatki: </span>
            {vendor.notes}
          </div>
        )}
      </div>
    </div>
  );
}

