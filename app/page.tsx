"use client"

import { useState, useEffect } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  TouchSensor,
  type DragStartEvent,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { restrictToVerticalAxis, restrictToWindowEdges } from "@dnd-kit/modifiers"
import { AnimatePresence, motion } from "framer-motion"
import { Plus, Moon, Sun, BarChart, Command, LogIn, BrainCircuit } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskForm } from "@/components/task-form"
import { CategoryColumn } from "@/components/category-column"
import { PomodoroTimer } from "@/components/pomodoro-timer"
import { StatsModal } from "@/components/stats-modal"
import { TaskItem } from "@/components/task-item"
import { FocusMode } from "@/components/focus-mode"
import { CommandMenu } from "@/components/command-menu"
import { AIAssistant } from "@/components/ai-assistant"
import { Logo } from "@/components/logo"
import { useToast } from "@/components/ui/use-toast"
import { useHotkeys } from "react-hotkeys-hook"
import type { Task, Category } from "@/lib/types"
import { defaultCategories, defaultTasks } from "@/lib/default-data"
import { generateId } from "@/lib/utils"
import { MobileNav } from "@/components/mobile-nav"
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh"

export default function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isStatsOpen, setIsStatsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
        tolerance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Hotkeys
  useHotkeys("mod+k", () => setIsCommandOpen(true))
  useHotkeys("mod+n", () => {
    setEditingTask(null)
    setIsFormOpen(true)
  })
  useHotkeys("esc", () => {
    if (isFocusMode) setIsFocusMode(false)
  })
  useHotkeys("mod+j", () => setIsAIAssistantOpen(true))

  const { isRefreshing, pullToRefreshRef } = usePullToRefresh(() => {
    // Refresh tasks
    const savedTasks = localStorage.getItem("tasks")
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  })

  useEffect(() => {
    // Load tasks and categories from localStorage or use defaults
    const savedTasks = localStorage.getItem("tasks")
    const savedCategories = localStorage.getItem("categories")

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    } else {
      setTasks(defaultTasks)
    }

    if (savedCategories) {
      setCategories(JSON.parse(savedCategories))
    } else {
      setCategories(defaultCategories)
    }
  }, [])

  useEffect(() => {
    // Save tasks and categories to localStorage whenever they change
    if (tasks.length > 0) {
      localStorage.setItem("tasks", JSON.stringify(tasks))
    }

    if (categories.length > 0) {
      localStorage.setItem("categories", JSON.stringify(categories))
    }
  }, [tasks, categories])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }

    setActiveId(null)
  }

  const addTask = (task: Omit<Task, "id" | "completed" | "createdAt">) => {
    const newTask: Task = {
      id: generateId(),
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      category: task.category,
      completed: false,
      createdAt: new Date().toISOString(),
    }

    setTasks((prev) => [newTask, ...prev])
    setIsFormOpen(false)

    toast({
      title: "Task added",
      description: `"${task.title}" has been added to your tasks.`,
    })
  }

  const updateTask = (updatedTask: Task) => {
    setTasks((prev) => prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
    setEditingTask(null)
    setIsFormOpen(false)

    toast({
      title: "Task updated",
      description: `"${updatedTask.title}" has been updated.`,
    })
  }

  const deleteTask = (id: string) => {
    const taskToDelete = tasks.find((task) => task.id === id)
    setTasks((prev) => prev.filter((task) => task.id !== id))

    if (taskToDelete) {
      toast({
        title: "Task deleted",
        description: `"${taskToDelete.title}" has been removed.`,
        variant: "destructive",
      })
    }
  }

  const toggleTaskCompletion = (id: string) => {
    let taskTitle = "";
    let markedComplete = false;

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const newCompletedState = !task.completed;
          if (newCompletedState) {
            // Store task title and completion status for later toast
            taskTitle = task.title;
            markedComplete = true;
          }
          return { ...task, completed: newCompletedState };
        }
        return task;
      })
    );

    // Show toast notification after state update if a task was marked complete
    if (markedComplete) {
      toast({
        title: "Task completed",
        description: `"${taskTitle}" has been marked as complete.`,
        variant: "success",
      });
    }
  };

  const addCategory = (category: Omit<Category, "id">) => {
    const newCategory: Category = {
      id: generateId(),
      name: category.name,
      color: category.color,
      icon: category.icon,
    }

    setCategories((prev) => [...prev, newCategory])

    toast({
      title: "Category added",
      description: `"${category.name}" category has been created.`,
    })
  }

  const filteredTasks = activeCategory === "all" ? tasks : tasks.filter((task) => task.category === activeCategory)

  const getTasksByCategory = (categoryId: string) => {
    return tasks.filter((task) => task.category === categoryId)
  }

  const completedTasks = tasks.filter((task) => task.completed)
  const pendingTasks = tasks.filter((task) => !task.completed)
  const activeTask = activeId ? tasks.find((task) => task.id === activeId) : null

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background to-background/95 transition-all duration-300 dark:from-background dark:to-background/90">
        <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center"
              >
                <Logo className="mr-2 h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                  TaskMaster
                </h1>
              </motion.div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsCommandOpen(true)}>
                <Command className="h-4 w-4" />
                <span className="hidden sm:inline-block">Command</span>
                <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                  ⌘K
                </kbd>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsAIAssistantOpen(true)}
                aria-label="AI Assistant"
                className="relative"
              >
                <BrainCircuit className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
              </Button>
              <Button variant="outline" size="icon" onClick={() => setIsStatsOpen(true)} aria-label="View statistics">
                <BarChart className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
                className="relative overflow-hidden"
              >
                <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-yellow-500 to-yellow-300 dark:from-indigo-500 dark:to-purple-500 transition-opacity duration-500"></div>
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 relative z-10" />
                ) : (
                  <Moon className="h-5 w-5 relative z-10" />
                )}
              </Button>
              <Button variant="outline" className="gap-2">
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Button>
              <Button
                onClick={() => {
                  setEditingTask(null)
                  setIsFormOpen(true)
                }}
                className="group relative overflow-hidden"
              >
                <div className="relative z-10 flex items-center">
                  <Plus className="mr-2 h-4 w-4" /> Add Task
                </div>
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-primary/80 to-primary opacity-0 transition-opacity group-hover:opacity-100" />
              </Button>
            </div>
          </div>
        </header>

        <main className="container py-6 pb-24 md:pb-6" ref={pullToRefreshRef}>
          {isRefreshing && (
            <div className="fixed top-0 left-0 right-0 z-50 flex h-2 items-center justify-center bg-primary/20">
              <div className="h-full w-full origin-left bg-primary" style={{ transform: `scaleX(${isRefreshing ? 1 : 0})` }} />
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[300px_1fr]">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <PomodoroTimer
                  tasks={pendingTasks}
                  onFocusModeToggle={() => setIsFocusMode(!isFocusMode)}
                  isFocusMode={isFocusMode}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="rounded-2xl border bg-card/80 p-4 shadow-md backdrop-blur-md"
              >
                <h2 className="mb-4 text-lg font-semibold">Categories</h2>
                <div className="space-y-2">
                  <Button
                    variant={activeCategory === "all" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveCategory("all")}
                  >
                    All Tasks ({tasks.length})
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={activeCategory === category.id ? "default" : "ghost"}
                      className="w-full justify-start transition-all hover:translate-x-1"
                      onClick={() => setActiveCategory(category.id)}
                    >
                      <div className="mr-2 h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
                      {category.name} ({getTasksByCategory(category.id).length})
                    </Button>
                  ))}
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="space-y-6"
            >
              <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-2 rounded-xl p-1">
                  <TabsTrigger value="pending" className="rounded-lg">
                    Pending ({pendingTasks.length})
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="rounded-lg">
                    Completed ({completedTasks.length})
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="pending" className="mt-4 outline-none">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
                  >
                    <SortableContext
                      items={filteredTasks.filter((t) => !t.completed).map((t) => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <AnimatePresence>
                        {activeCategory === "all" ? (
                          categories.map((category) => (
                            <motion.div
                              key={category.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.3 }}
                            >
                              <CategoryColumn
                                category={category}
                                tasks={getTasksByCategory(category.id).filter((t) => !t.completed)}
                                onToggleComplete={toggleTaskCompletion}
                                onDeleteTask={deleteTask}
                                onEditTask={(task) => {
                                  setEditingTask(task)
                                  setIsFormOpen(true)
                                }}
                              />
                            </motion.div>
                          ))
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                          >
                            <CategoryColumn
                              category={
                                categories.find((c) => c.id === activeCategory) || {
                                  id: "all",
                                  name: "All Tasks",
                                  color: "#6366f1",
                                  icon: "list",
                                }
                              }
                              tasks={filteredTasks.filter((t) => !t.completed)}
                              onToggleComplete={toggleTaskCompletion}
                              onDeleteTask={deleteTask}
                              onEditTask={(task) => {
                                setEditingTask(task)
                                setIsFormOpen(true)
                              }}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </SortableContext>

                    <DragOverlay>
                      {activeId && activeTask ? (
                        <div className="opacity-80">
                          <TaskItem
                            task={activeTask}
                            onToggleComplete={toggleTaskCompletion}
                            onDeleteTask={deleteTask}
                            onEditTask={(task) => {
                              setEditingTask(task)
                              setIsFormOpen(true)
                            }}
                            isDragging
                          />
                        </div>
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                </TabsContent>
                <TabsContent value="completed" className="mt-4 outline-none">
                  <div className="space-y-4">
                    <AnimatePresence>
                      {filteredTasks
                        .filter((t) => t.completed)
                        .map((task) => (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, height: 0, y: 10 }}
                            animate={{ opacity: 1, height: "auto", y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="flex items-center rounded-xl border bg-muted/40 p-4 opacity-70 transition-all hover:opacity-100">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mr-2 h-6 w-6 rounded-full p-0"
                                onClick={() => toggleTaskCompletion(task.id)}
                              >
                                <div className="h-4 w-4 rounded-full bg-primary" />
                              </Button>
                              <div className="line-through">{task.title}</div>
                            </div>
                          </motion.div>
                        ))}
                    </AnimatePresence>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </main>

        <MobileNav
          onAddTask={() => {
            setEditingTask(null)
            setIsFormOpen(true)
          }}
          onOpenStats={() => setIsStatsOpen(true)}
          onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
        />
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <TaskForm
            categories={categories}
            onAddTask={addTask}
            onUpdateTask={updateTask}
            onAddCategory={addCategory}
            onClose={() => {
              setIsFormOpen(false)
              setEditingTask(null)
            }}
            editingTask={editingTask}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isStatsOpen && <StatsModal tasks={tasks} onClose={() => setIsStatsOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {isFocusMode && (
          <FocusMode
            onClose={() => setIsFocusMode(false)}
            tasks={pendingTasks}
            onToggleComplete={toggleTaskCompletion}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAIAssistantOpen && (
          <AIAssistant onClose={() => setIsAIAssistantOpen(false)} tasks={tasks} onAddTask={addTask} />
        )}
      </AnimatePresence>

      <CommandMenu
        isOpen={isCommandOpen}
        setIsOpen={setIsCommandOpen}
        tasks={tasks}
        categories={categories}
        onAddTask={() => {
          setEditingTask(null)
          setIsFormOpen(true)
          setIsCommandOpen(false)
        }}
        onSelectCategory={(categoryId) => {
          setActiveCategory(categoryId)
          setIsCommandOpen(false)
        }}
        onToggleFocusMode={() => {
          setIsFocusMode(!isFocusMode)
          setIsCommandOpen(false)
        }}
        onToggleStats={() => {
          setIsStatsOpen(!isStatsOpen)
          setIsCommandOpen(false)
        }}
        onOpenAIAssistant={() => {
          setIsAIAssistantOpen(true)
          setIsCommandOpen(false)
        }}
      />
    </>
  )
}
