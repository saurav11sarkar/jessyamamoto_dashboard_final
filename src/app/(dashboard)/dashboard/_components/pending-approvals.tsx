"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PendingApprovalsResponse } from "@/types/pending-approvals";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function PendingApprovals() {
  const { data: session } = useSession();

  const token = session?.user?.accessToken || "";

  const { data, isLoading } = useQuery<PendingApprovalsResponse>({
    queryKey: ["pending-approvals"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/all-user?limits=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch pending approvals");

      return res.json();
    },
    enabled: !!token,
  });

  // only pending users
  const cleaners =
    data?.data?.filter(
      (user) => user.userStatus === "pending"
    ) || [];

  return (
    <Card className="border-none shadow-sm h-full">
      <CardHeader className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold">
            Pending Cleaners Approvals
          </CardTitle>

          <CardDescription>
            Approve pending professional profiles.
          </CardDescription>
        </div>

        <Link
          href="/dashboard/user-managements"
          className="text-sm font-medium text-emerald-600 hover:underline"
        >
          See all
        </Link>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading...</p>
        )}

        {cleaners?.map((cleaner) => (
          <div
            key={cleaner?._id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10 border-2 border-slate-100">
                <AvatarImage src={typeof cleaner?.profileImage === "string" ? cleaner.profileImage : ""} />

                <AvatarFallback>
                  {cleaner?.firstName?.charAt(0)}
                  {cleaner?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col">
                <p className="text-sm font-semibold text-slate-900">
                  {cleaner?.firstName} {cleaner?.lastName}
                </p>

                <p className="text-xs text-muted-foreground">
                  {cleaner?.email}
                </p>
              </div>
            </div>
          </div>
        ))}

        {cleaners.length === 0 && !isLoading && (
          <p className="text-sm text-muted-foreground">
            No pending approvals
          </p>
        )}
      </CardContent>
    </Card>
  );
}