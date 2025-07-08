import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAllVisitorRecords } from "@/actions/client";
import { toast } from "sonner";

export default function VisitorRecords() {
  const [records, setRecords] = useState([]);
  const fetchRecords = async () => {
    try {
      const client = JSON.parse(localStorage.getItem("clientInfo"));
      const data = await getAllVisitorRecords(client?.clientId);
      setRecords(data);
    } catch (err) {
      toast.error("Failed to load visitor records.");
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
          <Button size="sm" onClick={fetchRecords}>Refresh</Button>
        </div>
        {records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 border-b font-medium">Name</th>
                  <th className="p-2 border-b font-medium">Date</th>
                  <th className="p-2 border-b font-medium">CheckIn Time</th>
                  <th className="p-2 border-b font-medium">Scheduled Checkout</th>
                  <th className="p-2 border-b font-medium">Actual CheckOut</th>
                  <th className="p-2 border-b font-medium">Purpose</th>
                  <th className="p-2 border-b font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {records.map((visitor) => (
                  <tr key={visitor.id}>
                    <td className="p-2">{visitor.name}</td>
                    <td className="p-2">{visitor.date}</td>
                    <td className="p-2">{visitor.checkInTime}</td>
                    <td className="p-2">{visitor.scheduledCheckOut}</td>
                    <td className="p-2">{visitor.actualCheckOutTime}</td>
                    <td className="p-2">{visitor.purpose}</td>
                    <td className="p-2">
                      <Badge variant={getBadgeVariant(visitor.status)} className="text-xs">
                        {visitor.status}
                      </Badge>
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
