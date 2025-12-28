"use client";

import { WithId, Task } from "@/lib/db/types";
import TaskCard from "./TaskCard";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskBoardProps {
  tasks: WithId<Task>[];
  onEdit: (task: WithId<Task>) => void;
  onDelete: (taskId: string) => void;
  onMoveStatus: (taskId: string, newStatus: Task["status"]) => void;
}

const columns: Array<{ 
  id: Task["status"]; 
  title: string;
  color: string;
  bgColor: string;
}> = [
  { 
    id: "todo", 
    title: "Do zrobienia",
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-50 dark:bg-slate-800/50"
  },
  { 
    id: "doing", 
    title: "W trakcie",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/10"
  },
  { 
    id: "done", 
    title: "Zrobione",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-900/10"
  },
];

function ColumnDropZone({
  columnId,
  children,
  className,
}: {
  columnId: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        className,
        isOver && "bg-slate-100/50 dark:bg-slate-700/30 ring-2 ring-blue-500 ring-offset-2 rounded-xl"
      )}
    >
      {children}
    </div>
  );
}

export default function TaskBoard({
  tasks,
  onEdit,
  onDelete,
  onMoveStatus,
}: TaskBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const getTasksByStatus = (status: Task["status"]) => {
    return tasks.filter((task) => task.status === status);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as Task["status"];

    // Sprawdź czy zadanie jest przeciągane do innej kolumny
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== newStatus && columns.some(col => col.id === newStatus)) {
      onMoveStatus(taskId, newStatus);
    }
  };

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 overflow-x-auto pb-2">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.id);
          
          return (
            <div
              key={column.id}
              className="flex flex-col min-w-[280px]"
            >
              {/* Column Header */}
              <div className={`${column.bgColor} rounded-xl px-4 py-3 mb-3 border border-slate-200 dark:border-slate-700/50 sticky top-0 z-10 backdrop-blur-sm`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Circle className={`w-2 h-2 ${column.color} fill-current`} />
                    <h3 className={`font-semibold text-sm sm:text-base ${column.color}`}>
                      {column.title}
                    </h3>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${column.bgColor} ${column.color} border border-current/20`}>
                    {columnTasks.length}
                  </span>
                </div>
              </div>

              {/* Column Content - Drop Zone */}
              <ColumnDropZone
                columnId={column.id}
                className="flex-1 space-y-3 min-h-[300px] sm:min-h-[400px] max-h-[calc(100vh-280px)] overflow-y-auto pr-1 rounded-xl p-2 transition-colors"
              >
                <SortableContext
                  items={columnTasks.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {columnTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                        <Circle className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                        Brak zadań
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        Przeciągnij zadanie tutaj
                      </p>
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onMoveStatus={onMoveStatus}
                      />
                    ))
                  )}
                </SortableContext>
              </ColumnDropZone>
            </div>
          );
        })}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTask ? (
          <div className="opacity-90 rotate-3 scale-105">
            <TaskCard
              task={activeTask}
              onEdit={onEdit}
              onDelete={onDelete}
              onMoveStatus={onMoveStatus}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
