"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { MeetingLog } from "@/lib/types";
import { calculateTotalMeetings } from "@/lib/helpers/meeting-analytics";
import { FileText } from "lucide-react";

interface TotalMeetingsCardProps {
  logs: MeetingLog[];
}

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
            <dt className="text-sm font-medium text-muted-foreground">
              Total Meetings
            </dt>
            <dd className="text-3xl font-bold text-foreground mt-2">
              {total}
            </dd>
          </div>
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
