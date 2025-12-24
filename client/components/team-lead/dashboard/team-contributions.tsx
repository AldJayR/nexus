import { formatDistanceToNow } from "date-fns";
import { FramePanel } from "@/components/ui/frame";
import type { TeamMemberSummary } from "@/lib/helpers/dashboard-computations";
import { ChartRadialText } from "./chart";

type TeamContributionsProps = {
  members: TeamMemberSummary[];
};

export function TeamContributions({ members }: TeamContributionsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((member) => {
        const completionRate =
          member.tasksAssigned > 0
            ? (member.tasksCompleted / member.tasksAssigned) * 100
            : 0;

        return (
          <FramePanel className="bg-card" key={member.id}>
            {/* Member Info */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm leading-none">
                    {member.name}
                  </p>
                  <p className="truncate text-muted-foreground text-xs">
                    {member.email}
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3">
                  <div className="text-center">
                    <p className="font-semibold font-sora text-lg">
                      {member.tasksAssigned}
                    </p>
                    <p className="mb-1 text-muted-foreground text-xs">
                      Assigned
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold font-sora text-lg">
                      {member.tasksCompleted}
                    </p>
                    <p className="mb-1 text-muted-foreground text-xs">
                      Completed
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold font-sora text-lg">
                      {member.evidenceUploaded}
                    </p>
                    <p className="mb-1 text-muted-foreground text-xs">
                      Evidence
                    </p>
                  </div>
                </div>
              </div>
              {/* Radial Chart */}
              <div className="shrink-0">
                <ChartRadialText
                  className="h-24 w-24"
                  color="var(--chart-2)"
                  innerRadius={45}
                  label="Done"
                  outerRadius={65}
                  polarRadius={[47, 37]}
                  value={completionRate}
                />
              </div>
            </div>

            {/* Last Activity */}
            {member.lastActivity ? (
              <p className="mt-4 text-muted-foreground text-xs">
                Last activity:{" "}
                <span className="text-foreground">
                  {formatDistanceToNow(new Date(member.lastActivity), {
                    addSuffix: false,
                  })}
                </span>
              </p>
            ) : null}
          </FramePanel>
        );
      })}
    </div>
  );
}
