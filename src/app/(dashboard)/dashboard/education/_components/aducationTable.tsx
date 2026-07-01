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
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import DynamicPageHeader from "@/components/PageHeader";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Education, EducationResponse } from "@/types/educationDataType";


export default function EducationTable() {
  const [page, setPage] = React.useState(1);

  // MODAL STATE
  const [open, setOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const [selectedEducation, setSelectedEducation] =
    React.useState<Education | null>(null);

  const [institutionName, setInstitutionName] = React.useState("");
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const queryClient = useQueryClient();
  const session = useSession();
  const token = session?.data?.user?.accessToken || "";

  // ================= FETCH =================
  const { data, isLoading } = useQuery<EducationResponse>({
    queryKey: ["education", page],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/education?page=${page}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) throw new Error("Failed to fetch education");

      return res.json();
    },
    enabled: !!token,
  });

  // ================= ADD =================
  const addMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/education`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ institutionName }),
        },
      );

      if (!res.ok) throw new Error("Failed to add education");

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["education"] });
      setOpen(false);
      setInstitutionName("");
    },
  });

  // ================= UPDATE =================
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedEducation) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/education/${selectedEducation._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ institutionName }),
        },
      );

      if (!res.ok) throw new Error("Update failed");

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["education"] });
      setEditOpen(false);
      setSelectedEducation(null);
      setInstitutionName("");
    },
  });

  // ================= DELETE =================
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/education/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) throw new Error("Delete failed");

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["education"] });
    },
  });

  // ================= HANDLERS =================
  const handleEdit = (item: Education) => {
    setSelectedEducation(item);
    setInstitutionName(item.institutionName);
    setEditOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId);
    setDeleteOpen(false);
    setDeleteId(null);
  };

  // ================= PAGINATION =================
  const total = data?.meta?.total || 0;
  const limit = data?.meta?.limit || 10;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-8 mb-8">
        <DynamicPageHeader pageTitle="Education" />

        <Button
          onClick={() => {
            setInstitutionName("");
            setOpen(true);
          }}
          className="bg-[#3ee0cf] hover:bg-[#3ee0cf]/90 text-white flex items-center gap-2 px-4 py-2 h-11"
        >
          <Plus className="w-5 h-5" />
          Add Education
        </Button>
      </div>

      {/* ADD MODAL */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Education</DialogTitle>
          </DialogHeader>

          <Input
            placeholder="Institution Name"
            value={institutionName}
            onChange={(e) => setInstitutionName(e.target.value)}
          />

          <Button className="bg-[#3ee0cf] text-white" onClick={() => addMutation.mutate()}>
            {addMutation.isPending ? "Adding..." : "Add"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Education</DialogTitle>
          </DialogHeader>

          <Input
            value={institutionName}
            onChange={(e) => setInstitutionName(e.target.value)}
          />

          <Button className="bg-[#3ee0cf] text-white" onClick={() => updateMutation.mutate()}>
            {updateMutation.isPending ? "Updating..." : "Update"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* DELETE MODAL */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Education</DialogTitle>
          </DialogHeader>

          <p>Are you sure you want to delete this education?</p>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>

            <Button className="bg-red-500 text-white" onClick={confirmDelete}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* TABLE */}
      <div className="border-t border-[#B6B6B6] rounded-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-[#B6B6B6]">
              <TableHead className="py-4 font-bold px-8">
                Institution Name
              </TableHead>
              <TableHead className="py-4 font-bold px-8 text-center">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-10">
                  Loading...
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.map((item: Education) => (
                <TableRow key={item._id}>
                  <TableCell className="py-6 px-8">
                    {item.institutionName}
                  </TableCell>

                  <TableCell className="py-6 px-8">
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-slate-600 hover:text-blue-600"
                      >
                        <SquarePen className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-slate-600 hover:text-rose-600"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* PAGINATION */}
        <div className="flex flex-col gap-3 px-4 py-4 border-t sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-slate-500">
            Page {page} of {totalPages || 1}
          </p>

          <div className="flex gap-1 overflow-x-auto">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="sm"
                className="w-8 h-8 bg-[#3ee0cf] text-white"
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            ))}

            <Button
              variant="outline"
              size="icon"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}