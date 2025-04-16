"use client"

import type React from "react"

import { useState } from "react"
import { CalendarIcon, X, Plus, Palette } from "lucide-react"
import { format } from "date-fns"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { Task, Category, Priority } from "@/lib/types"

interface TaskFormProps {
  categories: Category[]
  onAddTask: (task: Omit<Task, "id" | "completed" | "createdAt">) => void
  onUpdateTask: (task: Task) => void
  onAddCategory: (category: Omit<Category, "id">) => void
  onClose: () => void
  editingTask: Task | null
}

export function TaskForm({ categories, onAddTask, onUpdateTask, onAddCategory, onClose, editingTask }: TaskFormProps) {
  const [title, setTitle] = useState(editingTask?.title || "")
  const [description, setDescription] = useState(editingTask?.description || "")
  const [dueDate, setDueDate] = useState<Date | undefined>(
    editingTask?.dueDate ? new Date(editingTask.dueDate) : undefined,
  )
  const [priority, setPriority] = useState<Priority>(editingTask?.priority || "Medium")
  const [category, setCategory] = useState(editingTask?.category || categories[0]?.id || "")
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryColor, setNewCategoryColor] = useState("#6366f1")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) return

    if (editingTask) {
      onUpdateTask({
        ...editingTask,
        title,
        description,
        dueDate: dueDate ? dueDate.toISOString() : undefined,
        priority,
        category,
      })
    } else {
      onAddTask({
        title,
        description,
        dueDate: dueDate ? dueDate.toISOString() : undefined,
        priority,
        category,
      })
    }
  }

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return

    onAddCategory({
      name: newCategoryName,
      color: newCategoryColor,
      icon: "folder",
    })

    setNewCategoryName("")
    setIsAddingCategory(false)
  }

  const priorityColors = {
    High: "text-red-500 dark:text-red-400",
    Medium: "text-amber-500 dark:text-amber-400",
    Low: "text-green-500 dark:text-green-400",
  }

  const priorityBgColors = {
    High: "bg-red-100 dark:bg-red-900/30",
    Medium: "bg-amber-100 dark:bg-amber-900/30",
    Low: "bg-green-100 dark:bg-green-900/30",
  }

  const dialogVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={dialogVariants}
          className="overflow-hidden rounded-2xl"
        >
          <DialogHeader>
            <DialogTitle className="text-xl">{editingTask ? "Edit Task" : "Add New Task"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 p-1">
            <div className="space-y-2">
              <Input
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border-none bg-muted/50 p-4 text-lg shadow-inner focus-visible:ring-1"
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px] w-full rounded-xl border-none bg-muted/50 p-4 shadow-inner focus-visible:ring-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start rounded-xl text-left font-normal transition-all hover:shadow-md",
                        !dueDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select value={priority} onValueChange={(value: Priority) => setPriority(value)}>
                  <SelectTrigger className="rounded-xl transition-all hover:shadow-md">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High" className={priorityColors.High}>
                      <div className="flex items-center">
                        <div className={`mr-2 h-2 w-2 rounded-full bg-red-500`} />
                        High
                      </div>
                    </SelectItem>
                    <SelectItem value="Medium" className={priorityColors.Medium}>
                      <div className="flex items-center">
                        <div className={`mr-2 h-2 w-2 rounded-full bg-amber-500`} />
                        Medium
                      </div>
                    </SelectItem>
                    <SelectItem value="Low" className={priorityColors.Low}>
                      <div className="flex items-center">
                        <div className={`mr-2 h-2 w-2 rounded-full bg-green-500`} />
                        Low
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Category</label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddingCategory(!isAddingCategory)}
                  className="rounded-lg transition-all hover:bg-muted"
                >
                  {isAddingCategory ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </Button>
              </div>

              {isAddingCategory ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center space-x-2 rounded-xl bg-muted/50 p-2">
                    <Input
                      placeholder="Category name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="flex-1 rounded-lg border-none bg-background shadow-inner focus-visible:ring-1"
                    />
                    <div className="relative">
                      <input
                        type="color"
                        value={newCategoryColor}
                        onChange={(e) => setNewCategoryColor(e.target.value)}
                        className="absolute inset-0 cursor-pointer opacity-0"
                      />
                      <Button type="button" variant="outline" size="icon" className="h-9 w-9 rounded-lg">
                        <Palette className="h-4 w-4" style={{ color: newCategoryColor }} />
                      </Button>
                    </div>
                    <Button type="button" size="sm" onClick={handleAddCategory} className="rounded-lg">
                      Add
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="rounded-xl transition-all hover:shadow-md">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center">
                          <div className="mr-2 h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-xl transition-all hover:bg-muted"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-primary to-primary/80 transition-all hover:shadow-lg"
              >
                {editingTask ? "Update" : "Add"} Task
              </Button>
            </DialogFooter>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
