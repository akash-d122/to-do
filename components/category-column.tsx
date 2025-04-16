"use client"

import { motion, AnimatePresence } from "framer-motion"
import type { Task, Category } from "@/lib/types"
import { TaskItem } from "@/components/task-item"

interface CategoryColumnProps {
  category: Category
  tasks: Task[]
  onToggleComplete: (id: string) => void
  onDeleteTask: (id: string) => void
  onEditTask: (task: Task) => void
}

export function CategoryColumn({ category, tasks, onToggleComplete, onDeleteTask, onEditTask }: CategoryColumnProps) {
  if (tasks.length === 0) {
    return null
  }

  return (
    <div className="mb-6">
      <div
        className="mb-4 flex items-center rounded-xl border-l-4 bg-card/80 p-3 shadow-md backdrop-blur-sm transition-all hover:shadow-lg"
        style={{ borderLeftColor: category.color }}
      >
        <div className="mr-2 h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
        <h2 className="text-lg font-semibold">{category.name}</h2>
        <div className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">{tasks.length}</div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <TaskItem
                task={task}
                onToggleComplete={onToggleComplete}
                onDeleteTask={onDeleteTask}
                onEditTask={onEditTask}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
