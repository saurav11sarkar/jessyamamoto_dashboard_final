"use client";

import React from "react";
import { Award, Plus, RefreshCw, ShieldCheck } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import DynamicPageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Badge {
  _id: string;
  key: string;
  title: string;
  description: string;
  issuer?: string;
  isActive: boolean;
  order?: number;
}

export default function BadgesPage() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken || "";
  const queryClient = useQueryClient();
  const [form, setForm] = React.useState({
    key: "",
    title: "",
    description: "",
    issuer: "JetSet Cares",
  });
  const [assignEmail, setAssignEmail] = React.useState("");
  const [selectedBadgeId, setSelectedBadgeId] = React.useState("");
  const [validThrough, setValidThrough] = React.useState("");
  const [note, setNote] = React.useState("");

  const { data } = useQuery<{ data: Badge[] }>({
    queryKey: ["badges"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/badge`);
      if (!res.ok) throw new Error("Failed to fetch badges");
      return res.json();
    },
  });

  const authedFetch = async (url: string, body?: unknown) => {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.message || "Action failed");
    return json;
  };

  const seedMutation = useMutation({
    mutationFn: () =>
      authedFetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/badge/seed-defaults`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges"] });
      toast.success("Default 23 badges are ready.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      authedFetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/badge`, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges"] });
      setForm({ key: "", title: "", description: "", issuer: "JetSet Cares" });
      toast.success("Badge saved.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const assignMutation = useMutation({
    mutationFn: (action: "assign" | "revoke") =>
      authedFetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/badge/${action}`, {
        email: assignEmail,
        badgeId: selectedBadgeId,
        validThrough: validThrough || undefined,
        note,
      }),
    onSuccess: (_data, action) => {
      toast.success(action === "assign" ? "Badge assigned." : "Badge revoked.");
      setNote("");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const badges = data?.data || [];

  return (
    <div className="min-h-screen px-4 py-4 sm:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <DynamicPageHeader pageTitle="Badges" />
        <Button
          onClick={() => seedMutation.mutate()}
          disabled={seedMutation.isPending}
          className="bg-[#3ee0cf] text-white hover:bg-[#3ee0cf]/90"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Seed 23 Default Badges
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Badge Library
          </h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {badges.map((badge) => (
              <button
                key={badge._id}
                type="button"
                onClick={() => setSelectedBadgeId(badge._id)}
                className={`rounded-xl border p-4 text-left transition hover:border-[#3ee0cf] ${
                  selectedBadgeId === badge._id
                    ? "border-[#3ee0cf] bg-[#ecfffd]"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-[#087c73]" />
                  <span className="font-semibold text-slate-900">
                    {badge.title}
                  </span>
                </div>
                <p className="line-clamp-3 text-sm text-slate-600">
                  {badge.description}
                </p>
                <p className="mt-3 text-xs text-slate-400">{badge.key}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Plus className="h-5 w-5" />
              Add or Update Badge
            </h2>
            <div className="space-y-3">
              <Input
                placeholder="key, e.g. cpr_certified"
                value={form.key}
                onChange={(e) => setForm((p) => ({ ...p, key: e.target.value }))}
              />
              <Input
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              />
              <Input
                placeholder="Issuer"
                value={form.issuer}
                onChange={(e) => setForm((p) => ({ ...p, issuer: e.target.value }))}
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                className="min-h-[90px] w-full rounded-lg border border-slate-200 p-3 text-sm"
              />
              <Button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="w-full bg-slate-900 text-white hover:bg-slate-800"
              >
                Save Badge
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Award className="h-5 w-5" />
              Assign / Revoke
            </h2>
            <div className="space-y-3">
              <Input
                placeholder="Partner email"
                value={assignEmail}
                onChange={(e) => setAssignEmail(e.target.value)}
              />
              <select
                value={selectedBadgeId}
                onChange={(e) => setSelectedBadgeId(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              >
                <option value="">Select badge</option>
                {badges.map((badge) => (
                  <option key={badge._id} value={badge._id}>
                    {badge.title}
                  </option>
                ))}
              </select>
              <Input
                type="date"
                value={validThrough}
                onChange={(e) => setValidThrough(e.target.value)}
              />
              <textarea
                placeholder="Internal note shown in badge details"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="min-h-[80px] w-full rounded-lg border border-slate-200 p-3 text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => assignMutation.mutate("assign")}
                  disabled={!assignEmail || !selectedBadgeId || assignMutation.isPending}
                  className="bg-[#3ee0cf] text-white hover:bg-[#3ee0cf]/90"
                >
                  Assign
                </Button>
                <Button
                  onClick={() => assignMutation.mutate("revoke")}
                  disabled={!assignEmail || !selectedBadgeId || assignMutation.isPending}
                  variant="outline"
                >
                  Revoke
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
