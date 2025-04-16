"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, RotateCcw, Check, Maximize2 } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Task } from "@/lib/types"
import { cn } from "@/lib/utils"

interface PomodoroTimerProps {
  tasks: Task[]
  onFocusModeToggle: () => void
  isFocusMode: boolean
}

type TimerMode = "focus" | "break"

export function PomodoroTimer({ tasks, onFocusModeToggle, isFocusMode }: PomodoroTimerProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string>("")
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState<TimerMode>("focus")
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const focusTime = 25 * 60 // 25 minutes
  const breakTime = 5 * 60 // 5 minutes

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Timer completed
            clearInterval(timerRef.current!)

            // Play sound
            const audio = new Audio("/notification.mp3")
            audio.play().catch(() => {
              // Handle autoplay restrictions
              console.log("Audio play failed - user interaction required")
            })

            if (mode === "focus") {
              setSessionsCompleted((prev) => prev + 1)
              setMode("break")
              setTimeLeft(breakTime)
            } else {
              setMode("focus")
              setTimeLeft(focusTime)
            }

            setIsActive(false)
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isActive, mode])

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(mode === "focus" ? focusTime : breakTime)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const calculateProgress = () => {
    const totalTime = mode === "focus" ? focusTime : breakTime
    return ((totalTime - timeLeft) / totalTime) * 100
  }

  const progress = calculateProgress()
  const circumference = 2 * Math.PI * 45 // 45 is the radius of the circle
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const modeColors = {
    focus: "text-primary",
    break: "text-emerald-500",
  }

  return (
    <Card className="overflow-hidden rounded-2xl border bg-card/80 backdrop-blur-md dark:bg-card/40 dark:backdrop-blur-xl">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
            Pomodoro Timer
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full p-0" onClick={onFocusModeToggle}>
            <Maximize2 className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className="mb-2 text-sm font-medium text-muted-foreground">
              {mode === "focus" ? "Focus Time" : "Break Time"}
            </div>
            <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
              <svg className="absolute h-full w-full -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="opacity-10"
                />
                <motion.circle
                  cx="50%"
                  cy="50%"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className={modeColors[mode]}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </svg>
              <div className={`text-2xl font-bold ${modeColors[mode]}`}>{formatTime(timeLeft)}</div>
            </div>
          </div>

          <div className="flex justify-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTimer}
              className={cn(
                "h-10 w-10 rounded-full transition-all hover:scale-105",
                isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              <motion.div whileTap={{ scale: 0.9 }}>
                {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </motion.div>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={resetTimer}
              className="h-10 w-10 rounded-full transition-all hover:scale-105"
            >
              <motion.div whileTap={{ scale: 0.9 }}>
                <RotateCcw className="h-4 w-4" />
              </motion.div>
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Current Task</label>
            <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
              <SelectTrigger className="rounded-xl border-none bg-muted/50 shadow-inner dark:bg-muted/30">
                <SelectValue placeholder="Select a task" />
              </SelectTrigger>
              <SelectContent>
                {tasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div>Sessions: {sessionsCompleted}</div>
            {selectedTaskId && (
              <div className="flex items-center text-muted-foreground">
                <Check className="mr-1 h-4 w-4" /> Working on selected task
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
