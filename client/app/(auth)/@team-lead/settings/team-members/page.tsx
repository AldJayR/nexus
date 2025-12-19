import TeamMembers from "@/components/team-lead/settings/team-members";
import { Separator } from "@/components/ui/separator";

export default function TeamMembersPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-bold text-2xl">Team Members</h2>
        <p className="text-muted-foreground">
          Manage your team members and invitations
        </p>
      </div>
      <Separator />
      <TeamMembers />
    </div>
  );
}
