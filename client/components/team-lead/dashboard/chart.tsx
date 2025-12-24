"use client";

import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import { type ChartConfig, ChartContainer } from "@/components/ui/chart";

export const description = "A radial chart with text";

type ChartRadialTextProps = {
  value: number;
  label: string;
  color?: string;
  className?: string;
  innerRadius?: number;
  outerRadius?: number;
  polarRadius?: [number, number];
};

export function ChartRadialText({
  value,
  label,
  color = "var(--chart-1)",
  className = "mx-auto aspect-square max-h-62",
  innerRadius = 80,
  outerRadius = 110,
  polarRadius = [86, 74],
}: ChartRadialTextProps) {
  // const value = 100; // test value
  const chartData = [{ name: "value", value, fill: color }];

  const chartConfig = {
    value: {
      label,
      color,
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer className={className} config={chartConfig}>
      <RadialBarChart
        data={chartData}
        endAngle={chartData[0].value}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={0}
      >
        <PolarGrid
          className="first:fill-muted last:fill-card"
          gridType="circle"
          polarRadius={polarRadius}
          radialLines={false}
          stroke="none"
        />
        <RadialBar
          cornerRadius={10}
          // background
          dataKey="value"
        />
        <PolarRadiusAxis axisLine={false} tick={false} tickLine={false}>
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    dominantBaseline="middle"
                    textAnchor="middle"
                    x={viewBox.cx}
                    y={viewBox.cy}
                  >
                    <tspan
                      className="fill-foreground font-bold font-sora text-xl"
                      x={viewBox.cx}
                      y={viewBox.cy}
                    >
                      {Math.round(value)}%
                    </tspan>
                    <tspan
                      className="fill-muted-foreground text-xs"
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 24}
                    >
                      {label}
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </PolarRadiusAxis>
      </RadialBarChart>
    </ChartContainer>
  );
}
