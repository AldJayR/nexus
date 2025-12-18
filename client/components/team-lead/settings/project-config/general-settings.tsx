import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import DateRange from "./date-range";

export default function GeneralSettings() {
  return (
    <Frame id="general-settings">
      <FrameHeader>
        <FrameTitle>General Settings</FrameTitle>
        <FrameDescription>
          Basic identification details for your capstone project.
        </FrameDescription>
      </FrameHeader>
      <FramePanel className="space-y-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel className="font-medium" htmlFor="project-name">
              Project Name
            </FieldLabel>
            <Input
              id="project-name"
              placeholder="Enter project name"
              required
            />
          </Field>
          <Field>
            <FieldLabel className="font-medium" htmlFor="date-range">
              Start and End Dates
            </FieldLabel>
            <DateRange id="date-range" />
          </Field>
        </div>
        <Field>
          <FieldLabel className="font-medium" htmlFor="project-description">
            Project Descripion
          </FieldLabel>
          <Textarea
            id="project-description"
            placeholder="Enter project description"
            required
            rows={3}
          />
          <FieldDescription>
            Briefly describe the project goals. Markdown is supported.
          </FieldDescription>
        </Field>
      </FramePanel>
      <FrameFooter className="flex-row justify-between">
        <p className="text-muted-foreground text-sm">Last Edited 2 days ago</p>
        <Button variant="secondary">Save Changes</Button>
      </FrameFooter>
    </Frame>
  );
}
