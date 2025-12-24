/**
 * Category Bar
 * Displays a proportional breakdown of categories as stacked bars
 */

import { cn } from "@/lib/utils";

const COLOR_VARIANTS = {
  emerald: "bg-emerald-500 dark:bg-emerald-600",
  blue: "bg-blue-500 dark:bg-blue-600",
  violet: "bg-violet-500 dark:bg-violet-600",
  gray: "bg-accent",
  destructive: "bg-destructive",
  primary: "bg-primary",
  "chart-1": "bg-chart-1",
  "chart-2": "bg-chart-2",
  "chart-3": "bg-chart-3",
  "chart-4": "bg-chart-4",
  "chart-5": "bg-chart-5",
} as const;

export type ColorVariant = keyof typeof COLOR_VARIANTS;

type CategoryBarProps = {
  values: number[];
  colors: ColorVariant[];
  showLabels?: boolean;
  className?: string;
  tooltips?: string[];
};

export function CategoryBar({
  values,
  colors,
  // showLabels = false,
  className,
  tooltips,
}: CategoryBarProps) {
  const total = values.reduce((sum, val) => sum + val, 0);

  if (total === 0) {
    return (
      <div
        className={cn(
          "flex w-full overflow-hidden rounded-full bg-accent",
          className
        )}
      />
    );
  }

  return (
    <div className={cn("flex w-full gap-0 bg-accent overflow-hidden rounded-full", className)}>
      {values.map((value, index) => {
        const percentage = (value / total) * 100;
        const color = colors[index] || "bg-accent";

        if (percentage === 0) {
          return null;
        }

        return (
          <div
            key={index}
            style={{
              width: `${percentage}%`,
            }}
            title={tooltips?.[index] || `${value}`}
            className={cn(
              "h-full transition-all nth-[3]:rounded-r-full",
              COLOR_VARIANTS[color as ColorVariant]
            )}
          />
        );
      })}
    </div>
  );
}
