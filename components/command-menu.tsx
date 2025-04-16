"use client"

import { useState, useEffect } from "react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Plus, ListTodo, Focus, BarChart2, Moon, Sun, CheckCircle2, BrainCircuit } from "lucide-react"
import { useTheme } from "next-themes"
import type { Task, Category } from "@/lib/types"

interface CommandMenuProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  tasks: Task[]
  categories: Category[]
  onAddTask: () => void
  onSelectCategory: (categoryId: string) => void
  onToggleFocusMode: () => void
  onToggleStats: () => void
  onOpenAIAssistant: () => void
}

export function CommandMenu({
  isOpen,
  setIsOpen,
  tasks,
  categories,
  onAddTask,
  onSelectCategory,
  onToggleFocusMode,
  onToggleStats,
  onOpenAIAssistant,
}: CommandMenuProps) {
  const { theme, setTheme } = useTheme()
  const [pendingTasks, setPendingTasks] = useState<Task[]>([])

  useEffect(() => {
    setPendingTasks(tasks.filter((task) => !task.completed).slice(0, 5))
  }, [tasks])

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Actions">
          <CommandItem onSelect={onAddTask}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Add new task</span>
          </CommandItem>
          <CommandItem onSelect={onToggleFocusMode}>
            <Focus className="mr-2 h-4 w-4" />
            <span>Toggle focus mode</span>
          </CommandItem>
          <CommandItem onSelect={onToggleStats}>
            <BarChart2 className="mr-2 h-4 w-4" />
            <span>View statistics</span>
          </CommandItem>
          <CommandItem onSelect={onOpenAIAssistant}>
            <BrainCircuit className="mr-2 h-4 w-4" />
            <span>Open AI Assistant</span>
          </CommandItem>
          <CommandItem onSelect={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? (
              <>
                <Sun className="mr-2 h-4 w-4" />
                <span>Switch to light mode</span>
              </>
            ) : (
              <>
                <Moon className="mr-2 h-4 w-4" />
                <span>Switch to dark mode</span>
              </>
            )}
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Categories">
          <CommandItem onSelect={() => onSelectCategory("all")}>
            <ListTodo className="mr-2 h-4 w-4" />
            <span>All Tasks</span>
          </CommandItem>
          {categories.map((category) => (
            <CommandItem key={category.id} onSelect={() => onSelectCategory(category.id)}>
              <div className="mr-2 flex h-4 w-4 items-center justify-center">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
              </div>
              <span>{category.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Recent Tasks">
          {pendingTasks.map((task) => (
            <CommandItem key={task.id}>
              <CheckCircle2 className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{task.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
