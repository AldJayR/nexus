import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="relative space-y-4">
      <div className="absolute -bottom-6 left-0 bg-linear-to-t from-background to-transparent h-full w-full z-20" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="w-full h-10 max-w-60" />
        <Skeleton className="w-32 h-10" />
      </div>
      {/* table */}
      <div className="overflow-hidden border rounded-md bg-background">
        <div className="flex justify-between gap-4 border-b">
          <div className="w-full p-4">
            <Skeleton className="w-16 h-4" />
          </div>
          <div className="w-full p-4 border-l">
            <Skeleton className="w-16 h-4" />
          </div>
          <div className="w-full p-4 border-l">
            <Skeleton className="w-16 h-4" />
          </div>
          <div className="w-full p-4 border-l">
            <Skeleton className="w-16 h-4" />
          </div>
        </div>
        <div className="p-4 space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="w-full h-6" />
          ))}
        </div>
      </div>
    </div>
  )
}