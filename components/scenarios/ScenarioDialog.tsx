"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { WithId, BudgetScenario } from "@/lib/db/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

const scenarioSchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana"),
  description: z.string().optional().nullable(),
  isActive: z.boolean(),
});

type ScenarioFormValues = z.infer<typeof scenarioSchema>;

interface ScenarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scenario?: WithId<BudgetScenario> | null;
  hasOtherScenarios: boolean;
  onSubmit: (data: Omit<BudgetScenario, "createdAt" | "updatedAt">) => Promise<void>;
}

export default function ScenarioDialog({
  open,
  onOpenChange,
  scenario,
  hasOtherScenarios,
  onSubmit,
}: ScenarioDialogProps) {
  const form = useForm<ScenarioFormValues>({
    resolver: zodResolver(scenarioSchema),
    defaultValues: {
      name: "",
      description: null,
      isActive: false,
    },
  });

  useEffect(() => {
    if (scenario) {
      form.reset({
        name: scenario.name,
        description: scenario.description || null,
        isActive: scenario.isActive,
      });
    } else {
      form.reset({
        name: "",
        description: null,
        isActive: !hasOtherScenarios, // Jeśli to pierwszy scenariusz, ustaw jako aktywny
      });
    }
  }, [scenario, open, hasOtherScenarios, form]);

  const handleSubmit = async (values: ScenarioFormValues) => {
    try {
      const scenarioData: Omit<BudgetScenario, "createdAt" | "updatedAt"> = {
        name: values.name,
        isActive: values.isActive,
      };

      if (values.description && values.description.trim()) {
        scenarioData.description = values.description;
      }

      await onSubmit(scenarioData);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Błąd podczas zapisywania scenariusza:", error);
      alert(`Błąd podczas zapisywania scenariusza: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{scenario ? "Edytuj scenariusz" : "Dodaj scenariusz"}</DialogTitle>
          <DialogDescription>
            {scenario
              ? "Zaktualizuj szczegóły scenariusza kosztorysu"
              : "Utwórz nowy scenariusz kosztorysu (np. różne sale, wersje)"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nazwa scenariusza *</FormLabel>
                  <FormControl>
                    <Input placeholder="Np. Sala A, Wersja ekonomiczna" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opis</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Dodatkowe informacje o scenariuszu..."
                      className="resize-none"
                      rows={3}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Ustaw jako aktywny scenariusz</FormLabel>
                    <FormDescription>
                      Aktywny scenariusz będzie domyślnie wyświetlany w kosztorysie
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Anuluj
              </Button>
              <Button type="submit">Zapisz</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


