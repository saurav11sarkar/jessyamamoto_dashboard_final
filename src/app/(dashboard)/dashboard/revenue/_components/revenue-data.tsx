"use client"

import React, { useState } from "react"
import DynamicPageHeader from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { PaymentResponse } from "@/types/paymentdata"

// ✅ simple debounce hook
function useDebounce(value: string, delay = 500) {
  const [debounced, setDebounced] = React.useState(value)

  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

const LIMIT = 10

const RevenueData = () => {
  const session = useSession()
  const token = session?.data?.user?.accessToken || ""
  const userId = session?.data?.user?.id

  // ✅ states
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")

  const debouncedSearch = useDebounce(search, 500)

  // ✅ query
  const { data, isLoading } = useQuery<PaymentResponse>({
    queryKey: ["revenue", page, debouncedSearch],
    enabled: !!userId && !!token,
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/payment?page=${page}&limit=${LIMIT}&searchTerm=${debouncedSearch}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      if (!res.ok) throw new Error("Failed to fetch revenue")
      return res.json()
    },
  })

  // ✅ pagination calc
  const totalPages = Math.ceil((data?.meta?.total || 0) / LIMIT)

  const handlePrev = () => {
    if (page > 1) setPage((p) => p - 1)
  }

  const handleNext = () => {
    if (page < totalPages) setPage((p) => p + 1)
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex px-8 py-4 justify-between items-start mb-8">
        <DynamicPageHeader pageTitle="Revenue" />

        {/* ✅ Search */}
        <div className="flex w-full max-w-sm items-center overflow-hidden rounded-lg border border-[#666666] focus-within:ring-1 focus-within:ring-ring">
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1) // reset page on search
            }}
            type="text"
            placeholder="Search by email"
            className="border-0 bg-transparent py-6 text-gray-500 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button
            type="button"
            size="icon"
            className="h-12 w-16 rounded-none bg-[#3ee0cf] hover:bg-[#3ee0cf]/80"
          >
            <Search className="h-5 w-5 text-white" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border-t border-[#B6B6B6] rounded-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-[#B6B6B6]">
              <TableHead className="py-4 font-bold px-8 text-slate-800">
                Name
              </TableHead>
              <TableHead className="py-4 font-bold px-8 text-center">
                Service
              </TableHead>
              <TableHead className="py-4 font-bold px-8 text-center">
                Email
              </TableHead>
              <TableHead className="py-4 font-bold px-8 text-center">
                Amount
              </TableHead>
              <TableHead className="py-4 font-bold px-8 text-center">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  Loading...
                </TableCell>
              </TableRow>
            )}

            {!isLoading && data?.data?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  No revenue found
                </TableCell>
              </TableRow>
            )}

            {data?.data?.map((item) => {
              const user = item.user

              return (
                <TableRow key={item._id}>
                  <TableCell className="py-6 font-medium px-8">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={`https://ui-avatars.com/api/?name=${user?.firstName || "U"}`}
                        />
                        <AvatarFallback>
                          {user?.firstName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      {user
                        ? `${user.firstName} ${user.lastName}`
                        : "Unknown User"}
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    {item.paymentType}
                  </TableCell>

                  <TableCell className="text-center">
                    {user?.email || "—"}
                  </TableCell>

                  <TableCell className="text-center">
                    {item.amount} {item.currency}
                  </TableCell>

                  <TableCell className="text-center capitalize">
                    {item.status}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        {/* ✅ Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-white">
          <p className="text-sm text-slate-500">
            Page {page} of {totalPages || 1}
          </p>

          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrev}
              disabled={page === 1}
              variant="outline"
              size="icon"
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                onClick={() => setPage(p)}
                variant={p === page ? "default" : "outline"}
                size="sm"
                className={`h-8 w-8 ${p === page ? "bg-[#3ee0cf] text-white hover:bg-[#3ee0cf]/80" : "border-slate-200 text-slate-600"}`}
              >
                {p}
              </Button>
            ))}

            <Button
              onClick={handleNext}
              disabled={page === totalPages || totalPages === 0}
              variant="outline"
              size="icon"
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RevenueData
