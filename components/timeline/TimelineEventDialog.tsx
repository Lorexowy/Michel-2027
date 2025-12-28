"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { WithId, TimelineEvent } from "@/lib/db/types";
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
import { Timestamp } from "firebase/firestore";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const timelineEventSchema = z.object({
  title: z.string().min(1, "Tytuł jest wymagany"),
  description: z.string().optional().nullable(),
  eventDate: z.string().min(1, "Data wydarzenia jest wymagana"),
  startHour: z.string().optional().nullable(),
  startMinute: z.string().optional().nullable(),
  hasEndTime: z.boolean().optional(),
  endHour: z.string().optional().nullable(),
  endMinute: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
});

type TimelineEventFormValues = z.infer<typeof timelineEventSchema>;

interface TimelineEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: WithId<TimelineEvent> | null;
  onSubmit: (data: Omit<TimelineEvent, "createdAt" | "updatedAt">) => Promise<void>;
}

export default function TimelineEventDialog({
  open,
  onOpenChange,
  event,
  onSubmit,
}: TimelineEventDialogProps) {
  const form = useForm<TimelineEventFormValues>({
    resolver: zodResolver(timelineEventSchema),
    defaultValues: {
      title: "",
      description: null,
      eventDate: "",
      startHour: null,
      startMinute: null,
      hasEndTime: false,
      endHour: null,
      endMinute: null,
      location: null,
    },
  });

  useEffect(() => {
    if (event) {
      const startTimeParts = event.startTime ? event.startTime.split(":") : [null, null];
      const endTimeParts = event.endTime ? event.endTime.split(":") : [null, null];
      const hasEndTime = !!event.endTime;
      
      form.reset({
        title: event.title,
        description: event.description || null,
        eventDate: formatDateForInput(event.eventDate.toDate()),
        startHour: startTimeParts[0] || null,
        startMinute: startTimeParts[1] || null,
        hasEndTime: hasEndTime,
        endHour: endTimeParts[0] || null,
        endMinute: endTimeParts[1] || null,
        location: event.location || null,
      });
    } else {
      form.reset({
        title: "",
        description: null,
        eventDate: "",
        startHour: null,
        startMinute: null,
        hasEndTime: false,
        endHour: null,
        endMinute: null,
        location: null,
      });
    }
  }, [event, open, form]);

  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const handleSubmit = async (values: TimelineEventFormValues) => {
    try {
      const eventData: Omit<TimelineEvent, "createdAt" | "updatedAt"> = {
        title: values.title,
        eventDate: Timestamp.fromDate(new Date(values.eventDate)),
      };

      if (values.description && values.description.trim()) {
        eventData.description = values.description;
      }
      
      // Format time as HH:MM (24h)
      if (values.startHour && values.startMinute) {
        const hour = values.startHour.padStart(2, "0");
        const minute = values.startMinute.padStart(2, "0");
        eventData.startTime = `${hour}:${minute}`;
      }
      
      // End time is optional - only save if checkbox is checked and both hour and minute are provided
      if (values.hasEndTime && values.endHour && values.endMinute) {
        const hour = values.endHour.padStart(2, "0");
        const minute = values.endMinute.padStart(2, "0");
        eventData.endTime = `${hour}:${minute}`;
      }
      
      if (values.location && values.location.trim()) {
        eventData.location = values.location;
      }

      await onSubmit(eventData);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Błąd podczas zapisywania wydarzenia:", error);
      alert(`Błąd podczas zapisywania wydarzenia: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event ? "Edytuj wydarzenie" : "Dodaj wydarzenie"}</DialogTitle>
          <DialogDescription>
            {event
              ? "Zaktualizuj szczegóły wydarzenia"
              : "Dodaj nowe wydarzenie do harmonogramu"}
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
                    <Input placeholder="Np. Ceremonia ślubna" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="eventDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data wydarzenia *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  Godzina rozpoczęcia
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="startHour"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Godzina</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="23"
                            value={field.value || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "" || (parseInt(val) >= 0 && parseInt(val) <= 23)) {
                                field.onChange(val || null);
                              }
                            }}
                            placeholder="14"
                            className="font-mono text-center"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startMinute"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Minuta</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="59"
                            value={field.value || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "" || (parseInt(val) >= 0 && parseInt(val) <= 59)) {
                                field.onChange(val || null);
                              }
                            }}
                            placeholder="30"
                            className="font-mono text-center"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="hasEndTime"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-slate-200 dark:border-slate-700 p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium cursor-pointer">
                        Podaj godzinę zakończenia
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              {form.watch("hasEndTime") && (
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Godzina zakończenia
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="endHour"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Godzina</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="23"
                              value={field.value || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "" || (parseInt(val) >= 0 && parseInt(val) <= 23)) {
                                  field.onChange(val || null);
                                }
                              }}
                              placeholder="18"
                              className="font-mono text-center"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endMinute"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Minuta</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="59"
                              value={field.value || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "" || (parseInt(val) >= 0 && parseInt(val) <= 59)) {
                                  field.onChange(val || null);
                                }
                              }}
                              placeholder="00"
                              className="font-mono text-center"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lokalizacja</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Np. Kościół św. Jana, Warszawa"
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opis</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Dodatkowe informacje o wydarzeniu..."
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

