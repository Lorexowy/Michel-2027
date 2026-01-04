"use client";

import { WithId, Expense } from "@/lib/db/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { MoreVertical, Calendar, Wallet } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { cn } from "@/lib/utils";

interface ExpenseCardProps {
  expense: WithId<Expense>;
  onEdit: (expense: WithId<Expense>) => void;
  onDelete: (expenseId: string) => void;
}

const statusLabels: Record<Expense["status"], string> = {
  planned: "Zaplanowany",
  deposit: "Zadatek",
  paid: "Opłacony",
};

const statusStyles: Record<Expense["status"], string> = {
  planned: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  deposit: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
  paid: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
};

export default function ExpenseCard({
  expense,
  onEdit,
  onDelete,
}: ExpenseCardProps) {
  const formatDueDate = (dueDate: Timestamp | null | undefined) => {
    if (!dueDate) return null;
    try {
      return format(dueDate.toDate(), "dd.MM.yyyy");
    } catch {
      return null;
    }
  };

  const dueDateStr = formatDueDate(expense.dueDate);
  const isOverdue = dueDateStr && new Date(expense.dueDate!.toDate()) < new Date() && expense.status !== "paid";

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm hover:shadow-lg transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-1">
            {expense.title}
          </h4>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className={cn("text-xs font-medium", statusStyles[expense.status])}
            >
              {statusLabels[expense.status]}
            </Badge>
            <Badge variant="outline" className="text-xs font-medium bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600">
              {expense.category}
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
            <DropdownMenuItem onClick={() => onEdit(expense)}>
              Edytuj
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(expense.id)}
              className="text-destructive focus:text-destructive"
            >
              Usuń
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <Wallet className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              <span>{expense.amount.toFixed(2)} PLN</span>
            </div>
            {expense.paidAmount !== undefined && expense.paidAmount > 0 && (
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 ml-7">
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  Zapłacono: {expense.paidAmount.toFixed(2)} PLN
                </span>
                {expense.paidAmount < expense.amount && (
                  <span className="text-slate-500 dark:text-slate-500">
                    (pozostało: {(expense.amount - expense.paidAmount).toFixed(2)} PLN)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {expense.description && (
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
            {expense.description}
          </p>
        )}

        {dueDateStr && (
          <div className={`flex items-center gap-1.5 text-xs font-medium ${
            isOverdue 
              ? "text-rose-600 dark:text-rose-400" 
              : "text-slate-500 dark:text-slate-400"
          }`}>
            <Calendar className={`h-3.5 w-3.5 ${isOverdue ? "text-rose-600 dark:text-rose-400" : ""}`} />
            <span>Termin: {dueDateStr}</span>
            {isOverdue && (
              <span className="ml-1 px-1.5 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded text-[10px] font-semibold">
                Przeterminowane
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

