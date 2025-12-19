import BackupSettings from "@/components/team-lead/settings/backup";
import { Separator } from "@/components/ui/separator";

export default function BackupPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-bold text-2xl">Backups</h2>
        <p className="text-muted-foreground">Manage your backups</p>
      </div>
      <Separator />
      <BackupSettings />
    </div>
  );
}
