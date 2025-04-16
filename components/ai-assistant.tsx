"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { X, Send, Sparkles, Bot, User, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { Task } from "@/lib/types"

interface AIAssistantProps {
  onClose: () => void
  tasks: Task[]
  onAddTask: (task: Omit<Task, "id" | "completed" | "createdAt">) => void
}

type Message = {
  role: "user" | "assistant"
  content: string
}

export function AIAssistant({ onClose, tasks, onAddTask }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi there! I'm your productivity assistant. How can I help you manage your tasks today?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [suggestedTasks, setSuggestedTasks] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    // Focus input when component mounts
    inputRef.current?.focus()

    // Generate suggested tasks based on existing tasks
    generateTaskSuggestions()
  }, [])

  const generateTaskSuggestions = async () => {
    if (tasks.length === 0) return

    try {
      const taskTitles = tasks.map((t) => t.title).join(", ")
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt: `Based on these existing tasks: ${taskTitles}, suggest 3 related tasks that might be helpful. Return only the task titles separated by |, no explanations or other text.`,
        maxTokens: 100,
      })

      const suggestions = text
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean)
      setSuggestedTasks(suggestions.slice(0, 3))
    } catch (error) {
      console.error("Error generating task suggestions:", error)
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const systemPrompt = `You are a helpful productivity assistant for a task management app called TaskMaster. 
      The user currently has ${tasks.length} tasks (${tasks.filter((t) => !t.completed).length} pending and ${tasks.filter((t) => t.completed).length} completed).
      Be concise, friendly, and helpful. If the user wants to add a task, extract the task details and respond with "ADD_TASK: [task title] | [description] | [priority: High/Medium/Low] | [category]".
      If you don't know the category, use "personal". If you don't know the priority, use "Medium".`

      const { text } = await generateText({
        model: openai("gpt-4o"),
        system: systemPrompt,
        prompt: input,
        maxTokens: 500,
      })

      if (text.startsWith("ADD_TASK:")) {
        const taskParts = text
          .replace("ADD_TASK:", "")
          .split("|")
          .map((part) => part.trim())
        const [title, description, priority, category] = taskParts

        // Find category ID or use default
        const categoryId =
          tasks.find((t) => t.category.toLowerCase() === category.toLowerCase())?.category || "personal"

        // Add the task
        onAddTask({
          title,
          description,
          priority: (priority as "High" | "Medium" | "Low") || "Medium",
          category: categoryId,
          dueDate: undefined,
        })

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `I've added "${title}" to your tasks! Is there anything else you'd like to do?`,
          },
        ])
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: text }])
      }
    } catch (error) {
      console.error("Error generating response:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I encountered an error. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const addSuggestedTask = (taskTitle: string) => {
    onAddTask({
      title: taskTitle,
      description: "",
      priority: "Medium",
      category: "personal",
      dueDate: undefined,
    })

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `I've added "${taskTitle}" to your tasks! Is there anything else you'd like to do?`,
      },
    ])

    // Remove the suggestion
    setSuggestedTasks((prev) => prev.filter((t) => t !== taskTitle))
  }

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
        className="relative mx-auto w-full max-w-md rounded-2xl border bg-card p-6 shadow-lg"
      >
        <Button variant="ghost" size="icon" className="absolute right-4 top-4 h-8 w-8 rounded-full" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>

        <div className="mb-4 flex items-center">
          <Sparkles className="mr-2 h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">AI Assistant</h2>
        </div>

        <Card className="mb-4 h-[350px] overflow-hidden rounded-xl border bg-muted/30 p-4">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flex max-w-[80%] items-start rounded-xl px-4 py-2 ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <div className="mr-2 mt-0.5">
                      {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className="text-sm">{message.content}</div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex max-w-[80%] items-center rounded-xl bg-muted px-4 py-2">
                    <div className="mr-2">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex space-x-1">
                      <motion.div
                        className="h-2 w-2 rounded-full bg-primary"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, repeatDelay: 0.2 }}
                      />
                      <motion.div
                        className="h-2 w-2 rounded-full bg-primary"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, delay: 0.2, repeatDelay: 0.2 }}
                      />
                      <motion.div
                        className="h-2 w-2 rounded-full bg-primary"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, delay: 0.4, repeatDelay: 0.2 }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </Card>

        {suggestedTasks.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-sm text-muted-foreground">Suggested tasks:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedTasks.map((task, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 rounded-full text-xs"
                  onClick={() => addSuggestedTask(task)}
                >
                  <Plus className="h-3 w-3" />
                  {task}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-end gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about your tasks..."
            className="min-h-[60px] max-h-[120px] resize-none rounded-xl border-none bg-muted/50 shadow-inner focus-visible:ring-1 dark:bg-muted/30"
          />
          <Button
            size="icon"
            className="h-10 w-10 rounded-full bg-primary"
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
