"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { WithId, Vendor, VendorStatus } from "@/lib/db/types";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const vendorSchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana"),
  category: z.string().min(1, "Kategoria jest wymagana"),
  contactName: z.string().optional().nullable(),
  email: z.string().email("Nieprawidłowy adres email").optional().or(z.literal("")),
  phone: z.string().optional().nullable(),
  website: z.string().url("Nieprawidłowy adres URL").optional().or(z.literal("")),
  status: z.enum(["considering", "booked", "rejected"]),
  notes: z.string().optional().nullable(),
});

type VendorFormValues = z.infer<typeof vendorSchema>;

interface VendorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor?: WithId<Vendor> | null;
  onSubmit: (data: Omit<Vendor, "createdAt" | "updatedAt">) => Promise<void>;
}

export default function VendorDialog({
  open,
  onOpenChange,
  vendor,
  onSubmit,
}: VendorDialogProps) {
  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: "",
      category: "",
      contactName: null,
      email: "",
      phone: null,
      website: "",
      status: "considering",
      notes: null,
    },
  });

  useEffect(() => {
    if (vendor) {
      form.reset({
        name: vendor.name,
        category: vendor.category,
        contactName: vendor.contactName || null,
        email: vendor.email || "",
        phone: vendor.phone || null,
        website: vendor.website || "",
        status: vendor.status,
        notes: vendor.notes || null,
      });
    } else {
      form.reset({
        name: "",
        category: "",
        contactName: null,
        email: "",
        phone: null,
        website: "",
        status: "considering",
        notes: null,
      });
    }
  }, [vendor, open, form]);

  const handleSubmit = async (values: VendorFormValues) => {
    try {
      const vendorData: Omit<Vendor, "createdAt" | "updatedAt"> = {
        name: values.name,
        category: values.category,
        status: values.status,
      };

      if (values.contactName && values.contactName.trim()) {
        vendorData.contactName = values.contactName;
      }
      if (values.email && values.email.trim()) {
        vendorData.email = values.email;
      }
      if (values.phone && values.phone.trim()) {
        vendorData.phone = values.phone;
      }
      if (values.website && values.website.trim()) {
        vendorData.website = values.website;
      }
      if (values.notes && values.notes.trim()) {
        vendorData.notes = values.notes;
      }

      await onSubmit(vendorData);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Błąd podczas zapisywania usługodawcy:", error);
      alert(`Błąd podczas zapisywania usługodawcy: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vendor ? "Edytuj usługodawcę" : "Dodaj usługodawcę"}</DialogTitle>
          <DialogDescription>
            {vendor
              ? "Zaktualizuj dane usługodawcy"
              : "Dodaj nowego usługodawcę do listy"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nazwa *</FormLabel>
                    <FormControl>
                      <Input placeholder="Np. Kwiaciarnia Kwiatowa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategoria *</FormLabel>
                    <FormControl>
                      <Input placeholder="Np. Kwiaty" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="contactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imię i nazwisko kontaktu</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Np. Jan Kowalski"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                        placeholder="kontakt@example.com"
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

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Strona internetowa</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        <SelectItem value="considering">Rozważany</SelectItem>
                        <SelectItem value="booked">Zarezerwowany</SelectItem>
                        <SelectItem value="rejected">Odrzucony</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notatki</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Dodatkowe informacje o usługodawcy..."
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

