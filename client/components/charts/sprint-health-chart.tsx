"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type SprintHealthChartProps = {
  data: Array<{
    name: string;
    value: number;
    fill: string;
  }>;
  config: ChartConfig;
};

const chartConfig = {
  value: {
    label: "Tasks",
  },
  week1: {
    label: "Week 1",
    color: "var(--chart-1)",
  },
  week2: {
    label: "Week 2",
    color: "var(--chart-2)",
  },
  week3: {
    label: "Week 3",
    color: "var(--chart-3)",
  },
  week4: {
    label: "Week 4",
    color: "var(--chart-4)",
  },
  week5: {
    label: "Week 5",
    color: "var(--chart-5)",
  },
  week6: {
    label: "Week 6",
    color: "var(--chart-1)",
  },
  week7: {
    label: "Week 7",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function SprintHealthChart({ data }: SprintHealthChartProps) {
  return (
    <ChartContainer config={chartConfig}>
      <BarChart data={data} height={150}>
        <CartesianGrid vertical={false} />
        <XAxis
          axisLine={false}
          dataKey="name"
          tick={{ fontSize: 12 }}
          tickLine={false}
          tickMargin={10}
        />
        <ChartTooltip
          content={<ChartTooltipContent hideLabel />}
          cursor={false}
        />
        <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
