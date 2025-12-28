"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { WithId, Note } from "@/lib/db/types";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const noteSchema = z.object({
  title: z.string().min(1, "Tytuł jest wymagany"),
  content: z.string().min(1, "Treść jest wymagana"),
  tags: z.string().optional().nullable(),
});

type NoteFormValues = z.infer<typeof noteSchema>;

interface NoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note?: WithId<Note> | null;
  onSubmit: (data: Omit<Note, "createdAt" | "updatedAt">) => Promise<void>;
}

export default function NoteDialog({
  open,
  onOpenChange,
  note,
  onSubmit,
}: NoteDialogProps) {
  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: "",
      content: "",
      tags: null,
    },
  });

  useEffect(() => {
    if (note) {
      form.reset({
        title: note.title,
        content: note.content,
        tags: note.tags ? note.tags.join(", ") : null,
      });
    } else {
      form.reset({
        title: "",
        content: "",
        tags: null,
      });
    }
  }, [note, open, form]);

  const handleSubmit = async (values: NoteFormValues) => {
    try {
      const noteData: Omit<Note, "createdAt" | "updatedAt"> = {
        title: values.title,
        content: values.content,
      };

      // Parse tags from comma-separated string
      if (values.tags && values.tags.trim()) {
        const tagsArray = values.tags
          .split(",")
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0);
        if (tagsArray.length > 0) {
          noteData.tags = tagsArray;
        }
      }

      await onSubmit(noteData);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Błąd podczas zapisywania notatki:", error);
      alert(`Błąd podczas zapisywania notatki: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{note ? "Edytuj notatkę" : "Dodaj notatkę"}</DialogTitle>
          <DialogDescription>
            {note
              ? "Zaktualizuj treść notatki"
              : "Utwórz nową notatkę"}
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
                    <Input placeholder="Np. Pomysły na dekoracje" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Treść *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Wpisz treść notatki..."
                      className="resize-none min-h-[200px]"
                      rows={10}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tagi</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Np. dekoracje, kwiaty, menu (oddzielone przecinkami)"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Oddziel tagi przecinkami
                  </p>
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

