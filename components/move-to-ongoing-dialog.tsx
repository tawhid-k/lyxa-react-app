"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

interface Todo {
  id: string
  title: string
  description: string
  status: "New" | "Ongoing" | "Done"
  createdAt: Date
  dueDate?: Date
  completedAt?: Date
}

interface MoveToOngoingDialogProps {
  todo: Todo
  onMove: (dueDate?: Date) => void
}

export function MoveToOngoingDialog({ todo, onMove }: MoveToOngoingDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [isOpen, setIsOpen] = useState(false)

  const handleMove = () => {
    onMove(selectedDate)
    setIsOpen(false)
    setSelectedDate(undefined)
  }

  const handleCancel = () => {
    setIsOpen(false)
    setSelectedDate(undefined)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="px-2 py-1.5 text-sm hover:bg-accent cursor-pointer">Move to Ongoing</div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Due Date (Optional)</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Label>Select due date for this task:</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
            </PopoverContent>
          </Popover>
          <div className="flex gap-2">
            <Button onClick={handleMove} className="flex-1">
              Move to Ongoing
            </Button>
            <Button variant="outline" onClick={handleCancel} className="flex-1 bg-transparent">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
