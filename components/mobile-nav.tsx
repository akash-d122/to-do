"use client"

import { Plus, BarChart2, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MobileNavProps {
  onAddTask: () => void
  onOpenStats: () => void
  onOpenAssistant: () => void
}

export function MobileNav({ onAddTask, onOpenStats, onOpenAssistant }: MobileNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 flex justify-around items-center md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={onAddTask}
        className="rounded-full"
      >
        <Plus className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenStats}
        className="rounded-full"
      >
        <BarChart2 className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenAssistant}
        className="rounded-full"
      >
        <Bot className="h-6 w-6" />
      </Button>
    </div>
  )
} 