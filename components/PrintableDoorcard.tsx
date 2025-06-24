import type React from "react";
import { convertToPST } from "@/lib/utils";

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
  HOURS_BY_ARRANGEMENT: "Hours by Arrangement",
  REFERENCE: "Reference",
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

interface Doorcard {
  id: string;
  name: string;
  doorcardName: string;
  officeNumber: string;
  term: string;
  year: string;
  college?: string;
  isActive: boolean;
  appointments: Appointment[];
}

interface PrintableDoorcardProps {
  doorcard?: Doorcard;
  name?: string;
  doorcardName?: string;
  officeNumber?: string;
  timeBlocks?: TimeBlock[];
  onBack?: () => void;
  onPrint?: () => void;
}

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const timeSlots = Array.from({ length: 28 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${minute}`;
});

const PrintableDoorcard: React.FC<PrintableDoorcardProps> = ({
  doorcard,
  name,
  doorcardName,
  officeNumber,
  timeBlocks,
  onBack,
  onPrint,
}) => {
  // Use doorcard data if provided, otherwise fall back to individual props
  const displayName = doorcard?.doorcardName || doorcardName || "";
  const facultyName = doorcard?.name || name || "";
  const office = doorcard?.officeNumber || officeNumber || "";

  // Convert appointments to timeBlocks format if doorcard is provided
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

  const blocks = doorcard?.appointments
    ? convertAppointmentsToTimeBlocks(doorcard.appointments)
    : timeBlocks || [];

  return (
    <div className="w-full">
      <style jsx>{`
        @media print {
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .printable-doorcard {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0.5in !important;
            font-family: Arial, sans-serif !important;
            background: white !important;
          }
          .printable-doorcard h2 {
            font-size: 18px !important;
            margin-bottom: 8px !important;
            font-weight: bold !important;
            text-align: center !important;
          }
          .printable-doorcard p {
            font-size: 14px !important;
            margin-bottom: 12px !important;
            text-align: center !important;
          }
          .printable-doorcard table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 10px !important;
            table-layout: fixed !important;
            margin: 0 !important;
            background: white !important;
          }
          .printable-doorcard th {
            padding: 4px 2px !important;
            font-size: 10px !important;
            background-color: white !important;
            border: 1px solid #000 !important;
            text-align: center !important;
            font-weight: bold !important;
            line-height: 1.2 !important;
          }
          .printable-doorcard td {
            padding: 3px !important;
            font-size: 9px !important;
            border: 1px solid #000 !important;
            height: 24px !important;
            vertical-align: top !important;
            line-height: 1.1 !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .printable-doorcard td:first-child {
            background: white !important;
          }
          .printable-doorcard th:first-child,
          .printable-doorcard td:first-child {
            width: 12% !important;
            font-size: 8px !important;
            text-align: center !important;
          }
          .printable-doorcard th:nth-child(n + 2),
          .printable-doorcard td:nth-child(n + 2) {
            width: 12.6% !important;
          }
          .printable-doorcard .text-sm {
            font-size: 8px !important;
            font-weight: bold !important;
            line-height: 1.1 !important;
          }
          .printable-doorcard .text-xs {
            font-size: 7px !important;
            line-height: 1 !important;
            margin-top: 1px !important;
          }
          .printable-doorcard .bg-gray-100 {
            background-color: white !important;
          }
          .printable-doorcard .legend {
            margin-top: 6px !important;
            font-size: 6px !important;
            page-break-inside: avoid !important;
          }
          .printable-doorcard .legend h3 {
            font-size: 7px !important;
            margin-bottom: 2px !important;
            font-weight: bold !important;
          }
          .printable-doorcard .legend-categories {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 8px !important;
            margin-bottom: 3px !important;
          }
          .printable-doorcard .legend-item {
            display: flex !important;
            align-items: center !important;
            margin-bottom: 0 !important;
          }
          .printable-doorcard .legend-box {
            width: 8px !important;
            height: 8px !important;
            margin-right: 2px !important;
            border: 1px solid #000 !important;
            flex-shrink: 0 !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .printable-doorcard .legend-notes {
            margin-top: 2px !important;
            font-size: 5px !important;
            line-height: 1.1 !important;
          }
          .printable-doorcard .legend-notes p {
            margin-bottom: 1px !important;
            text-align: left !important;
          }
        }

        @media screen {
          .printable-doorcard {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 20px !important;
            background: white !important;
          }
          .printable-doorcard h2 {
            font-size: 24px !important;
            margin-bottom: 8px !important;
            font-weight: bold !important;
            text-align: center !important;
          }
          .printable-doorcard p {
            font-size: 16px !important;
            margin-bottom: 16px !important;
            text-align: center !important;
          }
          .printable-doorcard table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 12px !important;
            table-layout: fixed !important;
            margin: 0 !important;
          }
          .printable-doorcard th {
            padding: 8px 4px !important;
            font-size: 12px !important;
            background-color: #f9f9f9 !important;
            border: 1px solid #ccc !important;
            text-align: center !important;
            font-weight: bold !important;
          }
          .printable-doorcard td {
            padding: 6px !important;
            font-size: 11px !important;
            border: 1px solid #ccc !important;
            height: 32px !important;
            vertical-align: top !important;
          }
          .printable-doorcard th:first-child,
          .printable-doorcard td:first-child {
            width: 12% !important;
            font-size: 10px !important;
            text-align: center !important;
          }
          .printable-doorcard th:nth-child(n + 2),
          .printable-doorcard td:nth-child(n + 2) {
            width: 12.6% !important;
          }
          .printable-doorcard .text-sm {
            font-size: 11px !important;
            font-weight: bold !important;
          }
          .printable-doorcard .text-xs {
            font-size: 9px !important;
            margin-top: 2px !important;
          }
          .printable-doorcard .bg-gray-100 {
            background-color: #f5f5f5 !important;
          }
        }
      `}</style>

      <div className="printable-doorcard">
        {onBack && (
          <div className="mb-4 flex justify-between items-center print:hidden">
            <button
              onClick={onBack}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to View
            </button>
            {onPrint && (
              <button
                onClick={() => {
                  window.print();
                  onPrint();
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Print Doorcard
              </button>
            )}
          </div>
        )}

        <h2>{displayName}</h2>
        <p>
          {facultyName} - Office #{office}
        </p>

        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">Time</th>
              {days.map((day) => (
                <th key={day} className="border border-gray-300 p-2">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((timeSlot) => (
              <tr key={timeSlot}>
                <td className="border border-gray-300 p-2 text-sm">
                  {convertToPST(timeSlot)}
                </td>
                {days.map((day) => {
                  const block = blocks.find(
                    (b) => b.day === day && b.startTime === timeSlot
                  );
                  if (block) {
                    const duration =
                      timeSlots.indexOf(block.endTime) -
                      timeSlots.indexOf(block.startTime);
                    return (
                      <td
                        key={day}
                        className="border border-gray-300 p-2"
                        rowSpan={duration}
                        style={{
                          backgroundColor:
                            categoryColors[
                              (block.category ||
                                "OFFICE_HOURS") as keyof typeof categoryColors
                            ] || categoryColors.OFFICE_HOURS,
                        }}
                      >
                        <div className="text-sm font-semibold">
                          {extractCourseCode(block.activity)}
                        </div>
                        <div className="text-xs">
                          {convertToPST(block.startTime)} -{" "}
                          {convertToPST(block.endTime)}
                        </div>
                        {block.location && (
                          <div className="text-xs text-gray-600">
                            {block.location}
                          </div>
                        )}
                      </td>
                    );
                  }
                  const isWithinBlock = blocks.some(
                    (b) =>
                      b.day === day &&
                      timeSlot >= b.startTime &&
                      timeSlot < b.endTime
                  );
                  return isWithinBlock ? null : (
                    <td key={day} className="border border-gray-300"></td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Legend */}
        <div className="legend mt-4 text-sm">
          <h3 className="font-bold mb-2">Legend:</h3>
          <div className="legend-categories flex flex-wrap gap-3">
            {Object.entries(categoryLabels).map(([key, label]) => (
              <div key={key} className="legend-item flex items-center">
                <div
                  className="legend-box w-4 h-4 border border-gray-300 mr-2"
                  style={{
                    backgroundColor:
                      categoryColors[key as keyof typeof categoryColors],
                  }}
                ></div>
                <span className="text-xs">{label}</span>
              </div>
            ))}
            <div className="legend-item flex items-center">
              <div className="legend-box w-4 h-4 border border-gray-300 mr-2 bg-white"></div>
              <span className="text-xs">Available Time</span>
            </div>
          </div>
          <div className="legend-notes mt-2 text-xs text-gray-600">
            <p>
              <strong>Time:</strong> Pacific Standard Time (PST) •{" "}
              <strong>Codes:</strong> Shortened for readability •{" "}
              <strong>Location:</strong> Room/building codes when available
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintableDoorcard;
