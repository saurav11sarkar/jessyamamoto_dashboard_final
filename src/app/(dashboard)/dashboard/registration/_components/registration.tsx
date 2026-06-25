"use client";

import React, { useState } from "react";
import DynamicPageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, EyeIcon, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type User = {
  _id: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  profileImage?: string;
  role: string;
  status: string;
  userStatus: string;
  city?: string;
  countery?: string;
  createdAt: string;
};

type UserResponse = {
  data: User[];
  meta: { total: number; page: number; limit: number };
};

const Registration = () => {
  const session = useSession();
  const token = session?.data?.user?.accessToken || "";
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<UserResponse>({
    queryKey: ["registrations", page, debouncedSearchTerm],
    enabled: !!token,
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/all-user?page=${page}&limit=10&searchTerm=${encodeURIComponent(debouncedSearchTerm)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userStatus: status }),
        }
      );
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      toast.success("Status updated successfully");
    },
    onError: () => toast.error("Failed to update status"),
  });

  const users: User[] = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, limit: 10 };
  const totalPages = Math.ceil(meta.total / meta.limit);

  if (isLoading) return <p className="p-6 text-center">Loading...</p>;

  return (
    <div className="min-h-screen">
      <div className="flex px-8 py-4 justify-between items-start mb-8">
        <DynamicPageHeader pageTitle="Registration Requests" />
        <div className="flex w-full max-w-sm items-center overflow-hidden rounded-lg border border-[#666666] focus-within:ring-1 focus-within:ring-ring">
          <Input
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="border-0 bg-transparent py-6 text-gray-500 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button
            type="submit"
            size="icon"
            className="h-12 w-16 rounded-none bg-[#3ee0cf] hover:bg-[#3ee0cf]/80 transition-colors"
          >
            <Search className="h-5 w-5 text-white" />
          </Button>
        </div>
      </div>

      <div className="border-t border-[#B6B6B6] rounded-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-[#B6B6B6]">
              <TableHead className="py-4 font-bold px-8 text-slate-800">Name</TableHead>
              <TableHead className="py-4 font-bold px-8 text-slate-800 text-center">Email</TableHead>
              <TableHead className="py-4 font-bold px-8 text-slate-800 text-center">Role</TableHead>
              <TableHead className="py-4 font-bold px-8 text-slate-800 text-center">Date</TableHead>
              <TableHead className="py-4 font-bold px-8 text-slate-800 text-center">Status</TableHead>
              <TableHead className="py-4 font-bold px-8 text-slate-800 text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id} className="border-b border-[#B6B6B6]">
                <TableCell className="py-6 font-medium px-8 text-slate-700">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={typeof user.profileImage === "string" ? user.profileImage : ""}
                        alt={user.firstName}
                      />
                      <AvatarFallback>{user.firstName?.[0]}</AvatarFallback>
                    </Avatar>
                    {user.firstName} {user.lastName}
                  </div>
                </TableCell>
                <TableCell className="py-6 text-center px-8 text-slate-600">{user.email}</TableCell>
                <TableCell className="py-6 text-center px-8 text-slate-600 capitalize">{user.role}</TableCell>
                <TableCell className="py-6 text-center px-8 text-slate-600">
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="py-6 text-center px-8">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.userStatus === "approved"
                        ? "bg-green-100 text-green-800"
                        : user.userStatus === "reject"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {user.userStatus || "pending"}
                  </span>
                </TableCell>
                <TableCell className="py-6 px-8">
                  <div className="flex items-center justify-center gap-2">
                    {user.userStatus !== "approved" && (
                      <button
                        onClick={() => updateStatus({ id: user._id, status: "approved" })}
                        className="text-white py-1 px-3 text-xs rounded-full bg-[#008000] hover:bg-[#008000]/80 transition-colors"
                      >
                        Approve
                      </button>
                    )}
                    {user.userStatus !== "reject" && (
                      <button
                        onClick={() => updateStatus({ id: user._id, status: "reject" })}
                        className="text-white py-1 px-3 text-xs rounded-full bg-[#F2415A] hover:bg-[#F2415A]/80 transition-colors"
                      >
                        Reject
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setIsOpen(true);
                      }}
                      className="text-white py-1 px-2 rounded-md bg-[#3ee0cf] hover:bg-[#3ee0cf]/80 transition-colors"
                    >
                      <EyeIcon className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between px-6 py-4 border-t bg-white">
          <p className="text-sm text-slate-500">
            Showing page {page} of {totalPages || 1}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages || 1 }).map((_, i) => (
              <Button
                key={i}
                variant={page === i + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setPage(i + 1)}
                className={`h-8 w-8 ${page === i + 1 ? "bg-[#3ee0cf] text-white" : ""}`}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              disabled={page === totalPages || !totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg p-6 rounded-lg shadow-lg bg-white">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Registration information</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14">
                  <AvatarImage
                    src={typeof selectedUser.profileImage === "string" ? selectedUser.profileImage : ""}
                  />
                  <AvatarFallback>{selectedUser.firstName?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </p>
                  <p className="text-sm text-slate-500">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <p><strong>Role:</strong> {selectedUser.role}</p>
                <p><strong>Status:</strong> {selectedUser.userStatus || "pending"}</p>
                <p><strong>Phone:</strong> {selectedUser.phone || "N/A"}</p>
                <p><strong>City:</strong> {selectedUser.city || "N/A"}</p>
                <p><strong>Country:</strong> {selectedUser.countery || "N/A"}</p>
                <p><strong>Registered:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button onClick={() => setIsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Registration;
