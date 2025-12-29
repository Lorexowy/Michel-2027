"use client";

import { BudgetScenario, Expense, WithId } from "@/lib/db/types";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ScenarioComparisonProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scenarios: WithId<BudgetScenario>[];
  expensesByScenario: Record<string, WithId<Expense>[]>;
  currency?: string;
  onSetActive: (scenarioId: string) => void;
}

export default function ScenarioComparison({
  open,
  onOpenChange,
  scenarios,
  expensesByScenario,
  currency = "PLN",
  onSetActive,
}: ScenarioComparisonProps) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Porównanie scenariuszy</DialogTitle>
          <DialogDescription>
            Porównaj budżety i wydatki we wszystkich scenariuszach
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {scenarios.map((scenario) => {
            const stats = calculateStats(scenario.id);
            const isActive = scenario.isActive;

            return (
              <div
                key={scenario.id}
                className={`bg-white dark:bg-slate-800 rounded-xl border shadow-sm p-6 ${
                  isActive ? "border-2 border-green-500" : "border-slate-200 dark:border-slate-700"
                }`}
              >
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {scenario.name}
                    </h3>
                    {isActive && (
                      <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Aktywny
                      </span>
                    )}
                  </div>
                  {scenario.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {scenario.description}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Całkowity budżet:
                      </span>
                      <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {stats.total.toFixed(2)} {currency}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Zaplanowane:
                      </span>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {stats.planned.toFixed(2)} {currency}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Zadatek:
                      </span>
                      <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                        {stats.deposit.toFixed(2)} {currency}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Opłacone:
                      </span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {stats.paid.toFixed(2)} {currency}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Liczba wydatków:
                      </span>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {stats.count}
                      </span>
                    </div>
                  </div>

                  {!isActive && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-4"
                      onClick={() => onSetActive(scenario.id)}
                    >
                      Ustaw jako aktywny
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

