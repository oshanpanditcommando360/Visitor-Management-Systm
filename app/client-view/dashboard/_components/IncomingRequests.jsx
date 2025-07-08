"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { getPendingVisitorRequests,approveVisitorRequest,denyVisitorRequest } from "@/actions/client";
import { toast } from "sonner";

export default function IncomingRequests() {
  const [requests, setRequests] = useState([]);
  const [durations, setDurations] = useState({});
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [popupIndex, setPopupIndex] = useState(null);

  const fetchRequests = async () => {
    try {
      const client = JSON.parse(localStorage.getItem("clientInfo"));
      const data = await getPendingVisitorRequests(client?.clientId);
      setRequests(data);
    } catch (err) {
      toast.error("Failed to fetch visitor requests.");
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (field, value) => {
    setDurations((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const openPopup = (item, index) => {
    setSelectedVisitor(item);
    setPopupIndex(index);
    setDurations({ hours: "", minutes: "" });
  };

  const handleApprove = async () => {
    try {
      const durationHours = parseInt(durations.hours) || 0;
      const durationMinutes = parseInt(durations.minutes) || 0;
      await approveVisitorRequest({
        visitorId: selectedVisitor.id,
        durationHours,
        durationMinutes,
      });
      toast.success("Visitor approved.");
      fetchRequests();
    } catch (err) {
      toast.error("Failed to approve visitor.");
    }
    setSelectedVisitor(null);
    setPopupIndex(null);
  };

  const handleDeny = async (item) => {
    try {
      await denyVisitorRequest(item.id);
      toast.success("Visitor denied.");
      fetchRequests();
    } catch (err) {
      toast.error("Failed to deny visitor.");
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Visit Requests</h2>
          <Button size="sm" onClick={fetchRequests}>Refresh</Button>
        </div>
        {requests.length > 0 ? (
          <div className="flex flex-col space-y-3 max-h-96 overflow-y-auto pr-2">
            {requests.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-3"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">Purpose: {item.purpose}</p>
                </div>
                <div className="flex space-x-2 mt-2 md:mt-0">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => openPopup(item, idx)}
                      >
                        Approve
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Select Visit Duration</DialogTitle>
                      </DialogHeader>
                      <div className="flex gap-3 mt-4">
                        <Input
                          type="number"
                          placeholder="Hours"
                          min={0}
                          className="w-1/2"
                          value={durations.hours || ""}
                          onChange={(e) => handleChange("hours", e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="Minutes"
                          min={0}
                          max={59}
                          className="w-1/2"
                          value={durations.minutes || ""}
                          onChange={(e) => handleChange("minutes", e.target.value)}
                        />
                      </div>
                      <DialogFooter className="mt-4">
                        <Button onClick={handleApprove}>Add Visitor</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeny(item)}
                  >
                    Deny
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No data available.</p>
        )}
      </CardContent>
    </Card>
  );
}
