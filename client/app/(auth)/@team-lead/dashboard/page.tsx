import {
  AtSign,
  Ban,
  CheckCircle2,
  Droplet,
  Plus,
  RefreshCw,
  Rocket,
  Timer,
  TrendingUp,
} from "lucide-react";
import { SprintHealthChart } from "@/components/charts/sprint-health-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Mock data for phases
const phasesData = [
  {
    id: "waterfall",
    title: "Waterfall",
    description: "Planning and Requirements",
    icon: Droplet,
    completion: 100,
    bgColor: "bg-chart-2/10",
    textColor: "text-chart-2",
    isCurrent: false,
  },
  {
    id: "scrum",
    title: "Scrum",
    description: "Iterative Development",
    icon: RefreshCw,
    completion: 70,
    bgColor: "bg-primary/10",
    textColor: "text-primary",
    isCurrent: true,
  },
  {
    id: "fall",
    title: "Fall",
    description: "Testing and Deployment",
    icon: Rocket,
    completion: 10,
    bgColor: "bg-chart-5/10",
    textColor: "text-chart-5",
    isCurrent: false,
  },
];

// Mock data for activities
const activitiesData = [
  {
    id: "blocker",
    type: "ban",
    title: "Database connection blocked by firewall rules",
    status: "High Priority • 20 min ago",
    statusType: "destructive",
    actionText: "Open",
  },
  {
    id: "mention",
    type: "mention",
    title: "@Sarah commented on Wireframes",
    status: "Discussion • 1h ago",
    statusType: "default",
  },
  {
    id: "review",
    type: "check",
    title: "Review API Documentation",
    status: "Assigned to you • 3h ago",
    statusType: "default",
    actionText: "Start",
  },
];

// Chart data
const chartData = [
  { name: "Week 1", value: 80, fill: "var(--color-week1)" },
  { name: "Week 2", value: 70, fill: "var(--color-week2)" },
  { name: "Week 3", value: 65, fill: "var(--color-week3)" },
  { name: "Week 4", value: 40, fill: "var(--color-week4)" },
  { name: "Week 5", value: 30, fill: "var(--color-week5)" },
  { name: "Week 6", value: 20, fill: "var(--color-week6)" },
  { name: "Week 7", value: 10, fill: "var(--color-week7)" },
];

const activityIconMap = {
  ban: { icon: Ban, bg: "bg-destructive/10", color: "text-destructive" },
  mention: { icon: AtSign, bg: "bg-primary/10", color: "text-primary" },
  check: { icon: CheckCircle2, bg: "bg-chart-2/10", color: "text-chart-2" },
};

export default function DashboardPage() {
  return (
    <main className="min-w-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-300 flex-col gap-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="font-black text-3xl tracking-tight md:text-4xl">
              Team Alpha
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
              <span className="text-sm">Capstone 2024</span>
              <span className="text-muted-foreground/50">•</span>
              <span className="font-medium text-primary text-sm">
                Sprint 4 Active
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button className="gap-2" variant="default">
              <Plus className="h-4 w-4" />
              Create Task
            </Button>
            <Button className="gap-2" variant="outline">
              <Timer className="h-4 w-4" />
              Log Hours
            </Button>
            <Button className="gap-2" variant="destructive">
              <Ban className="h-4 w-4" />
              Blocker
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                Total Project Completion
              </p>
              <div className="flex flex-wrap items-baseline gap-2">
                <div className="font-bold text-4xl">65%</div>
                <div className="flex items-center gap-1 font-medium text-primary text-sm">
                  <TrendingUp className="h-4 w-4" />
                  +5% this week
                </div>
              </div>
            </div>

            <div className="hidden text-right sm:block">
              <p className="font-medium">On Track</p>
              <p className="text-muted-foreground text-sm">
                Target: 70% by Friday
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between font-semibold text-muted-foreground text-xs uppercase tracking-wider">
              <span>Start</span>
              <span>Deadline</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-[65%] rounded-full bg-primary" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {phasesData.map((phase) => (
            <Card
              className={
                phase.isCurrent ? "relative ring-1 ring-primary/20" : "relative"
              }
              key={phase.id}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-lg ${phase.bgColor} p-2 ${phase.textColor}`}
                  >
                    <phase.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle>{phase.title}</CardTitle>
                    <CardDescription>{phase.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`font-semibold text-sm ${phase.textColor}`}>
                    {(() => {
                      if (phase.isCurrent) {
                        return "Active Phase";
                      }
                      if (phase.completion === 100) {
                        return "Completed";
                      }
                      return "Pending";
                    })()}
                  </span>
                  <span className="font-bold text-sm">{phase.completion}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${phase.textColor.replace("text-", "bg-")}`}
                    style={{ width: `${phase.completion}%` }}
                  />
                </div>
              </CardContent>
              <CardFooter className="border-border border-t">
                <p className="text-muted-foreground text-xs">
                  {phase.id === "waterfall" && "All requirements signed off."}
                  {phase.id === "scrum" && (
                    <span className="flex items-center gap-2">
                      Sprint 4 in progress
                      <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                    </span>
                  )}
                  {phase.id === "fall" && "Final report draft started."}
                </p>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 pb-8 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-border border-b">
              <CardTitle>Sprint Health</CardTitle>
              <Badge variant="default">Sprint 4</Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 items-center text-center">
                <div className="space-y-1">
                  <div className="font-black text-3xl">12</div>
                  <div className="text-muted-foreground text-xs uppercase tracking-wide">
                    Tasks Done
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-black text-3xl text-muted-foreground">
                    8
                  </div>
                  <div className="text-muted-foreground text-xs uppercase tracking-wide">
                    Remaining
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-black text-3xl text-destructive">1</div>
                  <div className="text-destructive text-xs uppercase tracking-wide">
                    Blocked
                  </div>
                </div>
              </div>

              <SprintHealthChart config={{}} data={chartData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-border border-b">
              <CardTitle>Activity Feed</CardTitle>
              <Button className="h-auto px-0" variant="link">
                View All
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col">
                {activitiesData.map((activity, index) => {
                  const iconConfig =
                    activityIconMap[
                      activity.type as keyof typeof activityIconMap
                    ];
                  const IconComponent = iconConfig.icon;
                  return (
                    <div
                      className={`flex gap-4 p-4 transition-colors hover:bg-muted/50 ${
                        index < activitiesData.length - 1
                          ? "border-border border-b"
                          : ""
                      }`}
                      key={activity.id}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconConfig.bg} ${iconConfig.color}`}
                      >
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex flex-1 flex-col gap-1">
                        <p className="font-medium text-sm leading-tight">
                          {activity.title}
                        </p>
                        <p
                          className={`text-xs ${
                            activity.statusType === "destructive"
                              ? "font-medium text-destructive"
                              : "text-muted-foreground"
                          }`}
                        >
                          {activity.status}
                        </p>
                      </div>
                      {activity.actionText ? (
                        <Button className="gap-2" size="sm" variant="outline">
                          <IconComponent className="h-4 w-4" />
                          {activity.actionText}
                        </Button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
