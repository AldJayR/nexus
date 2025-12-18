import Link from "next/link";
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

export default function RepositorySettings() {
  return (
    <Frame id="repository-connection">
      <FrameHeader>
        <FrameTitle>Repository Connection</FrameTitle>
        <FrameDescription>
          Link your GitHub or GitLab repository for automated tracking.
        </FrameDescription>
      </FrameHeader>
      <FramePanel>
        <Field>
          <FieldLabel htmlFor="github">Reposity URL</FieldLabel>
          <div className="relative">
            <Input
              className="peer ps-16"
              id="github"
              placeholder="github.com/your-username/your-repo"
              type="text"
            />
            <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground text-sm peer-disabled:opacity-50">
              https://
            </span>
          </div>
        </Field>
        <FieldDescription>
          <Link href="">Open</Link>
        </FieldDescription>
      </FramePanel>
      <FrameFooter className="flex-row justify-end">
        <Button variant="secondary">Save Changes</Button>
      </FrameFooter>
    </Frame>
  );
}
