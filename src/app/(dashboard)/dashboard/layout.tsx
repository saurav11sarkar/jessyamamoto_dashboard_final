import React from "react";
import { DashboardSidebar } from "./_components/sidebar";

function layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <div className="flex h-screen overflow-hidden">
                <DashboardSidebar />
                
                <div className="flex-1  bg-[#EDEEF1] overflow-y-auto">
                    <div className="min-h-screen">{children}</div>
                </div>
            </div>
        </>
    );
}

export default layout;