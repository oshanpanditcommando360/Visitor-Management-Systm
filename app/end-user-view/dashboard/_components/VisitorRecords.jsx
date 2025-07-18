"use client";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Eye } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import QRCode from "react-qr-code";
import { getEndUserRecords } from "@/actions/enduser";
import { toast } from "sonner";

const fmt = (v) => v.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

export default function VisitorRecordsEndUser({ user, onNew }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const prevCount = useRef(0);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await getEndUserRecords(user.id);
      setRecords(data);
      if (onNew && data.length > prevCount.current) {
        onNew(true);
      }
      prevCount.current = data.length;
    } catch {
      toast.error("Failed to load visitor records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    const interval = setInterval(fetchRecords, 10000);
    return () => clearInterval(interval);
  }, []);

  const getBadgeVariant = (status) => {
    switch (status) {
      case "CHECKED_IN":
        return "default";
      case "CHECKED_OUT":
        return "secondary";
      case "Not Checked In":
      case "PENDING":
      default:
        return "outline";
    }
  };

  return (
    <Card className="overflow-scroll">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Visitor Records</h3>
          <Button size="icon" variant="ghost" onClick={fetchRecords}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
        {records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-[700px] w-full text-xs md:text-sm text-left border-collapse">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 border-b font-medium">Name</th>
                  <th className="p-2 border-b font-medium">Date</th>
                  <th className="p-2 border-b font-medium">Scheduled CheckIn</th>
                  <th className="p-2 border-b font-medium">Scheduled Checkout</th>
                  <th className="p-2 border-b font-medium hidden md:table-cell">Actual CheckIn Date</th>
                  <th className="p-2 border-b font-medium hidden md:table-cell">Actual CheckIn</th>
                  <th className="p-2 border-b font-medium hidden md:table-cell">Actual CheckOut</th>
                  <th className="p-2 border-b font-medium hidden md:table-cell">Approved By</th>
                  <th className="p-2 border-b font-medium">Status</th>
                  <th className="p-2 border-b font-medium">QR</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {records.map((visitor) => (
                  <tr key={visitor.id}>
                    <td className="p-2 whitespace-nowrap">{visitor.name}</td>
                    <td className="p-2 whitespace-nowrap">{visitor.date}</td>
                    <td className="p-2 whitespace-nowrap">{visitor.scheduledCheckIn}</td>
                    <td className="p-2 whitespace-nowrap">{visitor.scheduledCheckOut}</td>
                    <td className="p-2 hidden md:table-cell whitespace-nowrap">{visitor.checkInDate}</td>
                    <td className="p-2 hidden md:table-cell whitespace-nowrap">{visitor.checkInTime}</td>
                    <td className="p-2 hidden md:table-cell whitespace-nowrap">{visitor.checkOutTime}</td>
                    <td className="p-2 hidden md:table-cell whitespace-nowrap">{visitor.approvedBy ? fmt(visitor.approvedBy) : "-"}</td>
                    <td className="p-2">
                      <Badge variant={getBadgeVariant(visitor.status)} className="text-xs">
                        {fmt(visitor.status)}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="text-center">
                          <DialogHeader>
                            <DialogTitle>Visitor QR</DialogTitle>
                          </DialogHeader>
                          <div className="mt-4 flex justify-center">
                            <QRCode value={visitor.id} />
                          </div>
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No visitor records available.</p>
        )}
      </CardContent>
    </Card>
  );
}
