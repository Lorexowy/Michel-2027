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

interface ExpenseListProps {
  expenses: WithId<Expense>[];
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

export default function ExpenseList({
  expenses,
  onEdit,
  onDelete,
}: ExpenseListProps) {
  const formatDueDate = (dueDate: Timestamp | null | undefined) => {
    if (!dueDate) return null;
    try {
      return format(dueDate.toDate(), "dd.MM.yyyy");
    } catch {
      return null;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Tytuł
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                Kategoria
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Kwota
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">
                Termin
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {expenses.map((expense) => {
              const dueDateStr = formatDueDate(expense.dueDate);
              const isOverdue = dueDateStr && new Date(expense.dueDate!.toDate()) < new Date() && expense.status !== "paid";

              return (
                <tr
                  key={expense.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {expense.title}
                    </div>
                    {expense.description && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                        {expense.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 hidden sm:table-cell">
                    <Badge variant="outline" className="text-xs font-medium bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600">
                      {expense.category}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                      <Wallet className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      <span>{expense.amount.toFixed(2)} PLN</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={cn("text-xs font-medium", statusStyles[expense.status])}
                    >
                      {statusLabels[expense.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell">
                    {dueDateStr ? (
                      <div className={`flex items-center gap-1.5 ${isOverdue ? "text-rose-600 dark:text-rose-400" : ""}`}>
                        <Calendar className={`h-3.5 w-3.5 ${isOverdue ? "text-rose-600 dark:text-rose-400" : ""}`} />
                        <span>{dueDateStr}</span>
                        {isOverdue && (
                          <span className="ml-1 px-1.5 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded text-[10px] font-semibold">
                            Przeterminowane
                          </span>
                        )}
                      </div>
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

