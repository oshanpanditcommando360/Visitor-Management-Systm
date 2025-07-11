"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { createEndUser } from "@/actions/enduser";
import { toast } from "sonner";

const departments = ["FINANCE", "ADMIN", "HR", "IT", "OPERATIONS"];
const approvalTypes = ["CLIENT_ONLY", "END_USER_ONLY", "BOTH"];

export default function AddEndUser() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    post: "",
    password: "",
    department: "",
    approvalType: "CLIENT_ONLY",
    canAddVisitor: false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const client = JSON.parse(localStorage.getItem("clientInfo"));
    if (!client) return;
    if (!form.name || !form.email || !form.password || !form.department)
      return toast.error("Please fill all fields");
    setLoading(true);
    try {
      await createEndUser({ ...form, clientId: client.clientId });
      toast.success("End user created");
      setForm({ name: "", email: "", post: "", password: "", department: "", approvalType: "CLIENT_ONLY", canAddVisitor: false });
    } catch {
      toast.error("Failed to create");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  return (
    <Card className="max-w-xl mx-auto">
      <CardContent className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Add End User</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="block text-sm font-medium mb-1">Name</Label>
            <Input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div>
            <Label className="block text-sm font-medium mb-1">Email</Label>
            <Input name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div>
            <Label className="block text-sm font-medium mb-1">Post</Label>
            <Input name="post" value={form.post} onChange={handleChange} />
          </div>
          <div>
            <Label className="block text-sm font-medium mb-1">Password</Label>
            <Input name="password" type="password" value={form.password} onChange={handleChange} required />
          </div>
          <div>
            <Label className="block text-sm font-medium mb-1">Department</Label>
            <Select onValueChange={(v)=>setForm(p=>({...p,department:v}))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d)=>(
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="block text-sm font-medium mb-1">Approval Type</Label>
            <Select onValueChange={(v)=>setForm(p=>({...p,approvalType:v}))} defaultValue="CLIENT_ONLY">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {approvalTypes.map((t)=>(
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <input
              id="can-add"
              type="checkbox"
              checked={form.canAddVisitor}
              onChange={(e) => setForm((p) => ({ ...p, canAddVisitor: e.target.checked }))}
            />
            <Label htmlFor="can-add">Allow End User to add visitor</Label>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading?"Submitting...":"Add End User"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
