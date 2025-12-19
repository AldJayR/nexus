import ThemePicker from "@/components/shared/settings/theme-picker";
import ProjectConfig from "@/components/team-lead/settings/project-config";
import { Separator } from "@/components/ui/separator";
import { getPhasesWithDetails } from "@/lib/data/phases";
import { getProject } from "@/lib/data/project";

export default async function ProjectConfigPage() {
  // Fetch data on the server
  const [project, phases] = await Promise.all([
    getProject(),
    getPhasesWithDetails(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-bold text-2xl">Project Configurations</h2>
        <p className="text-muted-foreground">
          Manage your project configurations
        </p>
      </div>
      <Separator />
      <ProjectConfig phases={phases} project={project} />
      <ThemePicker />
    </div>
  );
}
