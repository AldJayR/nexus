import GeneralSettings from "./general-settings";
import Methodology from "./methodology";
import RepositorySettings from "./repository";

export default function ProjectConfig() {
  return (
    <div className="space-y-8">
      <GeneralSettings />
      <RepositorySettings />
      <Methodology />
    </div>
  );
}
