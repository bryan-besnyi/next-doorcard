"use client";

import React, { useRef, useState } from "react";
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
import { useDoorcardStore } from "@/store/use-doorcard-store";
import {
  DAYS_FULL,
  DAYS_WEEKDAYS,
  TIME_SLOTS,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  getTimeInMinutes,
  formatTimeRange,
  extractCourseCode,
} from "@/lib/doorcard-constants";
import {
  User,
  MapPin,
  Calendar,
  Building,
  Share2,
  Printer,
} from "lucide-react";

// Unified interfaces
interface TimeBlock {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  activity: string;
  location?: string;
  category?: string;
}

interface Appointment {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
  category: string;
  location?: string;
}

interface DoorcardData {
  id?: string;
  name: string;
  doorcardName: string;
  officeNumber: string;
  term?: string;
  year?: string;
  college?: string;
  isActive?: boolean;
  timeBlocks?: TimeBlock[];
  appointments?: Appointment[];
}

interface UnifiedDoorcardProps {
  mode: "preview" | "print" | "export" | "public";
  data?: DoorcardData;
  showControls?: boolean;
  showWeekendDays?: boolean;
  onBack?: () => void;
  onPrint?: () => void;
}

export default function UnifiedDoorcard({
  mode,
  data: propData,
  showControls = true,
  showWeekendDays = true,
  onBack: _onBack,
  onPrint,
}: UnifiedDoorcardProps) {
  const [htmlContent, setHtmlContent] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const printRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Get data from store if in preview mode
  const storeData = useDoorcardStore();

  const rawData =
    propData ||
    (mode === "preview"
      ? {
          name: storeData.name,
          doorcardName: storeData.doorcardName,
          officeNumber: storeData.officeNumber,
          timeBlocks: storeData.timeBlocks,
        }
      : null);

  if (!rawData) {
    return <div className="text-red-500">No doorcard data available</div>;
  }

  // Convert appointments to timeBlocks if needed
  const convertAppointmentsToTimeBlocks = (
    appointments: Appointment[]
  ): TimeBlock[] => {
    const dayMap: { [key: string]: string } = {
      MONDAY: "Monday",
      TUESDAY: "Tuesday",
      WEDNESDAY: "Wednesday",
      THURSDAY: "Thursday",
      FRIDAY: "Friday",
      SATURDAY: "Saturday",
      SUNDAY: "Sunday",
    };

    return appointments.map((apt) => ({
      id: apt.id,
      day: dayMap[apt.dayOfWeek] || apt.dayOfWeek,
      startTime: apt.startTime,
      endTime: apt.endTime,
      activity: apt.name,
      location: apt.location,
      category: apt.category,
    }));
  };

  const timeBlocks = rawData.appointments
    ? convertAppointmentsToTimeBlocks(rawData.appointments)
    : rawData.timeBlocks || [];

  const data = {
    ...rawData,
    timeBlocks,
  };

  // Standardize on showing all 7 days for consistency, but allow override
  const days = !showWeekendDays ? DAYS_WEEKDAYS : DAYS_FULL;

  // Print functionality: trigger print dialog immediately
  const handlePrint = () => {
    window.print();
  };

  // HTML Export functionality
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
      .join("")}</tr></thead><tbody>${TIME_SLOTS.map(
      (slot) =>
        `<tr><td style="padding:0.5rem;color:#666;border-right:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb">${
          slot.label
        }</td>${days
          .map((day) => {
            const timeBlock = timeBlocks.find(
              (block) => block.day === day && block.startTime === slot.value
            );
            if (timeBlock) {
              const startMinutes = getTimeInMinutes(timeBlock.startTime);
              const endMinutes = getTimeInMinutes(timeBlock.endTime);
              const rowSpan = Math.ceil((endMinutes - startMinutes) / 30);
              const bgColor = timeBlock.category
                ? CATEGORY_COLORS[
                    timeBlock.category as keyof typeof CATEGORY_COLORS
                  ] || "#f0fdf4"
                : "#f0fdf4";
              return `<td style="background-color:${bgColor};padding:0.5rem;border-right:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb" rowspan="${rowSpan}"><div>${formatTimeRange(
                timeBlock.startTime,
                timeBlock.endTime
              )}</div><div>${timeBlock.activity}</div></td>`;
            }
            const isBlocked = timeBlocks.some(
              (block) =>
                block.day === day &&
                getTimeInMinutes(slot.value) >=
                  getTimeInMinutes(block.startTime) &&
                getTimeInMinutes(slot.value) < getTimeInMinutes(block.endTime)
            );
            return isBlocked
              ? ""
              : '<td style="border-right:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb"></td>';
          })
          .join("")}</tr>`
    ).join("")}</tbody></table></div></div>`;

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

  // Time utilities
  const isTimeBlockAtSlot = (block: TimeBlock, slotTime: string) => {
    return getTimeInMinutes(block.startTime) === getTimeInMinutes(slotTime);
  };

  const isTimeInBlock = (block: TimeBlock, slotTime: string) => {
    const blockStart = getTimeInMinutes(block.startTime);
    const blockEnd = getTimeInMinutes(block.endTime);
    const slotTimeMinutes = getTimeInMinutes(slotTime);
    return slotTimeMinutes >= blockStart && slotTimeMinutes < blockEnd;
  };

  // Render schedule grid
  const renderScheduleGrid = () => {
    // Helper for contact info (classic style, improved)
    const contactSection = (
      <div className="mb-2 pb-2 border-b border-gray-400">
        <div className="flex flex-row justify-between items-start w-full">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-red-700 leading-tight">
              {data.name || "Faculty Name"}
            </div>
            <div className="text-sm">
              <span className="font-bold">Semester:</span>{" "}
              <span className="font-normal">
                {data.term ? `${data.term} ${data.year || ""}` : "Spring 2020"}
              </span>
            </div>
            <div className="text-sm">
              <span className="font-bold">Office Phone:</span>{" "}
              <span className="font-normal">(650) 358-6794</span>
            </div>
            <div className="text-sm">
              <span className="font-bold">Office Number:</span>{" "}
              <span className="font-normal">
                {data.officeNumber || "BLDG - District Office Rm 115"}
              </span>
            </div>
          </div>
          <div className="space-y-1 text-right min-w-[180px]">
            <div className="text-sm">
              <span className="font-bold">Division:</span>{" "}
              <span className="font-normal">District Office</span>
            </div>
            <div className="text-sm">
              <span className="font-bold">Email:</span>{" "}
              <span className="font-normal text-blue-700 underline">
                besnyib@smccd.edu
              </span>
            </div>
          </div>
        </div>
      </div>
    );

    // Helper for legend (classic style, improved)
    const legendSection = (
      <div className="mt-4 border border-gray-500 rounded bg-white p-3 w-full max-w-xs mx-auto print-legend-box">
        <div className="font-bold text-blue-800 mb-2">Legend</div>
        <div className="flex flex-col gap-2">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <span
                className="inline-block w-5 h-5 rounded-sm border border-gray-400"
                style={{
                  backgroundColor:
                    CATEGORY_COLORS[key as keyof typeof CATEGORY_COLORS],
                }}
              ></span>
              <span className="text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>
    );

    return (
      <div ref={printRef} className="w-full">
        {/* Print-specific styles to fit on one page */}
        <style jsx global>{`
          @media print {
            @page {
              size: A4 portrait;
              margin: 0.5in;
            }
            html,
            body {
              margin: 0 !important;
              padding: 0 !important;
              width: 100vw;
              height: 100vh;
              background: white !important;
            }
            body * {
              box-shadow: none !important;
            }
            .print-area,
            .print-area * {
              visibility: visible !important;
            }
            .print-area {
              position: static !important;
              width: 100vw !important;
              max-width: 7.25in !important;
              margin: 0 auto !important;
              padding: 0 !important;
              page-break-inside: avoid !important;
              margin-top: 0 !important;
              font-size: 10px !important;
            }
            .print-area table {
              table-layout: fixed !important;
              width: 100% !important;
              max-width: 7.25in !important;
            }
            .print-area th,
            .print-area td {
              padding: 2px 3px !important;
              font-size: 10px !important;
              word-break: break-word !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
            }
            /* Add a gap between table and legend to avoid border artifact */
            .print-area .print-legend-box {
              margin-top: 16px !important;
              border: 1.2px solid #64748b !important;
              background: #fff !important;
              padding: 8px 12px !important;
              box-shadow: none !important;
            }
            .print-area .print-legend-box,
            .print-area table {
              border-radius: 0 !important;
            }
            /* Hide dev/test indicators and floating buttons in print */
            .no-print,
            .no-print *,
            .dev-indicator,
            .dev-indicator *,
            .nextjs-portal,
            .nextjs-portal *,
            #__next-route-announcer,
            #__next-route-announcer * {
              display: none !important;
              visibility: hidden !important;
            }
            .print-area .mb-2,
            .print-area .mb-4,
            .print-area .mt-2,
            .print-area .mt-4,
            .print-area .pt-4,
            .print-area .pb-4 {
              margin-top: 0 !important;
              margin-bottom: 0 !important;
              padding-top: 0 !important;
              padding-bottom: 0 !important;
            }
            .print-area .border,
            .print-area .border-gray-700,
            .print-area .border-gray-400,
            .print-area .border-gray-500 {
              border-width: 1.2px !important;
            }
            .print-area .rounded-lg,
            .print-area .rounded,
            .print-area .rounded-sm {
              border-radius: 0 !important;
            }
            .print-area .p-2,
            .print-area .p-3,
            .print-area .p-4 {
              padding: 2px !important;
            }
            .print-area .text-2xl,
            .print-area .text-xl,
            .print-area .text-lg {
              font-size: 1.1em !important;
            }
            .print-area .text-sm,
            .print-area .text-xs {
              font-size: 0.9em !important;
            }
            .print-area .w-5,
            .print-area .h-5 {
              width: 12px !important;
              height: 12px !important;
            }
            .print-area .max-w-2xl {
              max-width: 100vw !important;
            }
            /* Hide UI-only elements (e.g., print/share buttons) */
            .no-print,
            .no-print * {
              display: none !important;
            }
          }
        `}</style>
        <div className="print-area">
          {!(mode === "public" && !showControls) && contactSection}
          {/* Removed repeated doorcard title above the table */}
          {/* <h2 className="text-xl font-bold mb-1 text-center">
            {data.doorcardName}
          </h2>
          <p className="text-sm text-gray-600 mb-6 text-center">
            {data.name} - Office #{data.officeNumber}
          </p> */}
          <div className="w-full border border-gray-700 rounded-lg overflow-hidden mt-2">
            <table
              className="w-full border-collapse"
              style={{ border: "1.5px solid #374151" }}
            >
              <thead>
                <tr>
                  <th
                    className="p-2 border-b border-r border-gray-700 bg-white"
                    style={{ border: "1.5px solid #374151" }}
                  >
                    <span className="sr-only">Time</span>
                  </th>
                  {days.map((day) => (
                    <th
                      key={day}
                      className="p-2 text-center border-b border-r last:border-r-0 border-gray-700 font-medium text-sm bg-white"
                      style={{ border: "1.5px solid #374151" }}
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((slot) => (
                  <tr key={slot.value}>
                    <td
                      className="p-2 text-xs text-gray-600 border-r border-b border-gray-700 bg-white"
                      style={{ border: "1.5px solid #374151" }}
                    >
                      {slot.label}
                    </td>
                    {days.map((day) => {
                      const dayBlocks = timeBlocks.filter(
                        (block) => block.day === day
                      );
                      const activeBlock = dayBlocks.find(
                        (block) =>
                          getTimeInMinutes(block.startTime) ===
                          getTimeInMinutes(slot.value)
                      );

                      if (activeBlock) {
                        const duration = Math.ceil(
                          (getTimeInMinutes(activeBlock.endTime) -
                            getTimeInMinutes(activeBlock.startTime)) /
                            30
                        );
                        const cellStyle = activeBlock.category
                          ? {
                              backgroundColor:
                                CATEGORY_COLORS[
                                  activeBlock.category as keyof typeof CATEGORY_COLORS
                                ],
                              border: "1.5px solid #374151",
                            }
                          : {
                              backgroundColor: "#f0fdf4",
                              border: "1.5px solid #374151",
                            };
                        return (
                          <td
                            key={`${day}-${slot.value}`}
                            rowSpan={duration}
                            className="p-2 text-xs border-r last:border-r-0 border-b border-gray-700 text-center align-middle"
                            style={cellStyle}
                          >
                            <div className="text-sm font-bold">
                              {extractCourseCode(activeBlock.activity)}
                            </div>
                            <div className="text-xs">
                              {formatTimeRange(
                                activeBlock.startTime,
                                activeBlock.endTime
                              )}
                            </div>
                            {activeBlock.location && (
                              <div className="text-xs text-gray-600">
                                {activeBlock.location}
                              </div>
                            )}
                          </td>
                        );
                      }

                      // If this slot is within an existing block, skip cell (rowspan will cover it)
                      const isInExistingBlock = dayBlocks.some(
                        (block) =>
                          getTimeInMinutes(block.startTime) <
                            getTimeInMinutes(slot.value) &&
                          getTimeInMinutes(block.endTime) >
                            getTimeInMinutes(slot.value)
                      );
                      if (!isInExistingBlock) {
                        return (
                          <td
                            key={`${day}-${slot.value}`}
                            className="border-r last:border-r-0 border-b border-gray-700 bg-white"
                            style={{ border: "1.5px solid #374151" }}
                          ></td>
                        );
                      }
                      return null;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {legendSection}
        </div>
      </div>
    );
  };

  // Different renders based on mode
  if (mode === "print") {
    return (
      <>
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-container,
            .print-container * {
              visibility: visible;
            }
            .print-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}</style>
        <div className="print-container">{renderScheduleGrid()}</div>
      </>
    );
  }

  if (mode === "preview") {
    return (
      <div className="bg-white rounded-lg p-6">{renderScheduleGrid()}</div>
    );
  }

  if (mode === "export") {
    return (
      <div className="space-y-6">
        {showControls && (
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
        )}
        <Tabs
          value={viewMode}
          onValueChange={(value) => setViewMode(value as "grid" | "list")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          <TabsContent value="grid">{renderScheduleGrid()}</TabsContent>
          <TabsContent value="list">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-1">{data.doorcardName}</h2>
                <p className="text-sm text-gray-600 mb-6">
                  {data.name} - Office #{data.officeNumber}
                </p>
                <div className="space-y-6">
                  {days.map((day) => {
                    const dayBlocks = timeBlocks.filter(
                      (block) => block.day === day
                    );
                    if (dayBlocks.length === 0) return null;
                    return (
                      <div key={day}>
                        <h3 className="font-medium mb-2">{day}</h3>
                        <div className="space-y-2">
                          {dayBlocks.map((block) => (
                            <div key={block.id} className="text-sm">
                              {formatTimeRange(block.startTime, block.endTime)}:{" "}
                              {block.activity}
                              {block.location && (
                                <span className="text-gray-600 ml-2">
                                  ({block.location})
                                </span>
                              )}
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

  if (mode === "public") {
    return (
      <div className="space-y-6">
        {showControls && (
          <div className="flex justify-between items-center max-w-4xl mx-auto px-4 py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {data.doorcardName}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {data.name}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {data.officeNumber}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {(data as any).term} {(data as any).year}
                </div>
                {(data as any).college && (
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-1" />
                    {(data as any).college}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: data.doorcardName,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
                className="flex items-center"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>

              <Button
                onClick={onPrint || handlePrint}
                size="sm"
                className="flex items-center bg-blue-600 hover:bg-blue-700"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        )}
        {renderScheduleGrid()}
      </div>
    );
  }

  return renderScheduleGrid();
}
