// "use client"

// import React from 'react';
// import Link from 'next/link';
// import { Button } from "@/components/ui/button";
// import { InputOTP } from "@/components/ui/input-otp";

// export default function VerifyEmail() {
//       const [otp, setOtp] = useState(["", "", "", "", "", ""])
//   const [timeLeft, setTimeLeft] = useState(54)
//   const router = useRouter()
//   const searchParams = useSearchParams();
//   const email = searchParams.get("email");
//   const decodedEmail = decodeURIComponent(email || "");

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setTimeLeft((prev) => {
//         const newTime = prev - 1
//         if (newTime <= 0) clearInterval(timer)
//         return Math.max(newTime, 0)
//       })
//     }, 1000)
//     return () => clearInterval(timer)
//   }, [])

//   // 🔢 Handle OTP input
//   const handleOtpChange = (value: string, index: number) => {
//     if (!/^\d*$/.test(value)) return
//     const newOtp = [...otp]
//     newOtp[index] = value.slice(-1)
//     setOtp(newOtp)
//     if (value && index < 5) {
//       document.getElementById(`otp-${index + 1}`)?.focus()
//     }
//   }

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
//     if (e.key === "Backspace" && !otp[index] && index > 0) {
//       document.getElementById(`otp-${index - 1}`)?.focus()
//     }
//   }

//   const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
//     e.preventDefault()
//     const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
//     if (digits.length > 0) {
//       const newOtp = digits.split("").concat(Array(6 - digits.length).fill(""))
//       setOtp(newOtp)
//       const nextEmptyIndex = newOtp.findIndex((d) => d === "")
//       const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex
//       setTimeout(() => {
//         document.getElementById(`otp-${focusIndex}`)?.focus()
//       }, 0)
//     }
//   }

//   const { mutate: verifyOtp, isPending: isVerifyingOtp } = useMutation({
//     mutationKey: ["verify-otp"],
//     mutationFn: async ({ email, otp }: { email: string; otp: string }) => {
//       const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/verify-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, otp }),
//       })
//       return res.json()
//     },
//     onSuccess: (data) => {
//       if (!data?.success) {
//         toast.error(data?.message || "Invalid OTP. Please try again.")
//         return
//       }
//       toast.success(data?.message || "OTP verified successfully!")
//       router.push("/change-password?email=" + encodeURIComponent(decodedEmail))
//     },
//     onError: (error) => {
//       console.error("Verify OTP error:", error)
//       toast.error("Something went wrong. Please try again.")
//     },
//   })

//   const { mutate: resendOtp, isPending: isResending } = useMutation({
//     mutationKey: ["resend-otp"],
//     mutationFn: async (email: string) => {
//       const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/forgot-password`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email }),
//       })
//       return res.json()
//     },
//     onSuccess: (data) => {
//       if (!data?.success) {
//         toast.error(data?.message || "Failed to resend OTP.")
//         return
//       }
//       toast.success(data?.message || "OTP sent successfully!")
//     },
//     onError: (error) => {
//       console.error("Resend OTP error:", error)
//       toast.error("Something went wrong. Please try again.")
//     },
//   })


//   const handleVerify = () => {
//     const fullOtp = otp.join("")
//     if (fullOtp.length !== 6) {
//       toast.error("Please enter a valid 6-digit OTP.")
//       return
//     }
//     verifyOtp({ email: decodedEmail, otp: fullOtp })

//   }

//   const handleResend = () => {
//     setOtp(["", "", "", "", "", ""])
//     setTimeLeft(54)
//     resendOtp(decodedEmail)

//   }

//   const isComplete = otp.every((digit) => digit !== "")
//   const formatTime = (seconds: number) => {
//     const mins = Math.floor(seconds / 60)
//     const secs = seconds % 60
//     return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
//   }

//     return (
//         <div className="min-h-screen w-full  flex items-center justify-center p-6">
//             <div className="w-full max-w-[400px] space-y-8">

//                 {/* Header Section */}
//                 <div className="space-y-2 text-left">
//                     <h1 className="text-3xl font-bold text-[#003366]">Verify Email</h1>
//                     <p className="text-gray-500 text-sm">
//                         Enter the 6-digit OTP sent to your email
//                     </p>
//                 </div>

//                 {/* OTP Input Section */}
//                 <div className="space-y-6">
//                     <div className="flex justify-center">
//                         <InputOTP maxLength={6} render={({ slots }) => (
//                             <div className="flex gap-4">
//                                 {slots.map((slot, index) => (
//                                     <div
//                                         key={index}
//                                         className="w-12 h-12 border-2 border-[#003366] rounded-md flex items-center justify-center bg-white"
//                                     >
//                                         <div className="text-xl font-semibold text-[#003366]">
//                                             {slot.char}
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         )} />
//                     </div>

