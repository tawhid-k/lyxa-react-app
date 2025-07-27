"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import { Clock, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { MoveToOngoingDialog } from "@/components/move-to-ongoing-dialog"

type TodoStatus = "New" | "Ongoing" | "Done"

interface Todo {
  id: string
  title: string
  description: string
  status: TodoStatus
  createdAt: Date
  dueDate?: Date
  completedAt?: Date
}

const statusColors = {
  New: "bg-blue-100 text-blue-800 border-blue-200",
  Ongoing: "bg-orange-100 text-orange-800 border-orange-200",
  Done: "bg-green-100 text-green-800 border-green-200",
}

const columnColors = {
  New: "border-blue-200 bg-blue-50/30",
  Ongoing: "border-orange-200 bg-orange-50/30",
  Done: "border-green-200 bg-green-50/30",
}

export default function TodoKanban() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [overdueAlerts, setOverdueAlerts] = useState<string[]>([])
  const [draggedItem, setDraggedItem] = useState<Todo | null>(null)

  // Check for overdue tasks
  useEffect(() => {
    const checkOverdue = () => {
      const now = new Date()
      const overdue = todos
        .filter((todo) => todo.status === "Ongoing" && todo.dueDate && todo.dueDate < now)
        .map((todo) => todo.id)

      setOverdueAlerts(overdue)
    }

    const interval = setInterval(checkOverdue, 60000) // Check every minute
    checkOverdue() // Initial check

    return () => clearInterval(interval)
  }, [todos])

  const addTodo = useCallback((title: string, description: string) => {
    const todo: Todo = {
      id: Date.now().toString(),
      title,
      description,
      status: "New",
      createdAt: new Date(),
    }
    setTodos((prev) => [todo, ...prev])
  }, [])

  const moveTodo = useCallback((todoId: string, newStatus: TodoStatus, dueDate?: Date) => {
    setTodos((prev) =>
      prev.map((todo) => {
        if (todo.id === todoId) {
          const updatedTodo = {
            ...todo,
            status: newStatus,
            ...(newStatus === "Done" && { completedAt: new Date() }),
            ...(newStatus === "Ongoing" && dueDate && { dueDate }),
          }
          return updatedTodo
        }
        return todo
      }),
    )
  }, [])

  const getAvailableStatuses = (currentStatus: TodoStatus): TodoStatus[] => {
    return (["New", "Ongoing", "Done"] as TodoStatus[]).filter((status) => status !== currentStatus)
  }

  const getTodosByStatus = (status: TodoStatus) => {
    const filtered = todos.filter((todo) => todo.status === status)

    switch (status) {
      case "New":
        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      case "Ongoing":
        return filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      case "Done":
        return filtered.sort((a, b) => {
          if (!a.completedAt || !b.completedAt) return 0
          return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        })
      default:
        return filtered
    }
  }

  const handleDragStart = (e: React.DragEvent, todo: Todo) => {
    setDraggedItem(todo)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetStatus: TodoStatus) => {
    e.preventDefault()
    if (draggedItem && draggedItem.status !== targetStatus) {
      moveTodo(draggedItem.id, targetStatus)
    }
    setDraggedItem(null)
  }

  const TodoCard = ({ todo }: { todo: Todo }) => {
    const isOverdue = overdueAlerts.includes(todo.id)

    return (
      <ContextMenu>
        <ContextMenuTrigger>
          <Card
            className={`cursor-move transition-all hover:shadow-md ${isOverdue ? "ring-2 ring-red-500" : ""}`}
            draggable
            onDragStart={(e) => handleDragStart(e, todo)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-sm font-medium line-clamp-2">{todo.title}</CardTitle>
                <Badge className={`text-xs ${statusColors[todo.status]} shrink-0`}>{todo.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground line-clamp-3 mb-2">{todo.description}</p>

              {todo.status === "Ongoing" && todo.dueDate && (
                <div
                  className={`flex items-center gap-1 text-xs ${isOverdue ? "text-red-600" : "text-muted-foreground"}`}
                >
                  <Clock className="h-3 w-3" />
                  Due: {format(todo.dueDate, "MMM dd, yyyy")}
                  {isOverdue && <AlertTriangle className="h-3 w-3 text-red-500" />}
                </div>
              )}

              {todo.status === "Done" && todo.completedAt && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Completed: {format(todo.completedAt, "MMM dd, yyyy")}
                </div>
              )}
            </CardContent>
          </Card>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {getAvailableStatuses(todo.status).map((status) =>
            status === "Ongoing" ? (
              <MoveToOngoingDialog key={status} todo={todo} onMove={(dueDate) => moveTodo(todo.id, status, dueDate)} />
            ) : (
              <ContextMenuItem key={status} onClick={() => moveTodo(todo.id, status)}>
                Move to {status}
              </ContextMenuItem>
            ),
          )}
        </ContextMenuContent>
      </ContextMenu>
    )
  }

  const Column = ({ status, title }: { status: TodoStatus; title: string }) => {
    const columnTodos = getTodosByStatus(status)

    return (
      <div
        className={`flex-1 min-h-[600px] border-2 border-dashed rounded-lg p-4 ${columnColors[status]}`}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, status)}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Badge variant="secondary">{columnTodos.length}</Badge>
        </div>

        {status === "New" && <AddTaskDialog onAddTask={addTodo} />}

        <div className="space-y-3">
          {columnTodos.map((todo) => (
            <TodoCard key={todo.id} todo={todo} />
          ))}
          {columnTodos.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <p>No tasks in {title.toLowerCase()}</p>
              {status === "New" && <p className="text-sm mt-1">Click "Add New Task" to get started</p>}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Todo Kanban Board</h1>
          <p className="text-muted-foreground">Manage your tasks across different stages</p>
        </div>

        {/* Overdue Alerts */}
        {overdueAlerts.length > 0 && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              You have {overdueAlerts.length} overdue task{overdueAlerts.length > 1 ? "s" : ""} in the Ongoing column!
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Column status="New" title="New Tasks" />
          <Column status="Ongoing" title="Ongoing Tasks" />
          <Column status="Done" title="Completed Tasks" />
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Right-click on any task to move it between columns</p>
          <p>Drag and drop tasks to move them quickly</p>
        </div>
      </div>
    </div>
  )
}
