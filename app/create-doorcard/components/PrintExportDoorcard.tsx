"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface TimeBlock {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  activity: string;
  location?: string;
  category?: string;
}

interface DoorcardData {
  name: string;
  doorcardName: string;
  officeNumber: string;
  timeBlocks: TimeBlock[];
}

interface PrintExportDoorcardProps {
  data: DoorcardData;
  isPrintView?: boolean;
}

const convertToPST = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const adjustedHours = hours % 12 || 12;
  return `${adjustedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
};

// Helper function to extract course code from activity name
const extractCourseCode = (activity: string) => {
  // If activity contains " - ", take only the part before it
  if (activity.includes(" - ")) {
    return activity.split(" - ")[0];
  }
  // If activity contains "CS", "MATH", etc., try to extract just the course code
  const courseCodeMatch = activity.match(/^([A-Z]{2,4}\s*\d{1,4}[A-Z]?)/);
  if (courseCodeMatch) {
    return courseCodeMatch[1];
  }
  // For activities like "Office Hours", "Lab", keep as is but make shorter
  if (activity.toLowerCase().includes("office hours")) return "Office Hours";
  if (activity.toLowerCase().includes("lab")) return "Lab";
  // Return first 12 characters to ensure it fits
  return activity.substring(0, 12);
};

// Include all 7 days for print layout (matches production)
const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const dayAbbreviations = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"];

// Match production time range: 7 AM to 10 PM (30 slots = 15 hours)
const timeSlots = Array.from({ length: 30 }, (_, i) => {
  const hour = Math.floor(i / 2) + 7;
  const minute = i % 2 === 0 ? "00" : "30";
  const value = `${hour.toString().padStart(2, "0")}:${minute}`;
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const period = hour >= 12 ? "PM" : "AM";
  const label = `${displayHour}:${minute} ${period}`;
  return { value, label };
});

// Category colors matching production
const categoryColors = {
  OFFICE_HOURS: "#E1E2CA",
  IN_CLASS: "#99B5D5",
  LECTURE: "#D599C5",
  LAB: "#EDAC80",
  HOURS_BY_ARRANGEMENT: "#99D5A1",
  REFERENCE: "#AD99D5",
};

const categoryLabels = {
  OFFICE_HOURS: "Office Hours",
  IN_CLASS: "In Class",
  LECTURE: "Lecture",
  LAB: "Lab",
  HOURS_BY_ARRANGEMENT: "Hours by Arrang",
  REFERENCE: "Reference",
};

export default function PrintExportDoorcard({
  data,
  isPrintView = false,
}: PrintExportDoorcardProps) {
  const [htmlContent, setHtmlContent] = useState("");
  const printRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
    }
  };

  const generateHtmlContent = () => {
    const content = `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:1000px;margin:20px auto;padding:20px"><h2 style="font-size:1.25rem;font-weight:bold;margin-bottom:0.25rem">${
      data.doorcardName
    }</h2><p style="font-size:0.875rem;color:#666;margin-bottom:1.5rem">${
      data.name
    } - Office #${
      data.officeNumber
    }</p><div style="border:1px solid #e5e7eb;border-radius:0.5rem;overflow:hidden"><table style="width:100%;border-collapse:collapse;font-size:0.75rem"><thead><tr><th style="padding:0.5rem;border-bottom:1px solid #e5e7eb;border-right:1px solid #e5e7eb"></th>${days
      .map(
        (day) =>
          `<th style="padding:0.5rem;text-align:center;border-bottom:1px solid #e5e7eb;border-right:1px solid #e5e7eb;font-weight:500">${day}</th>`
      )
      .join("")}</tr></thead><tbody>${timeSlots
      .map(
        (slot) =>
          `<tr><td style="padding:0.5rem;color:#666;border-right:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb">${
            slot.label
          }</td>${days
            .map((day) => {
              const timeBlock = data.timeBlocks.find(
                (block) => block.day === day && block.startTime === slot.value
              );
              if (timeBlock) {
                const startHour = Number.parseInt(
                  timeBlock.startTime.split(":")[0]
                );
                const endHour = Number.parseInt(
                  timeBlock.endTime.split(":")[0]
                );
                const rowSpan = (endHour - startHour) * 2;
                return `<td style="background-color:#f0fdf4;padding:0.5rem;border-right:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb" rowspan="${rowSpan}"><div>${convertToPST(
                  timeBlock.startTime
                )} - ${convertToPST(
                  timeBlock.endTime
                )}</div><div>${extractCourseCode(
                  timeBlock.activity
                )}</div></td>`;
              }
              const isBlocked = data.timeBlocks.some(
                (block) =>
                  block.day === day &&
                  slot.value >= block.startTime &&
                  slot.value < block.endTime
              );
              return isBlocked
                ? ""
                : '<td style="border-right:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb"></td>';
            })
            .join("")}</tr>`
      )
      .join("")}</tbody></table></div></div>`;

    setHtmlContent(content);
  };

  const handleCopyHtml = () => {
    const htmlWithNote = `<!-- Note: This HTML is minified for easier copying. You may want to format it for better readability. -->\n${htmlContent}`;
    navigator.clipboard
      .writeText(htmlWithNote)
      .then(() => {
        toast({
          title: "Success",
          description:
            "HTML copied to clipboard! You can now paste this into Canvas.",
        });
      })
      .catch((err) => {
        console.error("Failed to copy HTML:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to copy HTML. Please try again.",
        });
      });
  };

  const sortedTimeBlocks = [...data.timeBlocks].sort((a, b) => {
    const dayOrder = days.indexOf(a.day) - days.indexOf(b.day);
    if (dayOrder !== 0) return dayOrder;
    return a.startTime.localeCompare(b.startTime);
  });

  const renderContent = () => (
    <div className={isPrintView ? "print-container" : ""}>
      <style jsx>{`
        @media print {
          .print-container {
            width: 534px !important;
            margin: 0 auto !important;
            padding: 0 !important;
            font-family: Verdana, Arial, sans-serif !important;
            font-size: 6px !important;
          }
          .faculty-header {
            width: 100% !important;
            background-color: #f5f5f5 !important;
            border: 1px solid #ccc !important;
            margin-bottom: 1px !important;
          }
          .faculty-name {
            font-size: 10px !important;
            font-weight: bold !important;
            padding: 2px 4px !important;
          }
          .faculty-info {
            font-size: 6px !important;
            padding: 0.5px 4px !important;
            line-height: 1 !important;
          }
          .schedule-table {
            width: 100% !important;
            border-collapse: collapse !important;
            border: 1px solid #ccc !important;
            font-size: 5px !important;
          }
          .schedule-table th {
            background-color: #f0f0f0 !important;
            border: 1px solid #ccc !important;
            padding: 0.5px 1px !important;
            text-align: center !important;
            font-weight: bold !important;
            font-size: 5px !important;
            line-height: 1 !important;
          }
          .schedule-table td {
            border: 1px solid #ccc !important;
            padding: 0.25px 0.5px !important;
            vertical-align: top !important;
            height: 10px !important;
            text-align: center !important;
            line-height: 1 !important;
          }
          .time-column {
            width: 50px !important;
            background-color: #f8f8f8 !important;
            font-size: 4px !important;
          }
          .day-column {
            width: 55px !important;
          }
          .appointment-cell {
            font-size: 4px !important;
            line-height: 0.9 !important;
            padding: 0.5px !important;
          }
          .appointment-time {
            font-size: 3px !important;
            margin-top: 0.5px !important;
            line-height: 1 !important;
          }
          .legend-table {
            width: 515px !important;
            margin: 1px auto 0 !important;
            border: 1px solid #ccc !important;
            font-size: 6px !important;
          }
          .legend-table td {
            padding: 0.5px 2px !important;
            border: 1px solid #ccc !important;
            line-height: 1 !important;
          }
          .legend-color {
            width: 12px !important;
            height: 8px !important;
          }
        }
      `}</style>

      <Card className={isPrintView ? "shadow-none border-none" : ""}>
        <CardContent
          className={`${isPrintView ? "p-0" : "p-6"}`}
          ref={printRef}
        >
          {/* Faculty Header - matching production with user details at top */}
          <div className="faculty-header">
            <div className="faculty-name">{data.name}</div>
            <div className="faculty-info">
              <strong>Semester:</strong> Spring 2020
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "2px 8px",
              }}
            >
              <div className="faculty-info">
                <strong>Office Phone:</strong> (650) 358-6794
              </div>
              <div className="faculty-info">
                <strong>Division:</strong> District Office
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "2px 8px",
              }}
            >
              <div className="faculty-info">
                <strong>Office Number:</strong> {data.officeNumber}
              </div>
              <div className="faculty-info">
                <strong>Email:</strong> faculty@smccd.edu
              </div>
            </div>
          </div>

          {/* Schedule Table with all 7 days */}
          <table className="schedule-table">
            <thead>
              <tr>
                <th className="time-column">Time</th>
                {dayAbbreviations.map((day) => (
                  <th key={day} className="day-column">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot) => (
                <tr key={slot.value}>
                  <td className="time-column">{slot.label}</td>
                  {days.map((day) => {
                    const timeBlock = data.timeBlocks.find(
                      (block) =>
                        block.day === day && block.startTime === slot.value
                    );
                    if (timeBlock) {
                      const startHour = Number.parseInt(
                        timeBlock.startTime.split(":")[0]
                      );
                      const startMin = Number.parseInt(
                        timeBlock.startTime.split(":")[1]
                      );
                      const endHour = Number.parseInt(
                        timeBlock.endTime.split(":")[0]
                      );
                      const endMin = Number.parseInt(
                        timeBlock.endTime.split(":")[1]
                      );

                      // Calculate rowspan based on 30-minute intervals
                      const startSlots =
                        (startHour - 7) * 2 + (startMin === 30 ? 1 : 0);
                      const endSlots =
                        (endHour - 7) * 2 + (endMin === 30 ? 1 : 0);
                      const rowSpan = endSlots - startSlots;

                      const backgroundColor =
                        categoryColors[
                          (timeBlock.category ||
                            "OFFICE_HOURS") as keyof typeof categoryColors
                        ] || "#E1E2CA";

                      return (
                        <td
                          key={`${day}-${slot.value}`}
                          rowSpan={rowSpan}
                          className="appointment-cell"
                          style={{ backgroundColor }}
                        >
                          <div style={{ fontWeight: "bold" }}>
                            {extractCourseCode(timeBlock.activity)}
                          </div>
                          <div className="appointment-time">
                            {convertToPST(timeBlock.startTime).replace(" ", "")}{" "}
                            - {convertToPST(timeBlock.endTime).replace(" ", "")}
                          </div>
                        </td>
                      );
                    }
                    const isBlocked = data.timeBlocks.some(
                      (block) =>
                        block.day === day &&
                        slot.value >= block.startTime &&
                        slot.value < block.endTime
                    );
                    if (!isBlocked) {
                      return (
                        <td key={`${day}-${slot.value}`} className="day-column">
                          &nbsp;
                        </td>
                      );
                    }
                    return null;
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Legend - matching production */}
          <table className="legend-table">
            <tbody>
              <tr>
                <td
                  colSpan={2}
                  style={{ fontWeight: "bold", color: "#0066cc" }}
                >
                  Legend
                </td>
              </tr>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <tr key={key}>
                  <td
                    className="legend-color"
                    style={{
                      backgroundColor:
                        categoryColors[key as keyof typeof categoryColors],
                    }}
                  >
                    &nbsp;
                  </td>
                  <td style={{ color: "#666" }}>{label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );

  if (isPrintView) {
    return renderContent();
  }

  return (
    <div className="space-y-6">
      <div className="flex space-x-4">
        <Button onClick={handlePrint}>Print Doorcard</Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button onClick={generateHtmlContent}>
              Export HTML for Canvas
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[725px]">
            <DialogHeader>
              <DialogTitle>Export HTML for Canvas</DialogTitle>
              <DialogDescription>
                Copy the HTML below and paste it into Canvas.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Textarea
                value={htmlContent}
                readOnly
                className="min-h-[300px] font-mono text-sm"
              />
              <Button onClick={handleCopyHtml}>Copy HTML</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="grid">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        <TabsContent value="grid" className="mt-4">
          {renderContent()}
        </TabsContent>
        <TabsContent value="list" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-1">{data.doorcardName}</h2>
              <p className="text-sm text-gray-600 mb-6">
                {data.name} - Office #{data.officeNumber}
              </p>

              <div className="space-y-6">
                {days.map((day) => {
                  const dayBlocks = sortedTimeBlocks.filter(
                    (block) => block.day === day
                  );
                  if (dayBlocks.length === 0) return null;

                  return (
                    <div key={day}>
                      <h3 className="font-medium mb-2">{day}</h3>
                      <div className="space-y-2">
                        {dayBlocks.map((block) => (
                          <div key={block.id} className="text-sm">
                            {convertToPST(block.startTime)} -{" "}
                            {convertToPST(block.endTime)}: {block.activity}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
