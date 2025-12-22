"use client";

import { useRef, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Upload } from "lucide-react";

import { uploadMeetingLogAction } from "@/actions/meetings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import type { Phase, Sprint } from "@/lib/types";
import { uploadSchema } from "@/lib/validation";

type UploadInput = z.infer<typeof uploadSchema>;

interface UploadMinutesSheetProps {
	sprints: Sprint[];
	phases: Phase[];
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function UploadMinutesSheet({
	sprints,
	phases,
	open,
	onOpenChange,
}: UploadMinutesSheetProps) {
	const [isPending, startTransition] = useTransition();

	const form = useForm<UploadInput>({
		resolver: zodResolver(uploadSchema),
		defaultValues: {
			title: "",
			date: new Date().toISOString().split("T")[0],
			scope: "sprint",
			entityId: "",
			file: undefined,
		},
	});

	const fileInputRef = useRef<HTMLInputElement>(null);
	const [fileName, setFileName] = useState<string>("");
	const [uploadProgress, setUploadProgress] = useState<number>(0);
	const scope = form.watch("scope");

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			if (file.size > 10 * 1024 * 1024) {
				toast.error("File size must be under 10MB");
				return;
			}
			if (file.type !== "application/pdf") {
				toast.error("Only PDF files are allowed");
				return;
			}
			setFileName(file.name);
			form.setValue("file", file);
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const isValid = await form.trigger();
		if (!isValid) {
			toast.error("Please fix the errors before uploading");
			return;
		}

		const formData = new FormData();
		formData.append("title", form.getValues("title"));
		formData.append("date", form.getValues("date"));
		formData.append("scope", form.getValues("scope"));
		formData.append("entityId", form.getValues("entityId"));
		formData.append("file", form.getValues("file"));

		startTransition(async () => {
			const result = await uploadMeetingLogAction({} as any, formData);
			
			if (result.success) {
				toast.success("Meeting minutes uploaded successfully");
				setTimeout(() => {
					handleOpenChange(false);
				}, 500);
			} else if (result.error) {
				toast.error(result.error);
			}
		});
	};

	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			form.reset();
			setFileName("");
			onOpenChange(false);
		} else {
			onOpenChange(true);
		}
	};

	const selectedEntities = scope === "sprint" ? sprints : phases;

	return (
		<Sheet
			open={open}
			onOpenChange={handleOpenChange}
		>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Upload Meeting Minutes</SheetTitle>
					<SheetDescription>
						Upload meeting minutes and link them to a sprint or phase.
					</SheetDescription>
				</SheetHeader>
				<form
					className="space-y-6 px-6"
					onSubmit={handleSubmit}
				>
					<FieldGroup>
						{/* Title Field */}
						<Controller
							control={form.control}
							name="title"
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor={field.name}>Meeting Title</FieldLabel>
									<Input
										{...field}
										id={field.name}
										placeholder="e.g., Sprint Planning Meeting"
										aria-invalid={fieldState.invalid}
									/>
									{fieldState.invalid ? (
										<FieldError errors={[fieldState.error]} />
									) : null}
								</Field>
							)}
						/>

						{/* Date Field */}
						<Controller
							control={form.control}
							name="date"
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor={field.name}>Meeting Date</FieldLabel>
									<Input
										{...field}
										id={field.name}
										type="date"
										aria-invalid={fieldState.invalid}
									/>
									{fieldState.invalid ? (
										<FieldError errors={[fieldState.error]} />
									) : null}
								</Field>
							)}
						/>

						{/* Scope Selection */}
						<Controller
							control={form.control}
							name="scope"
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="scope">Scope</FieldLabel>
									<Select
										value={field.value}
										onValueChange={field.onChange}
									>
										<SelectTrigger id="scope" aria-invalid={fieldState.invalid}>
											<SelectValue placeholder="Select scope" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="sprint">Sprint</SelectItem>
											<SelectItem value="phase">Phase</SelectItem>
										</SelectContent>
									</Select>
									{fieldState.invalid ? (
										<FieldError errors={[fieldState.error]} />
									) : null}
								</Field>
							)}
						/>

						{/* Entity Selection (Sprint or Phase) */}
						<Controller
							control={form.control}
							name="entityId"
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="entityId">
										{scope === "sprint" ? "Sprint" : "Phase"}
									</FieldLabel>
									<Select
										value={field.value}
										onValueChange={field.onChange}
									>
										<SelectTrigger id="entityId" aria-invalid={fieldState.invalid}>
											<SelectValue
												placeholder={`Select ${scope === "sprint" ? "sprint" : "phase"}`}
											/>
										</SelectTrigger>
										<SelectContent>
											{selectedEntities.map((entity) => (
												<SelectItem
													key={entity.id}
													value={entity.id}
												>
													{scope === "sprint"
														? `Sprint ${(entity as Sprint).number}`
														: (entity as Phase).name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{fieldState.invalid ? (
										<FieldError errors={[fieldState.error]} />
									) : null}
								</Field>
							)}
						/>

						{/* File Upload */}
						<Field>
							<FieldLabel htmlFor="file">Meeting Minutes (PDF)</FieldLabel>
							<div className="rounded-lg border-2 border-dashed border-muted-foreground/30 p-6">
								<input
									id="file"
									accept=".pdf"
									ref={fileInputRef}
									type="file"
									className="hidden"
									onChange={handleFileChange}
								/>
								<button
									className="flex w-full flex-col items-center gap-2 text-center"
									onClick={() => fileInputRef.current?.click()}
									type="button"
								>
									<Upload
										className="text-muted-foreground"
										size={24}
									/>
									<div>
										<p className="font-medium text-sm">{fileName || "Click to upload PDF"}</p>
										<p className="text-muted-foreground text-xs">Max 10MB, PDF only</p>
									</div>
								</button>
							</div>
							{form.formState.errors.file && (
								<FieldError errors={[form.formState.errors.file]} />
							)}
						</Field>
					</FieldGroup>

					<SheetFooter className="px-0">
						<Button
							disabled={isPending}
							type="submit"
						>
							{isPending ? "Uploading..." : "Upload Minutes"}
						</Button>
						<SheetClose asChild>
							<Button
								type="button"
								variant="outline"
							>
								Cancel
							</Button>
						</SheetClose>
					</SheetFooter>
				</form>
			</SheetContent>
		</Sheet>
	);
}
