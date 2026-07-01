"use client";

import React, { useEffect, useState } from "react";
import { Save, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

interface PersonalInfoForm {
  fullName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  profileImage: string;
}

const PersonalInformation = () => {
  const session = useSession();
  const token = session?.data?.user?.accessToken || "";
  const userId = session?.data?.user?.id;

  const queryClient = useQueryClient();
  const userRole = (session?.data?.user as { role?: string })?.role;
  const isAmbassador = userRole === "ambassador";

  const [formData, setFormData] = useState<PersonalInfoForm>({
    fullName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    profileImage: "/placeholder.svg",
  });

  const [originalData, setOriginalData] =
    useState<PersonalInfoForm | null>(null);

  /* ================= FETCH PROFILE ================= */
  const profileUrl = isAmbassador
    ? `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/profile`
    : `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/${userId}`;

  const { data } = useQuery({
    queryKey: ["user-profile", userId],
    enabled: !!userId && !!token,
    queryFn: async () => {
      const res = await fetch(profileUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
  });


  useEffect(() => {
    if (data?.data) {
      const user = data.data;

      const mapped = {
        fullName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phone || "",
        profileImage: user.profileImage || "/placeholder.svg",
      };

      setFormData(mapped);
      setOriginalData(mapped);
    }
  }, [data]);

  const updateProfileImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("profileImage", file);

      const updateUrl = isAmbassador
        ? `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/profile`
        : `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/${userId}`;

      const res = await fetch(updateUrl, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Image update failed");
      return res.json();
    },
    onSuccess: (res) => {
      toast.success("Profile image updated");
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });

      if (res?.data?.profileImage) {
        setFormData((prev) => ({
          ...prev,
          profileImage: res.data.profileImage,
        }));
      }
    },
    onError: () => {
      toast.error("Failed to update profile image");
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: {
      firstName: string;
      lastName: string;
      phone: string;
    }) => {
      const updateUrl = isAmbassador
        ? `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/profile`
        : `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/${userId}`;

      const res = await fetch(updateUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Profile update failed");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateProfileMutation.mutate({
      firstName: formData.fullName,
      lastName: formData.lastName,
      phone: formData.phoneNumber,
    });
  };

  const handleCancel = () => {
    if (originalData) setFormData(originalData);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      profileImage: previewUrl,
    }));
    updateProfileImageMutation.mutate(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Setting</h1>
        <div className="flex gap-2 mt-2 text-sm text-gray-500">
          <span>Dashboard</span>
          <span>{">"}</span>
          <span>Setting</span>
          <span>{">"}</span>
          <span>Personal Information</span>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4 sm:p-6 mb-6 relative">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 relative">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={formData.profileImage} />
                <AvatarFallback>
                  {formData.fullName
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              {/* Loading overlay */}
              {updateProfileImageMutation.isPending && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                  <div className="animate-spin border-4 border-white border-t-transparent rounded-full h-10 w-10"></div>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                {formData.fullName} {formData.lastName}
              </h2>
              <p className="text-sm text-gray-500">{formData.email}</p>
            </div>
          </div>

          <div>
            <input
              type="file"
              id="profileImage"
              accept="image/*"
              hidden
              onChange={handleImageUpload}
            />
            <Button
              type="button"
              onClick={() =>
                document.getElementById("profileImage")?.click()
              }
              className="bg-[#3ee0cf]/80 text-white hover:bg-[#3ee0cf]"
            >
              <Upload className="h-4 w-4 mr-2" />
              Update Profile
            </Button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label>Full Name</Label>
              <Input
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Last Name</Label>
              <Input
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label>Phone Number</Label>
              <Input
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phoneNumber: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input value={formData.email} disabled />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="text-red-600 border-red-300"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>

          <Button type="submit" className="bg-[#3ee0cf] text-white hover:bg-[#3ee0cf]/80">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PersonalInformation;
