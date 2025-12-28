"use client";

import { useEffect, useState, useMemo } from "react";
import { WithId, Expense, ExpenseStatus } from "@/lib/db/types";
import { listExpenses, createExpense, updateExpense, deleteExpense } from "@/lib/db/expenses";
import { Button } from "@/components/ui/button";
import ExpenseCard from "@/components/expenses/ExpenseCard";
import ExpenseList from "@/components/expenses/ExpenseList";
import ExpenseDialog from "@/components/expenses/ExpenseDialog";
import ExpenseFilters from "@/components/expenses/ExpenseFilters";
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
import { Plus, Calculator, Wallet, CheckCircle2, Clock, Grid3x3, List } from "lucide-react";

export default function KosztorysPage() {
  const [expenses, setExpenses] = useState<WithId<Expense>[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<WithId<Expense> | null>(null);
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const allExpenses = await listExpenses();
      setExpenses(allExpenses);
    } catch (error) {
      console.error("Błąd podczas ładowania wydatków:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(expenses.map(e => e.category)));
    return uniqueCategories.sort();
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !expense.title.toLowerCase().includes(query) &&
          !expense.category.toLowerCase().includes(query) &&
          !(expense.description?.toLowerCase().includes(query) || false)
        ) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "all" && expense.status !== statusFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== "all" && expense.category !== categoryFilter) {
        return false;
      }

      return true;
    });
  }, [expenses, searchQuery, statusFilter, categoryFilter]);

  const handleCreateExpense = async (data: Omit<Expense, "createdAt" | "updatedAt">) => {
    try {
      await createExpense(data);
      await loadExpenses();
    } catch (error) {
      console.error("Błąd podczas tworzenia wydatku:", error);
      throw error;
    }
  };

  const handleUpdateExpense = async (data: Omit<Expense, "createdAt" | "updatedAt">) => {
    if (!editingExpense) return;
    try {
      await updateExpense(editingExpense.id, data);
      await loadExpenses();
      setEditingExpense(null);
    } catch (error) {
      console.error("Błąd podczas aktualizacji wydatku:", error);
      throw error;
    }
  };

  const handleDeleteExpense = async () => {
    if (!deleteExpenseId) return;
    await deleteExpense(deleteExpenseId);
    await loadExpenses();
    setDeleteExpenseId(null);
  };

  const handleEdit = (expense: WithId<Expense>) => {
    setEditingExpense(expense);
    setDialogOpen(true);
  };

  const handleDialogSubmit = async (data: Omit<Expense, "createdAt" | "updatedAt">) => {
    try {
      if (editingExpense) {
        await handleUpdateExpense(data);
      } else {
        await handleCreateExpense(data);
      }
      setDialogOpen(false);
      setEditingExpense(null);
    } catch (error) {
      console.error("Błąd w handleDialogSubmit:", error);
      throw error;
    }
  };

  // Statistics
  const totalExpenses = filteredExpenses.length;
  const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const plannedAmount = filteredExpenses.filter(e => e.status === "planned").reduce((sum, e) => sum + e.amount, 0);
  const depositAmount = filteredExpenses.filter(e => e.status === "deposit").reduce((sum, e) => sum + e.amount, 0);
  const paidAmount = filteredExpenses.filter(e => e.status === "paid").reduce((sum, e) => sum + e.amount, 0);
  const plannedCount = filteredExpenses.filter(e => e.status === "planned").length;
  const depositCount = filteredExpenses.filter(e => e.status === "deposit").length;
  const paidCount = filteredExpenses.filter(e => e.status === "paid").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-600 dark:text-slate-400">Ładowanie wydatków...</div>
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
              <Calculator className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 truncate">
              Kosztorys
            </h1>
          </div>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Śledź wydatki i budżet ślubny
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
              setEditingExpense(null);
              setDialogOpen(true);
            }}
            className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow"
          >
            <Plus className="h-4 w-4 mr-2" />
            Dodaj wydatek
          </Button>
        </div>
      </div>

      {/* Expense Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Całkowity budżet</p>
            <p className="text-2xl font-bold">{totalAmount.toFixed(2)} PLN</p>
            <p className="text-xs opacity-75 mt-1">{totalExpenses} wydatków</p>
          </div>
          <Wallet className="w-10 h-10 opacity-80" />
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Zaplanowane</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{plannedAmount.toFixed(2)} PLN</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{plannedCount} wydatków</p>
          </div>
          <Clock className="w-8 h-8 text-blue-400 dark:text-blue-600" />
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Zadatek</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{depositAmount.toFixed(2)} PLN</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{depositCount} wydatków</p>
          </div>
          <Wallet className="w-8 h-8 text-amber-400 dark:text-amber-600" />
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Opłacone</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{paidAmount.toFixed(2)} PLN</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{paidCount} wydatków</p>
          </div>
          <CheckCircle2 className="w-8 h-8 text-green-400 dark:text-green-600" />
        </div>
      </div>

      <ExpenseFilters
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        categoryFilter={categoryFilter}
        onSearchChange={setSearchQuery}
        onStatusFilterChange={setStatusFilter}
        onCategoryFilterChange={setCategoryFilter}
        categories={categories}
      />

      {filteredExpenses.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center flex flex-col items-center justify-center">
          <Calculator className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
            Brak wydatków. Dodaj pierwszy wydatek.
          </p>
          <Button
            onClick={() => {
              setEditingExpense(null);
              setDialogOpen(true);
            }}
            className="mt-6 shadow-md hover:shadow-lg transition-shadow"
          >
            <Plus className="h-4 w-4 mr-2" />
            Dodaj wydatek
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExpenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onEdit={handleEdit}
              onDelete={setDeleteExpenseId}
            />
          ))}
        </div>
      ) : (
        <ExpenseList
          expenses={filteredExpenses}
          onEdit={handleEdit}
          onDelete={setDeleteExpenseId}
        />
      )}

      <ExpenseDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingExpense(null);
          }
        }}
        expense={editingExpense}
        onSubmit={handleDialogSubmit}
      />

      <AlertDialog
        open={deleteExpenseId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteExpenseId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usunąć wydatek?</AlertDialogTitle>
            <AlertDialogDescription>
              Tej operacji nie można cofnąć.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteExpenseId(null)}>
              Anuluj
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteExpense}
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
