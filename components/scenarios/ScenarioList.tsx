"use client";

import { BudgetScenario, Expense, WithId } from "@/lib/db/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { CheckCircle2, MoreVertical, Plus, Copy, Edit, Trash2, ArrowRight } from "lucide-react";
import { format } from "date-fns";

interface ScenarioListProps {
  scenarios: WithId<BudgetScenario>[];
  expensesByScenario: Record<string, WithId<Expense>[]>;
  currency: string;
  onScenarioClick: (scenarioId: string) => void;
  onAddScenario: () => void;
  onEditScenario: (scenario: WithId<BudgetScenario>) => void;
  onDeleteScenario: (scenarioId: string) => void;
  onCloneScenario: (scenarioId: string) => void;
  onSetActive: (scenarioId: string) => void;
}

export default function ScenarioList({
  scenarios,
  expensesByScenario,
  currency,
  onScenarioClick,
  onAddScenario,
  onEditScenario,
  onDeleteScenario,
  onCloneScenario,
  onSetActive,
}: ScenarioListProps) {
  const calculateStats = (scenarioId: string) => {
    const expenses = expensesByScenario[scenarioId] || [];
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const planned = expenses
      .filter((e) => e.status === "planned")
      .reduce((sum, e) => sum + e.amount, 0);
    const deposit = expenses
      .filter((e) => e.status === "deposit")
      .reduce((sum, e) => sum + e.amount, 0);
    const paid = expenses
      .filter((e) => e.status === "paid")
      .reduce((sum, e) => sum + e.amount, 0);

    return { total, planned, deposit, paid, count: expenses.length };
  };

  if (scenarios.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
          <Plus className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-lg text-slate-600 dark:text-slate-400 font-medium mb-2">
          Brak scenariuszy
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">
          Utwórz pierwszy scenariusz kosztorysu, aby rozpocząć planowanie
        </p>
        <Button onClick={onAddScenario} className="shadow-md hover:shadow-lg transition-shadow">
          <Plus className="h-4 w-4 mr-2" />
          Dodaj scenariusz
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Scenariusze kosztorysu
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Wybierz scenariusz, aby zobaczyć szczegóły i zarządzać wydatkami
          </p>
        </div>
        <Button onClick={onAddScenario} className="shadow-md hover:shadow-lg transition-shadow">
          <Plus className="h-4 w-4 mr-2" />
          Dodaj scenariusz
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((scenario) => {
          const stats = calculateStats(scenario.id);
          const isActive = scenario.isActive;

          return (
            <div
              key={scenario.id}
              className={`bg-white dark:bg-slate-800 rounded-xl border shadow-sm hover:shadow-md transition-all cursor-pointer group ${
                isActive
                  ? "border-2 border-green-500 dark:border-green-400"
                  : "border-slate-200 dark:border-slate-700"
              }`}
              onClick={() => onScenarioClick(scenario.id)}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {scenario.name}
                      </h3>
                      {isActive && (
                        <span className="flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full whitespace-nowrap">
                          <CheckCircle2 className="w-3 h-3" />
                          Aktywny
                        </span>
                      )}
                    </div>
                    {scenario.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                        {scenario.description}
                      </p>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onScenarioClick(scenario.id);
                        }}
                      >
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Otwórz
                      </DropdownMenuItem>
                      {!isActive && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onSetActive(scenario.id);
                          }}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Ustaw jako aktywny
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditScenario(scenario);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edytuj
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onCloneScenario(scenario.id);
                        }}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Klonuj
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteScenario(scenario.id);
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Usuń
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Stats */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Całkowity budżet:
                    </span>
                    <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {stats.total.toFixed(2)} {currency}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <div className="text-blue-600 dark:text-blue-400 font-medium">
                        {stats.planned.toFixed(0)}
                      </div>
                      <div className="text-slate-600 dark:text-slate-400">Zaplan.</div>
                    </div>
                    <div className="text-center p-2 bg-amber-50 dark:bg-amber-900/20 rounded">
                      <div className="text-amber-600 dark:text-amber-400 font-medium">
                        {stats.deposit.toFixed(0)}
                      </div>
                      <div className="text-slate-600 dark:text-slate-400">Zadatek</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                      <div className="text-green-600 dark:text-green-400 font-medium">
                        {stats.paid.toFixed(0)}
                      </div>
                      <div className="text-slate-600 dark:text-slate-400">Opłac.</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>{stats.count} wydatków</span>
                    <span>
                      {scenario.createdAt &&
                        format(scenario.createdAt.toDate(), "d MMM yyyy")}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onScenarioClick(scenario.id);
                  }}
                >
                  Zobacz szczegóły
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

