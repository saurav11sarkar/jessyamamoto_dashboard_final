"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, Pie, PieChart, Cell } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"

const earningsConfig = {
  earnings: {
    label: "Earnings",
    color: "hsl(221.2 83.2% 53.3%)",
  },
} satisfies ChartConfig

interface EarningsItem {
  _id: {
    year: number
    month: number
  }
  totalAmount: number
}

// --- Booking Distribution ---
const bookingData = [
  { service: "Service A", value: 100, fill: "#0095FF" },
  { service: "Service B", value: 100, fill: "#3ee0cf" },
  { service: "Service C", value: 100, fill: "#76D9D1" },
  { service: "Service D", value: 100, fill: "#6A0DAD" },
  { service: "Service E", value: 200, fill: "#FFD66B" },
]

export default function DashboardCharts() {

  const { data: session } = useSession()
  const token = session?.user?.accessToken || ""
 const [selectedValue, setSelectedValue] = React.useState("monthly")
  const { data } = useQuery({
    queryKey: ["Earnings", selectedValue],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/dashboard/earnings?filter=${selectedValue}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!res.ok) throw new Error("Failed to fetch earnings")

      return res.json()
    },
    enabled: !!token
  })

  const earningsData =
    data?.data?.map((item: EarningsItem) => ({
      month: new Date(item._id.year, item._id.month - 1).toLocaleString(
        "en-US",
        { month: "short" }
      ),
      earnings: item.totalAmount,
    })) || []                               

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">

      {/* Earnings Chart */}
      <Card className="lg:col-span-2 border-none shadow-sm">
        <CardHeader className="flex flex-col gap-3 space-y-0 pb-10 sm:flex-row sm:items-start sm:justify-between sm:gap-0">
          <div className="grid gap-1">
            <CardTitle className="text-xl font-bold">Earnings Overview</CardTitle>
            <CardDescription>
              Track total revenue, platform commission, and payouts over time.
            </CardDescription>
          </div>

          <Select defaultValue="monthly" onValueChange={setSelectedValue}>
            <SelectTrigger className="w-[110px] h-8 text-xs">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent>
          <ChartContainer config={earningsConfig} className="h-[400px] w-full">

            <AreaChart data={earningsData} margin={{ left: -20, right: 10 }}>

              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="#f0f0f0"
              />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                className="text-xs text-muted-foreground"
              />

              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    className="w-32"
                    hideLabel
                    indicator="dot"
                  />
                }
              />

              <Area
                type="monotone"
                dataKey="earnings"
                stroke="#3ee0cf"
                strokeWidth={2}
                fill="#F8FAFC"
                fillOpacity={0.8}
              />

            </AreaChart>

          </ChartContainer>
        </CardContent>
      </Card>

      {/* Booking Distribution */}
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-col gap-3 space-y-0 pb-10 sm:flex-row sm:items-start sm:justify-between sm:gap-0">
          <div className="grid gap-1">
            <CardTitle className="text-xl font-bold">
              Booking Distribution
            </CardTitle>
            <CardDescription>
              See which services are booked the most by users.
            </CardDescription>
          </div>

          <Select defaultValue="monthly">
            <SelectTrigger className="w-[110px] h-8 text-xs">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col items-center">

            <ChartContainer config={{}} className="mx-auto aspect-square h-[250px]">
              <PieChart>
                <Pie
                  data={bookingData}
                  dataKey="value"
                  nameKey="service"
                  innerRadius={60}
                  outerRadius={100}
                  strokeWidth={0}
                >
                  {bookingData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>

          </div>
        </CardContent>
      </Card>

    </div>
  )
}
