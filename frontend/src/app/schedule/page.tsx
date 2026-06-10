import React from "react";
import { getSchedule } from "@/lib/sanity";
import ScheduleClient from "@/components/sections/ScheduleClient";

export const revalidate = 0; // Disable cache for instant update

export default async function SchedulePage() {
  // Fetch both days on the server side (bypassing browser CORS)
  const [day1Schedule, day2Schedule] = await Promise.all([
    getSchedule(1),
    getSchedule(2),
  ]);

  return (
    <ScheduleClient
      initialDay1Schedule={day1Schedule}
      initialDay2Schedule={day2Schedule}
    />
  );
}
