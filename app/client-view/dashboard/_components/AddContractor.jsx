"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { addContractorByClient } from "@/actions/client";
import { getCurrentClient } from "@/actions/session";
import { toast } from "sonner";

const materialOptions = [
  { label: "None", value: "NONE" },
  { label: "Construction Material", value: "CONSTRUCTION" },
  { label: "Electrical Equipment", value: "ELECTRICAL" },
  { label: "HVAC Equipment", value: "HVAC" },
  { label: "IT Hardware", value: "IT_HARDWARE" },
  { label: "Safety Gear", value: "SAFETY_GEAR" },
  { label: "Plumbing Supplies", value: "PLUMBING_SUPPLIES" },
  { label: "Maintenance Supplies", value: "MAINTENANCE_SUPPLIES" },
  { label: "Other Equipment", value: "OTHER" },
];

export default function AddContractor() {
  const [formData, setFormData] = useState({
    contractorName: "",
    phoneNumber: "",
    materialType: "NONE",
    visitDate: null,
    entryTime: "",
    durationHours: "",
    durationMinutes: "",
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
    const { contractorName, phoneNumber, materialType, visitDate, entryTime, durationHours, durationMinutes } = formData;

    if (!contractorName || !phoneNumber || !visitDate || !entryTime || !durationHours) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const client = await getCurrentClient();
      const scheduledEntry = new Date(`${visitDate.toDateString()} ${entryTime}`);
      const scheduledExit = new Date(
        scheduledEntry.getTime() +
        parseInt(durationHours) * 60 * 60 * 1000 +
        parseInt(durationMinutes || 0) * 60 * 1000
      );

      await addContractorByClient({
        name: contractorName,
        phone: phoneNumber,
        materialType,
        scheduledEntry,
        scheduledExit,
        clientId: client.clientId,
      });

      toast.success("Contractor scheduled successfully.");
      setFormData({
        contractorName: "",
        phoneNumber: "",
        materialType: "NONE",
        visitDate: null,
        entryTime: "",
        durationHours: "",
        durationMinutes: "",
      });
    } catch (err) {
      toast.error("Failed to add contractor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-xl mx-auto">
      <CardContent className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Add New Contractor</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="block text-sm font-medium mb-1">Contractor Name</Label>
            <Input type="text" name="contractorName" value={formData.contractorName} onChange={handleChange} required />
          </div>
          <div>
            <Label className="block text-sm font-medium mb-1">Phone Number</Label>
            <Input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
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
            <Label className="block text-sm font-medium mb-1">Material Details</Label>
            <Select onValueChange={(v) => setFormData((p) => ({ ...p, materialType: v }))} defaultValue="NONE">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select material" />
              </SelectTrigger>
              <SelectContent>
                {materialOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Submit Contractor"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
