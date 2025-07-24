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
import { getAllContractorRecords } from "@/actions/contractor";
import { getCurrentClient } from "@/actions/session";
import { toast } from "sonner";

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
                  <th className="p-2 border-b font-medium">Material</th>
                  <th className="p-2 border-b font-medium">Post</th>
                  <th className="p-2 border-b font-medium hidden md:table-cell">Vehicle Img</th>
                  <th className="p-2 border-b font-medium hidden md:table-cell">Material Img</th>
                  <th className="p-2 border-b font-medium">Date</th>
                  <th className="p-2 border-b font-medium hidden md:table-cell">Scheduled CheckIn</th>
                  <th className="p-2 border-b font-medium hidden md:table-cell">Scheduled Checkout</th>
                  <th className="p-2 border-b font-medium hidden md:table-cell">CheckIn</th>
                  <th className="p-2 border-b font-medium hidden md:table-cell">CheckOut</th>
                  <th className="p-2 border-b font-medium">Status</th>
                  <th className="p-2 border-b font-medium">QR</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {records.map((c) => (
                  <tr key={c.id}>
                    <td className="p-2 whitespace-nowrap">{c.name}</td>
                    <td className="p-2 whitespace-nowrap">{c.material}</td>
                    <td className="p-2 whitespace-nowrap">{c.post}</td>
                    <td className="p-2 whitespace-nowrap hidden md:table-cell">
                      {c.vehicleImage ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">Img</Button>
                          </DialogTrigger>
                          <DialogContent className="text-center">
                            <DialogHeader>
                              <DialogTitle>Vehicle Image</DialogTitle>
                            </DialogHeader>
                            <img src={c.vehicleImage} alt="Vehicle" className="mx-auto" />
                          </DialogContent>
                        </Dialog>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="p-2 whitespace-nowrap hidden md:table-cell">
                      {c.materialImage ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">Img</Button>
                          </DialogTrigger>
                          <DialogContent className="text-center">
                            <DialogHeader>
                              <DialogTitle>Material Image</DialogTitle>
                            </DialogHeader>
                            <img src={c.materialImage} alt="Material" className="mx-auto" />
                          </DialogContent>
                        </Dialog>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="p-2 whitespace-nowrap">{c.date}</td>
                    <td className="p-2 whitespace-nowrap hidden md:table-cell">{c.scheduledCheckIn}</td>
                    <td className="p-2 whitespace-nowrap hidden md:table-cell">{c.scheduledCheckOut}</td>
                    <td className="p-2 whitespace-nowrap hidden md:table-cell">{c.checkInTime}</td>
                    <td className="p-2 whitespace-nowrap hidden md:table-cell">{c.checkOutTime}</td>
                    <td className="p-2">
                      <Badge variant={getBadgeVariant(c.status)} className="text-xs">
                        {c.status}
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
                            <QRCode value={c.id} />
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
