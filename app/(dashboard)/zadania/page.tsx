"use client";

import { useEffect, useState, useMemo } from "react";
import { WithId, Task, TaskStatus, TaskPriority } from "@/lib/db/types";
import { listTasks, createTask, updateTask, deleteTask } from "@/lib/db/tasks";
import { Button } from "@/components/ui/button";
import TaskBoard from "@/components/tasks/TaskBoard";
import TaskDialog from "@/components/tasks/TaskDialog";
import TaskFilters from "@/components/tasks/TaskFilters";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, CheckSquare2 } from "lucide-react";

export default function ZadaniaPage() {
  const [tasks, setTasks] = useState<WithId<Task>[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<WithId<Task> | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const allTasks = await listTasks();
      setTasks(allTasks);
    } catch (error) {
      console.error("Błąd podczas ładowania zadań:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!task.title.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "all" && task.status !== statusFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== "all" && task.priority !== priorityFilter) {
        return false;
      }

      return true;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      todo: tasks.filter(t => t.status === "todo").length,
      doing: tasks.filter(t => t.status === "doing").length,
      done: tasks.filter(t => t.status === "done").length,
    };
  }, [tasks]);

  const handleCreateTask = async (data: Omit<Task, "createdAt" | "updatedAt">) => {
    console.log("ZadaniaPage: handleCreateTask wywołany z danymi:", data);
    try {
      const taskId = await createTask(data);
      console.log("ZadaniaPage: Zadanie utworzone z ID:", taskId);
      await loadTasks();
      console.log("ZadaniaPage: Zadania przeładowane");
    } catch (error) {
      console.error("ZadaniaPage: Błąd podczas tworzenia zadania:", error);
      throw error;
    }
  };

  const handleUpdateTask = async (data: Omit<Task, "createdAt" | "updatedAt">) => {
    if (!editingTask) return;
    try {
      await updateTask(editingTask.id, data);
      await loadTasks();
      setEditingTask(null);
    } catch (error) {
      console.error("Błąd podczas aktualizacji zadania:", error);
      throw error;
    }
  };

  const handleDeleteTask = async () => {
    if (!deleteTaskId) return;
    await deleteTask(deleteTaskId);
    await loadTasks();
    setDeleteTaskId(null);
  };

  const handleEdit = (task: WithId<Task>) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleMoveStatus = async (taskId: string, newStatus: TaskStatus) => {
    await updateTask(taskId, { status: newStatus });
    await loadTasks();
  };

  const handleDialogSubmit = async (data: Omit<Task, "createdAt" | "updatedAt">) => {
    console.log("ZadaniaPage: handleDialogSubmit wywołany z danymi:", data, "editingTask:", editingTask);
    try {
      if (editingTask) {
        console.log("ZadaniaPage: Aktualizuję zadanie");
        await handleUpdateTask(data);
      } else {
        console.log("ZadaniaPage: Tworzę nowe zadanie");
        await handleCreateTask(data);
      }
      console.log("ZadaniaPage: Operacja zakończona, zamykam dialog");
      setDialogOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error("ZadaniaPage: Błąd w handleDialogSubmit:", error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-600 dark:text-slate-400">Ładowanie zadań...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <div className="p-1.5 sm:p-2 bg-slate-100 dark:bg-slate-800 rounded-lg flex-shrink-0">
              <CheckSquare2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700 dark:text-slate-300" />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 truncate">
              Zadania
            </h1>
          </div>
          <p className="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-slate-400 ml-7 sm:ml-11">
            Zarządzaj zadaniami związanymi z planowaniem ślubu
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingTask(null);
            setDialogOpen(true);
          }}
          className="w-full sm:w-auto shadow-sm hover:shadow-md transition-shadow"
          size="lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Dodaj zadanie
        </Button>
      </div>

      {/* Stats */}
      {stats.total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Wszystkie</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Do zrobienia</div>
            <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">{stats.todo}</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">W trakcie</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.doing}</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Zrobione</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.done}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <TaskFilters
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        onSearchChange={setSearchQuery}
        onStatusFilterChange={setStatusFilter}
        onPriorityFilterChange={setPriorityFilter}
      />

      {/* Task Board */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 sm:p-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            <CheckSquare2 className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Brak zadań
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
              ? "Nie znaleziono zadań pasujących do filtrów."
              : "Dodaj pierwsze zadanie, aby rozpocząć planowanie."}
          </p>
          {(!searchQuery && statusFilter === "all" && priorityFilter === "all") && (
            <Button
              onClick={() => {
                setEditingTask(null);
                setDialogOpen(true);
              }}
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Dodaj pierwsze zadanie
            </Button>
          )}
        </div>
      ) : (
        <TaskBoard
          tasks={filteredTasks}
          onEdit={handleEdit}
          onDelete={setDeleteTaskId}
          onMoveStatus={handleMoveStatus}
        />
      )}

      {/* Dialogs */}
      <TaskDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingTask(null);
          }
        }}
        task={editingTask}
        onSubmit={handleDialogSubmit}
      />

      <AlertDialog open={deleteTaskId !== null} onOpenChange={(open) => {
        if (!open) setDeleteTaskId(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usunąć zadanie?</AlertDialogTitle>
            <AlertDialogDescription>
              Tej operacji nie można cofnąć.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTaskId(null)}>
              Anuluj
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTask}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
