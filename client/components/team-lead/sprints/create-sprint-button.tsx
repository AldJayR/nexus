"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { CreateSprintDialog } from "./create-sprint-dialog";

export function CreateSprintButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusIcon />
        Create Sprint
      </Button>
      <CreateSprintDialog onOpenChange={setOpen} open={open} />
    </>
  );
}
