"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { addVisitorByClient } from "@/actions/client";
import { getCurrentClient } from "@/actions/session";
import { toast } from "sonner";

const departments = ["FINANCE", "ADMIN", "HR", "IT", "OPERATIONS"];
const fmt = (v) => v.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

export default function AddVisitor() {
  const [formData, setFormData] = useState({
    visitorName: "",
    phoneNumber: "",
    department: "",
    visitDate: null,
    entryTime: "",
    durationHours: "",
    durationMinutes: "",
    purpose: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({ ...prev, visitDate: date }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { visitorName, phoneNumber, department, visitDate, entryTime, durationHours, durationMinutes, purpose } = formData;

    if (!visitorName || !phoneNumber || !visitDate || !entryTime || !durationHours || !purpose || !department) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const client = await getCurrentClient();
      const scheduledEntry = new Date(`${visitDate.toDateString()} ${entryTime}`);
      const scheduledExit = new Date(scheduledEntry.getTime() +
        parseInt(durationHours) * 60 * 60 * 1000 +
        parseInt(durationMinutes || 0) * 60 * 1000);

      await addVisitorByClient({
        name: visitorName,
        phone: phoneNumber,
        purpose,
        department,
        scheduledEntry,
        scheduledExit,
        clientId: client.clientId,
      });

      toast.success("Visitor scheduled successfully.");
      setFormData({
        visitorName: "",
        phoneNumber: "",
        visitDate: null,
        entryTime: "",
        durationHours: "",
        durationMinutes: "",
        purpose: "",
        department: "",
      });
    } catch (err) {
      toast.error("Failed to add visitor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-xl mx-auto">
      <CardContent className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Add New Visitor</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="block text-sm font-medium mb-1">Visitor Name</Label>
            <Input type="text" name="visitorName" value={formData.visitorName} onChange={handleChange} required />
          </div>
          <div>
            <Label className="block text-sm font-medium mb-1">Phone Number</Label>
            <Input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
          </div>
          <div>
            <Label className="block text-sm font-medium mb-1">Department</Label>
            <Select onValueChange={(v) => setFormData((p) => ({ ...p, department: v }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d} value={d}>
                    {fmt(d)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 flex flex-col items-center">
            <Label>Select Date</Label>
            <Calendar
              mode="single"
              selected={formData.visitDate}
              onSelect={handleDateChange}
              className="rounded-md border"
            />
          </div>
          <div>
            <Label className="block text-sm font-medium mb-1">Entry Time</Label>
            <Input type="time" name="entryTime" value={formData.entryTime} onChange={handleChange} required />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Label className="block text-sm font-medium mb-1">Visit Duration (Hours)</Label>
              <Input type="number" name="durationHours" value={formData.durationHours} onChange={handleChange} min="0" required />
            </div>
            <div className="flex-1">
              <Label className="block text-sm font-medium mb-1">Visit Duration (Minutes)</Label>
              <Input type="number" name="durationMinutes" value={formData.durationMinutes} onChange={handleChange} min="0" max="59" />
            </div>
          </div>
          <div>
            <Label className="block text-sm font-medium mb-1">Purpose of Visit</Label>
            <Textarea name="purpose" value={formData.purpose} onChange={handleChange} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Submit Visitor"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
