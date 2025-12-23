/**
 * Team Contributions Table
 * Shows individual member stats and activity
 */
"use client";

import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, FileText, MessageSquare, Target } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TeamMemberSummary } from "@/lib/helpers/dashboard-computations";

type TeamContributionsTableProps = {
  members: TeamMemberSummary[];
};

export function TeamContributionsTable({
  members,
}: TeamContributionsTableProps) {
  return (
    <Card>
      <CardHeader className="border-border border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Team Contributions</CardTitle>
          <Button asChild size="sm" variant="link">
            <Link href="/settings/team">Manage Team</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-border border-b bg-muted/50">
              <tr>
                <th className="p-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Member
                </th>
                <th className="p-3 text-center font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  <div className="flex items-center justify-center gap-1">
                    <Target className="h-3 w-3" />
                    <span className="hidden sm:inline">Assigned</span>
                  </div>
                </th>
                <th className="p-3 text-center font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  <div className="flex items-center justify-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span className="hidden sm:inline">Completed</span>
                  </div>
                </th>
                <th className="p-3 text-center font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  <div className="flex items-center justify-center gap-1">
                    <FileText className="h-3 w-3" />
                    <span className="hidden sm:inline">Evidence</span>
                  </div>
                </th>
                <th className="p-3 text-center font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  <div className="flex items-center justify-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    <span className="hidden sm:inline">Comments</span>
                  </div>
                </th>
                <th className="p-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Last Active
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.map((member) => {
                const completionRate =
                  member.tasksAssigned > 0
                    ? (member.tasksCompleted / member.tasksAssigned) * 100
                    : 0;

                return (
                  <tr
                    className="transition-colors hover:bg-muted/50"
                    key={member.id}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 font-semibold text-primary text-xs">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5">
                          <p className="font-medium text-sm leading-none">
                            {member.name}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <div className="font-semibold tabular-nums">
                        {member.tasksAssigned}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="font-semibold text-chart-2 tabular-nums">
                          {member.tasksCompleted}
                        </div>
                        {member.tasksAssigned > 0 && (
                          <Badge
                            className="text-[10px]"
                            variant={
                              completionRate >= 75
                                ? "default"
                                : completionRate >= 50
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {Math.round(completionRate)}%
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <div className="font-semibold tabular-nums">
                        {member.evidenceUploaded}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <div className="font-semibold tabular-nums">
                        {member.commentsCount}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-muted-foreground text-xs">
                        {member.lastActivity
                          ? formatDistanceToNow(new Date(member.lastActivity), {
                              addSuffix: true,
                            })
                          : "No activity"}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
