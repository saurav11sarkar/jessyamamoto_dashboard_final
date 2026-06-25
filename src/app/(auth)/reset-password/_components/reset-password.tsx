"use client"

import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPassword() {
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const router = useRouter();
    const searchParams = useSearchParams();
    const decodedEmail = searchParams.get("email") || "";

    const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setNewPassword(value)
        setError("")
    }

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setConfirmPassword(value)
        setError("")
    }

    const validatePassword = () => {
        if (!newPassword) {
            setError("New password is required")
            return false
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters")
            return false
        }

        if (!confirmPassword) {
            setError("Please confirm your password")
            return false
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match")
            return false
        }

        return true
    }

    const { mutate, isPending } = useMutation({
        mutationKey: ["change-password"],
        mutationFn: async ({ email, newPassword }: { email: string; newPassword: string }) => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, newPassword }),
            })
            return res.json()
        },
        onSuccess: (data) => {
            if (!data?.success) {
                toast.error(data?.message || "Something went wrong.")
                return
            }
            toast.success(data?.message || "Password changed successfully!")
            router.push("/login")
        },
        onError: () => {
            toast.error("Something went wrong. Please try again.")
        },
    })

    const handleChangePassword = () => {
        if (!validatePassword()) return
        mutate({ email: decodedEmail, newPassword });
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6">
            <div className="w-full max-w-[400px] space-y-8">

                <div className="space-y-2 text-left">
                    <h1 className="text-3xl font-bold text-[#3ee0cf]">Reset Password</h1>
                    <p className="text-muted-foreground text-sm">
                        Create a new password
                    </p>
                </div>

                <form
                    className="space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault()
                        handleChangePassword()
                    }}
                >

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            type={showPass ? "text" : "password"}
                            placeholder="Create New Password"
                            value={newPassword}
                            onChange={handleNewPasswordChange}
                            className="pl-10 pr-10 py-6 bg-white border-gray-200 focus-visible:ring-[#3ee0cf] placeholder:text-gray-400"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            type={showConfirm ? "text" : "password"}
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            className="pl-10 pr-10 py-6 bg-white border-gray-200 focus-visible:ring-[#3ee0cf] placeholder:text-gray-400"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {error && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}

                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-[#3ee0cf] hover:bg-[#3ee0cf]/80 text-white py-6 text-lg font-semibold mt-4 transition-colors"
                    >
                        {isPending ? "Changing..." : "Change Password"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
