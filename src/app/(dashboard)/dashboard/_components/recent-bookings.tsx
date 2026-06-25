// components/dashboard/RecentBookings.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Booking = {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
  };
  serviceId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
  };
  categoryId: {
    _id: string;
    name: string;
  };
  date: string;
  status: string;
};

const getStatusStyles = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-orange-50 text-orange-600 hover:bg-orange-50 border-none px-3";

    case "cancel":
    case "cancelled":
      return "bg-rose-50 text-rose-600 hover:bg-rose-50 border-none px-3";

    case "completed":
      return "bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-none px-3";

    case "accepted":
      return "bg-blue-50 text-blue-600 hover:bg-blue-50 border-none px-3";

    default:
      return "bg-slate-100 text-slate-700 border-none px-3";
  }
};

export default function RecentBookings() {
  const { data: session } = useSession();

  const token = session?.user?.accessToken || "";

  const { data, isLoading } = useQuery({
    queryKey: ["recent-bookings"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/booking?limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch bookings");
      }

      return res.json();
    },
    enabled: !!token,
  });

  const bookings: Booking[] = data?.data || [];

  return (
    <Card className="lg:col-span-2 border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold">
            Recent Bookings
          </CardTitle>

          <CardDescription>
            View the latest customer appointments and their current status.
          </CardDescription>
        </div>

        <Link
          href="#"
          className="text-sm font-medium text-emerald-600 hover:underline"
        >
          See all
        </Link>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="font-medium">
                Service Provider
              </TableHead>

              <TableHead className="font-medium">
                Service Name
              </TableHead>

              <TableHead className="font-medium">Customer</TableHead>

              <TableHead className="font-medium">Status</TableHead>

              <TableHead className="font-medium">Date</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : bookings?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No bookings found
                </TableCell>
              </TableRow>
            ) : (
              bookings?.map((booking) => (
                <TableRow
                  key={booking?._id}
                  className="border-b-slate-100"
                >
                  {/* Service Provider */}
                  <TableCell>
                    <div className="flex items-center gap-3 py-2">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src="" />

                        <AvatarFallback>
                          {booking?.serviceId?.firstName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">
                          {booking?.serviceId?.firstName}{" "}
                          {booking?.serviceId?.lastName}
                        </span>

                        <span className="text-xs text-muted-foreground">
                          {booking?.serviceId?.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Service Name */}
                  <TableCell className="text-muted-foreground">
                    {booking?.categoryId?.name}
                  </TableCell>

                  {/* Customer */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src="" />

                        <AvatarFallback>
                          {booking?.userId?.firstName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">
                          {booking?.userId?.firstName}{" "}
                          {booking?.userId?.lastName}
                        </span>

                        <span className="text-xs text-muted-foreground">
                          {booking?.userId?.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge className={getStatusStyles(booking?.status)}>
                      {booking?.status}
                    </Badge>
                  </TableCell>

                  {/* Date */}
                  <TableCell className="text-muted-foreground">
                    {booking?.date ? new Date(booking.date).toLocaleDateString() : "N/A"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}