import Link from "next/link";

import { Button } from "@/components/ui/button";

export type FilterKey = "all" | "active" | "planned" | "completed";

type FilterChipsProps = {
  selected: FilterKey;
};

export function FilterChips({ selected }: FilterChipsProps) {
  const items: Array<{ key: FilterKey; label: string; href: string }> = [
    { key: "all", label: "All", href: "/sprints" },
    { key: "active", label: "Active", href: "/sprints?filter=active" },
    { key: "completed", label: "Completed", href: "/sprints?filter=completed" },
    { key: "planned", label: "Planned", href: "/sprints?filter=planned" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const isSelected = item.key === selected;
        return (
          <Button
            asChild
            key={item.key}
            size="sm"
            variant={isSelected ? "default" : "outline"}
          >
            <Link href={item.href}>{item.label}</Link>
          </Button>
        );
      })}
    </div>
  );
}
