"use client"

import React, { useState } from 'react'
import DynamicPageHeader from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, EyeIcon, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useDebounce } from 'use-debounce'

// Define types
type Service = {
  _id: string
  location: string
  email: string
  firstName: string
  lastName: string
  gender: string
  hourRate: number
  days: { day: string[], time: string[] }
}

type Category = {
  _id: string
  name: string
}

type User = {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: string
  profileImage?: string
  phone?: string
}

type Booking = {
  _id: string
  userId: User
  serviceId: Service
  categoryId: Category
  day: string
  date: string
  time: string
  status: string
  location: string
  disputeReason?: string
}

const statusBadgeClass = (status?: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800"
    case "cancelled":
    case "declined":
      return "bg-red-100 text-red-800"
    case "confirmed":
    case "accepted":
      return "bg-blue-100 text-blue-800"
    case "no_show":
      return "bg-orange-100 text-orange-800"
    case "disputed":
      return "bg-purple-100 text-purple-800"
    default:
      return "bg-yellow-100 text-yellow-800"
  }
}

type Meta = {
  total: number
  page: number
  limit: number
}

type BookingResponse = {
  data: Booking[]
  meta: Meta
}

const RESOLUTION_OPTIONS = [
  { value: "completed", label: "Resolve — Mark Completed" },
  { value: "confirmed", label: "Resolve — Keep Confirmed" },
  { value: "cancelled", label: "Resolve — Cancel & Refund" },
] as const

