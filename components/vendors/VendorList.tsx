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

interface VendorListProps {
  vendors: WithId<Vendor>[];
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

export default function VendorList({
  vendors,
  onEdit,
  onDelete,
}: VendorListProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Nazwa
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                Kategoria
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">
                Kontakt
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {vendors.map((vendor) => (
              <tr
                key={vendor.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {vendor.name}
                  </div>
                  {vendor.contactName && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {vendor.contactName}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 hidden sm:table-cell">
                  <Badge variant="outline" className="text-xs font-medium bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600">
                    {vendor.category}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell">
                  <div className="space-y-1">
                    {vendor.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate max-w-[200px]">{vendor.email}</span>
                      </div>
                    )}
                    {vendor.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{vendor.phone}</span>
                      </div>
                    )}
                    {vendor.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5 flex-shrink-0" />
                        <a
                          href={vendor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate max-w-[200px] hover:underline"
                        >
                          {vendor.website}
                        </a>
                      </div>
                    )}
                    {!vendor.email && !vendor.phone && !vendor.website && (
                      <span className="text-slate-400 dark:text-slate-500 text-xs">Brak kontaktu</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant="outline"
                    className={cn("text-xs font-medium", statusStyles[vendor.status])}
                  >
                    {statusLabels[vendor.status]}
                  </Badge>
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

