"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { addVisitorByEndUser } from "@/actions/enduser";
import { toast } from "sonner";

export default function AddVisitorEndUser({ user }) {
  const [formData, setFormData] = useState({
    visitorName: "",
    phoneNumber: "",
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
  const handleDateChange = (date) => setFormData((p) => ({ ...p, visitDate: date }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { visitorName, phoneNumber, visitDate, entryTime, durationHours, durationMinutes, purpose } = formData;
    if (!visitorName || !phoneNumber || !visitDate || !entryTime || !durationHours || !purpose) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const scheduledEntry = new Date(`${visitDate.toDateString()} ${entryTime}`);
      const scheduledExit = new Date(scheduledEntry.getTime() + parseInt(durationHours) * 60 * 60 * 1000 + parseInt(durationMinutes || 0) * 60 * 1000);
      await addVisitorByEndUser({
        name: visitorName,
        phone: phoneNumber,
        purpose,
        scheduledEntry,
        scheduledExit,
        endUserId: user.id,
        clientId: user.clientId,
      });
      toast.success("Request sent to client");
      setFormData({ visitorName: "", phoneNumber: "", visitDate: null, entryTime: "", durationHours: "", durationMinutes: "", purpose: "" });
    } catch (err) {
      toast.error("Failed to add visitor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-xl mx-auto">
      <CardContent className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Request Visitor</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="block text-sm font-medium mb-1">Visitor Name</Label>
            <Input type="text" name="visitorName" value={formData.visitorName} onChange={handleChange} required />
          </div>
          <div>
            <Label className="block text-sm font-medium mb-1">Phone Number</Label>
            <Input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
          </div>
          <div className="space-y-1 flex flex-col items-center">
            <Label>Select Date</Label>
            <Calendar mode="single" selected={formData.visitDate} onSelect={handleDateChange} className="rounded-md border" />
          </div>
          <div>
            <Label className="block text-sm font-medium mb-1">Entry Time</Label>
            <Input type="time" name="entryTime" value={formData.entryTime} onChange={handleChange} required />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Label className="block text-sm font-medium mb-1">Duration (Hours)</Label>
              <Input type="number" name="durationHours" value={formData.durationHours} onChange={handleChange} min="0" required />
            </div>
            <div className="flex-1">
              <Label className="block text-sm font-medium mb-1">Duration (Minutes)</Label>
              <Input type="number" name="durationMinutes" value={formData.durationMinutes} onChange={handleChange} min="0" max="59" />
            </div>
          </div>
          <div>
            <Label className="block text-sm font-medium mb-1">Purpose of Visit</Label>
            <Textarea name="purpose" value={formData.purpose} onChange={handleChange} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
