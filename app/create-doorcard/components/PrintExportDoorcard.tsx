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

const timeSlots = Array.from({ length: 28 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = i % 2 === 0 ? "00" : "30";
  const period = hour >= 12 ? "PM" : "AM";
  const display12Hour = hour % 12 || 12;
  return {
    label: `${display12Hour}:${minute} ${period}`,
    value: `${hour.toString().padStart(2, "0")}:${minute}`,
  };
});

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function PrintExportDoorcard({
  data,
  isPrintView = false,
}: PrintExportDoorcardProps) {
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
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
                )} - ${convertToPST(timeBlock.endTime)}</div><div>${
                  timeBlock.activity
                }</div></td>`;
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
    <Card>
      <CardContent className="p-6" ref={printRef}>
        <h2 className="text-xl font-bold mb-1">{data.doorcardName}</h2>
        <p className="text-sm text-gray-600 mb-6">
          {data.name} - Office #{data.officeNumber}
        </p>

        <table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
          <thead>
            <tr>
              <th className="w-24 p-2 border-b border-r border-gray-200 sr-only">
                Time
              </th>
              {days.map((day) => (
                <th
                  key={day}
                  className="p-2 text-center border-b border-r last:border-r-0 border-gray-200 font-medium text-sm"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot) => (
              <tr key={slot.value}>
                <td className="p-2 text-xs text-gray-600 border-r border-b border-gray-200">
                  {slot.label}
                </td>
                {days.map((day) => {
                  const timeBlock = data.timeBlocks.find(
                    (block) =>
                      block.day === day && block.startTime === slot.value
                  );
                  if (timeBlock) {
                    const startHour = Number.parseInt(
                      timeBlock.startTime.split(":")[0]
                    );
                    const endHour = Number.parseInt(
                      timeBlock.endTime.split(":")[0]
                    );
                    const rowSpan = (endHour - startHour) * 2;
                    return (
                      <td
                        key={`${day}-${slot.value}`}
                        rowSpan={rowSpan}
                        className="bg-green-50 p-2 text-xs border-r last:border-r-0 border-b border-gray-200"
                      >
                        <div>
                          {convertToPST(timeBlock.startTime)} -{" "}
                          {convertToPST(timeBlock.endTime)}
                        </div>
                        <div>{timeBlock.activity}</div>
                        {timeBlock.location && (
                          <div className="text-xs text-gray-600">
                            {timeBlock.location}
                          </div>
                        )}
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
                      <td
                        key={`${day}-${slot.value}`}
                        className="border-r last:border-r-0 border-b border-gray-200"
                      ></td>
                    );
                  }
                  return null;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
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
