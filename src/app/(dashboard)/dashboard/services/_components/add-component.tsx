"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { toast } from "sonner";

const schema = z.object({
  dname: z
    .string()
    .min(1, "Service title is required")
    .min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  image: z.any().optional(),
  banner: z.any().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editData?: {
    _id?: string;
    name?: string;
    description?: string;
    image?: string;
    banner?: string[];
  } | null;
}

export default function AddServiceModal({ open, setIsOpen, editData }: Props) {
  const isEdit = !!editData?._id;
  const queryClient = useQueryClient();
  const session = useSession();
  const token = session?.data?.user?.accessToken || "";

  const [preview, setPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const watchedImage = watch("image");
  const watchedBanner = watch("banner");

  // ✅ Prefill when editing
  useEffect(() => {
    if (editData) {
      setValue("dname", editData.name || "");
      setValue("description", editData.description || "");
      setPreview(editData.image || null);
      setBannerPreview(editData.banner || []);
    } else {
      reset();
      setPreview(null);
      setBannerPreview([]);
    }
  }, [editData, setValue, reset]);

  // ✅ Logo preview
  useEffect(() => {
    const file = watchedImage?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [watchedImage]);

  // ✅ Banner preview (multiple)
  useEffect(() => {
    const files = watchedBanner;
    if (files?.length) {
      const urls = Array.from(files as File[]).map((file: File) =>
        URL.createObjectURL(file),
      );
      setBannerPreview(urls);

      return () => urls.forEach((url) => URL.revokeObjectURL(url));
    }
  }, [watchedBanner]);

  // ✅ Add mutation
  const addMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const fd = new FormData();

      fd.append("name", formData.dname);
      fd.append("description", formData.description || "");

      // logo
      const imageFile = formData.image?.[0];

      if (imageFile) {
        fd.append("image", imageFile);
      }

      // banner multiple
      const bannerFiles = formData.banner;

      if (bannerFiles?.length) {
        Array.from(bannerFiles as File[]).forEach((file: File) => {
          fd.append("banner", file);
        });
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/category`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: fd,
        },
      );

      const data = await res.json();

      // backend response show korbe
      if (!res.ok) {
        throw new Error(data?.message || "Create failed");
      }

      return data;
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["service"],
      });

      setIsOpen(false);
      reset();
      setPreview(null);
      setBannerPreview([]);

      toast.success(data?.message || "Category created successfully");
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast.error(err?.message || "Create failed");
    },
  });

  // ✅ Edit mutation
  const editMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const fd = new FormData();

      fd.append("name", formData.dname);
      fd.append("description", formData.description || "");

      const imageFile = formData.image?.[0];

      if (imageFile) {
        fd.append("image", imageFile);
      }

      const bannerFiles = formData.banner;

      if (bannerFiles?.length) {
        Array.from(bannerFiles as File[]).forEach((file: File) => {
          fd.append("banner", file);
        });
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/category/${editData?._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: fd,
        },
      );

      const data = await res.json();

      // backend error message show korbe
      if (!res.ok) {
        throw new Error(data?.message || "Update failed");
      }

      return data;
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["service"],
      });

      setIsOpen(false);
      reset();
      setPreview(null);
      setBannerPreview([]);

      toast.success(data?.message || "Category updated successfully");
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast.error(err?.message || "Update failed");
    },
  });

  const onSubmit = (data: FormData) => {
    if (isEdit) {
      editMutation.mutate(data);
    } else {
      addMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[525px] p-8 rounded-2xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-6">
            {/* Title */}
            <div className="grid gap-2">
              <Label className="text-lg text-slate-800">Service Title</Label>
              <Input
                placeholder="Type Title here..."
                className="h-12 border-slate-200 rounded-lg"
                {...register("dname")}
              />
              {errors.dname && (
                <p className="text-sm text-red-500">{errors.dname.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label className="text-lg text-slate-800">Description</Label>
              <textarea
                className="border rounded-lg p-3 min-h-[100px]"
                placeholder="Write description..."
                {...register("description")}
              />
            </div>

            {/* Logo */}
            <div className="grid gap-2">
              <Label className="text-lg text-slate-800">Service Logo</Label>
              <Input
                type="file"
                accept="image/*"
                className="h-12 border-slate-200 rounded-lg file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-[#3ee0cf] file:text-white file:rounded-md"
                {...register("image")}
              />

              {preview && (
                <div className="mt-3 flex justify-center">
                  <Image
                    width={200}
                    height={200}
                    src={preview}
                    alt="preview"
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>

            {/* Banner Multiple */}
            <div className="grid gap-2">
              <Label className="text-lg text-slate-800">
                Banner Images (Multiple)
              </Label>

              <Input
                type="file"
                accept="image/*"
                multiple
                className="h-12 border-slate-200 rounded-lg"
                {...register("banner")}
              />

              {bannerPreview.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-3 justify-center">
                  {bannerPreview.map((img, i) => (
                    <Image
                      key={i}
                      src={img}
                      width={120}
                      height={120}
                      alt="banner"
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Button */}
            <div className="flex justify-center mt-2">
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  addMutation.isPending ||
                  editMutation.isPending
                }
                className="bg-[#3ee0cf] hover:bg-[#3ee0cf]/90 text-white px-10 py-6 text-lg font-medium rounded-lg"
              >
                {isEdit ? "Update" : "Save"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
