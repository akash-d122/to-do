import type { Task, Category } from "./types"

export const defaultCategories: Category[] = [
  {
    id: "work",
    name: "Work",
    color: "#3b82f6",
    icon: "briefcase",
  },
  {
    id: "personal",
    name: "Personal",
    color: "#10b981",
    icon: "user",
  },
  {
    id: "study",
    name: "Study",
    color: "#8b5cf6",
    icon: "book",
  },
]

export const defaultTasks: Task[] = [
  {
    id: "task-1",
    title: "Complete project proposal",
    description: "Write and submit the project proposal for the new client",
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
    priority: "High",
    category: "work",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-2",
    title: "Go for a run",
    description: "30 minute jog in the park",
    dueDate: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
    priority: "Medium",
    category: "personal",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-3",
    title: "Read chapter 5",
    description: "Complete reading chapter 5 of the textbook",
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
    priority: "Medium",
    category: "study",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-4",
    title: "Buy groceries",
    description: "Milk, eggs, bread, fruits",
    dueDate: new Date(Date.now()).toISOString(), // Today
    priority: "Low",
    category: "personal",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-5",
    title: "Team meeting",
    description: "Weekly team sync-up",
    dueDate: new Date(Date.now() + 86400000 * 1).toISOString(), // 1 day from now
    priority: "High",
    category: "work",
    completed: false,
    createdAt: new Date().toISOString(),
  },
]
