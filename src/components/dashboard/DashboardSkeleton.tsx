"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function StatCardSkeleton() {
  return (
    <Card className="shadow-sm bg-white border-gray-100">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="w-8 h-8 rounded-md" />
          <Skeleton className="w-16 h-3" />
        </div>
        <Skeleton className="w-20 h-7 mb-1" />
        <Skeleton className="w-28 h-3 mb-2" />
        <Skeleton className="w-full h-3" />
      </CardContent>
    </Card>
  );
}

export function ChartSkeleton({ height = 180 }: { height?: number }) {
  return (
    <Card className="shadow-sm bg-white border-gray-100">
      <CardHeader className="flex flex-row items-center justify-between p-3 pb-0">
        <Skeleton className="w-40 h-4" />
        <Skeleton className="w-24 h-7" />
      </CardHeader>
      <CardContent className="p-3">
        <Skeleton className="w-full rounded-lg" style={{ height }} />
      </CardContent>
    </Card>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <Card className="shadow-sm bg-white border-gray-100">
      <CardHeader className="flex flex-row items-center justify-between p-3 pb-2 border-b border-gray-100">
        <Skeleton className="w-36 h-4" />
        <Skeleton className="w-16 h-3" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-50">
          <div className="flex px-4 py-2 gap-3 bg-gray-50/50">
            {Array.from({ length: cols }).map((_, i) => (
              <Skeleton key={i} className="h-3 flex-1" />
            ))}
          </div>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex px-4 py-2.5 gap-3">
              {Array.from({ length: cols }).map((_, j) => (
                <Skeleton key={j} className="h-3 flex-1" />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardPrincipalSkeleton() {
  return (
    <div className="p-4 max-w-[1600px] mx-auto space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="w-48 h-6 mb-1" />
          <Skeleton className="w-64 h-3" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="w-28 h-8" />
          <Skeleton className="w-24 h-8" />
          <Skeleton className="w-36 h-8" />
        </div>
      </div>
      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-3">
        <ChartSkeleton height={180} />
        <ChartSkeleton height={180} />
        <ChartSkeleton height={180} />
        <ChartSkeleton height={180} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <ChartSkeleton key={i} height={200} />
        ))}
      </div>
      <TableSkeleton rows={5} cols={5} />
    </div>
  );
}
