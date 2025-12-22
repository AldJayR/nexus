import { House, UserLock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <Empty>
        <EmptyHeader>
          <EmptyMedia className="pointer-events-none">
            <Image
              alt="Access Denied"
              height={500}
              src="/unauthorized.svg"
              width={500}
            />
          </EmptyMedia>
          <EmptyTitle className="font-bold text-3xl text-blue-900">
            Access Denied
          </EmptyTitle>
          <EmptyDescription className="text-blue-600 text-sm md:text-base">
            You're not authorized to access this page. You need to be logged in
            to continue.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/login">
                <UserLock className="size-4" />
                Go to Login
              </Link>
            </Button>
            <Button
              asChild
              className="text-blue-950 hover:text-blue-800 dark:border-blue-300"
              variant="outline"
            >
              <Link href="/">
                <House className="size-4" />
                Back Home
              </Link>
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </div>
  );
}
