"use client";

import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card className="py-4">
      <CardContent>
        <div className="flex items-start justify-between">
          <div>
            <dt className="font-medium text-muted-foreground text-sm">
              Total Meetings
            </dt>
            <dd className="mt-2 font-bold text-3xl text-foreground">{total}</dd>
          </div>
          <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900">
            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
