"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { signInEndUser } from "@/actions/enduser";
import { toast } from "sonner";

export default function EndUserSignIn(){
  const [form, setForm] = useState({email:"", password:""});
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    setError("");
    if(!form.email || !form.password){
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    try{
      const res = await signInEndUser(form);
      toast.success("Login successful!");
      localStorage.setItem("endUserInfo", JSON.stringify({
        id: res.id,
        name: res.name,
        email: res.email,
        department: res.department,
        post: res.post,
        approvalType: res.approvalType,
        clientId: res.clientId,
      }));
      router.push("/end-user-view/dashboard");
    }catch(err){
      setError(err.message || "An error occurred");
      toast.error(err.message || "An error occurred");
    }finally{
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const {name, value} = e.target;
    setForm((p)=>({...p,[name]:value}));
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-center">End User Login</h2>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <Input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <Input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
          <Button className="w-full" onClick={handleSubmit} disabled={loading}>{loading?"Signing in...":"Sign In"}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
