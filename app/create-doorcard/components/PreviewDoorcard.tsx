"use client";

import { useDoorcardStore } from "@/store/use-doorcard-store";

interface TimeBlock {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  activity: string;
}

const timeSlots = Array.from({ length: 28 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = i % 2 === 0 ? "00" : "30";
  const time = `${hour.toString().padStart(2, "0")}:${minute}`;
  return {
    label: time,
    value: time,
    hour,
    minute: minute === "00" ? 0 : 30,
  };
});

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function PreviewDoorcard() {
  const { name, doorcardName, officeNumber, timeBlocks } = useDoorcardStore();

  const getActivityStyle = (activity: string) => {
    switch (activity) {
      case "Office Hours":
        return "bg-green-50";
      case "Class":
        return "bg-blue-50";
      case "Lab Time":
        return "bg-yellow-50";
      case "TBA":
        return "bg-gray-50";
      default:
        return "bg-gray-50";
    }
  };

  const formatTimeRange = (start: string, end: string) => {
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(":").map(Number);
      const period = hours >= 12 ? "PM" : "AM";
      const hour12 = hours % 12 || 12;
      return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
    };
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  const getTimeInMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const isTimeBlockAtSlot = (block: TimeBlock, slotTime: string) => {
    const blockStart = getTimeInMinutes(block.startTime);
    const slotTimeMinutes = getTimeInMinutes(slotTime);
    return blockStart === slotTimeMinutes;
  };

  const isTimeInBlock = (block: TimeBlock, slotTime: string) => {
    const blockStart = getTimeInMinutes(block.startTime);
    const blockEnd = getTimeInMinutes(block.endTime);
    const slotTimeMinutes = getTimeInMinutes(slotTime);
    return slotTimeMinutes >= blockStart && slotTimeMinutes < blockEnd;
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-xl font-bold mb-1">{doorcardName}</h2>
      <p className="text-sm text-gray-600 mb-6">
        {name} - Office #{officeNumber}
      </p>

      <div className="w-full border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 border-b border-r border-gray-200">
                <span className="sr-only">Time</span>
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
                  const dayBlocks = timeBlocks.filter(
                    (block) => block.day === day
                  );
                  const activeBlock = dayBlocks.find((block) =>
                    isTimeBlockAtSlot(block, slot.value)
                  );

                  if (activeBlock) {
                    const duration = Math.ceil(
                      (getTimeInMinutes(activeBlock.endTime) -
                        getTimeInMinutes(activeBlock.startTime)) /
                        30
                    );

                    return (
                      <td
                        key={`${day}-${slot.value}`}
                        rowSpan={duration}
                        className={`${getActivityStyle(
                          activeBlock.activity
                        )} p-2 text-xs border-r last:border-r-0 border-b border-gray-200`}
                      >
                        <div>
                          {formatTimeRange(
                            activeBlock.startTime,
                            activeBlock.endTime
                          )}
                        </div>
                        <div>{activeBlock.activity}</div>
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
      </div>
    </div>
  );
}
