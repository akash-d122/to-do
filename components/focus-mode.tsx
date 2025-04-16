"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PomodoroTimer } from "@/components/pomodoro-timer"
import type { Task } from "@/lib/types"

interface FocusModeProps {
  onClose: () => void
  tasks: Task[]
  onToggleComplete: (id: string) => void
}

export function FocusMode({ onClose, tasks, onToggleComplete }: FocusModeProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string>(tasks[0]?.id || "")

  const selectedTask = tasks.find((task) => task.id === selectedTaskId)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative mx-auto w-full max-w-2xl rounded-2xl border bg-card p-6 shadow-lg"
      >
        <Button variant="ghost" size="icon" className="absolute right-4 top-4 h-8 w-8 rounded-full" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>

        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold">Focus Mode</h2>
          <p className="text-muted-foreground">Eliminate distractions and focus on your task</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <PomodoroTimer tasks={tasks} onFocusModeToggle={onClose} isFocusMode={true} />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Current Focus</h3>

            {selectedTask ? (
              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="mb-2 flex items-start justify-between">
                  <h4 className="text-xl font-medium">{selectedTask.title}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-0.5 h-6 w-6 rounded-full p-0"
                    onClick={() => onToggleComplete(selectedTask.id)}
                  >
                    <motion.div
                      className="flex h-5 w-5 items-center justify-center rounded-full border-2"
                      whileTap={{ scale: 0.8 }}
                    >
                      {selectedTask.completed && <Check className="h-3 w-3" />}
                    </motion.div>
                  </Button>
                </div>

                {selectedTask.description && <p className="text-muted-foreground">{selectedTask.description}</p>}
              </div>
            ) : (
              <div className="rounded-xl border bg-muted/30 p-4 text-center text-muted-foreground">
                No task selected
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Focus Tips</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  Break your work into 25-minute focused sessions
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  Take short 5-minute breaks between sessions
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  Remove distractions from your environment
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  Stay hydrated and maintain good posture
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
