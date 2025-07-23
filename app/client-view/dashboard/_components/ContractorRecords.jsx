import { useEffect, useState, useRef } from "react";
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
import { getAllContractorRecords } from "@/actions/client";
import { getCurrentClient } from "@/actions/session";
import { toast } from "sonner";

const fmt = (v) => v.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

export default function ContractorRecords({ onNew }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const prevCount = useRef(0);
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const client = await getCurrentClient();
      const data = await getAllContractorRecords(client?.clientId);
      setRecords(data);
      if (onNew && data.length > prevCount.current) {
        onNew(true);
      }
      prevCount.current = data.length;
    } catch (err) {
      toast.error("Failed to load contractor records.");
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
          <h3 className="text-lg font-semibold">Contractor Records</h3>
          <Button size="icon" variant="ghost" onClick={fetchRecords}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
        {records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full text-xs md:text-sm text-left border-collapse">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 border-b font-medium">Name</th>
                  <th className="p-2 border-b font-medium hidden md:table-cell">Vehicle No.</th>
                  <th className="p-2 border-b font-medium">Department</th>
                  <th className="p-2 border-b font-medium">Date</th>
                  <th className="p-2 border-b font-medium hidden md:table-cell">Scheduled CheckIn</th>
                  <th className="p-2 border-b font-medium hidden md:table-cell">Scheduled Checkout</th>
                  <th className="p-2 border-b font-medium hidden md:table-cell">Actual CheckIn Date</th>
                  <th className="p-2 border-b font-medium hidden md:table-cell">Actual CheckIn</th>
                  <th className="p-2 border-b font-medium hidden md:table-cell">Actual CheckOut</th>
                  <th className="p-2 border-b font-medium hidden md:table-cell">Approved By</th>
                  <th className="p-2 border-b font-medium">Status</th>
                  <th className="p-2 border-b font-medium">QR</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {records.map((record) => (
                  <tr key={record.id}>
                    <td className="p-2 whitespace-nowrap">{record.name}</td>
                    <td className="p-2 hidden md:table-cell">
                      {record.vehicleImage ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">Img</Button>
                          </DialogTrigger>
                          <DialogContent className="text-center">
                            <DialogHeader>
                              <DialogTitle>Plate Image</DialogTitle>
                            </DialogHeader>
                            <img src={record.vehicleImage} alt="Plate" className="mx-auto" />
                          </DialogContent>
                        </Dialog>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="p-2 whitespace-nowrap">{record.materialType}</td>
                    <td className="p-2 whitespace-nowrap">{record.date}</td>
                    <td className="p-2 hidden md:table-cell whitespace-nowrap">{record.scheduledCheckIn}</td>
                    <td className="p-2 hidden md:table-cell whitespace-nowrap">{record.scheduledCheckOut}</td>
                    <td className="p-2 hidden md:table-cell whitespace-nowrap">{record.checkInDate}</td>
                    <td className="p-2 hidden md:table-cell whitespace-nowrap">{record.checkInTime}</td>
                    <td className="p-2 hidden md:table-cell whitespace-nowrap">{record.checkOutTime}</td>
                    <td className="p-2 hidden md:table-cell whitespace-nowrap">-</td>
                    <td className="p-2">
                      <Badge variant={getBadgeVariant(record.status)} className="text-xs">
                        {fmt(record.status)}
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
                            <DialogTitle>Contractor QR</DialogTitle>
                          </DialogHeader>
                          <div className="mt-4 flex justify-center">
                            <QRCode value={record.id} />
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
          <p className="text-sm text-muted-foreground">No contractor records available.</p>
        )}
      </CardContent>
    </Card>
  );
}
