"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { WithId, Guest, GuestSide, GuestRSVP } from "@/lib/db/types";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const guestSchema = z.object({
  firstName: z.string().min(1, "Imię jest wymagane"),
  lastName: z.string().optional().nullable(),
  email: z.string().email("Nieprawidłowy adres email").optional().or(z.literal("")),
  phone: z.string().optional().nullable(),
  side: z.enum(["bride", "groom"]),
  rsvp: z.enum(["not_sent", "sent", "yes", "no"]),
  hasCompanion: z.boolean().optional(),
  dietaryRestrictions: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type GuestFormValues = z.infer<typeof guestSchema>;

interface GuestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guest?: WithId<Guest> | null;
  onSubmit: (data: Omit<Guest, "createdAt" | "updatedAt">) => Promise<void>;
}

export default function GuestDialog({
  open,
  onOpenChange,
  guest,
  onSubmit,
}: GuestDialogProps) {
  const form = useForm<GuestFormValues>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: null,
      side: "bride",
      rsvp: "not_sent",
      hasCompanion: false,
      dietaryRestrictions: null,
      notes: null,
    },
  });

  useEffect(() => {
    if (guest) {
      form.reset({
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email || "",
        phone: guest.phone || null,
        side: guest.side,
        rsvp: guest.rsvp,
        hasCompanion: guest.hasCompanion || false,
        dietaryRestrictions: guest.dietaryRestrictions || null,
        notes: guest.notes || null,
      });
    } else {
      form.reset({
        firstName: "",
        lastName: "",
        email: "",
        phone: null,
        side: "bride",
        rsvp: "not_sent",
        hasCompanion: false,
        dietaryRestrictions: null,
        notes: null,
      });
    }
  }, [guest, open, form]);

  const handleSubmit = async (values: GuestFormValues) => {
    try {
      // Firestore nie akceptuje undefined - musimy usunąć te pola lub ustawić null
      const guestData: Omit<Guest, "createdAt" | "updatedAt"> = {
        firstName: values.firstName,
        side: values.side,
        rsvp: values.rsvp,
      };

      // Dodaj opcjonalne pola tylko jeśli mają wartość
      if (values.lastName && values.lastName.trim()) {
        guestData.lastName = values.lastName;
      }
      if (values.email && values.email.trim()) {
        guestData.email = values.email;
      }
      if (values.phone && values.phone.trim()) {
        guestData.phone = values.phone;
      }
      if (values.hasCompanion) {
        guestData.hasCompanion = true;
      }
      if (values.dietaryRestrictions && values.dietaryRestrictions.trim()) {
        guestData.dietaryRestrictions = values.dietaryRestrictions;
      }
      if (values.notes && values.notes.trim()) {
        guestData.notes = values.notes;
      }

      await onSubmit(guestData);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Błąd podczas zapisywania gościa:", error);
      alert(`Błąd podczas zapisywania gościa: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{guest ? "Edytuj gościa" : "Dodaj gościa"}</DialogTitle>
          <DialogDescription>
            {guest
              ? "Zaktualizuj dane gościa"
              : "Dodaj nowego gościa do listy zaproszonych"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imię *</FormLabel>
                    <FormControl>
                      <Input placeholder="Jan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nazwisko</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Kowalski"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="jan.kowalski@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+48 123 456 789"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
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
                name="side"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Strona *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz stronę" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bride">Strona Panny Młodej</SelectItem>
                        <SelectItem value="groom">Strona Pana Młodego</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rsvp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RSVP *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Status RSVP" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="not_sent">Zaproszenie nie wysłane</SelectItem>
                        <SelectItem value="sent">Zaproszenie wysłane</SelectItem>
                        <SelectItem value="yes">Potwierdzony</SelectItem>
                        <SelectItem value="no">Odrzucony</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="hasCompanion"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-slate-200 dark:border-slate-700 p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Osoba towarzysząca
                    </FormLabel>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Zaznacz, jeśli gość przyjdzie z osobą towarzyszącą (będzie liczony jako 2 osoby)
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dietaryRestrictions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ograniczenia dietetyczne</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Np. Wegetariańskie, bezglutenowe..."
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notatki</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Dodatkowe informacje o gościu..."
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

