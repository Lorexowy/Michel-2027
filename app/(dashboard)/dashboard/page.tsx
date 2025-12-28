"use client";

import { useEffect, useState } from "react";
import { ensureMainProject } from "@/lib/db/project";
import { WeddingProject } from "@/lib/db/types";
import Link from "next/link";
import { CheckSquare, Users, Wallet, Calendar, TrendingUp, FileText, CheckCircle2, Clock, UserCheck, UserX, Send } from "lucide-react";
import { listTasks } from "@/lib/db/tasks";
import { listGuests } from "@/lib/db/guests";
import { listExpenses } from "@/lib/db/expenses";
import { listVendors } from "@/lib/db/vendors";
import { listTimelineEvents } from "@/lib/db/timeline";
import { listNotes } from "@/lib/db/notes";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = {
  tasks: {
    todo: "#3b82f6", // blue
    doing: "#f59e0b", // amber
    done: "#10b981", // green
  },
  guests: {
    confirmed: "#10b981", // green
    pending: "#f59e0b", // amber
    notSent: "#6b7280", // gray
    declined: "#ef4444", // red
  },
  expenses: {
    planned: "#6b7280", // gray
    deposit: "#f59e0b", // amber
    paid: "#10b981", // green
  },
  vendors: {
    booked: "#10b981", // green
    considering: "#f59e0b", // amber
    rejected: "#ef4444", // red
  },
};

