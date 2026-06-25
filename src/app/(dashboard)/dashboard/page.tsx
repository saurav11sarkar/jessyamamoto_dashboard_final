"use client";

import React from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { PageHeader } from './_components/PageHeader'
import DashboardStats from './_components/dashboard-stats'
import DashboardCharts from './_components/DashboardCharts'
import RecentBookings from './_components/recent-bookings'
import PendingApprovals from './_components/pending-approvals'

export default function DashboardPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string })?.role;

  if (userRole === 'ambassador') {
    redirect('/dashboard/ambassador-panel');
  }

  return (
    <div className=''>
      <PageHeader />
      <div className='p-6 space-y-6'>
        <DashboardStats />
        <DashboardCharts />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <RecentBookings />
          <PendingApprovals />
        </div>
      </div>
    </div>
  )
}