"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LogOut,
  User2,
  UserPlus,
  LayoutPanelLeft,
  Settings,
  Gift,
  DollarSign,
  Calendar,
  Globe,
  Languages,
  BookText,
  FileText,
  Wallet,
  CreditCard,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";

const adminNavigation = [
  { name: "Dashboard Overview", href: "/dashboard", icon: LayoutPanelLeft },
  { name: "Services", href: "/dashboard/services", icon: Gift },
  { name: "Revenue", href: "/dashboard/revenue", icon: DollarSign },
  { name: "Bookings", href: "/dashboard/bookings", icon: Calendar },
  { name: "Country", href: "/dashboard/country", icon: Globe },
  { name: "Language", href: "/dashboard/language", icon: Languages },
  { name: "Education", href: "/dashboard/education", icon: BookText },
  { name: "Blog", href: "/dashboard/blog", icon: FileText },
  { name: "Subscriptions", href: "/dashboard/subscriptions", icon: CreditCard },
  { name: "Provider Payouts", href: "/dashboard/provider-payouts", icon: Wallet },
  { name: "Ambassadors", href: "/dashboard/ambassadors", icon: UserPlus },
  { name: "User Managements", href: "/dashboard/user-managements", icon: User2 },
  { name: "Settings", href: "/dashboard/setting", icon: Settings },
];

const ambassadorNavigation = [
  { name: "My Dashboard", href: "/dashboard/ambassador-panel", icon: LayoutPanelLeft },
  { name: "Settings", href: "/dashboard/setting", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string })?.role;
  const navigation = userRole === "ambassador" ? ambassadorNavigation : adminNavigation;

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
    setOpen(false);
  };

  return (
    <div className="flex flex-col w-[300px] bg-card border-r border-border h-screen">
      <div className="mt-10">
        <Link href="/" className="flex items-center justify-center w-full h-20">
          <Image src={"/logo.png"} alt="Logo" width={900} height={900} className="w-40 h-36" />
        </Link>
      </div>

      <nav className="flex-1 scrollbar-none px-4 mt-10 space-y-[24px] overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-2 py-3 text-[16px] font-medium rounded-md transition-colors",
                isActive
                  ? "bg-[#3ee0cf] text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon className="mr-3 h-6 w-6" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center px-3 py-2 m-4 text-sm font-medium rounded-md text-[#E5102E] hover:text-[#E5102E] hover:bg-muted transition-colors"
        type="button"
      >
        <LogOut className="mr-3 h-4 w-4" />
        Logout
      </button>

      {/* Logout confirmation modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to log out? You’ll need to log in again to access your dashboard.
          </p>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
