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
    <div className="flex items-center justify-center min-h-screen p-4 bg-white">
      <Empty>
        <EmptyHeader>
          <EmptyMedia className="pointer-events-none">
            <Image
              src="/unauthorized.svg"
              alt="Access Denied"
              width={500}
              height={500}
            />
          </EmptyMedia>
          <EmptyTitle className="text-blue-900 font-bold text-3xl">
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
              variant="outline"
              asChild
              className="text-blue-950 hover:text-blue-800 dark:border-blue-300"
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
