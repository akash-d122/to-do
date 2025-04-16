"use client"

import type React from "react"

import { useState, useRef } from "react"
import { format } from "date-fns"
import { Calendar, Clock, Edit, Trash2, MoreHorizontal, Check } from "lucide-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import type { Task } from "@/lib/types"
import { cn } from "@/lib/utils"

interface TaskItemProps {
  task: Task
  onToggleComplete: (id: string) => void
  onDeleteTask: (id: string) => void
  onEditTask: (task: Task) => void
  isDragging?: boolean
}

export function TaskItem({ task, onToggleComplete, onDeleteTask, onEditTask, isDragging = false }: TaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(task.title)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
    disabled: isEditing,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isSortableDragging || isDragging ? 10 : 0,
  }

  const priorityColors = {
    High: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    Medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    Low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  }

  const handleToggleComplete = () => {
    onToggleComplete(task.id)
  }

  const startEditing = () => {
    setIsEditing(true)
    setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 10)
  }

  const saveEdit = () => {
    if (editedTitle.trim() !== "") {
      onEditTask({ ...task, title: editedTitle })
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveEdit()
    } else if (e.key === "Escape") {
      setIsEditing(false)
      setEditedTitle(task.title)
    }
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative overflow-hidden rounded-xl border transition-all duration-200 hover:shadow-md",
        (isSortableDragging || isDragging) && "rotate-1 scale-105 shadow-lg",
        isExpanded && "shadow-md",
        "bg-gradient-to-br from-card to-card/95 dark:from-card/90 dark:to-card/80",
      )}
      {...attributes}
      {...listeners}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
      />
      <CardContent className="relative p-4">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="mt-0.5 h-6 w-6 rounded-full p-0 transition-all hover:scale-110"
            onClick={handleToggleComplete}
          >
            <motion.div
              className={cn(
                "h-4 w-4 rounded-full border-2",
                task.completed ? "bg-primary" : "bg-background",
                "transition-colors duration-200"
              )}
              whileTap={{ scale: 0.8 }}
              transition={{ duration: 0.2 }}
            />
          </Button>

          <div className="flex-1">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onBlur={saveEdit}
                  onKeyDown={handleKeyDown}
                  className="rounded-lg border-none bg-muted/50 shadow-inner focus-visible:ring-1"
                />
                <Button size="icon" variant="ghost" onClick={saveEdit} className="h-8 w-8 rounded-full p-0">
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{task.title}</h3>
                  <div className="flex items-center gap-2">
                    <div className={cn("rounded-full px-2 py-0.5 text-xs font-medium", priorityColors[task.priority])}>
                      {task.priority}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-xl">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            startEditing()
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteTask(task.id)
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {task.dueDate && (
                  <div className="mt-1 flex items-center text-xs text-muted-foreground">
                    <Calendar className="mr-1 h-3 w-3" />
                    {format(new Date(task.dueDate), "MMM d, yyyy")}
                  </div>
                )}
              </div>
            )}

            {isExpanded && !isEditing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 space-y-3 overflow-hidden"
              >
                {task.description && (
                  <p className="rounded-lg bg-muted/30 p-2 text-sm text-muted-foreground">{task.description}</p>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    <Clock className="mr-1 inline-block h-3 w-3" />
                    Created {format(new Date(task.createdAt), "MMM d, yyyy")}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 rounded-full p-0 transition-all hover:bg-muted"
                      onClick={(e) => {
                        e.stopPropagation()
                        startEditing()
                      }}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 rounded-full p-0 text-destructive transition-all hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteTask(task.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
