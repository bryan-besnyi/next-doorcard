import type React from "react";
import { convertToPST } from "@/lib/utils";

interface TimeBlock {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  activity: string;
  location?: string;
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

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
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
    }));
  };

  const blocks = doorcard?.appointments
    ? convertAppointmentsToTimeBlocks(doorcard.appointments)
    : timeBlocks || [];

  return (
    <div className="p-8 max-w-4xl mx-auto">
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

      <h2 className="text-3xl font-bold mb-2">{displayName}</h2>
      <p className="text-xl mb-6">
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
                      className="border border-gray-300 p-2 bg-gray-100"
                      rowSpan={duration}
                    >
                      <div className="text-sm font-semibold">
                        {block.activity}
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
    </div>
  );
};

export default PrintableDoorcard;
