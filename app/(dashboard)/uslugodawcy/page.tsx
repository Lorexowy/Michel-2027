"use client";

import { useEffect, useState, useMemo } from "react";
import { WithId, Vendor, VendorStatus } from "@/lib/db/types";
import { listVendors, createVendor, updateVendor, deleteVendor } from "@/lib/db/vendors";
import { Button } from "@/components/ui/button";
import VendorCard from "@/components/vendors/VendorCard";
import VendorList from "@/components/vendors/VendorList";
import VendorDialog from "@/components/vendors/VendorDialog";
import VendorFilters from "@/components/vendors/VendorFilters";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Briefcase, CheckCircle2, Clock, X, Grid3x3, List } from "lucide-react";

export default function UslugodawcyPage() {
  const [vendors, setVendors] = useState<WithId<Vendor>[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<WithId<Vendor> | null>(null);
  const [deleteVendorId, setDeleteVendorId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<VendorStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const allVendors = await listVendors();
      setVendors(allVendors);
    } catch (error) {
      console.error("Błąd podczas ładowania usługodawców:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(vendors.map(v => v.category)));
    return uniqueCategories.sort();
  }, [vendors]);

  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !vendor.name.toLowerCase().includes(query) &&
          !vendor.category.toLowerCase().includes(query) &&
          !(vendor.contactName?.toLowerCase().includes(query) || false) &&
          !(vendor.email?.toLowerCase().includes(query) || false) &&
          !(vendor.notes?.toLowerCase().includes(query) || false)
        ) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "all" && vendor.status !== statusFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== "all" && vendor.category !== categoryFilter) {
        return false;
      }

      return true;
    });
  }, [vendors, searchQuery, statusFilter, categoryFilter]);

  const handleCreateVendor = async (data: Omit<Vendor, "createdAt" | "updatedAt">) => {
    try {
      await createVendor(data);
      await loadVendors();
    } catch (error) {
      console.error("Błąd podczas tworzenia usługodawcy:", error);
      throw error;
    }
  };

  const handleUpdateVendor = async (data: Omit<Vendor, "createdAt" | "updatedAt">) => {
    if (!editingVendor) return;
    try {
      await updateVendor(editingVendor.id, data);
      await loadVendors();
      setEditingVendor(null);
    } catch (error) {
      console.error("Błąd podczas aktualizacji usługodawcy:", error);
      throw error;
    }
  };

  const handleDeleteVendor = async () => {
    if (!deleteVendorId) return;
    await deleteVendor(deleteVendorId);
    await loadVendors();
    setDeleteVendorId(null);
  };

  const handleEdit = (vendor: WithId<Vendor>) => {
    setEditingVendor(vendor);
    setDialogOpen(true);
  };

  const handleDialogSubmit = async (data: Omit<Vendor, "createdAt" | "updatedAt">) => {
    try {
      if (editingVendor) {
        await handleUpdateVendor(data);
      } else {
        await handleCreateVendor(data);
      }
      setDialogOpen(false);
      setEditingVendor(null);
    } catch (error) {
      console.error("Błąd w handleDialogSubmit:", error);
      throw error;
    }
  };

  // Statistics
  const totalVendors = filteredVendors.length;
  const consideringCount = filteredVendors.filter(v => v.status === "considering").length;
  const bookedCount = filteredVendors.filter(v => v.status === "booked").length;
  const rejectedCount = filteredVendors.filter(v => v.status === "rejected").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-600 dark:text-slate-400">Ładowanie usługodawców...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <Briefcase className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 truncate">
              Usługodawcy
            </h1>
          </div>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Zarządzaj kontaktami z usługodawcami
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" 
                ? "bg-white dark:bg-slate-700 shadow-sm" 
                : "hover:bg-slate-200 dark:hover:bg-slate-700"
              }
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" 
                ? "bg-white dark:bg-slate-700 shadow-sm" 
                : "hover:bg-slate-200 dark:hover:bg-slate-700"
              }
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={() => {
              setEditingVendor(null);
              setDialogOpen(true);
            }}
            className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow"
          >
            <Plus className="h-4 w-4 mr-2" />
            Dodaj usługodawcę
          </Button>
        </div>
      </div>

      {/* Vendor Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Wszyscy usługodawcy</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalVendors}</p>
          </div>
          <Briefcase className="w-8 h-8 text-slate-400 dark:text-slate-600" />
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Rozważani</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{consideringCount}</p>
          </div>
          <Clock className="w-8 h-8 text-amber-400 dark:text-amber-600" />
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Zarezerwowani</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{bookedCount}</p>
          </div>
          <CheckCircle2 className="w-8 h-8 text-green-400 dark:text-green-600" />
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Odrzuceni</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{rejectedCount}</p>
          </div>
          <X className="w-8 h-8 text-red-400 dark:text-red-600" />
        </div>
      </div>

      <VendorFilters
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        categoryFilter={categoryFilter}
        onSearchChange={setSearchQuery}
        onStatusFilterChange={setStatusFilter}
        onCategoryFilterChange={setCategoryFilter}
        categories={categories}
      />

      {filteredVendors.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center flex flex-col items-center justify-center">
          <Briefcase className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
            Brak usługodawców. Dodaj pierwszego usługodawcę.
          </p>
          <Button
            onClick={() => {
              setEditingVendor(null);
              setDialogOpen(true);
            }}
            className="mt-6 shadow-md hover:shadow-lg transition-shadow"
          >
            <Plus className="h-4 w-4 mr-2" />
            Dodaj usługodawcę
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVendors.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              onEdit={handleEdit}
              onDelete={setDeleteVendorId}
            />
          ))}
        </div>
      ) : (
        <VendorList
          vendors={filteredVendors}
          onEdit={handleEdit}
          onDelete={setDeleteVendorId}
        />
      )}

      <VendorDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingVendor(null);
          }
        }}
        vendor={editingVendor}
        onSubmit={handleDialogSubmit}
      />

      <AlertDialog
        open={deleteVendorId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteVendorId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usunąć usługodawcę?</AlertDialogTitle>
            <AlertDialogDescription>
              Tej operacji nie można cofnąć.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteVendorId(null)}>
              Anuluj
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVendor}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
