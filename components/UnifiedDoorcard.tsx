"use client";

import React from "react";
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
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
// Note: This component now operates independently of the store
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
  FileDown,
} from "lucide-react";

// Unified interfaces
import type { TimeBlock } from "@/types/store/doorcard";

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
  console.log("UnifiedDoorcard received props:", {
    mode,
    data: propData,
    showControls,
    showWeekendDays,
  });

  const [htmlContent, setHtmlContent] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const printRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Parse data if it's a string, otherwise use as is
  const rawData =
    typeof propData === "string" ? JSON.parse(propData) : propData;

  if (!rawData) {
    console.log("UnifiedDoorcard: No data provided");
    return <div className="text-red-500">No doorcard data available</div>;
  }

  // Convert appointments to timeBlocks if needed
  const convertAppointmentsToTimeBlocks = (
    appointments: Appointment[]
  ): TimeBlock[] => {
    console.log("Converting appointments:", appointments);
    const blocks = appointments.map((apt) => ({
      id: apt.id,
      day: apt.dayOfWeek as
        | "MONDAY"
        | "TUESDAY"
        | "WEDNESDAY"
        | "THURSDAY"
        | "FRIDAY"
        | "SATURDAY"
        | "SUNDAY",
      startTime: apt.startTime,
      endTime: apt.endTime,
      activity: apt.name,
      location: apt.location || undefined,
      category: apt.category as
        | "OFFICE_HOURS"
        | "IN_CLASS"
        | "LECTURE"
        | "LAB"
        | "HOURS_BY_ARRANGEMENT"
        | "REFERENCE",
    }));
    console.log("Converted blocks:", blocks);
    return blocks;
  };

  // Use either appointments or timeBlocks, but not both
  const timeBlocks = (
    "appointments" in rawData && Array.isArray(rawData.appointments)
      ? convertAppointmentsToTimeBlocks(rawData.appointments)
      : Array.isArray(rawData.timeBlocks)
      ? rawData.timeBlocks
      : []
  ) as TimeBlock[];

  console.log("Final timeBlocks for rendering:", timeBlocks);

  const data: DoorcardData = {
    ...rawData,
    timeBlocks,
  };

  // Debug log for time slots
  console.log("TIME_SLOTS:", TIME_SLOTS);

  // Helper for time comparison
  const formatTimeForComparison = (time: string) => {
    // Ensure time is in HH:mm format
    const [hours, minutes] = time.split(":");
    // Convert hours to 24-hour format if needed
    let hour = parseInt(hours);
    if (time.toLowerCase().includes("pm") && hour < 12) {
      hour += 12;
    } else if (time.toLowerCase().includes("am") && hour === 12) {
      hour = 0;
    }
    const formattedHours = hour.toString().padStart(2, "0");
    const formattedMinutes = minutes
      ? minutes.split(" ")[0].padStart(2, "0")
      : "00";
    return `${formattedHours}:${formattedMinutes}`;
  };

  // Helper for time slot comparison
  const isTimeSlotMatch = (blockTime: string, slotTime: string) => {
    const formattedBlockTime = formatTimeForComparison(blockTime);
    const formattedSlotTime = slotTime; // TIME_SLOTS are already in 24-hour format
    console.log(
      `Comparing times - Block: ${formattedBlockTime}, Slot: ${formattedSlotTime}`
    );
    return formattedBlockTime === formattedSlotTime;
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
    return isTimeSlotMatch(block.startTime, slotTime);
  };

  const isTimeInBlock = (block: TimeBlock, slotTime: string) => {
    const blockStart = getTimeInMinutes(
      formatTimeForComparison(block.startTime)
    );
    const blockEnd = getTimeInMinutes(formatTimeForComparison(block.endTime));
    const slotTimeMinutes = getTimeInMinutes(slotTime); // TIME_SLOTS are already in 24-hour format
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

    // Add debug logging for time slots
    console.log("TIME_SLOTS:", TIME_SLOTS);
    console.log("Available time blocks:", timeBlocks);

    return (
      <div ref={printRef} className="w-full">
        {/* Always show contact section in preview mode */}
        {(mode === "preview" || !(mode === "public" && !showControls)) &&
          contactSection}
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
              {TIME_SLOTS.map((slot) => {
                console.log(`Processing slot: ${slot.value}`);
                return (
                  <tr key={slot.value}>
                    <td
                      className="p-2 text-xs text-gray-600 border-r border-b border-gray-700 bg-white"
                      style={{ border: "1.5px solid #374151" }}
                    >
                      {slot.label}
                    </td>
                    {days.map((day) => {
                      const dayBlocks = timeBlocks.filter(
                        (block) => block.day === day.toUpperCase()
                      );
                      console.log(`Day ${day} blocks:`, dayBlocks);

                      const activeBlock = dayBlocks.find((block) =>
                        isTimeBlockAtSlot(block, slot.value)
                      );

                      if (activeBlock) {
                        console.log(
                          `Found active block for ${day} at ${slot.value}:`,
                          activeBlock
                        );
                        const duration = Math.ceil(
                          (getTimeInMinutes(
                            formatTimeForComparison(activeBlock.endTime)
                          ) -
                            getTimeInMinutes(
                              formatTimeForComparison(activeBlock.startTime)
                            )) /
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
                      const isInExistingBlock = dayBlocks.some((block) =>
                        isTimeInBlock(block, slot.value)
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
                );
              })}
            </tbody>
          </table>
        </div>
        {legendSection}
      </div>
    );
  };

  // Print-specific styles
  const printStyles = `
    @media print {
      @page {
        size: letter portrait;
        margin: 0.5in;
      }

      body {
        margin: 0;
        padding: 0;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      .print-container {
        width: 100%;
        max-width: 100%;
        margin: 0;
        padding: 0;
      }

      .print-header {
        margin-bottom: 1rem;
      }

      .print-table {
        width: 100%;
        border-collapse: collapse;
        page-break-inside: avoid;
      }

      .print-table th,
      .print-table td {
        border: 1px solid #374151;
        padding: 0.25rem;
      }

      .print-legend {
        margin-top: 1rem;
        page-break-inside: avoid;
      }

      .no-print {
        display: none !important;
      }
    }
  `;

  // Render print layout
  const renderPrintLayout = () => {
    return (
      <div className="print-container">
        <style>{printStyles}</style>
        <div className="print-header">
          <div className="text-2xl font-bold text-red-700 mb-2">
            {data.name}
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div>
                <strong>Semester:</strong> {data.term} {data.year}
              </div>
              <div>
                <strong>Office:</strong> {data.officeNumber}
              </div>
              <div>
                <strong>Phone:</strong> (650) 358-6794
              </div>
            </div>
            <div className="text-right">
              <div>
                <strong>Division:</strong> District Office
              </div>
              <div>
                <strong>Email:</strong> besnyib@smccd.edu
              </div>
            </div>
          </div>
        </div>

        <table className="print-table">
          <thead>
            <tr>
              <th className="w-20" aria-label="Time">
                Time
              </th>
              {days.map((day) => (
                <th key={day} className="text-center font-medium py-2">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((slot) => (
              <tr key={slot.value}>
                <td className="text-xs text-center py-2">{slot.label}</td>
                {days.map((day) => {
                  const dayBlocks = timeBlocks.filter(
                    (block) => block.day === day.toUpperCase()
                  );
                  const activeBlock = dayBlocks.find((block) =>
                    isTimeBlockAtSlot(block, slot.value)
                  );

                  if (activeBlock) {
                    const duration = Math.ceil(
                      (getTimeInMinutes(
                        formatTimeForComparison(activeBlock.endTime)
                      ) -
                        getTimeInMinutes(
                          formatTimeForComparison(activeBlock.startTime)
                        )) /
                        30
                    );
                    const cellStyle = activeBlock.category
                      ? {
                          backgroundColor:
                            CATEGORY_COLORS[
                              activeBlock.category as keyof typeof CATEGORY_COLORS
                            ],
                        }
                      : {};
                    return (
                      <td
                        key={`${day}-${slot.value}`}
                        rowSpan={duration}
                        className="text-center align-middle"
                        style={cellStyle}
                      >
                        <div className="font-bold text-sm">
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

                  const isInExistingBlock = dayBlocks.some((block) =>
                    isTimeInBlock(block, slot.value)
                  );
                  if (!isInExistingBlock) {
                    return <td key={`${day}-${slot.value}`}></td>;
                  }
                  return null;
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="print-legend">
          <div className="font-bold mb-2">Legend</div>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <span
                  className="inline-block w-4 h-4"
                  style={{
                    backgroundColor:
                      CATEGORY_COLORS[key as keyof typeof CATEGORY_COLORS],
                  }}
                ></span>
                <span className="text-xs">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Different renders based on mode
  if (mode === "print") {
    return renderPrintLayout();
  }

  if (mode === "preview") {
    const generatePDF = async () => {
      if (!pdfRef.current) return;

      // Create a clean version of the schedule for PDF
      const pdfContent = pdfRef.current.cloneNode(true) as HTMLElement;
      pdfContent.style.width = "1100px"; // Fixed width for better quality
      pdfContent.style.padding = "40px";
      document.body.appendChild(pdfContent);

      try {
        const canvas = await html2canvas(pdfContent, {
          scale: 2, // Higher resolution
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
        });

        document.body.removeChild(pdfContent);

        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const pdf = new jsPDF({
          orientation: imgHeight > imgWidth ? "portrait" : "landscape",
          unit: "mm",
        });

        pdf.addImage(
          canvas.toDataURL("image/png"),
          "PNG",
          0,
          0,
          imgWidth,
          imgHeight
        );

        pdf.save(`${data.name}-schedule.pdf`);
      } catch (error) {
        console.error("Error generating PDF:", error);
        toast({
          title: "Error",
          description: "Failed to generate PDF. Please try again.",
          variant: "destructive",
        });
      }
    };

    return (
      <div className="bg-white rounded-lg p-6">
        <div ref={pdfRef}>
          {/* PDF-optimized layout */}
          <div className="pdf-content p-8 bg-white">
            <div className="mb-6 border-b pb-4">
              <h1 className="text-2xl font-bold text-red-700 mb-2">
                {data.name}
              </h1>
              <div className="grid grid-cols-2 gap-x-8 text-sm">
                <div className="space-y-1">
                  <div>
                    <span className="font-semibold">Semester:</span> {data.term}{" "}
                    {data.year}
                  </div>
                  <div>
                    <span className="font-semibold">Office:</span>{" "}
                    {data.officeNumber}
                  </div>
                  <div>
                    <span className="font-semibold">Phone:</span> (650) 358-6794
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <div>
                    <span className="font-semibold">Division:</span> District
                    Office
                  </div>
                  <div>
                    <span className="font-semibold">Email:</span>{" "}
                    besnyib@smccd.edu
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full border-collapse bg-white">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="w-20 p-2 text-left text-sm font-semibold text-gray-900">
                      Time
                    </th>
                    {days.map((day) => (
                      <th
                        key={day}
                        className="p-2 text-center text-sm font-semibold text-gray-900"
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map((slot) => (
                    <tr key={slot.value} className="border-b border-gray-200">
                      <td className="p-2 text-sm text-gray-500 text-center">
                        {slot.label}
                      </td>
                      {days.map((day) => {
                        const dayBlocks = timeBlocks.filter(
                          (block) => block.day === day.toUpperCase()
                        );
                        const activeBlock = dayBlocks.find((block) =>
                          isTimeBlockAtSlot(block, slot.value)
                        );

                        if (activeBlock) {
                          const duration = Math.ceil(
                            (getTimeInMinutes(
                              formatTimeForComparison(activeBlock.endTime)
                            ) -
                              getTimeInMinutes(
                                formatTimeForComparison(activeBlock.startTime)
                              )) /
                              30
                          );
                          return (
                            <td
                              key={`${day}-${slot.value}`}
                              rowSpan={duration}
                              className="p-2 text-center"
                              style={{
                                backgroundColor:
                                  CATEGORY_COLORS[
                                    activeBlock.category as keyof typeof CATEGORY_COLORS
                                  ],
                              }}
                            >
                              <div className="font-medium text-sm">
                                {extractCourseCode(activeBlock.activity)}
                              </div>
                              <div className="text-xs text-gray-600">
                                {formatTimeRange(
                                  activeBlock.startTime,
                                  activeBlock.endTime
                                )}
                              </div>
                              {activeBlock.location && (
                                <div className="text-xs text-gray-500">
                                  {activeBlock.location}
                                </div>
                              )}
                            </td>
                          );
                        }

                        const isInExistingBlock = dayBlocks.some((block) =>
                          isTimeInBlock(block, slot.value)
                        );
                        if (!isInExistingBlock) {
                          return (
                            <td
                              key={`${day}-${slot.value}`}
                              className="border-r border-gray-200"
                            />
                          );
                        }
                        return null;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 border-t pt-4">
              <h2 className="text-sm font-semibold mb-2">Legend</h2>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span
                      className="h-4 w-4 rounded"
                      style={{
                        backgroundColor:
                          CATEGORY_COLORS[key as keyof typeof CATEGORY_COLORS],
                      }}
                    />
                    <span className="text-sm text-gray-600">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex justify-end gap-3">
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button
            onClick={generatePDF}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <FileDown className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>
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
