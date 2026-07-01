"use client";

import React, { useState } from "react";
import {
  Plus,
  SquarePen,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserPlus,
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

interface AmbassadorUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
}

interface Ambassador {
  _id: string;
  userId: AmbassadorUser;
  ambassadorId: string;
  referralCode: string;
  assignedCity: string;
  assignedCountry: string;
  languages?: string[];
  commissionRate: number;
  commissionType: string;
  commissionDuration: string;
  commissionStartDate: string;
  commissionEndDate?: string;
  status: "active" | "paused" | "removed" | "pending";
  phone?: string;
  whatsapp?: string;
  paymentMethod?: string;
  internalNotes?: string;
  createdAt: string;
}

interface FounderBoardItem {
  ambassadorId: string;
  ambassadorCode: string;
  name: string;
  city: string;
  country: string;
  status: string;
  commissionRate: number;
  providersReferred: number;
  providersApproved: number;
  providersActive: number;
  completedBookings: number;
  platformFees: number;
  commissionOwed: number;
  commissionPaid: number;
}

export default function AmbassadorManagement() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [editData, setEditData] = useState<Ambassador | null>(null);
  const [page, setPage] = useState(1);
  const [showBoard, setShowBoard] = useState(true);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ambId, setAmbId] = useState("");
  const [refCode, setRefCode] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [languages, setLanguages] = useState("");
  const [commissionRate, setCommissionRate] = useState(10);
  const [commissionDuration, setCommissionDuration] = useState("12_months");
  const [status, setStatus] = useState<string>("active");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Assign form state
  const [assignProviderId, setAssignProviderId] = useState("");
  const [assignAmbassadorId, setAssignAmbassadorId] = useState("");
  const [assignReason, setAssignReason] = useState("");

  const queryClient = useQueryClient();
  const session = useSession();
  const token = session?.data?.user?.accessToken || "";
  const userId = session?.data?.user?.id;

  const { data } = useQuery({
    queryKey: ["ambassadors", page],
    enabled: !!userId && !!token,
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/ambassador?page=${page}&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: boardData } = useQuery({
    queryKey: ["founder-board"],
    enabled: !!token,
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/ambassador/founder-board`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch board");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/ambassador/${id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      const d = await res.json();
      if (!res.ok) throw new Error(d?.message || "Delete failed");
      return d;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ambassadors"] });
      queryClient.invalidateQueries({ queryKey: ["founder-board"] });
      toast.success("Ambassador deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const openAddModal = () => {
    setEditData(null);
    setFirstName(""); setLastName(""); setEmail(""); setPassword("");
    setAmbId(""); setRefCode(""); setCity(""); setCountry("");
    setLanguages(""); setCommissionRate(10); setCommissionDuration("12_months");
    setStatus("active"); setPhone(""); setWhatsapp("");
    setPaymentMethod(""); setInternalNotes("");
    setIsOpen(true);
  };

  const openEditModal = (amb: Ambassador) => {
    setEditData(amb);
    setFirstName(amb.userId?.firstName || "");
    setLastName(amb.userId?.lastName || "");
    setEmail(amb.userId?.email || "");
    setPassword("");
    setAmbId(amb.ambassadorId);
    setRefCode(amb.referralCode);
    setCity(amb.assignedCity);
    setCountry(amb.assignedCountry);
    setLanguages(amb.languages?.join(", ") || "");
    setCommissionRate(amb.commissionRate);
    setCommissionDuration(amb.commissionDuration);
    setStatus(amb.status);
    setPhone(amb.phone || "");
    setWhatsapp(amb.whatsapp || "");
    setPaymentMethod(amb.paymentMethod || "");
    setInternalNotes(amb.internalNotes || "");
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    if (!firstName || !lastName || !ambId || !refCode || !city || !country) {
      toast.error("Please fill required fields");
      return;
    }
    if (!editData && (!email || !password)) {
      toast.error("Email and password required for new ambassador");
      return;
    }

    const cleanAmbId = ambId.replace(/\s+/g, "-").toUpperCase();
    const cleanRefCode = refCode.replace(/\s+/g, "-").toUpperCase();

    setIsSubmitting(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body: Record<string, any> = {
        firstName, lastName, ambassadorId: cleanAmbId, referralCode: cleanRefCode,
        assignedCity: city, assignedCountry: country,
        languages: languages.split(",").map(l => l.trim()).filter(Boolean),
        commissionRate, commissionDuration, status,
        phone, whatsapp, paymentMethod, internalNotes,
      };
      if (!editData) {
        body.email = email;
        body.password = password;
      }

      const url = editData
        ? `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/ambassador/${editData._id}`
        : `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/ambassador`;

      const res = await fetch(url, {
        method: editData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result?.message || "Failed");

      toast.success(editData ? "Ambassador updated" : "Ambassador created");
      queryClient.invalidateQueries({ queryKey: ["ambassadors"] });
      queryClient.invalidateQueries({ queryKey: ["founder-board"] });
      setIsOpen(false);
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssign = async () => {
    if (!assignProviderId || !assignAmbassadorId) {
      toast.error("Provider ID and Ambassador are required");
      return;
    }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/ambassador/assign-provider`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ providerId: assignProviderId, ambassadorId: assignAmbassadorId, reason: assignReason }),
        }
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result?.message || "Failed");
      toast.success("Ambassador assigned to provider");
      setIsAssignOpen(false);
      setAssignProviderId(""); setAssignAmbassadorId(""); setAssignReason("");
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  };

  const exportCSV = () => {
    const board: FounderBoardItem[] = boardData?.data || [];
    if (!board.length) return;
    const headers = "City,Ambassador,Providers Referred,Approved,Active,Bookings,Trusted Booking Fees,Commission Owed,Commission Paid,Status\n";
    const rows = board.map(b =>
      `${b.city},${b.name},${b.providersReferred},${b.providersApproved},${b.providersActive},${b.completedBookings},$${b.platformFees},$${b.commissionOwed},$${b.commissionPaid},${b.status}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "ambassador_report.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const ambassadors: Ambassador[] = data?.data || [];
  const total = data?.meta?.total || 0;
  const limit = data?.meta?.limit || 10;
  const totalPages = Math.ceil(total / limit);
  const board: FounderBoardItem[] = boardData?.data || [];

  const statusColor = (s: string) => {
    switch (s) {
      case "active": return "bg-green-100 text-green-700";
      case "paused": return "bg-yellow-100 text-yellow-700";
      case "removed": return "bg-red-100 text-red-700";
      case "pending": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-8 mb-4">
        <DynamicPageHeader pageTitle="City Ambassadors" />
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button onClick={() => setIsAssignOpen(true)} variant="outline" className="flex items-center gap-2 h-11">
            <UserPlus className="w-4 h-4" /> Assign to Provider
          </Button>
          <Button onClick={exportCSV} variant="outline" className="flex items-center gap-2 h-11">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button onClick={openAddModal} className="bg-[#3ee0cf] hover:bg-[#3ee0cf]/90 text-white flex items-center gap-2 px-4 py-2 h-11">
            <Plus className="w-5 h-5" /> Add Ambassador
          </Button>
        </div>
      </div>

      {/* Founder Admin Board */}
      {board.length > 0 && (
        <div className="mx-8 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-slate-800">City Ambassador Board</h3>
            <button onClick={() => setShowBoard(!showBoard)} className="text-sm text-primary hover:underline">
              {showBoard ? "Hide" : "Show"}
            </button>
          </div>
          {showBoard && (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-bold text-slate-800">City</TableHead>
                    <TableHead className="font-bold text-slate-800">Ambassador</TableHead>
                    <TableHead className="font-bold text-slate-800 text-center">Referred</TableHead>
                    <TableHead className="font-bold text-slate-800 text-center">Approved</TableHead>
                    <TableHead className="font-bold text-slate-800 text-center">Active</TableHead>
                    <TableHead className="font-bold text-slate-800 text-center">Bookings</TableHead>
                    <TableHead className="font-bold text-slate-800 text-center">Trusted Booking Fees</TableHead>
                    <TableHead className="font-bold text-slate-800 text-center">Commission Owed</TableHead>
                    <TableHead className="font-bold text-slate-800 text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {board.map((b) => (
                    <TableRow key={b.ambassadorId}>
                      <TableCell className="font-medium">{b.city}</TableCell>
                      <TableCell>{b.name}</TableCell>
                      <TableCell className="text-center">{b.providersReferred}</TableCell>
                      <TableCell className="text-center">{b.providersApproved}</TableCell>
                      <TableCell className="text-center">{b.providersActive}</TableCell>
                      <TableCell className="text-center">{b.completedBookings}</TableCell>
                      <TableCell className="text-center">${b.platformFees}</TableCell>
                      <TableCell className="text-center">${b.commissionOwed}</TableCell>
                      <TableCell className="text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(b.status)}`}>{b.status}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* Ambassador List Table */}
      <div className="border-t border-[#B6B6B6] rounded-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-[#B6B6B6]">
              <TableHead className="py-4 font-bold px-8 text-slate-800">Ambassador</TableHead>
              <TableHead className="py-4 font-bold px-8 text-slate-800">ID / Referral Code</TableHead>
              <TableHead className="py-4 font-bold px-8 text-slate-800 text-center">City</TableHead>
              <TableHead className="py-4 font-bold px-8 text-slate-800 text-center">Commission</TableHead>
              <TableHead className="py-4 font-bold px-8 text-slate-800 text-center">Status</TableHead>
              <TableHead className="py-4 font-bold px-8 text-slate-800 text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ambassadors.map((amb) => (
              <TableRow key={amb._id} className="border-b border-[#B6B6B6]">
                <TableCell className="py-6 px-8 font-medium">
                  <div>
                    <p className="font-semibold">{amb.userId?.firstName} {amb.userId?.lastName}</p>
                    <p className="text-sm text-slate-500">{amb.userId?.email}</p>
                  </div>
                </TableCell>
                <TableCell className="py-6 px-8">
                  <p className="text-sm font-mono">{amb.ambassadorId}</p>
                  <p className="text-xs text-slate-500">{amb.referralCode}</p>
                </TableCell>
                <TableCell className="py-6 px-8 text-center">
                  <p>{amb.assignedCity}</p>
                  <p className="text-xs text-slate-500">{amb.assignedCountry}</p>
                </TableCell>
                <TableCell className="py-6 px-8 text-center">{amb.commissionRate}%</TableCell>
                <TableCell className="py-6 px-8 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(amb.status)}`}>{amb.status}</span>
                </TableCell>
                <TableCell className="py-6 px-8">
                  <div className="flex items-center justify-center gap-3">
                    <button onClick={() => openEditModal(amb)} className="text-slate-600 hover:text-blue-600"><SquarePen className="w-5 h-5" /></button>
                    <button onClick={() => deleteMutation.mutate(amb._id)} className="text-slate-600 hover:text-rose-600"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {ambassadors.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-slate-500">No ambassadors found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex flex-col gap-3 px-4 py-4 border-t bg-white sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-slate-500">Showing page {page} of {totalPages || 1}</p>
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

      {/* Add/Edit Ambassador Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editData ? "Edit Ambassador" : "Create Ambassador"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">First Name *</label>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name *</label>
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>
            {!editData && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password *</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">Ambassador ID *</label>
                <input type="text" value={ambId} onChange={e => setAmbId(e.target.value)} placeholder="AMB-BKK-001"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Referral Code *</label>
                <input type="text" value={refCode} onChange={e => setRefCode(e.target.value)} placeholder="JETSETBKK-MARIA"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">Assigned City *</label>
                <input type="text" value={city} onChange={e => setCity(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Assigned Country *</label>
                <input type="text" value={country} onChange={e => setCountry(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Languages (comma separated)</label>
              <input type="text" value={languages} onChange={e => setLanguages(e.target.value)} placeholder="English, Thai, Korean"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium mb-1">Commission Rate (%)</label>
                <input type="number" value={commissionRate} onChange={e => setCommissionRate(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration</label>
                <select value={commissionDuration} onChange={e => setCommissionDuration(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="lifetime">Lifetime</option>
                  <option value="12_months">12 Months</option>
                  <option value="6_months">6 Months</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="paused">Paused</option>
                  <option value="removed">Removed</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">WhatsApp</label>
                <input type="text" value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Payment Method</label>
              <input type="text" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} placeholder="Wise, Bank Transfer, etc."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Internal Notes</label>
              <textarea rows={3} value={internalNotes} onChange={e => setInternalNotes(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1" disabled={isSubmitting}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}
                className="flex-1 bg-[#3ee0cf] hover:bg-[#3ee0cf]/90 text-white">
                {isSubmitting ? "Saving..." : editData ? "Update Ambassador" : "Create Ambassador"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Ambassador to Provider Modal */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Ambassador to Provider</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Provider ID *</label>
              <input type="text" value={assignProviderId} onChange={e => setAssignProviderId(e.target.value)}
                placeholder="Enter provider user ID" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ambassador *</label>
              <select value={assignAmbassadorId} onChange={e => setAssignAmbassadorId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="">Select Ambassador</option>
                {ambassadors.map(a => (
                  <option key={a._id} value={a._id}>{a.userId?.firstName} {a.userId?.lastName} ({a.assignedCity})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reason</label>
              <textarea rows={2} value={assignReason} onChange={e => setAssignReason(e.target.value)}
                placeholder="Provider confirmed referral manually" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsAssignOpen(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleAssign} className="flex-1 bg-[#3ee0cf] hover:bg-[#3ee0cf]/90 text-white">Assign</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
