"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import DynamicPageHeader from "@/components/PageHeader";

const Setting: React.FC = () => {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <div >
      <div className="px-8 py-4 ">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <DynamicPageHeader pageTitle="User Managements" />

        </div>

        {/* Setting Options */}
        <div className="space-y-4">
          {/* Personal Information */}
          <div
            onClick={() => handleNavigate("/dashboard/setting/profile")}
            className=" rounded-lg shadow-sm border border-[#B6B6B6] p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-900 font-medium">Personal Information</span>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>

          {/* Change Password */}
          <div
            onClick={() => handleNavigate("/dashboard/setting/update-password")}
            className=" rounded-lg shadow-sm border border-[#B6B6B6] p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-900 font-medium">Change Password</span>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setting;