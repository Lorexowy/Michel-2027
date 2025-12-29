"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { WithId, Task, TaskStatus, TaskPriority } from "@/lib/db/types";
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

const taskSchema = z.object({
  title: z.string().min(2, "Tytuł musi mieć co najmniej 2 znaki"),
  description: z.string().optional().nullable(),
  status: z.enum(["todo", "doing", "done"]),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.string().optional().nullable(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: WithId<Task> | null;
  onSubmit: (data: Omit<Task, "createdAt" | "updatedAt">) => Promise<void>;
}

export default function TaskDialog({
  open,
  onOpenChange,
  task,
  onSubmit,
}: TaskDialogProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: null,
      status: "todo",
      priority: "medium",
      dueDate: null,
    },
  });

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description || null,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate
          ? formatDateForInput(task.dueDate.toDate())
          : null,
      });
    } else {
      form.reset({
        title: "",
        description: null,
        status: "todo",
        priority: "medium",
        dueDate: null,
      });
    }
  }, [task, open, form]);

  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const handleSubmit = async (values: TaskFormValues) => {
    console.log("TaskDialog: handleSubmit wywołany z wartościami:", values);
    try {
      // Firestore nie akceptuje undefined - musimy usunąć te pola lub ustawić null
      const taskData: Omit<Task, "createdAt" | "updatedAt"> = {
        title: values.title,
        status: values.status,
        priority: values.priority,
        assignedTo: "both", // Domyślna wartość
      };

      // Dodaj opcjonalne pola tylko jeśli mają wartość
      if (values.description && values.description.trim()) {
        taskData.description = values.description;
      }
      if (values.dueDate) {
        taskData.dueDate = Timestamp.fromDate(new Date(values.dueDate));
      }

      console.log("TaskDialog: Wywołuję onSubmit z danymi:", taskData);
      await onSubmit(taskData);
      console.log("TaskDialog: onSubmit zakończony pomyślnie");
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("TaskDialog: Błąd podczas zapisywania zadania:", error);
      alert(`Błąd podczas zapisywania zadania: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? "Edytuj zadanie" : "Dodaj zadanie"}</DialogTitle>
          <DialogDescription>
            {task
              ? "Zaktualizuj szczegóły zadania"
              : "Utwórz nowe zadanie do planowania ślubu"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tytuł</FormLabel>
                  <FormControl>
                    <Input placeholder="Np. Zamówić kwiaty" {...field} />
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
                  <FormLabel>Opis (opcjonalnie)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Dodatkowe informacje o zadaniu..."
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
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
                        <SelectItem value="todo">Do zrobienia</SelectItem>
                        <SelectItem value="doing">W trakcie</SelectItem>
                        <SelectItem value="done">Zrobione</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priorytet</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz priorytet" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Niski</SelectItem>
                        <SelectItem value="medium">Średni</SelectItem>
                        <SelectItem value="high">Wysoki</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Termin (opcjonalnie)</FormLabel>
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

