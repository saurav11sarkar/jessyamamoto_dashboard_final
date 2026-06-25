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

import { Country, CountryResponse } from "@/types/countryDataType";
import { toast } from "sonner";

export default function LanguageTable() {
  const [page, setPage] = React.useState(1);

  // ================= MODAL STATE =================
  const [open, setOpen] = React.useState(false);

  // ================= EDIT MODAL STATE =================
  const [editOpen, setEditOpen] = React.useState(false);
  const [selectedCountry, setSelectedCountry] = React.useState<Country | null>(
    null,
  );

  // ================= FORM STATE =================
  const [languageName, setLanguageName] = React.useState("");

  // ================= DELETE MODAL STATE =================
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const queryClient = useQueryClient();

  const session = useSession();
  const token = session?.data?.user?.accessToken || "";

  // ================= FETCH LANGUAGE =================
  const { data, isLoading } = useQuery<CountryResponse>({
    queryKey: ["language", page],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/language?page=${page}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error("Failed to fetch languages");
      }

      return res.json();
    },
    enabled: !!token,
  });

// ================= ADD LANGUAGE =================
const addCountryMutation = useMutation({
  mutationFn: async () => {
    const body = {
      languageName,
    };

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/language`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();

    // backend error message show korbe
    if (!res.ok) {
      throw new Error(data?.message || "Failed to add language");
    }

    return data;
  },

  onSuccess: (data) => {
    queryClient.invalidateQueries({
      queryKey: ["language"],
    });

    setLanguageName("");
    setOpen(false);

    toast.success(
      data?.message || "Language added successfully"
    );
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onError: (err: any) => {
    toast.error(
      err?.message || "Failed to add language"
    );
  },
});

// ================= UPDATE LANGUAGE =================
const updateCountryMutation = useMutation({
  mutationFn: async () => {
    if (!selectedCountry) return;

    const body = {
      languageName,
    };

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/language/${selectedCountry._id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();

    // backend error message show korbe
    if (!res.ok) {
      throw new Error(data?.message || "Update failed");
    }

    return data;
  },

  onSuccess: (data) => {
    queryClient.invalidateQueries({
      queryKey: ["language"],
    });

    setEditOpen(false);
    setSelectedCountry(null);
    setLanguageName("");

    toast.success(
      data?.message || "Language updated successfully"
    );
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onError: (err: any) => {
    toast.error(err?.message || "Update failed");
  },
});

  // ================= DELETE LANGUAGE =================
 const deleteMutation = useMutation({
  mutationFn: async (id: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/language/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
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
      queryKey: ["language"],
    });

    toast.success(
      data?.message || "Language deleted successfully"
    );
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onError: (err: any) => {
    toast.error(err?.message || "Delete failed");
  },
});

  // ================= RESET =================
  const resetForm = () => {
    setLanguageName("");
    setSelectedCountry(null);
  };

  // ================= EDIT =================
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEdit = (lang: any) => {
    setSelectedCountry(lang);
    setLanguageName(lang.languageName);
    setEditOpen(true);
  };

  // ================= DELETE =================
  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
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
      <div className="flex px-8 py-4 justify-between items-start mb-8">
        <DynamicPageHeader pageTitle="Languages" />

        <Button
          onClick={() => {
            resetForm();
            setOpen(true);
          }}
          className="bg-[#3ee0cf] hover:bg-[#3ee0cf]/90 text-white flex items-center gap-2 px-4 py-2 h-11"
        >
          <Plus className="w-5 h-5" />
          Add Language
        </Button>
      </div>

      {/* ================= ADD MODAL ================= */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Language</DialogTitle>
          </DialogHeader>

          <Input
            placeholder="Enter language name"
            value={languageName}
            onChange={(e) => setLanguageName(e.target.value)}
          />

          <Button
            className="bg-[#3ee0cf] hover:bg-[#3ee0cf]/90"
            onClick={() => addCountryMutation.mutate()}
          >
            {addCountryMutation.isPending ? "Adding..." : "Add Language"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* ================= EDIT MODAL ================= */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Language</DialogTitle>
          </DialogHeader>

          <Input
            value={languageName}
            onChange={(e) => setLanguageName(e.target.value)}
          />

          <Button onClick={() => updateCountryMutation.mutate()}>
            {updateCountryMutation.isPending
              ? "Updating..."
              : "Update Language"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* ================= DELETE MODAL ================= */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Language</DialogTitle>
          </DialogHeader>

          <p>Are you sure you want to delete this language?</p>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>

            <Button
              className="bg-red-500 text-white"
              onClick={handleConfirmDelete}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ================= TABLE ================= */}
      <div className="border-t border-[#B6B6B6] rounded-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-[#B6B6B6]">
              <TableHead className="py-4 font-bold px-8 text-slate-800">
                Language Name
              </TableHead>
              <TableHead className="py-4 font-bold px-8 text-slate-800 text-center">
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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              data?.data?.map((lang: any) => (
                <TableRow key={lang._id}>
                  <TableCell className="py-6 px-8">
                    {lang.languageName}
                  </TableCell>

                  <TableCell className="py-6 px-8">
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={() => handleEdit(lang)}
                        className="text-slate-600 hover:text-blue-600"
                      >
                        <SquarePen className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => handleDeleteClick(lang._id)}
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
        <div className="flex items-center justify-between px-6 py-4 border-t bg-[#FFFFFF]">
          <p className="text-sm text-slate-500">
            Page {page} of {totalPages || 1}
          </p>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {[...Array.from({ length: totalPages }, (_, i) => i + 1)].map(
              (p) => (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="sm"
                  className="w-8 h-8 bg-[#3ee0cf] text-white"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ),
            )}

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

      {/* ================= DELETE CONFIRM MODAL ================= */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Language</DialogTitle>
          </DialogHeader>

          <p>Are you sure you want to delete this language?</p>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            
            <Button                                         
              className="bg-red-500 text-white"
              onClick={handleConfirmDelete}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
