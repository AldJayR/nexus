// import ThemePicker from "@/components/shared/settings/theme-picker";
import { auth } from "@/auth";
import ProjectConfig from "@/components/team-lead/settings/project-config";
import { getPhasesWithDetails } from "@/lib/data/phases";
import { getProject } from "@/lib/data/project";

export default async function ProjectConfigPage() {
  const session = await auth();

  // HARD GATE: Team Lead only
  if (session?.user?.role !== "teamLead") {
    return null;
  }

  // Fetch data on the server
  const [project, phases] = await Promise.all([
    getProject(),
    getPhasesWithDetails(),
  ]);

  return (
    <>
      <ProjectConfig phases={phases} project={project} />
      {/* <ThemePicker /> */}
    </>
  );
}
