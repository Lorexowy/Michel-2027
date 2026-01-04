"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BudgetScenario, WithId } from "@/lib/db/types";
import { Plus, Copy, BarChart3 } from "lucide-react";

interface ScenarioSelectorProps {
  scenarios: WithId<BudgetScenario>[];
  activeScenario: WithId<BudgetScenario> | null;
  onScenarioChange: (scenarioId: string) => void;
  onAddScenario: () => void;
  onCompareScenarios: () => void;
  onCloneScenario: (scenarioId: string) => void;
}

export default function ScenarioSelector({
  scenarios,
  activeScenario,
  onScenarioChange,
  onAddScenario,
  onCompareScenarios,
  onCloneScenario,
}: ScenarioSelectorProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
          Scenariusz:
        </label>
        <Select
          value={activeScenario?.id || ""}
          onValueChange={onScenarioChange}
        >
          <SelectTrigger className="w-full sm:w-[250px]">
            <SelectValue placeholder="Wybierz scenariusz" />
          </SelectTrigger>
          <SelectContent>
            {scenarios.map((scenario) => (
              <SelectItem key={scenario.id} value={scenario.id}>
                <div className="flex items-center gap-2">
                  <span>{scenario.name}</span>
                  {scenario.isActive && (
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                      (aktywny)
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {scenarios.length > 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onCompareScenarios}
              className="flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Porównaj</span>
            </Button>
            {activeScenario && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCloneScenario(activeScenario.id)}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Klonuj</span>
              </Button>
            )}
          </>
        )}
        <Button
          variant="default"
          size="sm"
          onClick={onAddScenario}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Dodaj scenariusz</span>
          <span className="sm:hidden">Dodaj</span>
        </Button>
      </div>
    </div>
  );
}


