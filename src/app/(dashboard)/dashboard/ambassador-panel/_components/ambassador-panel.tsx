"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  DollarSign,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DynamicPageHeader from "@/components/PageHeader";

interface DashboardData {
  ambassador: {
    ambassadorId: string;
    referralCode: string;
    assignedCity: string;
    assignedCountry: string;
    commissionRate: number;
    status: string;
    userId: { firstName: string; lastName: string; email: string };
  };
  stats: {
    totalReferred: number;
    pendingProviders: number;
    approvedProviders: number;
    rejectedProviders: number;
    activeProviders: number;
    completedBookings: number;
    totalBookingValue: number;
    totalPlatformFees: number;
    totalCommissionEarned: number;
    paidCommission: number;
    unpaidCommission: number;
  };
  providers: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    userStatus: string;
    status: string;
    createdAt: string;
  }>;
}

export default function AmbassadorPanel() {
  const session = useSession();
  const token = session?.data?.user?.accessToken;

  const { data, isLoading } = useQuery<{
    success: boolean;
    data: DashboardData;
  }>({
    queryKey: ["ambassador-dashboard"],
    enabled: !!token,
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/ambassador/my-dashboard`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      return res.json();
    },
  });

  const dashboard = data?.data;
  const stats = dashboard?.stats;
  const ambassador = dashboard?.ambassador;
  const providers = dashboard?.providers || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ee0cf]" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Referred",
      value: stats?.totalReferred || 0,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Pending",
      value: stats?.pendingProviders || 0,
      icon: Clock,
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      label: "Approved",
      value: stats?.approvedProviders || 0,
      icon: CheckCircle,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Rejected",
      value: stats?.rejectedProviders || 0,
      icon: XCircle,
      color: "bg-red-50 text-red-600",
    },
    {
      label: "Active Providers",
      value: stats?.activeProviders || 0,
      icon: Users,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Completed Bookings",
      value: stats?.completedBookings || 0,
      icon: Calendar,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Trusted Booking Fees",
      value: `$${stats?.totalPlatformFees || 0}`,
      icon: DollarSign,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Commission Earned",
      value: `$${stats?.totalCommissionEarned || 0}`,
      icon: TrendingUp,
      color: "bg-teal-50 text-teal-600",
    },
    {
      label: "Paid",
      value: `$${stats?.paidCommission || 0}`,
      icon: Wallet,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Unpaid Balance",
      value: `$${stats?.unpaidCommission || 0}`,
      icon: DollarSign,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  const statusColor = (s: string) => {
    switch (s) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "panding":
        return "bg-yellow-100 text-yellow-700";
      case "reject":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen">
      <div className="px-8 py-4">
        <DynamicPageHeader pageTitle="My Ambassador Dashboard" />

        {ambassador && (
          <div className="mt-4 bg-white border rounded-xl p-6 flex flex-wrap gap-6 items-center">
            <div>
              <p className="text-sm text-slate-500">Ambassador ID</p>
              <p className="font-mono font-semibold">
                {ambassador.ambassadorId}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Referral Code</p>
              <p className="font-mono font-semibold text-[#3ee0cf]">
                {ambassador.referralCode}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">City</p>
              <p className="font-semibold">
                {ambassador.assignedCity}, {ambassador.assignedCountry}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Commission Rate</p>
              <p className="font-semibold">{ambassador.commissionRate}%</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Referral Link</p>
              <div className="flex items-center gap-2">
                <a
                  href={`${process.env.NEXTAUTH_URL}/join/${encodeURIComponent(ambassador.referralCode)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-sm text-primary underline hover:text-primary/80"
                >
                  jetsetcares.org/join/
                  {encodeURIComponent(ambassador.referralCode)}
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${process.env.NEXTAUTH_URL}/join/${encodeURIComponent(ambassador.referralCode)}`,
                    );
                    toast.success("Referral link copied!");
                  }}
                  className="px-3 py-1 text-xs bg-[#3ee0cf] text-white rounded-full hover:bg-[#3ee0cf]/90"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-8 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className={`rounded-full p-2 ${card.color}`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-xs text-slate-500">{card.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-8 py-4">
        <h3 className="text-lg font-bold text-slate-800 mb-4">
          My Referred Providers
        </h3>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-bold">Name</TableHead>
                <TableHead className="font-bold">Email</TableHead>
                <TableHead className="font-bold text-center">Status</TableHead>
                <TableHead className="font-bold text-center">
                  Signup Date
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providers.map((p) => (
                <TableRow key={p._id}>
                  <TableCell className="font-medium">
                    {p.firstName} {p.lastName}
                  </TableCell>
                  <TableCell className="text-slate-600">{p.email}</TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(p.userStatus || "")}`}
                    >
                      {p.userStatus || "pending"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-slate-600">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {providers.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-10 text-slate-500"
                  >
                    No providers referred yet. Share your referral link to get
                    started!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
