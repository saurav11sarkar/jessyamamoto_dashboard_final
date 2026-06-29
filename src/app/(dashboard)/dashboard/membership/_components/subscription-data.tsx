"use client";

import React from "react";
import {
  Plus,
  SquarePen,
  Trash2,
  ChevronLeft,
  ChevronRight,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import DynamicPageHeader from "@/components/PageHeader";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Subscription {
  _id: string;
  type: string;
  title: string;
  price: number;
  description: string;
  content: string;
  totalSubscripeUser?: string[];
  totalServices?: string[];
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionResponse {
  success: boolean;
  message: string;
  meta: {
    total: number;
    page: number;
    limit: number;
  };
  data: Subscription[];
}

export default function SubscriptionManagement() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [editData, setEditData] = React.useState<Subscription | null>(null);
  const [page, setPage] = React.useState(1);

  // Form state
  const [formType, setFormType] = React.useState("");
  const [formTitle, setFormTitle] = React.useState("");
  const [formPrice, setFormPrice] = React.useState("");
  const [formDescription, setFormDescription] = React.useState("");
  const [formContent, setFormContent] = React.useState("");

  const queryClient = useQueryClient();
  const session = useSession();
  const token = session?.data?.user?.accessToken || "";
  const userId = session?.data?.user?.id;

  const { data } = useQuery<SubscriptionResponse>({
    queryKey: ["subscription", page],
    enabled: !!userId && !!token,
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/subscription?page=${page}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!res.ok) throw new Error("Failed to fetch subscriptions");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/subscription/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Delete failed");
      }

      return data;
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["subscription"],
      });

      toast.success(data?.message || "Membership deleted successfully");
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast.error(err?.message || "Delete failed");
    },
  });

  const addMutation = useMutation({
    mutationFn: async (payload: {
      type: string;
      title: string;
      price: number;
      description: string;
      content: string;
    }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/subscription`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Create failed");
      }

      return data;
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["subscription"],
      });

      setIsOpen(false);
      resetForm();
      toast.success(data?.message || "Membership created successfully");
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast.error(err?.message || "Create failed");
    },
  });

  const editMutation = useMutation({
    mutationFn: async (payload: {
      id: string;
      type: string;
      title: string;
      price: number;
      description: string;
      content: string;
    }) => {
      const { id, ...body } = payload;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/subscription/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Update failed");
      }

      return data;
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["subscription"],
      });

      setIsOpen(false);
      resetForm();
      toast.success(data?.message || "Membership updated successfully");
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast.error(err?.message || "Update failed");
    },
  });

  const resetForm = () => {
    setFormType("");
    setFormTitle("");
    setFormPrice("");
    setFormDescription("");
    setFormContent("");
    setEditData(null);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleEdit = (subscription: Subscription) => {
    setEditData(subscription);
    setFormType(subscription.type);
    setFormTitle(subscription.title);
    setFormPrice(String(subscription.price));
    setFormDescription(subscription.description);
    setFormContent(subscription.content);
    setIsOpen(true);
  };

  const handleAdd = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formType || !formTitle || !formPrice || !formDescription || !formContent) {
      toast.error("Please fill in all fields");
      return;
    }

    const payload = {
      type: formType,
      title: formTitle,
      price: Number(formPrice),
      description: formDescription,
      content: formContent,
    };

    if (editData?._id) {
      editMutation.mutate({ id: editData._id, ...payload });
    } else {
      addMutation.mutate(payload);
    }
  };

  const total = data?.meta?.total || 0;
  const limit = data?.meta?.limit || 10;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="flex px-8 py-4 justify-between items-start mb-8">
        <DynamicPageHeader pageTitle="Subscriptions" />
        <Button
          onClick={handleAdd}
          className="bg-[#3ee0cf] hover:bg-[#3ee0cf]/90 text-white flex items-center gap-2 px-4 py-2 h-11"
        >
          <Plus className="w-5 h-5" />
          Add Membership
        </Button>
      </div>

      {/* Table Section */}
      <div className="border-t border-[#B6B6B6] rounded-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-[#B6B6B6]">
              <TableHead className="py-4 font-bold px-8 text-slate-800">
                Title
              </TableHead>
              <TableHead className="py-4 font-bold px-8 text-slate-800 text-center">
                Type
              </TableHead>
              <TableHead className="py-4 font-bold px-8 text-slate-800 text-center">
                Price
              </TableHead>
              <TableHead className="py-4 font-bold px-8 text-slate-800 text-center">
                Description
              </TableHead>
              <TableHead className="py-4 font-bold px-8 text-slate-800 text-center">
                Total Subscribers
              </TableHead>
              <TableHead className="py-4 font-bold px-8 text-slate-800 text-center">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((subscription) => (
              <TableRow
                key={subscription._id}
                className="border-b border-[#B6B6B6]"
              >
                <TableCell className="py-6 font-medium px-8 text-slate-700">
                  {subscription.title}
                </TableCell>
                <TableCell className="py-6 text-center px-8 text-slate-600 capitalize">
                  {subscription.type}
                </TableCell>
                <TableCell className="py-6 text-center px-8 text-slate-600">
                  ${subscription.price}
                </TableCell>
                <TableCell className="py-6 text-center px-8 text-slate-600 max-w-[200px] truncate">
                  {subscription.description}
                </TableCell>
                <TableCell className="py-6 text-center px-8 text-slate-600">
                  {subscription.totalSubscripeUser?.length || 0}
                </TableCell>
                <TableCell className="py-6 px-8">
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => handleEdit(subscription)}
                      className="text-slate-600 hover:text-blue-600 transition-colors"
                    >
                      <SquarePen className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(subscription._id)}
                      className="text-slate-600 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination Section */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-[#FFFFFF]">
          <p className="text-sm text-slate-500">
            Showing page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 w-8 text-slate-400 bg-slate-50 border-slate-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <Button
                key={i}
                variant={page === i + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setPage(i + 1)}
                className={`h-8 w-8 ${page === i + 1 ? "bg-[#3ee0cf] text-white" : "border-slate-200 text-slate-600"}`}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 w-8 text-slate-600 border-slate-200"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-[525px] p-8 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-800">
              {editData ? "Edit Membership" : "Add Membership"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 mt-4">
              {/* Type */}
              <div className="grid gap-2">
                <Label className="text-lg text-slate-800">Type</Label>
                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger className="h-12 border-slate-200 rounded-lg">
                    <SelectValue placeholder="Select Membership type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="6month">6 Month</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="grid gap-2">
                <Label className="text-lg text-slate-800">Title</Label>
                <Input
                  placeholder="Type title here..."
                  className="h-12 border-slate-200 rounded-lg"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>

              {/* Price */}
              <div className="grid gap-2">
                <Label className="text-lg text-slate-800">Price</Label>
                <Input
                  type="number"
                  placeholder="Enter price..."
                  className="h-12 border-slate-200 rounded-lg"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="grid gap-2">
                <Label className="text-lg text-slate-800">Description</Label>
                <textarea
                  className="border rounded-lg p-3 min-h-[80px] border-slate-200"
                  placeholder="Write description..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>

              {/* Content (Features) */}
              <div className="grid gap-2">
                <Label className="text-lg text-slate-800">
                  Content (comma-separated features)
                </Label>
                <textarea
                  className="border rounded-lg p-3 min-h-[80px] border-slate-200"
                  placeholder="Feature 1, Feature 2, Feature 3..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-center mt-2">
                <Button
                  type="submit"
                  disabled={addMutation.isPending || editMutation.isPending}
                  className="bg-[#3ee0cf] hover:bg-[#3ee0cf]/90 text-white px-10 py-6 text-lg font-medium rounded-lg"
                >
                  {editData ? "Update" : "Save"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
