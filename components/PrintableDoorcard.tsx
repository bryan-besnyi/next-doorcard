import type React from "react"
import { convertToPST } from "@/lib/utils"

interface TimeBlock {
  id: string
  day: string
  startTime: string
  endTime: string
  activity: string
}

interface PrintableDoorcardProps {
  name: string
  doorcardName: string
  officeNumber: string
  timeBlocks: TimeBlock[]
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const timeSlots = Array.from({ length: 28 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8
  const minute = i % 2 === 0 ? "00" : "30"
  return `${hour.toString().padStart(2, "0")}:${minute}`
})

const PrintableDoorcard: React.FC<PrintableDoorcardProps> = ({ name, doorcardName, officeNumber, timeBlocks }) => {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-2">{doorcardName}</h2>
      <p className="text-xl mb-6">
        {name} - Office #{officeNumber}
      </p>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2"></th>
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
              <td className="border border-gray-300 p-2 text-sm">{convertToPST(timeSlot)}</td>
              {days.map((day) => {
                const block = timeBlocks.find((b) => b.day === day && b.startTime === timeSlot)
                if (block) {
                  const duration = timeSlots.indexOf(block.endTime) - timeSlots.indexOf(block.startTime)
                  return (
                    <td key={day} className="border border-gray-300 p-2 bg-gray-100" rowSpan={duration}>
                      <div className="text-sm font-semibold">{block.activity}</div>
                      <div className="text-xs">
                        {convertToPST(block.startTime)} - {convertToPST(block.endTime)}
                      </div>
                    </td>
                  )
                }
                const isWithinBlock = timeBlocks.some(
                  (b) => b.day === day && timeSlot >= b.startTime && timeSlot < b.endTime,
                )
                return isWithinBlock ? null : <td key={day} className="border border-gray-300"></td>
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default PrintableDoorcard

