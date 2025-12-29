"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { WithId, Expense, ExpenseStatus } from "@/lib/db/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Timestamp } from "firebase/firestore";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const expenseSchema = z.object({
  title: z.string().min(1, "Tytuł jest wymagany"),
  description: z.string().optional().nullable(),
  category: z.string().min(1, "Kategoria jest wymagana"),
  amount: z.number().min(0, "Kwota musi być większa lub równa 0"),
  status: z.enum(["planned", "deposit", "paid"]),
  scenarioId: z.string().min(1, "Scenariusz jest wymagany"),
  dueDate: z.string().optional().nullable(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: WithId<Expense> | null;
  scenarios: Array<{ id: string; name: string }>;
  activeScenarioId: string;
  onSubmit: (data: Omit<Expense, "createdAt" | "updatedAt">) => Promise<void>;
}

export default function ExpenseDialog({
  open,
  onOpenChange,
  expense,
  scenarios,
  activeScenarioId,
  onSubmit,
}: ExpenseDialogProps) {
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: "",
      description: null,
      category: "",
      amount: 0,
      status: "planned",
      scenarioId: activeScenarioId,
      dueDate: null,
    },
  });

  useEffect(() => {
    if (expense) {
      form.reset({
        title: expense.title,
        description: expense.description || null,
        category: expense.category,
        amount: expense.amount,
        status: expense.status,
        scenarioId: expense.scenarioId,
        dueDate: expense.dueDate
          ? formatDateForInput(expense.dueDate.toDate())
          : null,
      });
    } else {
      form.reset({
        title: "",
        description: null,
        category: "",
        amount: 0,
        status: "planned",
        scenarioId: activeScenarioId,
        dueDate: null,
      });
    }
  }, [expense, open, activeScenarioId, form]);

  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const handleSubmit = async (values: ExpenseFormValues) => {
    try {
      const expenseData: Omit<Expense, "createdAt" | "updatedAt"> = {
        title: values.title,
        category: values.category,
        amount: values.amount,
        status: values.status,
        scenarioId: values.scenarioId,
      };

      if (values.description && values.description.trim()) {
        expenseData.description = values.description;
      }
      if (values.dueDate) {
        expenseData.dueDate = Timestamp.fromDate(new Date(values.dueDate));
      }

      await onSubmit(expenseData);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Błąd podczas zapisywania wydatku:", error);
      alert(`Błąd podczas zapisywania wydatku: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{expense ? "Edytuj wydatek" : "Dodaj wydatek"}</DialogTitle>
          <DialogDescription>
            {expense
              ? "Zaktualizuj szczegóły wydatku"
              : "Dodaj nowy wydatek do kosztorysu"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tytuł *</FormLabel>
                  <FormControl>
                    <Input placeholder="Np. Kwiaty ślubne" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategoria *</FormLabel>
                    <FormControl>
                      <Input placeholder="Np. Dekoracje" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kwota (PLN) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scenarioId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scenariusz *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz scenariusz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {scenarios.map((scenario) => (
                          <SelectItem key={scenario.id} value={scenario.id}>
                            {scenario.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="planned">Zaplanowany</SelectItem>
                        <SelectItem value="deposit">Zadatek</SelectItem>
                        <SelectItem value="paid">Opłacony</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Termin płatności</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opis</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Dodatkowe informacje o wydatku..."
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

