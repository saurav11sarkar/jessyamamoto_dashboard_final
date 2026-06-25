"use client";

import React, { useState } from "react";
import DynamicPageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useDebounce } from "use-debounce";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Meta, User, UserResponse } from "../../../../../types/userdatatype";

const UserData = () => {
  const session = useSession();
  const token = session?.data?.user?.accessToken || "";
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

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
          body: JSON.stringify({
            userStatus: status,
          }),
        },
      );

      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  const handleStatusChange = (id: string, status: string) => {
    updateStatus({ id, status });
  };

  const { data, isLoading } = useQuery<UserResponse>({
    queryKey: ["user", page, debouncedSearchTerm],
    enabled: !!token,
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/all-user?page=${page}&limit=10&searchTerm=${debouncedSearchTerm ? debouncedSearchTerm : ""}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  if (isLoading) return <p className="p-6 text-center">Loading...</p>;

  const users: User[] = data?.data || [];
  const meta: Meta = data?.meta || { total: 0, page: 1, limit: 5 };
  const totalPages = Math.ceil(meta.total / meta.limit);
  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="flex px-8 py-4 justify-between items-start mb-8">
        <DynamicPageHeader pageTitle="User Managements" />

        <div className="flex w-full max-w-sm items-center overflow-hidden rounded-lg border border-[#666666] focus-within:ring-1 focus-within:ring-ring">
          <Input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            type="text"
            placeholder="Search by Category Name"
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

      {/* Table Section */}
      <div className="border-t border-[#B6B6B6] rounded-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-[#B6B6B6]">
              <TableHead className="py-4 font-bold px-8 text-slate-800">
                User Name
              </TableHead>
              <TableHead className="py-4 font-bold px-8 text-slate-800">
                Email
              </TableHead>
              <TableHead className="py-4 font-bold px-8 text-slate-800 text-center">
                Total Booking
              </TableHead>
              <TableHead className="py-4 font-bold px-8 text-slate-800 text-center">
                Completed booking
              </TableHead>
              <TableHead className="py-4 font-bold px-8 text-slate-800 text-center">
                Cancel Booking
              </TableHead>

              {/* ✅ NEW COLUMN */}
              <TableHead className="py-4 font-bold px-8 text-slate-800 text-center">
                Status
              </TableHead>

              <TableHead className="py-4 font-bold px-8 text-slate-800 text-center">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {users.map((user) => {
              const totalBooking = user.totalBooking?.length || 0;
              const completedBooking = user.completeBooking?.length || 0;
              const cancelledBooking = user.cencleBooking?.length || 0;

              return (
                <TableRow key={user._id} className="border-b border-[#B6B6B6]">
                  <TableCell className="py-6 font-medium px-8 text-slate-700">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={
                            typeof user.profileImage === "string"
                              ? user.profileImage
                              : Array.isArray(user.profileImage)
                                ? user.profileImage[0]
                                : ""
                          }
                          alt={user.firstName}
                        />
                        <AvatarFallback>{user.firstName?.[0]}</AvatarFallback>
                      </Avatar>
                      {user.firstName} {user.lastName}
                    </div>
                  </TableCell>
                  <TableCell className="py-6  text-slate-600">
                    {user.email}
                  </TableCell>
                  <TableCell className="py-6 text-center px-8 text-slate-600">
                    {totalBooking}
                  </TableCell>
                  <TableCell className="py-6 text-center px-8 text-slate-600">
                    {completedBooking}
                  </TableCell>
                  <TableCell className="py-6 text-center px-8 text-slate-600">
                    {cancelledBooking}
                  </TableCell>

                  {/* ✅ STATUS DROPDOWN */}
                  <TableCell className="py-6 text-center px-8">
                    {user.role === "find care" ? (
                      <span className="text-slate-400 text-sm">Approved</span>
                    ) : (
                      <select
                        value={user.userStatus || "panding"}
                        onChange={(e) =>
                          handleStatusChange(user._id, e.target.value)
                        }
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all duration-200 focus:outline-none cursor-pointer
        ${
          user.userStatus === "approved"
            ? "bg-green-100 text-green-700 border-green-300 hover:bg-green-200"
            : user.userStatus === "reject"
              ? "bg-red-100 text-red-700 border-red-300 hover:bg-red-200"
              : "bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200"
        }
      `}
                      >
                        <option value="panding">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="reject">Reject</option>
                      </select>
                    )}
                  </TableCell>

                  <TableCell className="py-6 px-8">
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsModalOpen(true);
                        }}
                        className="text-white py-1 px-2 text-[12px] rounded-md bg-[#3ee0cf] hover:bg-[#3ee0cf]/80 transition-colors"
                      >
                        Details
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Pagination (UNCHANGED) */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-[#FFFFFF]">
          <p className="text-sm text-slate-500">
            Showing {meta.page * meta.limit - meta.limit + 1} to{" "}
            {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}{" "}
            results
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-slate-400 bg-slate-50 border-slate-200"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="sm"
                className={`h-8 w-8 ${p === page ? "bg-[#3ee0cf] text-white" : "border-slate-200 text-slate-600"}`}
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-slate-600 border-slate-200"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* MODAL (UNCHANGED) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl w-full bg-white h-[600px] overflow-y-scroll rounded-lg p-6 shadow-lg">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected user.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="mt-4 space-y-6 text-sm text-slate-700">
              {/* Basic Info */}
              <div className="flex gap-3 flex-wrap">
                <Avatar className="h-14 w-14">
                  <AvatarImage
                    src={
                      typeof selectedUser.profileImage === "string"
                        ? selectedUser.profileImage
                        : Array.isArray(selectedUser.profileImage)
                          ? selectedUser.profileImage[0]
                          : ""
                    }
                  />
                  <AvatarFallback>{selectedUser.firstName?.[0]}</AvatarFallback>
                </Avatar>

                <div className="ml-2">
                  <p className="text-lg font-semibold">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </p>
                  <p className="text-slate-500">{selectedUser.email}</p>
                </div>
              </div>
              {/* Status Info */}
              <div className="grid grid-cols-2 gap-3">
                <p>
                  <strong>User Role:</strong> {selectedUser.role}
                </p>
                <p>
                  <strong>User Status:</strong> {selectedUser.userStatus}
                </p>
                <p>
                  <strong>Account Status:</strong> {selectedUser.status}
                </p>
                <p>
                  <strong>Subscription:</strong>{" "}
                  {selectedUser.isSubscription ? "Active" : "Inactive"}
                </p>
              </div>

              {/* Location */}
              <div className="p-3 bg-slate-50 rounded-md">
                <p className="font-semibold mb-1">Location</p>
                <p>{selectedUser.location || "N/A"}</p>
                <p>
                  {selectedUser.city} {selectedUser.countery}
                </p>
              </div>

              {/* Booking Info */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 border rounded-md">
                  <p className="text-xl font-bold">
                    {selectedUser.totalBooking?.length || 0}
                  </p>
                  <p className="text-xs">Total</p>
                </div>

                <div className="p-3 border rounded-md">
                  <p className="text-xl font-bold">
                    {selectedUser.completeBooking?.length || 0}
                  </p>
                  <p className="text-xs">Completed</p>
                </div>

                <div className="p-3 border rounded-md">
                  <p className="text-xl font-bold">
                    {selectedUser.cencleBooking?.length || 0}
                  </p>
                  <p className="text-xs">Cancelled</p>
                </div>
              </div>

              {/* Categories */}
              <div>
                <p className="font-semibold mb-2">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {selectedUser?.category?.length ? (
                    selectedUser.category.map((cat) => (
                      <span
                        key={cat._id}
                        className="px-2 py-1 text-xs bg-teal-100 text-teal-700 rounded-md"
                      >
                        {cat.name}
                      </span>
                    ))
                  ) : (
                    <p className="text-slate-400">No category</p>
                  )}
                </div>
              </div>

              {/* Service Info */}
              <div>
                <p className="font-semibold mb-2">Services</p>
                {selectedUser.service?.length ? (
                  selectedUser.service.map((srv) => (
                    <div
                      key={srv._id}
                      className="p-3 border rounded-md mb-2 text-xs"
                    >
                      <p>
                        <strong>Gender:</strong> {srv.gender}
                      </p>
                      <p>
                        <strong>Rate:</strong> ${srv.hourRate || "N/A"}/hr
                      </p>
                      <p>
                        <strong>Location:</strong> {srv.location}
                      </p>
                      <p>
                        <strong>Status:</strong> {srv.status}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400">No service data</p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserData;
