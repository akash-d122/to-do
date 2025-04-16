"use client"

import { useMemo } from "react"
import { format } from "date-fns"
import { X } from "lucide-react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Task } from "@/lib/types"

interface StatsModalProps {
  tasks: Task[]
  onClose: () => void
}

export function StatsModal({ tasks, onClose }: StatsModalProps) {
  const stats = useMemo(() => {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((t) => t.completed).length
    const pendingTasks = totalTasks - completedTasks

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    const tasksByPriority = {
      High: tasks.filter((t) => t.priority === "High").length,
      Medium: tasks.filter((t) => t.priority === "Medium").length,
      Low: tasks.filter((t) => t.priority === "Low").length,
    }

    const tasksByCategory = tasks.reduce(
      (acc, task) => {
        acc[task.category] = (acc[task.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Tasks completed today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const completedToday = tasks.filter((t) => {
      if (!t.completed) return false
      const completedDate = new Date(t.createdAt)
      completedDate.setHours(0, 0, 0, 0)
      return completedDate.getTime() === today.getTime()
    }).length

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate,
      tasksByPriority,
      tasksByCategory,
      completedToday,
    }
  }, [tasks])

  const motivationalQuotes = [
    "The secret of getting ahead is getting started.",
    "Don't watch the clock; do what it does. Keep going.",
    "The way to get started is to quit talking and begin doing.",
    "It always seems impossible until it's done.",
    "You don't have to be great to start, but you have to start to be great.",
  ]

  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]

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
            <DialogTitle className="text-xl">
              Productivity Stats
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 p-1">
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                className="rounded-xl bg-muted/50 p-4 text-center shadow-inner"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="text-3xl font-bold">{stats.completedTasks}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </motion.div>
              <motion.div
                className="rounded-xl bg-muted/50 p-4 text-center shadow-inner"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="text-3xl font-bold">{stats.pendingTasks}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </motion.div>
              <motion.div
                className="rounded-xl bg-muted/50 p-4 text-center shadow-inner"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <div className="text-3xl font-bold">{stats.completionRate}%</div>
                <div className="text-sm text-muted-foreground">Completion Rate</div>
              </motion.div>
              <motion.div
                className="rounded-xl bg-muted/50 p-4 text-center shadow-inner"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <div className="text-3xl font-bold">{stats.completedToday}</div>
                <div className="text-sm text-muted-foreground">Completed Today</div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <h3 className="mb-2 font-semibold">Tasks by Priority</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted/70">
                    <motion.div
                      className="h-2 rounded-full bg-red-500"
                      style={{ width: `${(stats.tasksByPriority.High / stats.totalTasks) * 100}%` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(stats.tasksByPriority.High / stats.totalTasks) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                    />
                  </div>
                  <span className="ml-2 min-w-[40px] text-sm">{stats.tasksByPriority.High}</span>
                  <span className="ml-1 text-sm text-muted-foreground">High</span>
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted/70">
                    <motion.div
                      className="h-2 rounded-full bg-amber-500"
                      style={{ width: `${(stats.tasksByPriority.Medium / stats.totalTasks) * 100}%` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(stats.tasksByPriority.Medium / stats.totalTasks) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.7 }}
                    />
                  </div>
                  <span className="ml-2 min-w-[40px] text-sm">{stats.tasksByPriority.Medium}</span>
                  <span className="ml-1 text-sm text-muted-foreground">Medium</span>
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted/70">
                    <motion.div
                      className="h-2 rounded-full bg-green-500"
                      style={{ width: `${(stats.tasksByPriority.Low / stats.totalTasks) * 100}%` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(stats.tasksByPriority.Low / stats.totalTasks) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.8 }}
                    />
                  </div>
                  <span className="ml-2 min-w-[40px] text-sm">{stats.tasksByPriority.Low}</span>
                  <span className="ml-1 text-sm text-muted-foreground">Low</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 p-4 shadow-inner"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.9 }}
            >
              <p className="text-center text-sm italic">"{randomQuote}"</p>
            </motion.div>

            <motion.div
              className="text-center text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 1.0 }}
            >
              Stats as of {format(new Date(), "MMMM d, yyyy")}
            </motion.div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