const BookingData = () => {
  const session = useSession()
  const token = session?.data?.user?.accessToken || ""
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [resolutionStatus, setResolutionStatus] = useState<string>("completed")
  const [resolutionNotes, setResolutionNotes] = useState("")

  const { data, isLoading } = useQuery<BookingResponse>({
    queryKey: ["booking", page, debouncedSearchTerm],
    enabled: !!token,
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/booking?page=${page}&limit=10&searchTerm=${encodeURIComponent(debouncedSearchTerm)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      if (!res.ok) throw new Error("Failed to fetch bookings")
      return res.json()
    },
  })

  const resolveDisputeMutation = useMutation({
    mutationFn: async ({
      bookingId,
      status,
      notes,
    }: {
      bookingId: string
      status: string
      notes: string
    }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/booking/${bookingId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status, disputeResolutionNotes: notes }),
        }
      )
      const result = await res.json()
      if (!res.ok) throw new Error(result.message || "Failed to resolve dispute")
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking"] })
      setIsModalOpen(false)
      setSelectedBooking(null)
      setResolutionNotes("")
    },
    onError: (error: Error) => {
      window.alert(error.message || "Failed to resolve dispute")
    },
  })

  if (isLoading) return <p className="p-6 text-center">Loading...</p>

  const bookings: Booking[] = data?.data || []
  const meta: Meta = data?.meta || { total: 0, page: 1, limit: 10 }
  const totalPages = Math.ceil(meta.total / meta.limit)

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-8 mb-8">
        <DynamicPageHeader pageTitle="Bookings" />

        <div className="flex w-full max-w-sm items-center overflow-hidden rounded-lg border border-[#666666] focus-within:ring-1 focus-within:ring-ring">
          <Input
            type="text"
            placeholder="Search by Customer Name"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
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
              <TableHead className="py-4 font-bold px-8 text-slate-800">Service Provider</TableHead>
              <TableHead className="py-4 font-bold px-8 text-slate-800 text-center">Service Name</TableHead>
              <TableHead className="py-4 font-bold px-8 text-slate-800 text-center">Customer</TableHead>
              <TableHead className="py-4 font-bold px-8 text-slate-800 text-center">Date</TableHead>
              <TableHead className="py-4 font-bold px-8 text-slate-800 text-center">Status</TableHead>
              <TableHead className="py-4 font-bold px-8 text-slate-800 text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings?.map((b) => (
              <TableRow key={b._id} className="border-b border-[#B6B6B6]">
                <TableCell className="py-6 font-medium px-8 text-slate-700">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={typeof b?.userId?.profileImage === "string" ? b.userId.profileImage : ""}
                        alt={b?.userId?.firstName}
                      />
                      <AvatarFallback>{b?.userId?.firstName?.[0]}</AvatarFallback>
                    </Avatar>
                    {b?.serviceId?.firstName} {b?.serviceId?.lastName}
                  </div>
                </TableCell>
                <TableCell className="py-6 text-center px-8 text-slate-600">{b?.categoryId?.name}</TableCell>
                <TableCell className="py-6 text-center px-8 text-slate-600">
                  <div className="flex flex-col items-start gap-1">
                    <span>{b?.userId?.firstName} {b?.userId?.lastName}</span>
                    <span className="text-sm text-gray-500">{b?.userId?.email}</span>
                  </div>
                </TableCell>
                <TableCell className="py-6 text-center px-8 text-slate-600">{b?.date}</TableCell>
                <TableCell className="py-6 text-center px-8 text-slate-600">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadgeClass(b?.status)}`}>
                    {b?.status}
                  </span>
                </TableCell>
                <TableCell className="py-6 px-8">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      className="text-white py-1 px-2 rounded-md bg-[#3ee0cf] hover:bg-[#3ee0cf]/80 transition-colors"
                      onClick={() => {
                        setSelectedBooking(b)
                        setResolutionStatus("completed")
                        setResolutionNotes("")
                        setIsModalOpen(true)
                      }}
                    >
                      <EyeIcon className="w-5 h-5 text-white" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex flex-col gap-3 px-4 py-4 border-t bg-[#FFFFFF] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-slate-500">
            Showing {(meta.page - 1) * meta.limit + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} results
          </p>
          <div className="flex items-center gap-1 overflow-x-auto">
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

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl w-full max-h-[85vh] overflow-y-auto p-4 sm:p-6 rounded-lg shadow-lg bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold mb-2">Booking Details</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">Detailed info of the selected booking.</DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={typeof selectedBooking?.userId?.profileImage === "string" ? selectedBooking.userId.profileImage : ""}
                  />
                  <AvatarFallback>{selectedBooking?.userId?.firstName?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedBooking?.userId?.firstName} {selectedBooking?.userId?.lastName}</p>
                  <p className="text-sm text-slate-500">{selectedBooking?.userId?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <p><strong>Service Provider:</strong> {selectedBooking?.serviceId?.firstName} {selectedBooking?.serviceId?.lastName}</p>
                <p><strong>Service Name:</strong> {selectedBooking?.categoryId?.name}</p>
                <p><strong>Location:</strong> {selectedBooking?.location || selectedBooking?.serviceId?.location}</p>
                <p><strong>Hourly Rate:</strong> ${selectedBooking?.serviceId?.hourRate}</p>
                <p><strong>Day:</strong> {selectedBooking?.day}</p>
                <p><strong>Date:</strong> {selectedBooking?.date}</p>
                <p><strong>Time:</strong> {selectedBooking?.time}</p>
                <p><strong>Status:</strong>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadgeClass(selectedBooking?.status)}`}>
                    {selectedBooking?.status}
                  </span>
                </p>
              </div>
              {selectedBooking?.disputeReason && (
                <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 text-sm text-purple-900">
                  <p className="font-semibold">Dispute reason</p>
                  <p className="mt-1">{selectedBooking.disputeReason}</p>
                </div>
              )}

              {selectedBooking?.status === "disputed" && (
                <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">Resolve this dispute</p>
                  <div className="space-y-1.5">
                    <Label>Outcome</Label>
                    <Select value={resolutionStatus} onValueChange={setResolutionStatus}>
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RESOLUTION_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Resolution notes (sent to both parties)</Label>
                    <textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Explain the outcome and why..."
                      className="min-h-[90px] w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                  <Button
                    className="bg-[#3ee0cf] hover:bg-[#3ee0cf]/80 text-white"
                    disabled={!resolutionNotes.trim() || resolveDisputeMutation.isPending}
                    onClick={() =>
                      selectedBooking &&
                      resolveDisputeMutation.mutate({
                        bookingId: selectedBooking._id,
                        status: resolutionStatus,
                        notes: resolutionNotes.trim(),
                      })
                    }
                  >
                    {resolveDisputeMutation.isPending ? "Resolving..." : "Resolve Dispute"}
                  </Button>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button variant="default" onClick={() => setIsModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BookingData
