"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { signInClient } from "@/actions/client";
import { toast } from "sonner";

export default function ClientSignIn() {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setError("");
        const { email, password } = formData;

        if (!email || !password) {
            setError("Email and password are required.");
            return;
        }
        setLoading(true);
        try {
            const res = await signInClient({ email, password });
            toast.success("Login successful!");
            localStorage.setItem("clientInfo", JSON.stringify({
                name: res.name,
                email: res.email,
                phone: res.phone,
                clientId:res.id
            }));

            router.push("/client-view/dashboard");
        } catch (err) {
            setError(err.message || "An unexpected error occurred.");
            toast.error(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-muted flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardContent className="p-6 space-y-4">
                    <h2 className="text-2xl font-bold text-center">Client Login</h2>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <Input
                        name="email"
                        placeholder="Email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        name="password"
                        placeholder="Password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <Button className="w-full" onClick={handleSubmit} disabled={loading}>
                        {loading ? "Signing in..." : "Sign In"}
                    </Button>

                    <p className="text-sm text-center text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/client-view/sign-up" className="text-blue-600 hover:underline">
                            Sign Up
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
