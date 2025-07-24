"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  Clock,
  X,
  Plus,
  CalendarDays,
  Building2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { updateTimeBlocks } from "@/app/doorcard/actions";

interface TimeBlock {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  activity: string;
  location?: string;
  category?: string;
}

interface TimeBlockFormProps {
  doorcard: {
    id: string;
    timeBlocks: TimeBlock[];
  };
}

const days = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const dayLabels = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

const categories = [
  { value: "OFFICE_HOURS", label: "Office Hours" },
  { value: "IN_CLASS", label: "In Class" },
  { value: "LECTURE", label: "Lecture" },
  { value: "LAB", label: "Lab" },
  { value: "HOURS_BY_ARRANGEMENT", label: "Hours by Arrangement" },
  { value: "REFERENCE", label: "Reference" },
];

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving Schedule...
        </>
      ) : (
        "Continue to Preview"
      )}
    </Button>
  );
}

export default function TimeBlockForm({ doorcard }: TimeBlockFormProps) {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(
    doorcard.timeBlocks || []
  );
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [addMode, setAddMode] = useState<"single" | "repeating" | null>(null);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);
  const [newBlock, setNewBlock] = useState({
    startTime: "",
    endTime: "",
    activity: "",
    location: "",
    category: "OFFICE_HOURS",
  });

  const resetForm = () => {
    setIsAdding(false);
    setError(null);
    setSelectedDays([]);
    setAddMode(null);
    setEditingBlock(null);
    setNewBlock({
      startTime: "",
      endTime: "",
      activity: "",
      location: "",
      category: "OFFICE_HOURS",
    });
  };

  const startEditing = (block: TimeBlock) => {
    setEditingBlock(block);
    setIsAdding(true);
    setAddMode("single");
    setSelectedDays([block.day]);
    setNewBlock({
      startTime: block.startTime,
      endTime: block.endTime,
      activity: block.activity,
      location: block.location || "",
      category: block.category || "OFFICE_HOURS",
    });
  };

  const validateNewBlock = () => {
    if (addMode === "repeating" && selectedDays.length === 0)
      return "Please select at least one day";
    if (addMode === "single" && selectedDays.length !== 1)
      return "Please select exactly one day";
    if (!newBlock.startTime) return "Please enter a start time";
    if (!newBlock.endTime) return "Please enter an end time";
    if (newBlock.category !== "OFFICE_HOURS" && !newBlock.activity) {
      return "Please enter an activity or course name";
    }

    // Validate time format and range
    const start = new Date(`1970-01-01T${newBlock.startTime}`);
    const end = new Date(`1970-01-01T${newBlock.endTime}`);
    if (end <= start) return "End time must be after start time";

    return null;
  };

  const addTimeBlock = () => {
    const validationError = validateNewBlock();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);

    // Create a time block for each selected day
    const newBlocks = selectedDays.map((day) => ({
      id: `temp-${Date.now()}-${day}`,
      day,
      startTime: newBlock.startTime,
      endTime: newBlock.endTime,
      activity:
        newBlock.category === "OFFICE_HOURS"
          ? newBlock.activity || "Office Hours"
          : newBlock.activity,
      location: newBlock.location || undefined,
      category: newBlock.category,
    }));

    setTimeBlocks([...timeBlocks, ...newBlocks]);
    resetForm();
  };

  const updateTimeBlock = () => {
    const validationError = validateNewBlock();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);

    if (!editingBlock) return;

    // Update the existing block
    setTimeBlocks(
      timeBlocks.map((block) =>
        block.id === editingBlock.id
          ? {
              ...block,
              day: selectedDays[0],
              startTime: newBlock.startTime,
              endTime: newBlock.endTime,
              activity:
                newBlock.category === "OFFICE_HOURS"
                  ? newBlock.activity || "Office Hours"
                  : newBlock.activity,
              location: newBlock.location || undefined,
              category: newBlock.category,
            }
          : block
      )
    );

    resetForm();
  };

  const removeTimeBlock = (id: string) => {
    setTimeBlocks(timeBlocks.filter((block) => block.id !== id));
  };

  const handleSubmit = async (formData: FormData) => {
    if (timeBlocks.length === 0) {
      setError("Please add at least one time block before continuing");
      return;
    }
    setError(null);
    formData.append("timeBlocks", JSON.stringify(timeBlocks));
    await updateTimeBlocks(doorcard.id, formData);
  };

  return (
    <div className="space-y-8">
      {/* Current Schedule */}
      <div className="space-y-4">
        <div className="flex items-start gap-3 pb-2">
          <CalendarDays className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-gray-900">Current Schedule</h3>
            <p className="text-sm text-gray-500 mt-1">
              Your weekly schedule will be displayed on your doorcard.
            </p>
          </div>
        </div>

        {timeBlocks.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <CalendarDays className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No time blocks
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first time block
            </p>
            <div className="mt-6 flex gap-3 justify-center">
              <Button
                onClick={() => {
                  setIsAdding(true);
                  setAddMode("single");
                  setSelectedDays([days[0]]); // Pre-select Monday for single entry
                }}
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Single Time Block
              </Button>
              <Button
                onClick={() => {
                  setIsAdding(true);
                  setAddMode("repeating");
                }}
              >
                <CalendarDays className="h-4 w-4 mr-2" />
                Repeating Time Block
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {timeBlocks.map((block) => (
              <Card
                key={block.id}
                className="hover:border-blue-300 transition-colors cursor-pointer"
                onClick={() => startEditing(block)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <span className="font-medium text-gray-900">
                          {dayLabels[block.day as keyof typeof dayLabels]}
                        </span>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-1.5" />
                          {block.startTime} - {block.endTime}
                        </div>
                        <span className="font-medium text-blue-600">
                          {block.activity}
                        </span>
                        {block.location && (
                          <div className="flex items-center text-gray-500">
                            <Building2 className="h-4 w-4 mr-1.5" />
                            {block.location}
                          </div>
                        )}
                      </div>
                      <div className="mt-1">
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          {categories.find((c) => c.value === block.category)
                            ?.label || block.category}
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTimeBlock(block.id);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add buttons when there are existing blocks */}
            <div className="flex gap-3 justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(true);
                  setAddMode("single");
                  setSelectedDays([days[0]]); // Pre-select Monday for single entry
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Single Time Block
              </Button>
              <Button
                onClick={() => {
                  setIsAdding(true);
                  setAddMode("repeating");
                }}
              >
                <CalendarDays className="h-4 w-4 mr-2" />
                Repeating Time Block
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle
                className="h-5 w-5 text-red-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Time Block Form */}
      {isAdding && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {editingBlock ? "Edit Time Block" : `Add ${addMode === "single" ? "Single" : "Repeating"} Time Block`}
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetForm}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Days Selection - Replaced checkboxes with better UI */}
            <div>
              <Label className="text-sm font-medium text-gray-900 mb-2 block">
                {addMode === "single" ? "Select Day" : "Select Days"}
              </Label>
              {addMode === "single" ? (
                <Select
                  value={selectedDays[0] || ""}
                  onValueChange={(day) => {
                    setSelectedDays([day]);
                    setError(null);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a day" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((day) => (
                      <SelectItem key={day} value={day}>
                        {dayLabels[day as keyof typeof dayLabels]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {days.map((day) => (
                    <Button
                      key={day}
                      type="button"
                      size="sm"
                      variant={
                        selectedDays.includes(day) ? "default" : "outline"
                      }
                      onClick={() => {
                        setSelectedDays(
                          selectedDays.includes(day)
                            ? selectedDays.filter((d) => d !== day)
                            : [...selectedDays, day]
                        );
                        setError(null);
                      }}
                      className={`flex-1 min-w-[100px] ${
                        selectedDays.includes(day)
                          ? "bg-blue-600 text-white"
                          : ""
                      }`}
                    >
                      {dayLabels[day as keyof typeof dayLabels]}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Time and Category Selection - Improved Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="startTime">Start</Label>
                    <Input
                      type="time"
                      value={newBlock.startTime}
                      onChange={(e) =>
                        setNewBlock({ ...newBlock, startTime: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="endTime">End</Label>
                    <Input
                      type="time"
                      value={newBlock.endTime}
                      onChange={(e) =>
                        setNewBlock({ ...newBlock, endTime: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="category">Type</Label>
                  <Select
                    value={newBlock.category}
                    onValueChange={(value) => {
                      setNewBlock({
                        ...newBlock,
                        category: value,
                        activity:
                          value === "OFFICE_HOURS" ? "Office Hours" : "",
                      });
                      setError(null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="activity">
                    {newBlock.category === "OFFICE_HOURS" ? (
                      <>
                        Title <span className="text-gray-500">(Optional)</span>
                      </>
                    ) : (
                      "Activity/Course"
                    )}
                  </Label>
                  <Input
                    value={newBlock.activity}
                    onChange={(e) =>
                      setNewBlock({ ...newBlock, activity: e.target.value })
                    }
                    placeholder={
                      newBlock.category === "OFFICE_HOURS"
                        ? "Office Hours"
                        : "e.g., MATH 101"
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="location">
                    Location <span className="text-gray-500">(Optional)</span>
                  </Label>
                  <Input
                    value={newBlock.location}
                    onChange={(e) =>
                      setNewBlock({ ...newBlock, location: e.target.value })
                    }
                    placeholder="e.g., Building 10, Room 203"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                onClick={editingBlock ? updateTimeBlock : addTimeBlock}
                className="bg-blue-600 hover:bg-blue-700 flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                {editingBlock ? "Update Time Block" : `Add ${addMode === "single" ? "Time Block" : "Time Blocks"}`}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Form */}
      {timeBlocks.length > 0 && (
        <form action={handleSubmit}>
          <SubmitButton />
        </form>
      )}
    </div>
  );
}
