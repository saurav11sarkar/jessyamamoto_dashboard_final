"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Download,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DynamicPageHeader from "@/components/PageHeader";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface PayoutPayment {
  _id: string;
  amount: number;
  adminFree: number;
  serviceProviderFree: number;
  caregiverRate?: number;
  status: string;
  providerPayoutStatus?: string;
  providerPaidDate?: string;
  providerPaidAmount?: number;
  providerPayoutMethod?: string;
  providerPayoutNote?: string;
  createdAt: string;
  user?: { firstName: string; lastName: string; email: string };
  service?: {
    firstName: string;
    lastName: string;
    hourRate?: number;
    userId?: { firstName: string; lastName: string; email: string; phone?: string };
  };
  booking?: { day: string; date: string; time: string; status: string };
}

export default function ProviderPayoutsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PayoutPayment | null>(null);
  const [paidAmount, setPaidAmount] = useState(0);
  const [payoutMethod, setPayoutMethod] = useState("");
  const [payoutNote, setPayoutNote] = useState("");

  const queryClient = useQueryClient();
  const session = useSession();
  const token = session?.data?.user?.accessToken || "";

  const { data, isLoading } = useQuery({
    queryKey: ["provider-payouts", page, filter],
    enabled: !!token,
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (filter) params.set("providerPayoutStatus", filter);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/payment/provider-payouts?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPayment) return;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/payment/${selectedPayment._id}/provider-paid`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ paidAmount, payoutMethod, note: payoutNote }),
        }
      );
      const d = await res.json();
      if (!res.ok) throw new Error(d?.message || "Failed");
      return d;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-payouts"] });
      toast.success("Provider payout marked as paid");
      setIsPayOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const openPayModal = (payment: PayoutPayment) => {
    setSelectedPayment(payment);
    setPaidAmount(payment.caregiverRate || payment.service?.hourRate || payment.serviceProviderFree || 0);
    setPayoutMethod("");
    setPayoutNote("");
    setIsPayOpen(true);
  };

  const exportCSV = () => {
    const payments: PayoutPayment[] = data?.data || [];
    if (!payments.length) return;
    const headers = "Provider,Email,Booking Date,Trusted Booking Fee,Caregiver Rate,Payment Method,Status,Paid Date,Payout Method\n";
    const rows = payments.map((p) => {
      const provider = p.service?.userId;
      const caregiverRate = p.caregiverRate || p.service?.hourRate || 0;
      return `${provider?.firstName || ""} ${provider?.lastName || ""},${provider?.email || ""},${p.booking?.date || ""},${p.amount},${caregiverRate},${p.providerPayoutStatus === "direct_cash" ? "Direct Cash" : p.providerPayoutStatus || "unpaid"},${p.providerPayoutStatus || "unpaid"},${p.providerPaidDate ? new Date(p.providerPaidDate).toLocaleDateString() : ""},${p.providerPayoutMethod || ""}`;
    }).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "provider_payouts.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const payments: PayoutPayment[] = data?.data || [];
  const total = data?.meta?.total || 0;
  const limit = data?.meta?.limit || 10;
  const totalPages = Math.ceil(total / limit);

  const statusColor = (s?: string) => {
    switch (s) {
      case "paid": return "bg-green-100 text-green-700";
      case "processing": return "bg-blue-100 text-blue-700";
      case "direct_cash": return "bg-purple-100 text-purple-700";
      default: return "bg-yellow-100 text-yellow-700";
    }
  };

  const statusLabel = (s?: string) => {
    switch (s) {
      case "direct_cash": return "Direct Cash";
      case "paid": return "paid";
      case "processing": return "processing";
      default: return s || "unpaid";
    }
  };

  const totalBookingFees = payments.reduce((s, p) => s + (p.adminFree || p.amount || 0), 0);
  const totalCaregiverValue = payments.reduce((s, p) => s + (p.caregiverRate || p.service?.hourRate || 0), 0);

  return (
    <div className="min-h-screen">
      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-8 mb-4">
        <DynamicPageHeader pageTitle="Provider Payouts" />
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">All Payouts</option>
            <option value="unpaid">Unpaid</option>
            <option value="processing">Processing</option>
            <option value="paid">Paid</option>
          </select>
          <Button onClick={exportCSV} variant="outline" className="flex items-center gap-2 h-10">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="px-4 sm:px-8 mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-white border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold">{total}</p>
          <p className="text-xs text-slate-500">Total Bookings</p>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary">${totalBookingFees.toFixed(2)}</p>
          <p className="text-xs text-slate-500">Trusted Booking Fees Collected</p>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-slate-600">${totalCaregiverValue.toFixed(2)}</p>
          <p className="text-xs text-slate-500">Caregiver Rates (Paid Direct)</p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-center py-10 text-slate-500">Loading...</p>
      ) : (
        <div className="border-t border-[#B6B6B6] rounded-sm">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-[#B6B6B6]">
                <TableHead className="py-4 font-bold px-6 text-slate-800">Provider</TableHead>
                <TableHead className="py-4 font-bold px-4 text-slate-800 text-center">Booking Date</TableHead>
                <TableHead className="py-4 font-bold px-4 text-slate-800 text-center">Trusted Booking Fee</TableHead>
                <TableHead className="py-4 font-bold px-4 text-slate-800 text-center">Caregiver Rate</TableHead>
                <TableHead className="py-4 font-bold px-4 text-slate-800 text-center">Payment Method</TableHead>
                <TableHead className="py-4 font-bold px-4 text-slate-800 text-center">Status</TableHead>
                <TableHead className="py-4 font-bold px-4 text-slate-800 text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => {
                const provider = p.service?.userId;
                return (
                  <TableRow key={p._id} className="border-b border-[#B6B6B6]">
                    <TableCell className="py-4 px-6">
                      <div>
                        <p className="font-semibold">{provider?.firstName} {provider?.lastName}</p>
                        <p className="text-xs text-slate-500">{provider?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4 text-center text-slate-600">
                      {p.booking?.date || new Date(p.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="py-4 px-4 text-center font-semibold">${p.adminFree || p.amount}</TableCell>
                    <TableCell className="py-4 px-4 text-center font-bold text-[#3ee0cf]">${p.caregiverRate || p.service?.hourRate || 0}/hr</TableCell>
                    <TableCell className="py-4 px-4 text-center text-slate-600">
                      {p.providerPayoutStatus === "direct_cash" ? "Direct Cash" : "Platform"}
                    </TableCell>
                    <TableCell className="py-4 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(p.providerPayoutStatus)}`}>
                        {statusLabel(p.providerPayoutStatus)}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-4 text-center">
                      {p.providerPayoutStatus === "paid" ? (
                        <span className="text-green-600 text-xs flex items-center justify-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Paid
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => openPayModal(p)}
                          className="bg-[#3ee0cf] hover:bg-[#3ee0cf]/90 text-white text-xs h-8"
                        >
                          Mark Paid
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-500">
                    No payouts found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex flex-col gap-3 px-4 py-4 border-t bg-white sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-sm text-slate-500">Page {page} of {totalPages || 1}</p>
            <div className="flex items-center gap-1 overflow-x-auto">
              <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages || 1 }).map((_, i) => (
                <Button key={i} variant={page === i + 1 ? "default" : "outline"} size="sm" onClick={() => setPage(i + 1)}
                  className={`h-8 w-8 ${page === i + 1 ? "bg-[#3ee0cf] text-white" : ""}`}>{i + 1}</Button>
              ))}
              <Button variant="outline" size="icon" disabled={page === totalPages || !totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={isPayOpen} onOpenChange={setIsPayOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mark Provider Payout as Paid</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4 pt-4">
              <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
                <p><strong>Provider:</strong> {selectedPayment.service?.userId?.firstName} {selectedPayment.service?.userId?.lastName}</p>
                <p><strong>Email:</strong> {selectedPayment.service?.userId?.email}</p>
                <p><strong>Phone:</strong> {selectedPayment.service?.userId?.phone || "N/A"}</p>
                <p><strong>Trusted Booking Fee:</strong> ${selectedPayment.adminFree || selectedPayment.amount}</p>
                <p className="text-lg font-bold text-[#3ee0cf]">Caregiver Rate: ${selectedPayment.caregiverRate || selectedPayment.service?.hourRate || 0}/hr</p>
                {selectedPayment.providerPayoutStatus === "direct_cash" && (
                  <p className="text-xs text-purple-600 bg-purple-50 rounded px-2 py-1 mt-1">
                    Caregiver is paid directly in cash by the family
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount Paid ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payout Method</label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select method</option>
                  <option value="wise">Wise Transfer</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="paypal">PayPal</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Note (optional)</label>
                <textarea
                  rows={2}
                  value={payoutNote}
                  onChange={(e) => setPayoutNote(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  placeholder="Payment reference, notes..."
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsPayOpen(false)} className="flex-1">Cancel</Button>
                <Button
                  onClick={() => markPaidMutation.mutate()}
                  disabled={markPaidMutation.isPending}
                  className="flex-1 bg-[#3ee0cf] hover:bg-[#3ee0cf]/90 text-white"
                >
                  {markPaidMutation.isPending ? "Processing..." : "Confirm Paid"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