export default function DashboardPage() {
  const [project, setProject] = useState<(WeddingProject & { id: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Statistics
  const [stats, setStats] = useState({
    tasks: { total: 0, todo: 0, doing: 0, done: 0 },
    guests: { total: 0, confirmed: 0, pending: 0, notSent: 0, declined: 0 },
    expenses: { total: 0, planned: 0, deposit: 0, paid: 0 },
    vendors: { total: 0, booked: 0, considering: 0, rejected: 0 },
    events: { total: 0, upcoming: 0, past: 0 },
    notes: { total: 0, withTags: 0 },
  });

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    async function loadAllData() {
      try {
        setLoading(true);
        setError(null);

        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error("Timeout: Operacja trwa zbyt długo. Sprawdź połączenie z Firebase."));
          }, 15000);
        });

        // Load all data in parallel
        const [
          projectData,
          tasks,
          guests,
          expenses,
          vendors,
          events,
          notes,
        ] = await Promise.race([
          Promise.all([
            ensureMainProject(),
            listTasks(),
            listGuests(),
            listExpenses(),
            listVendors(),
            listTimelineEvents(),
            listNotes(),
          ]),
          timeoutPromise,
        ]) as [
          WeddingProject & { id: string },
          Awaited<ReturnType<typeof listTasks>>,
          Awaited<ReturnType<typeof listGuests>>,
          Awaited<ReturnType<typeof listExpenses>>,
          Awaited<ReturnType<typeof listVendors>>,
          Awaited<ReturnType<typeof listTimelineEvents>>,
          Awaited<ReturnType<typeof listNotes>>,
        ];
        
        clearTimeout(timeoutId);

        if (!isMounted) return;

        // Calculate statistics
        const tasksStats = {
          total: tasks.length,
          todo: tasks.filter(t => t.status === "todo").length,
          doing: tasks.filter(t => t.status === "doing").length,
          done: tasks.filter(t => t.status === "done").length,
        };

        const guestsStats = {
          total: guests.length,
          confirmed: guests.filter(g => g.rsvp === "yes").length,
          pending: guests.filter(g => g.rsvp === "sent").length,
          notSent: guests.filter(g => g.rsvp === "not_sent").length,
          declined: guests.filter(g => g.rsvp === "no").length,
        };

        const expensesStats = {
          total: expenses.reduce((sum, e) => sum + e.amount, 0),
          planned: expenses.filter(e => e.status === "planned").reduce((sum, e) => sum + e.amount, 0),
          deposit: expenses.filter(e => e.status === "deposit").reduce((sum, e) => sum + e.amount, 0),
          paid: expenses.filter(e => e.status === "paid").reduce((sum, e) => sum + e.amount, 0),
        };

        const vendorsStats = {
          total: vendors.length,
          booked: vendors.filter(v => v.status === "booked").length,
          considering: vendors.filter(v => v.status === "considering").length,
          rejected: vendors.filter(v => v.status === "rejected").length,
        };

        const now = new Date();
        const eventsStats = {
          total: events.length,
          upcoming: events.filter(e => new Date(e.eventDate.toDate()) >= now).length,
          past: events.filter(e => new Date(e.eventDate.toDate()) < now).length,
        };

        const notesStats = {
          total: notes.length,
          withTags: notes.filter(n => n.tags && n.tags.length > 0).length,
        };

        setProject(projectData);
        setStats({
          tasks: tasksStats,
          guests: guestsStats,
          expenses: expensesStats,
          vendors: vendorsStats,
          events: eventsStats,
          notes: notesStats,
        });
      } catch (err) {
        clearTimeout(timeoutId);
        if (!isMounted) return;
        
        console.error("Dashboard: Błąd podczas ładowania danych:", err);
        setError(`Nie udało się załadować danych: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAllData();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  // Prepare chart data
  const tasksChartData = [
    { name: "Do zrobienia", value: stats.tasks.todo },
    { name: "W trakcie", value: stats.tasks.doing },
    { name: "Zrobione", value: stats.tasks.done },
  ].filter(item => item.value > 0);

  const guestsChartData = [
    { name: "Potwierdzeni", value: stats.guests.confirmed },
    { name: "Oczekujący", value: stats.guests.pending },
    { name: "Nie wysłane", value: stats.guests.notSent },
    { name: "Odrzuceni", value: stats.guests.declined },
  ].filter(item => item.value > 0);

  const expensesChartData = [
    { name: "Zaplanowane", value: stats.expenses.planned },
    { name: "Zadatek", value: stats.expenses.deposit },
    { name: "Opłacone", value: stats.expenses.paid },
  ].filter(item => item.value > 0);

  const vendorsChartData = [
    { name: "Zarezerwowani", value: stats.vendors.booked },
    { name: "Rozważani", value: stats.vendors.considering },
    { name: "Odrzuceni", value: stats.vendors.rejected },
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {payload[0].name}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {typeof payload[0].value === "number" && payload[0].value % 1 !== 0
              ? `${payload[0].value.toFixed(2)} ${project?.currency || "PLN"}`
              : payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-600 dark:text-slate-400">Ładowanie danych...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-destructive mb-2">Błąd</h3>
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-1 sm:mb-2">
            Panel
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Podsumowanie planowania ślubu
          </p>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Expenses Card with Pie Chart */}
        <Link
          href="/kosztorys"
          className="md:col-span-2 lg:col-span-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-[1.01] group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Kosztorys</h3>
                <p className="text-sm opacity-90">Podsumowanie wydatków</p>
              </div>
            </div>
            <span className="text-xs font-medium opacity-90">Kliknij, aby zobaczyć szczegóły</span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div>
              <div className="text-4xl font-bold mb-2">
                {stats.expenses.total.toFixed(2)} {project?.currency || "PLN"}
              </div>
              <div className="space-y-2 text-sm opacity-90">
                <div className="flex items-center justify-between">
                  <span>Opłacone:</span>
                  <span className="font-semibold">{stats.expenses.paid.toFixed(2)} {project?.currency || "PLN"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Zadatek:</span>
                  <span className="font-semibold">{stats.expenses.deposit.toFixed(2)} {project?.currency || "PLN"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Zaplanowane:</span>
                  <span className="font-semibold">{stats.expenses.planned.toFixed(2)} {project?.currency || "PLN"}</span>
                </div>
              </div>
            </div>
            
            {expensesChartData.length > 0 ? (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensesChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expensesChartData.map((entry, index) => {
                        const colorMap: Record<string, string> = {
                          "Opłacone": COLORS.expenses.paid,
                          "Zadatek": COLORS.expenses.deposit,
                          "Zaplanowane": COLORS.expenses.planned,
                        };
                        return (
                          <Cell key={`cell-${index}`} fill={colorMap[entry.name] || COLORS.expenses.planned} />
                        );
                      })}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-white/60">
                <p>Brak danych do wyświetlenia</p>
              </div>
            )}
          </div>
        </Link>

        {/* Tasks Card with Pie Chart */}
        <Link
          href="/zadania"
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
              <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Zadania</span>
          </div>
          
          <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            {stats.tasks.total}
          </h3>
          
          {tasksChartData.length > 0 ? (
            <div className="h-[180px] mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tasksChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {tasksChartData.map((entry, index) => {
                      const colorMap: Record<string, string> = {
                        "Do zrobienia": COLORS.tasks.todo,
                        "W trakcie": COLORS.tasks.doing,
                        "Zrobione": COLORS.tasks.done,
                      };
                      return (
                        <Cell key={`cell-${index}`} fill={colorMap[entry.name] || COLORS.tasks.todo} />
                      );
                    })}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
              <p className="text-sm">Brak zadań</p>
            </div>
          )}
          
          <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {stats.tasks.todo}
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {stats.tasks.done}
            </span>
          </div>
        </Link>

        {/* Guests Card with Pie Chart */}
        <Link
          href="/goscie"
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Goście</span>
          </div>
          
          <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            {stats.guests.total}
          </h3>
          
          {guestsChartData.length > 0 ? (
            <div className="h-[180px] mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={guestsChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {guestsChartData.map((entry, index) => {
                      const colorMap: Record<string, string> = {
                        "Potwierdzeni": COLORS.guests.confirmed,
                        "Oczekujący": COLORS.guests.pending,
                        "Nie wysłane": COLORS.guests.notSent,
                        "Odrzuceni": COLORS.guests.declined,
                      };
                      return (
                        <Cell key={`cell-${index}`} fill={colorMap[entry.name] || COLORS.guests.notSent} />
                      );
                    })}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
              <p className="text-sm">Brak gości</p>
            </div>
          )}
          
          <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-green-600" />
              {stats.guests.confirmed}
            </span>
            <span className="flex items-center gap-1">
              <Send className="w-3 h-3 text-amber-600" />
              {stats.guests.pending}
            </span>
          </div>
        </Link>

        {/* Vendors Card with Pie Chart */}
        <Link
          href="/uslugodawcy"
          className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium opacity-90">Usługodawcy</span>
          </div>
          
          <h3 className="text-3xl font-bold mb-4">
            {stats.vendors.total}
          </h3>
          
          {vendorsChartData.length > 0 ? (
            <div className="h-[180px] mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vendorsChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {vendorsChartData.map((entry, index) => {
                      const colorMap: Record<string, string> = {
                        "Zarezerwowani": COLORS.vendors.booked,
                        "Rozważani": COLORS.vendors.considering,
                        "Odrzuceni": COLORS.vendors.rejected,
                      };
                      return (
                        <Cell key={`cell-${index}`} fill={colorMap[entry.name] || COLORS.vendors.considering} />
                      );
                    })}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-white/60 mb-4">
              <p className="text-sm">Brak usługodawców</p>
            </div>
          )}
          
          <div className="flex items-center gap-3 text-xs opacity-90">
            <span>Zarezerwowani: {stats.vendors.booked}</span>
          </div>
        </Link>

        {/* Timeline Card */}
        <Link
          href="/harmonogram"
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors">
              <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Harmonogram</span>
          </div>
          
          <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            {stats.events.total}
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Nadchodzące</span>
              </div>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.events.upcoming}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Minione</span>
              </div>
              <span className="text-lg font-bold text-slate-600 dark:text-slate-400">{stats.events.past}</span>
            </div>
          </div>
        </Link>

        {/* Notes Card */}
        <Link
          href="/notatki"
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg group-hover:bg-slate-200 dark:group-hover:bg-slate-600 transition-colors">
              <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Notatki</span>
          </div>
          
          <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            {stats.notes.total}
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Z tagami</span>
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{stats.notes.withTags}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Bez tagów</span>
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {stats.notes.total - stats.notes.withTags}
              </span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
