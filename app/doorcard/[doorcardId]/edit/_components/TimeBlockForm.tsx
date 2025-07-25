"use client";

import { useState } from "react";
import { useActionState } from "react";
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

interface TimeBlockErrors {
  startTime?: string;
  endTime?: string;
  activity?: string;
  location?: string;
  days?: string;
  general?: string;
}

const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

const dayLabels = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
};

const categories = [
  { value: "OFFICE_HOURS", label: "Office Hours" },
  { value: "LECTURE", label: "Lecture" },
  { value: "LAB", label: "Lab" },
  { value: "MEETING", label: "Meeting" },
  { value: "OTHER", label: "Other" },
];

function SubmitButton({ hasTimeBlocks }: { hasTimeBlocks: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending || !hasTimeBlocks}
      className="w-full"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Saving...
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

  // Validation state for time block creation/editing
  const [timeBlockErrors, setTimeBlockErrors] = useState<TimeBlockErrors>({});
  const [hasAttemptedAdd, setHasAttemptedAdd] = useState(false);

  // Server action state
  const [state, formAction] = useActionState(
    updateTimeBlocks.bind(null, doorcard.id),
    {
      success: true,
    }
  );

  // Validation functions for time blocks
  const validateTimeField = (
    field: keyof TimeBlockErrors,
    value: string | string[]
  ): string | undefined => {
    switch (field) {
      case "startTime":
        if (!value || (typeof value === "string" && !value.trim()))
          return "Start time is required";
        return undefined;
      case "endTime":
        if (!value || (typeof value === "string" && !value.trim()))
          return "End time is required";
        if (
          typeof value === "string" &&
          newBlock.startTime &&
          value <= newBlock.startTime
        ) {
          return "End time must be after start time";
        }
        return undefined;
      case "activity":
        if (!value || (typeof value === "string" && !value.trim()))
          return "Activity is required";
        if (typeof value === "string" && value.trim().length < 2)
          return "Activity must be at least 2 characters";
        if (typeof value === "string" && value.trim().length > 100)
          return "Activity must be less than 100 characters";
        return undefined;
      case "location":
        if (typeof value === "string" && value.length > 100)
          return "Location must be less than 100 characters";
        return undefined;
      case "days":
        if (!Array.isArray(value) || value.length === 0)
          return "At least one day must be selected";
        return undefined;
      default:
        return undefined;
    }
  };

  const validateTimeBlock = (): TimeBlockErrors => {
    const errors: TimeBlockErrors = {};

    errors.startTime = validateTimeField("startTime", newBlock.startTime);
    errors.endTime = validateTimeField("endTime", newBlock.endTime);
    errors.activity = validateTimeField("activity", newBlock.activity);
    errors.location = validateTimeField("location", newBlock.location);
    errors.days = validateTimeField("days", selectedDays);

    // Check for time conflicts
    if (newBlock.startTime && newBlock.endTime && selectedDays.length > 0) {
      const conflictingBlocks = timeBlocks.filter((block) => {
        if (editingBlock && block.id === editingBlock.id) return false;

        return (
          selectedDays.includes(block.day) &&
          ((newBlock.startTime >= block.startTime &&
            newBlock.startTime < block.endTime) ||
            (newBlock.endTime > block.startTime &&
              newBlock.endTime <= block.endTime) ||
            (newBlock.startTime <= block.startTime &&
              newBlock.endTime >= block.endTime))
        );
      });

      if (conflictingBlocks.length > 0) {
        errors.general = `Time conflict detected with existing ${
          conflictingBlocks[0].activity
        } on ${dayLabels[conflictingBlocks[0].day as keyof typeof dayLabels]}`;
      }
    }

    return errors;
  };

  const resetForm = () => {
    setIsAdding(false);
    setSelectedDays([]);
    setAddMode(null);
    setEditingBlock(null);
    setTimeBlockErrors({});
    setHasAttemptedAdd(false);
    setNewBlock({
      startTime: "",
      endTime: "",
      activity: "",
      location: "",
      category: "OFFICE_HOURS",
    });
  };

  const handleTimeBlockFieldChange = (
    field: keyof typeof newBlock,
    value: string
  ) => {
    setNewBlock((prev) => ({ ...prev, [field]: value }));

    // Clear field error if now valid, or show error if attempted add
    if (hasAttemptedAdd || timeBlockErrors[field as keyof TimeBlockErrors]) {
      const error = validateTimeField(field as keyof TimeBlockErrors, value);
      setTimeBlockErrors((prev) => ({
        ...prev,
        [field]: error,
      }));
    }
  };

  const addTimeBlock = () => {
    setHasAttemptedAdd(true);

    // Validate the time block
    const errors = validateTimeBlock();
    const hasErrors = Object.values(errors).some((error) => error);

    if (hasErrors) {
      setTimeBlockErrors(errors);
      return;
    }

    // Clear errors
    setTimeBlockErrors({});

    if (editingBlock) {
      // Update existing block
      setTimeBlocks(
        timeBlocks.map((block) =>
          block.id === editingBlock.id
            ? {
                ...block,
                startTime: newBlock.startTime,
                endTime: newBlock.endTime,
                activity: newBlock.activity.trim(),
                location: newBlock.location.trim() || undefined,
                category: newBlock.category,
              }
            : block
        )
      );
    } else {
      // Add new blocks
      const newBlocks = selectedDays.map((day) => ({
        id: crypto.randomUUID(),
        day,
        startTime: newBlock.startTime,
        endTime: newBlock.endTime,
        activity: newBlock.activity.trim(),
        location: newBlock.location.trim() || undefined,
        category: newBlock.category,
      }));
      setTimeBlocks([...timeBlocks, ...newBlocks]);
    }

    resetForm();
  };

  const removeTimeBlock = (id: string) => {
    setTimeBlocks(timeBlocks.filter((block) => block.id !== id));
  };

  const editTimeBlock = (block: TimeBlock) => {
    setEditingBlock(block);
    setNewBlock({
      startTime: block.startTime,
      endTime: block.endTime,
      activity: block.activity,
      location: block.location || "",
      category: block.category || "OFFICE_HOURS",
    });
    setSelectedDays([block.day]);
    setAddMode("single");
    setIsAdding(true);
    setTimeBlockErrors({});
    setHasAttemptedAdd(false);
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      if (timeBlocks.length === 0) {
        setError("Please add at least one time block before continuing");
        return;
      }
      setError(null);
      formData.set("timeBlocks", JSON.stringify(timeBlocks));
      await updateTimeBlocks(doorcard.id, null, formData);
    } catch (err) {
      // Only catch non-redirect errors
      if (err instanceof Error && !err.message.includes("NEXT_REDIRECT")) {
        setError(err.message);
      } else {
        throw err; // Re-throw redirect errors
      }
    }
  };

  // Check if there are any time block validation errors
  const hasTimeBlockErrors = Object.values(timeBlockErrors).some(
    (error) => error
  );

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
              Add your schedule to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {days.map((day) => {
              const dayBlocks = timeBlocks
                .filter((block) => block.day === day)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));

              if (dayBlocks.length === 0) return null;

              return (
                <Card key={day} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">
                        {dayLabels[day as keyof typeof dayLabels]}
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {dayBlocks.map((block) => (
                        <div
                          key={block.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                              <Clock className="h-4 w-4" />
                              {block.startTime} - {block.endTime}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {block.activity}
                            </p>
                            {block.location && (
                              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                <Building2 className="h-3 w-3" />
                                {block.location}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => editTimeBlock(block)}
                            >
                              Edit
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => removeTimeBlock(block.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {timeBlockErrors.days && (
                      <p className="text-xs text-red-500 mt-1">
                        {timeBlockErrors.days}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Time Block Buttons */}
      {!isAdding && (
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => {
              setIsAdding(true);
              setAddMode("single");
              setSelectedDays([days[0]]);
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
      )}

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

      {/* Server Error Display */}
      {state && !state.success && state.message && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle
                className="h-5 w-5 text-red-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Cannot Save Schedule
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{state.message}</p>
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
                {editingBlock
                  ? "Edit Time Block"
                  : `Add ${
                      addMode === "single" ? "Single" : "Repeating"
                    } Time Block`}
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

            {/* Validation Error Summary */}
            {hasAttemptedAdd &&
              (hasTimeBlockErrors || timeBlockErrors.general) && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle
                        className="h-5 w-5 text-red-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Please correct the following errors:
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <ul className="list-disc list-inside space-y-1">
                          {timeBlockErrors.startTime && (
                            <li>{timeBlockErrors.startTime}</li>
                          )}
                          {timeBlockErrors.endTime && (
                            <li>{timeBlockErrors.endTime}</li>
                          )}
                          {timeBlockErrors.activity && (
                            <li>{timeBlockErrors.activity}</li>
                          )}
                          {timeBlockErrors.location && (
                            <li>{timeBlockErrors.location}</li>
                          )}
                          {timeBlockErrors.days && (
                            <li>{timeBlockErrors.days}</li>
                          )}
                          {timeBlockErrors.general && (
                            <li>{timeBlockErrors.general}</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* Days Selection - Replaced checkboxes with better UI */}
            <div>
              <Label className="text-sm font-medium text-gray-900 mb-2 block">
                {addMode === "single" ? "Select Day" : "Select Days"}{" "}
                <span className="text-red-500">*</span>
              </Label>
              {addMode === "single" ? (
                <Select
                  value={selectedDays[0] || ""}
                  onValueChange={(day) => {
                    setSelectedDays([day]);
                    setError(null);
                  }}
                >
                  <SelectTrigger
                    className={`w-full ${
                      timeBlockErrors.days ? "border-red-500" : ""
                    }`}
                  >
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
              {timeBlockErrors.days && (
                <p className="text-xs text-red-500 mt-1">
                  {timeBlockErrors.days}
                </p>
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
                        handleTimeBlockFieldChange("startTime", e.target.value)
                      }
                      className={
                        timeBlockErrors.startTime ? "border-red-500" : ""
                      }
                    />
                    {timeBlockErrors.startTime && (
                      <p className="text-xs text-red-500 mt-1">
                        {timeBlockErrors.startTime}
                      </p>
                    )}
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="endTime">End</Label>
                    <Input
                      type="time"
                      value={newBlock.endTime}
                      onChange={(e) =>
                        handleTimeBlockFieldChange("endTime", e.target.value)
                      }
                      className={
                        timeBlockErrors.endTime ? "border-red-500" : ""
                      }
                    />
                    {timeBlockErrors.endTime && (
                      <p className="text-xs text-red-500 mt-1">
                        {timeBlockErrors.endTime}
                      </p>
                    )}
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
                      handleTimeBlockFieldChange("activity", e.target.value)
                    }
                    placeholder={
                      newBlock.category === "OFFICE_HOURS"
                        ? "Office Hours"
                        : "e.g., MATH 101"
                    }
                    className={timeBlockErrors.activity ? "border-red-500" : ""}
                  />
                  {timeBlockErrors.activity && (
                    <p className="text-xs text-red-500 mt-1">
                      {timeBlockErrors.activity}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="location">
                    Location <span className="text-gray-500">(Optional)</span>
                  </Label>
                  <Input
                    value={newBlock.location}
                    onChange={(e) =>
                      handleTimeBlockFieldChange("location", e.target.value)
                    }
                    placeholder="e.g., Building 10, Room 203"
                    className={timeBlockErrors.location ? "border-red-500" : ""}
                  />
                  {timeBlockErrors.location && (
                    <p className="text-xs text-red-500 mt-1">
                      {timeBlockErrors.location}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                onClick={addTimeBlock}
                className="bg-blue-600 hover:bg-blue-700 flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                {editingBlock
                  ? "Update Time Block"
                  : `Add ${
                      addMode === "single" ? "Time Block" : "Time Blocks"
                    }`}
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
          <SubmitButton hasTimeBlocks={timeBlocks.length > 0} />
        </form>
      )}
    </div>
  );
}
