"use client";

import { LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Redirect = () => {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.push("/dashboard");
        }, 500);
        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="flex h-screen w-full items-center justify-center bg-[#f8fbfb] px-4">
            <div className="flex flex-col items-center gap-5 rounded-2xl border border-[#3ee0cf]/20 bg-white px-8 py-9 text-center shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
                <div className="relative flex h-20 w-20 items-center justify-center">
                    <span className="absolute inset-0 rounded-full border-2 border-dashed border-[#3ee0cf] animate-spin" />
                    <span className="absolute inset-2 rounded-full border border-slate-200" />
                    <span className="absolute inset-4 rounded-full bg-[#3ee0cf]/10" />
                    <LayoutDashboard className="relative h-7 w-7 text-[#0f766e]" />
                </div>

                <div className="space-y-2">
                    <p className="text-base font-semibold text-slate-800">
                        Preparing your dashboard
                    </p>
                    <p className="text-sm font-medium text-slate-500">
                        Redirecting to your dashboard...
                    </p>
                </div>

                <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#3ee0cf]" />
                    <span className="h-1.5 w-5 animate-pulse rounded-full bg-[#3ee0cf]/70 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#3ee0cf]/45 [animation-delay:300ms]" />
                </div>
            </div>
        </div>
    );
};

export default Redirect;
