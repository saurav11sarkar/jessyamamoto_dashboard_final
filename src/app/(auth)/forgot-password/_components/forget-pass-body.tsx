"use client";

import React from "react";
import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* ---------------- Schema ---------------- */
const formSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ForgotPassword() {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["forgot-password"],
    mutationFn: async (email: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      return res.json();
    },

    onSuccess: (data, email) => {
      if (!data?.success) {
        toast.error(data?.message || "Something went wrong");
        return;
      }

      toast.success(data?.message || "OTP sent successfully");
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    },

    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });

  function onSubmit(values: FormValues) {
    mutate(values.email);
  }

  return (
    <div className="min-h-screen w-full bg-[#f8f9fa] flex items-center justify-center p-6">
      <div className="w-full max-w-[450px] space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[#3ee0cf]">
            Forgot Password
          </h1>
          <p className="text-muted-foreground text-sm">
            Enter your email to recover your password
          </p>
        </div>

        {/* Form */}
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

            <Input
              type="email"
              placeholder="Enter your email"
              className="pl-10 py-6"
              {...form.register("email")}
            />

            {form.formState.errors.email && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#3ee0cf] hover:bg-[#3ee0cf]/80 py-6"
          >
            {isPending ? "Sending..." : "Send OTP"}
          </Button>
        </form>
      </div>
    </div>
  );
}
