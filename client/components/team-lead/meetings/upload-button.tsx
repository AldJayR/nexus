"use client";

import { useState } from "react";
import { UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadMinutesSheet } from "./upload-minutes-sheet";
import type { Phase, Sprint } from "@/lib/types";

interface UploadMinutesButtonProps {
	sprints: Sprint[];
	phases: Phase[];
}

export function UploadMinutesButton({ sprints, phases }: UploadMinutesButtonProps) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button onClick={() => setOpen(true)}>
				<UploadIcon className="opacity-60" size={16} />
				Upload
			</Button>
			<UploadMinutesSheet
				open={open}
				onOpenChange={setOpen}
				phases={phases}
				sprints={sprints}
			/>
		</>
	);
}