//                     {/* Resend Link */}
//                     <div className="flex justify-end w-full">
//                         <p className="text-sm text-gray-400">
//                             Don&apos;t get a code?{" "}
//                             <Link href="#" className="text-[#003366] font-bold hover:underline">
//                                 Resend
//                             </Link>
//                         </p>
//                     </div>

//                     {/* Verify Button */}
//                     <Button
//                         className="w-full bg-[#003366] hover:bg-[#002855] text-white py-3 text-lg font-semibold"
//                     >
//                         Verify
//                     </Button>
//                 </div>

//             </div>
//         </div>
//     );
// }


"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function VerifyEmail() {
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(54);

  const router = useRouter();
  const searchParams = useSearchParams();
  const email = decodeURIComponent(searchParams.get("email") || "");

  /* ---------------- Timer ---------------- */
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  /* ---------------- Verify OTP ---------------- */
  const { mutate: verifyOtp, isPending: isVerifying } = useMutation({
    mutationKey: ["verify-otp"],
    mutationFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/verify-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        }
      );
      return res.json();
    },
    onSuccess: (data) => {
      if (!data?.success) {
        toast.error(data?.message || "Invalid OTP");
        return;
      }

      toast.success("OTP verified successfully");
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });

  /* ---------------- Resend OTP ---------------- */
  const { mutate: resendOtp, isPending: isResending } = useMutation({
    mutationKey: ["resend-otp"],
    mutationFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      return res.json();
    },
    onSuccess: (data) => {
      if (!data?.success) {
        toast.error(data?.message || "Failed to resend OTP");
        return;
      }

      toast.success("OTP resent successfully");
      setOtp("");
      setTimeLeft(54);
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });

  /* ---------------- Helpers ---------------- */
  const isComplete = otp.length === 6;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <div className="w-full max-w-[400px] space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[#3ee0cf]">
            Verify Email
          </h1>
          <p className="text-gray-500 text-sm">
            Enter the 6-digit OTP sent to your email
          </p>
        </div>

        {/* OTP */}
        <div className="space-y-6">
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
            >
              <InputOTPGroup className="gap-4">
                {[...Array(6)].map((_, i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="w-12 h-12 border-2 border-[#3ee0cf] text-xl font-semibold"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          {/* Resend */}
          <div className="flex justify-between text-sm text-gray-400">
            <span>
              Time left:{" "}
              <span className="font-semibold text-[#3ee0cf]">
                {formatTime(timeLeft)}
              </span>
            </span>

            <button
              disabled={timeLeft > 0 || isResending}
              onClick={() => resendOtp()}
              className="text-[#3ee0cf] font-bold disabled:text-gray-400"
            >
              Resend
            </button>
          </div>

          {/* Verify Button */}
          <Button
            disabled={!isComplete || isVerifying}
            onClick={() => verifyOtp()}
            className="w-full bg-[#3ee0cf] hover:bg-[#3ee0cf]/80 py-3 text-lg"
          >
            {isVerifying ? "Verifying..." : "Verify"}
          </Button>
        </div>
      </div>
    </div>
  );
}
