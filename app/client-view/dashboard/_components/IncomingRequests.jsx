"use client";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  getPendingVisitorRequests,
  getPendingContractorRequests,
  approveVisitorRequest,
  denyVisitorRequest,
  approveContractorRequest,
  denyContractorRequest,
} from "@/actions/client";
import { getCurrentClient } from "@/actions/session";
import { toast } from "sonner";

const fmt = (v) =>
  v.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

export default function IncomingRequests({ onNew }) {
  const [requests, setRequests] = useState([]);
  const [durations, setDurations] = useState({});
  const [selectedReq, setSelectedReq] = useState(null);
  const [popupIndex, setPopupIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const prevCount = useRef(0);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const client = await getCurrentClient();
      const [visitors, contractors] = await Promise.all([
        getPendingVisitorRequests(client?.clientId),
        getPendingContractorRequests(client?.clientId),
      ]);
      const combined = [
        ...visitors.map((v) => ({ ...v, _type: "visitor" })),
        ...contractors.map((c) => ({ ...c, _type: "contractor" })),
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRequests(combined);
      if (onNew && combined.length > prevCount.current) {
        onNew(true);
      }
      prevCount.current = combined.length;
    } catch (err) {
      toast.error("Failed to fetch visitor requests.");
    } finally {
      setLoading(false);
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
    setSelectedReq(item);
    setPopupIndex(index);
    setDurations({ hours: "", minutes: "" });
  };

  const approveWithoutDuration = async (visitorId) => {
    setActionLoading(true);
    try {
      await approveVisitorRequest({ visitorId, byClient: true });
      toast.success("Visitor approved.");
      fetchRequests();
    } catch (err) {
      toast.error("Failed to approve visitor.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const durationHours = parseInt(durations.hours) || 0;
      const durationMinutes = parseInt(durations.minutes) || 0;
      if (selectedReq._type === "visitor") {
        await approveVisitorRequest({
          visitorId: selectedReq.id,
          durationHours,
          durationMinutes,
          byClient: true,
        });
        toast.success("Visitor approved.");
      } else {
        await approveContractorRequest({
          contractorId: selectedReq.id,
          durationHours,
          durationMinutes,
        });
        toast.success("Contractor approved.");
      }
      fetchRequests();
    } catch (err) {
      toast.error("Failed to approve request.");
    } finally {
      setActionLoading(false);
      setSelectedReq(null);
      setPopupIndex(null);
    }
  };

  const handleDeny = async (item) => {
    setActionLoading(true);
    try {
      if (item._type === "visitor") {
        await denyVisitorRequest(item.id);
        toast.success("Visitor denied.");
      } else {
        await denyContractorRequest(item.id);
        toast.success("Contractor denied.");
      }
      fetchRequests();
    } catch (err) {
      toast.error("Failed to deny request.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Incoming Requests</h2>
          <Button size="icon" variant="ghost" onClick={fetchRequests}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
        {requests.length > 0 ? (
          <div className="flex flex-col space-y-3 max-h-96 overflow-y-auto pr-2">
            {requests.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-3"
              >
                <div>
                  <p className="font-medium flex items-center gap-2">
                    {item.name}
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${item._type === "visitor" ? "bg-blue-100 text-blue-800 border-blue-200" : "bg-green-100 text-green-800 border-green-200"}`}
                    >
                      {item._type === "visitor" ? "Visitor" : "Contractor"}
                    </Badge>
                  </p>
                  {item._type === "visitor" ? (
                    <p className="text-sm text-muted-foreground">Purpose: {item.purpose}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Material: {item.material ?? "None"}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    License Plate:
                    {item.vehicleImage ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="link" className="px-1 py-0 text-sm">Img</Button>
                        </DialogTrigger>
                        <DialogContent className="text-center">
                          <DialogHeader>
                            <DialogTitle>Plate Image</DialogTitle>
                          </DialogHeader>
                          <img src={item.vehicleImage} alt="Plate" className="mx-auto" />
                        </DialogContent>
                      </Dialog>
                    ) : (
                      " N/A"
                    )}
                  </p>
                  {item._type === "contractor" && (
                    <p className="text-sm text-muted-foreground">
                      Material Image:
                      {item.materialImage ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="link" className="px-1 py-0 text-sm">Img</Button>
                          </DialogTrigger>
                          <DialogContent className="text-center">
                            <DialogHeader>
                              <DialogTitle>Material</DialogTitle>
                            </DialogHeader>
                            <img src={item.materialImage} alt="Material" className="mx-auto" />
                          </DialogContent>
                        </Dialog>
                      ) : (
                        " N/A"
                      )}
                    </p>
                  )}
                  {item._type === "visitor" && (
                    <>
                      {item.requestedByGuard ? (
                        <p className="text-xs text-muted-foreground">Requested by guard for {fmt(item.department)}</p>
                      ) : item.requestedByEndUser ? (
                        <p className="text-xs text-muted-foreground">Added by {fmt(item.department)}</p>
                      ) : null}
                    </>
                  )}
                </div>
                <div className="flex space-x-2 mt-2 md:mt-0">
                  {item._type === "visitor" && item.requestedByEndUser ? (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => approveWithoutDuration(item.id)}
                      disabled={actionLoading}
                    >
                      {actionLoading ? "Processing..." : "Approve"}
                    </Button>
                  ) : (
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
                          <Button onClick={handleApprove} disabled={actionLoading}>
                            {actionLoading ? "Processing..." : item._type === "visitor" ? "Add Visitor" : "Approve"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeny(item)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Processing..." : "Deny"}
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
