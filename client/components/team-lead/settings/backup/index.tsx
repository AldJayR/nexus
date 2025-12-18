"use client";

import { AlertCircle, CheckCircle2, Download } from "lucide-react";
import { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	Frame,
	FrameDescription,
	FrameFooter,
	FrameHeader,
	FramePanel,
	FrameTitle,
} from "@/components/ui/frame";

export default function BackupSettings() {
	const [isExportingProgress, setIsExportingProgress] = useState(false);
	const [isExportingFiles, setIsExportingFiles] = useState(false);
	const [showConfirm, setShowConfirm] = useState<"progress" | "files" | null>(null);
	const [message, setMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	const handleExportProgress = () => {
		setIsExportingProgress(true);
		setMessage(null);
		try {
			// TODO: Implement API call to export project progress as JSON
			// GET /api/v1/backup/progress
			// const response = await fetch("/api/v1/backup/progress");
			// const data = await response.json();
			// const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
			// downloadFile(blob, `nexus-progress-${new Date().toISOString().split("T")[0]}.json`);

			setMessage({
				type: "success",
				text: "Progress export functionality coming soon",
			});
		} catch (error) {
			setMessage({
				type: "error",
				text: error instanceof Error ? error.message : "Failed to export progress",
			});
		} finally {
			setIsExportingProgress(false);
			setShowConfirm(null);
		}
	};

	const handleExportFiles = () => {
		setIsExportingFiles(true);
		setMessage(null);
		try {
			// TODO: Implement API call to export files (Evidence + Meeting Minutes) as ZIP
			// GET /api/v1/backup/files
			// const response = await fetch("/api/v1/backup/files");
			// const blob = await response.blob();
			// downloadFile(blob, `nexus-files-${new Date().toISOString().split("T")[0]}.zip`);

			setMessage({
				type: "success",
				text: "Files export functionality coming soon",
			});
		} catch (error) {
			setMessage({
				type: "error",
				text: error instanceof Error ? error.message : "Failed to export files",
			});
		} finally {
			setIsExportingFiles(false);
			setShowConfirm(null);
		}
	};

	return (
		<>
			<Frame
				id="backup-settings"
				stackedPanels
			>
				<FrameHeader>
					<FrameTitle>Data Backup & Export</FrameTitle>
					<FrameDescription>
						Download backups of your project progress and files. This includes all metadata, tasks,
						deliverables, evidence, and meeting minutes.
					</FrameDescription>
				</FrameHeader>
				<FramePanel className="space-y-6">
					{/* Message Alert */}
					{message && (
						<div
							className={`flex gap-3 rounded-lg p-4 ${
								message.type === "success"
									? "border border-green-200 bg-green-50 text-green-900"
									: "border border-red-200 bg-red-50 text-red-900"
							}`}
						>
							{message.type === "success" ? (
								<CheckCircle2 className="h-5 w-5 shrink-0" />
							) : (
								<AlertCircle className="h-5 w-5 shrink-0" />
							)}
							<p className="text-sm">{message.text}</p>
						</div>
					)}
					{/* Export Options */}
					<h3 className="mb-2 font-semibold text-sm">Export Progress</h3>
					<p className="mb-4 text-muted-foreground text-sm">
						Download a JSON file containing all project metadata, phases, deliverables, sprints,
						tasks, and their current status.
					</p>
					<Button
						className="w-full sm:w-auto"
						disabled={isExportingProgress}
						onClick={() => setShowConfirm("progress")}
						variant="outline"
					>
						{isExportingProgress ? (
							<>Exporting...</>
						) : (
							<>
								<Download className="mr-2 h-4 w-4" />
								Export Progress (JSON)
							</>
						)}
					</Button>
				</FramePanel>
				<FramePanel>
					<h3 className="mb-2 font-semibold text-sm">Export Files</h3>
					<p className="mb-4 text-muted-foreground text-sm">
						Download a ZIP archive containing all uploaded evidence files and meeting minutes PDFs.
					</p>
					<Button
						className="w-full sm:w-auto"
						disabled={isExportingFiles}
						onClick={() => setShowConfirm("files")}
						variant="outline"
					>
						{isExportingFiles ? (
							<>Exporting...</>
						) : (
							<>
								<Download className="mr-2 h-4 w-4" />
								Export Files (ZIP)
							</>
						)}
					</Button>
				</FramePanel>
				<FrameFooter>
					{/* Info Section */}
					<p className="text-muted-foreground text-sm">
						<strong>Note:</strong> These exports include all project data and files. Store them
						securely for archival purposes.
					</p>
				</FrameFooter>
			</Frame>

			{/* Confirmation Dialogs */}
			<AlertDialog
				onOpenChange={(open) => !open && setShowConfirm(null)}
				open={showConfirm !== null}
			>
				<AlertDialogContent>
					<AlertDialogTitle>
						{showConfirm === "progress" ? "Export Project Progress?" : "Export Project Files?"}
					</AlertDialogTitle>
					<AlertDialogDescription>
						{showConfirm === "progress"
							? "This will download a JSON file with all project metadata, phases, deliverables, and task status. The file may be large depending on your project size."
							: "This will download a ZIP archive containing all evidence files and meeting minute PDFs. This may take a few moments for large projects."}
					</AlertDialogDescription>
					<div className="flex justify-end gap-2">
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								if (showConfirm === "progress") {
									handleExportProgress();
								} else {
									handleExportFiles();
								}
							}}
						>
							Export
						</AlertDialogAction>
					</div>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
