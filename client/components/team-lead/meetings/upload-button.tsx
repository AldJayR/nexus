"use client";

import { UploadIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Phase, Sprint } from "@/lib/types";
import { UploadMinutesSheet } from "./upload-minutes-sheet";

type UploadMinutesButtonProps = {
  sprints: Sprint[];
  phases: Phase[];
};

export function UploadMinutesButton({
  sprints,
  phases,
}: UploadMinutesButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <UploadIcon className="opacity-60" size={16} />
        Upload
      </Button>
      <UploadMinutesSheet
        onOpenChange={setOpen}
        open={open}
        phases={phases}
        sprints={sprints}
      />
    </>
  );
}
