"use client";

import { FileText } from "lucide-react";
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { calculateTotalMeetings } from "@/lib/helpers/meeting-analytics";
import type { MeetingLog } from "@/lib/types";

type TotalMeetingsCardProps = {
  logs: MeetingLog[];
};

/**
 * TotalMeetingsCard Component
 *
 * Displays the total count of meeting documents uploaded
 *
 * @param logs - Array of all meeting logs
 */
export default function TotalMeetingsCard({ logs }: TotalMeetingsCardProps) {
  const total = calculateTotalMeetings(logs);

  return (
    <Frame>
      <FrameHeader className="flex-row items-center gap-2">
        <div className="rounded-md bg-linear-120 from-blue-500 to-blue-400 p-2 shadow-sm dark:from-blue-800 dark:to-blue-700">
          <FileText className="size-4 text-white" />
        </div>
        <div className="space-y-0">
          <FrameTitle className="text-sm">Total</FrameTitle>
          <FrameDescription className="text-xs">Meetings</FrameDescription>
        </div>
      </FrameHeader>
      <FramePanel>
        <p className="font-bold font-sora text-3xl">{total}</p>
      </FramePanel>
    </Frame>
  );
}
