"use client";
import React from "react";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

const DashboardStats = () => {
  const { data: session } = useSession();
  const token = session?.user?.accessToken || "";

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/dashboard/overview`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) throw new Error("Failed to fetch dashboard overview");

      return res.json();
    },
    enabled: !!token,
  });

  const stats = [
    {
      title: "Total Users",
      value: data?.data?.totalUserFindcare ?? 0,
    },
    {
      title: "Total Service Provider",
      value: data?.data?.totalServiceProviderFindjob ?? 0,
    },
    {
      title: "Total Bookings",
      value: data?.data?.totalBooking ?? 0,
    },
    {
      title: "Total Earnings",
      value: `$${data?.data?.totalEarning ?? 0}`,
    },
  ];

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">Loading dashboard...</p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="border-none shadow-sm rounded-xl">
          <CardContent className="p-6">
            <p className="text-xs font-medium text-muted-foreground mb-6">
              {stat.title}
            </p>

            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                {stat.value}
              </h3>

              <div className="flex items-center text-sm font-semibold text-emerald-500">
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
