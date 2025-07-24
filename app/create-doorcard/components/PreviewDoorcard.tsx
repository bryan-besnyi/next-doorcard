"use client";

import UnifiedDoorcard from "@/components/UnifiedDoorcard";
import { useDoorcardStore } from "@/store/use-doorcard-store";

export default function PreviewDoorcard() {
  const { name, doorcardName, officeNumber, term, year, college, timeBlocks } =
    useDoorcardStore();

  // Convert uppercase day names to lowercase for UnifiedDoorcard
  const convertTimeBlocks = (blocks: typeof timeBlocks) => {
    const dayMap: { [key: string]: string } = {
      MONDAY: "Monday",
      TUESDAY: "Tuesday",
      WEDNESDAY: "Wednesday",
      THURSDAY: "Thursday",
      FRIDAY: "Friday",
      SATURDAY: "Saturday",
      SUNDAY: "Sunday",
    };

    return blocks.map((block) => ({
      ...block,
      day: dayMap[block.day] || block.day,
      location: block.location ?? undefined, // Convert null to undefined
    }));
  };

  return (
    <UnifiedDoorcard
      mode="preview"
      data={{
        name,
        doorcardName,
        officeNumber,
        term,
        year,
        college,
        timeBlocks: convertTimeBlocks(timeBlocks),
      }}
      showWeekendDays={true}
      showControls={false}
    />
  );
}
