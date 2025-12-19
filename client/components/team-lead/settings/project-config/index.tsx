import type { PhaseDetail, Project } from "@/lib/types";
import GeneralSettings from "./general-settings";
import Methodology from "./methodology";
import RepositorySettings from "./repository";

type ProjectConfigProps = {
  project: Project | null;
  phases: PhaseDetail[];
};

export default function ProjectConfig({ project, phases }: ProjectConfigProps) {
  return (
    <div className="space-y-8">
      <GeneralSettings project={project} />
      <RepositorySettings project={project} />
      <Methodology phases={phases} />
    </div>
  );
}
