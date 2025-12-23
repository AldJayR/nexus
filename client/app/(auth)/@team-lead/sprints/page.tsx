import { SprintsClient } from "@/components/team-lead/sprints/sprints-client";
import { phaseApi } from "@/lib/api/phase";
import { sprintApi } from "@/lib/api/sprint";

export default async function Page() {
  const [sprints, phases] = await Promise.all([
    sprintApi.listSprints(),
    phaseApi.listPhases(),
  ]);

  const progressEntries = await Promise.all(
    sprints.map(async (sprint) => {
      try {
        const progress = await sprintApi.getSprintProgress(sprint.id);
        return [sprint.id, progress] as const;
      } catch {
        return [sprint.id, undefined] as const;
      }
    })
  );

  const progressById = Object.fromEntries(progressEntries);

  return (
    <SprintsClient
      phases={phases}
      progressById={progressById}
      sprints={sprints}
    />
  );
}
