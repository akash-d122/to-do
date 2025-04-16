export type Priority = "High" | "Medium" | "Low"

export interface Task {
  id: string
  title: string
  description?: string
  dueDate?: string
  priority: Priority
  category: string
  completed: boolean
  createdAt: string
}

export interface Category {
  id: string
  name: string
  color: string
  icon: string
}
