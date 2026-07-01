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

import AddServiceModal from "./add-component";
import DynamicPageHeader from "@/components/PageHeader";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Category, CategoryResponse } from "@/types/categorydata";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

export default function ServicesPage() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [editData, setEditData] = React.useState<Category | null>(null);
  const [page, setPage] = React.useState(1);

  const queryClient = useQueryClient();

  const session = useSession();
  const token = session?.data?.user?.accessToken || "";
  const userId = session?.data?.user?.id;

  const { data } = useQuery<CategoryResponse>({
    queryKey: ["service", page],
    enabled: !!userId && !!token,
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/category?page=${page}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/category/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      // backend error message show korbe
      if (!res.ok) {
        throw new Error(data?.message || "Delete failed");
      }

      return data;
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["service"],
      });

      toast.success(data?.message || "Category deleted successfully");
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast.error(err?.message || "Delete failed");
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleEdit = (service: Category) => {
    setEditData(service);
    setIsOpen(true);
  };

  const total = data?.meta?.total || 0;
  const limit = data?.meta?.limit || 10;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className=" min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-8 mb-8">
        <DynamicPageHeader pageTitle="Services" />
        <Button
          onClick={() => {
            setEditData(null);
            setIsOpen(true);
          }}
          className="bg-[#3ee0cf] hover:bg-[#3ee0cf]/90 text-white flex items-center gap-2 px-4 py-2 h-11"
        >
          <Plus className="w-5 h-5" />
          Add Category Service
        </Button>
      </div>

      {/* Table Section */}
      <div className="border-t border-[#B6B6B6] rounded-sm">
        <Table>
          <TableHeader className="">
            <TableRow className="hover:bg-transparent border-[#B6B6B6] ">
              <TableHead className="py-4 font-bold px-8 text-slate-800">
                Service Category Name
              </TableHead>
              <TableHead className="py-4 font-bold px-8 text-slate-800 text-center">
                Date
              </TableHead>
              <TableHead className="py-4 font-bold px-8 text-slate-800 text-center">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((service) => (
              <TableRow key={service._id} className="border-b border-[#B6B6B6]">
                <TableCell className="py-6 flex items-center font-medium px-8 text-slate-700">
                  <Avatar className="rounded-lg w-20 h-20">
                    <AvatarImage src={service.image} />
                  </Avatar>
                  <span className="ml-4">{service.name}</span>
                </TableCell>
                <TableCell className="py-6 text-center px-8 text-slate-600">
                  {new Date(service.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="py-6 px-8">
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => handleEdit(service)}
                      className="text-slate-600 hover:text-blue-600 transition-colors"
                    >
                      <SquarePen className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(service._id)}
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
        <div className="flex flex-col gap-3 px-4 py-4 border-t bg-[#FFFFFF] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-slate-500">
            Showing page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-1 overflow-x-auto">
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

      <AddServiceModal
        open={isOpen}
        setIsOpen={setIsOpen}
        editData={editData}
      />
    </div>
  );
}
