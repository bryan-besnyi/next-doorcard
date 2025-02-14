"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { X, Pencil } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useDoorcardStore } from "@/store/use-doorcard-store"
import { validateTimeBlockOverlap } from "@/lib/validations/doorcard"
import type { TimeBlock } from "@/lib/validations/doorcard"

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const activities = ["Class", "Office Hours", "Lab Time", "TBA"]

export default function TimeBlockForm() {
  const { timeBlocks, setTimeBlocks } = useDoorcardStore()
  const { toast } = useToast()
  const [day, setDay] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [activity, setActivity] = useState("")
  const [repeat, setRepeat] = useState<string[]>([])
  const [showRepeatOptions, setShowRepeatOptions] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const resetForm = () => {
    setDay("")
    setStartTime("")
    setEndTime("")
    setActivity("")
    setRepeat([])
    setShowRepeatOptions(false)
    setEditingId(null)
  }

  const handleEdit = (block: TimeBlock) => {
    setDay(block.day)
    setStartTime(block.startTime)
    setEndTime(block.endTime)
    setActivity(block.activity)
    setEditingId(block.id)
    setShowRepeatOptions(false)
    setRepeat([])
  }

  const handleAddOrUpdate = () => {
    if (!day || !startTime || !endTime || !activity) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all time block fields",
      })
      return
    }

    const newBlock = {
      day,
      startTime,
      endTime,
      activity,
    }

    // Check for time block overlap
    const overlapError = validateTimeBlockOverlap(newBlock, timeBlocks, editingId)
    if (overlapError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: overlapError,
      })
      return
    }

    const newTimeBlocks = editingId ? timeBlocks.filter((block) => block.id !== editingId) : [...timeBlocks]

    const createTimeBlock = (day: string): TimeBlock => ({
      id: editingId || Math.random().toString(36).substr(2, 9),
      day,
      startTime,
      endTime,
      activity,
    })

    // Add the original day
    newTimeBlocks.push(createTimeBlock(day))

    // Add repeated days if not editing
    if (!editingId) {
      repeat.forEach((repeatDay) => {
        if (repeatDay !== day) {
          const repeatedBlock = {
            day: repeatDay,
            startTime,
            endTime,
            activity,
          }

          // Check for overlap with repeated blocks
          const repeatedOverlapError = validateTimeBlockOverlap(repeatedBlock, timeBlocks)
          if (repeatedOverlapError) {
            toast({
              variant: "destructive",
              title: "Error",
              description: `Cannot add repeated block: ${repeatedOverlapError}`,
            })
            return
          }

          newTimeBlocks.push({
            ...createTimeBlock(repeatDay),
            id: Math.random().toString(36).substr(2, 9),
          })
        }
      })
    }

    setTimeBlocks(newTimeBlocks)
    resetForm()
    toast({
      title: "Success",
      description: editingId ? "Time block updated" : "Time block added",
    })
  }

  const handleRemoveTimeBlock = (id: string) => {
    setTimeBlocks(timeBlocks.filter((block) => block.id !== id))
    if (editingId === id) {
      resetForm()
    }
    toast({
      title: "Success",
      description: "Time block removed",
    })
  }

  const handleRepeatChange = (day: string) => {
    setRepeat((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  const formatTime = (time: string) => {
    if (!time) return ""
    const [hours, minutes] = time.split(":")
    const period = Number(hours) >= 12 ? "PM" : "AM"
    const hour12 = Number(hours) % 12 || 12
    return `${hour12}:${minutes} ${period}`
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {timeBlocks.map((block) => (
          <div key={block.id} className="flex items-center justify-between p-3 bg-muted rounded-lg group">
            <div className="space-y-1">
              <div className="font-medium">
                {block.day} • {formatTime(block.startTime)} - {formatTime(block.endTime)}
              </div>
              <div className="text-sm text-muted-foreground">{block.activity}</div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(block)}
                className={editingId === block.id ? "bg-muted-foreground/20" : ""}
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit time block</span>
              </Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveTimeBlock(block.id)}>
                <X className="h-4 w-4" />
                <span className="sr-only">Remove time block</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="day">Day</Label>
                <Select value={day} onValueChange={setDay}>
                  <SelectTrigger id="day">
                    <SelectValue placeholder="Select a day" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activity">Activity</Label>
                <Select value={activity} onValueChange={setActivity}>
                  <SelectTrigger id="activity">
                    <SelectValue placeholder="Select an activity" />
                  </SelectTrigger>
                  <SelectContent>
                    {activities.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>

            {!editingId && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-repeat"
                    checked={showRepeatOptions}
                    onCheckedChange={() => setShowRepeatOptions(!showRepeatOptions)}
                  />
                  <Label htmlFor="show-repeat" className="text-sm font-normal">
                    Repeat on other days
                  </Label>
                </div>

                {showRepeatOptions && (
                  <div className="ml-6 flex flex-wrap gap-4">
                    {days.map((d) => (
                      <div key={d} className="flex items-center space-x-2">
                        <Checkbox
                          id={`repeat-${d}`}
                          checked={repeat.includes(d)}
                          onCheckedChange={() => handleRepeatChange(d)}
                          disabled={d === day}
                        />
                        <Label htmlFor={`repeat-${d}`} className="text-sm font-normal">
                          {d}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Button type="button" onClick={handleAddOrUpdate} className="w-full" variant="secondary">
              {editingId ? "Update Time Block" : "Add Time Block"}
            </Button>

            {editingId && (
              <Button type="button" onClick={resetForm} className="w-full" variant="outline">
                Cancel Edit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

