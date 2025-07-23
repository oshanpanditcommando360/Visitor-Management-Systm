import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
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
            <table className="min-w-[600px] w-full text-xs md:text-sm text-left border-collapse">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 border-b font-medium">Name</th>
                  <th className="p-2 border-b font-medium">Material</th>
                  <th className="p-2 border-b font-medium">Date</th>
                  <th className="p-2 border-b font-medium hidden md:table-cell">Scheduled CheckIn</th>
                  <th className="p-2 border-b font-medium hidden md:table-cell">Scheduled Checkout</th>
                  <th className="p-2 border-b font-medium hidden md:table-cell">CheckIn</th>
                  <th className="p-2 border-b font-medium hidden md:table-cell">CheckOut</th>
                  <th className="p-2 border-b font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {records.map((c) => (
                  <tr key={c.id}>
                    <td className="p-2 whitespace-nowrap">{c.name}</td>
                    <td className="p-2 whitespace-nowrap">{c.material}</td>
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
