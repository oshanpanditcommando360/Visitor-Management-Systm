import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Eye } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import QRCode from "react-qr-code";
import { getAllVisitorRecords } from "@/actions/client";
import { toast } from "sonner";

const fmt = (v) => v.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

export default function VisitorRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const client = JSON.parse(localStorage.getItem("clientInfo"));
      const data = await getAllVisitorRecords(client?.clientId);
      setRecords(data);
    } catch (err) {
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
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 border-b font-medium">Name</th>
                  <th className="p-2 border-b font-medium">Vehicle No.</th>
                  <th className="p-2 border-b font-medium">Department</th>
                  <th className="p-2 border-b font-medium">Date</th>
                  <th className="p-2 border-b font-medium">Scheduled CheckIn</th>
                  <th className="p-2 border-b font-medium">Scheduled Checkout</th>
                  <th className="p-2 border-b font-medium">Actual CheckIn Date</th>
                  <th className="p-2 border-b font-medium">Actual CheckIn</th>
                  <th className="p-2 border-b font-medium">Actual CheckOut</th>
                  <th className="p-2 border-b font-medium">Approved By</th>
                  <th className="p-2 border-b font-medium">Status</th>
                  <th className="p-2 border-b font-medium">QR</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {records.map((visitor) => (
                  <tr key={visitor.id}>
                    <td className="p-2">{visitor.name}</td>
                    <td className="p-2">
                      {visitor.vehicleImage ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">Img</Button>
                          </DialogTrigger>
                          <DialogContent className="text-center">
                            <DialogHeader>
                              <DialogTitle>Plate Image</DialogTitle>
                            </DialogHeader>
                            <img src={visitor.vehicleImage} alt="Plate" className="mx-auto" />
                          </DialogContent>
                        </Dialog>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="p-2">{fmt(visitor.department)}</td>
                    <td className="p-2">{visitor.date}</td>
                    <td className="p-2">{visitor.scheduledCheckIn}</td>
                    <td className="p-2">{visitor.scheduledCheckOut}</td>
                    <td className="p-2">{visitor.checkInDate}</td>
                    <td className="p-2">{visitor.checkInTime}</td>
                    <td className="p-2">{visitor.checkOutTime}</td>
                    <td className="p-2">{visitor.approvedBy ? fmt(visitor.approvedBy) : "-"}</td>
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
