import { LucideSettings2, Server, UsersIcon } from "lucide-react";
import ThemePicker from "@/components/shared/settings/theme-picker";
import TeamMembers from "@/components/team-lead/settings/team-members";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Settings() {
  return (
    <div>
      {/* tabs for backup, config, and team members */}
      <Tabs defaultValue="team-members">
        <ScrollArea>
          <TabsList className="mb-3 h-auto gap-2 rounded-none border-b bg-transparent px-0 py-1 text-foreground">
            <TabsTrigger
              className="relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:hover:bg-accent data-[state=active]:after:bg-primary"
              value="team-members"
            >
              <UsersIcon aria-hidden="true" className="opacity-60" size={16} />
              Team Members
            </TabsTrigger>
            <TabsTrigger
              className="relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:hover:bg-accent data-[state=active]:after:bg-primary"
              value="project-configurations"
            >
              <LucideSettings2 aria-hidden="true" className="opacity-60" size={16} />
              Project Configurations
            </TabsTrigger>
            <TabsTrigger
              className="relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:hover:bg-accent data-[state=active]:after:bg-primary"
              value="backup"
            >
              <Server aria-hidden="true" className="opacity-60" size={16} />
              Backup
            </TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <div className="grow">
          <TabsContent className="space-y-8" value="team-members">
            <div>
              <h2 className="font-bold text-2xl">Team Members</h2>
              <p className="text-muted-foreground">
                Manage your team members and invitations
              </p>
            </div>
            <Separator />
            <TeamMembers />
          </TabsContent>
          <TabsContent className="space-y-8" value="project-configurations">
            <div>
              <h2 className="font-bold text-2xl">Project Configurations</h2>
              <p className="text-muted-foreground">
                Manage your project configurations
              </p>
            </div>
            <Separator />
            <ThemePicker />
          </TabsContent>
          <TabsContent className="space-y-8" value="backup">
            <div>
              <h2 className="font-bold text-2xl">Backups</h2>
              <p className="text-muted-foreground">Manage your backups</p>
            </div>
            <Separator className="mb-4" />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
