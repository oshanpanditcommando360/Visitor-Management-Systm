"use client";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info, CheckCircle, LogOut, AlertTriangle, RefreshCw, X } from "lucide-react";
import { getClientAlerts, deleteAlert } from "@/actions/alert";
import { getCurrentClient } from "@/actions/session";
import { toast } from "sonner";

const alertVariants = {
  REQUESTED: {
    icon: <Info className="h-5 w-5 text-yellow-500" />,
    title: "Visitor Requested a Visit",
    color: "border-yellow-500 bg-yellow-50",
  },
  SCHEDULED: {
    icon: <Info className="h-5 w-5 text-blue-500" />,
    title: "Visit Approved",
    color: "border-blue-500 bg-blue-50",
  },
  CHECKED_IN: {
    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    title: "Visitor Checked In",
    color: "border-green-500 bg-green-50",
  },
  DENIED: {
    icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
    title: "Visit Denied",
    color: "border-red-600 bg-red-50",
  },
  EXIT: {
    icon: <LogOut className="h-5 w-5 text-blue-500" />,
    title: "Visitor Checked Out",
    color: "border-blue-500 bg-blue-50",
  },
  TIMEOUT: {
    icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
    title: "Visitor Overstayed",
    color: "border-red-600 bg-red-50",
  },
  DEFAULT: {
    icon: <Info className="h-5 w-5 text-yellow-500" />,
    title: "Alert",
    color: "border-yellow-500 bg-yellow-50",
  },
};

export default function Alerts({ onNew }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const prevCount = useRef(0);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const client = await getCurrentClient();
      const data = await getClientAlerts(client?.clientId);
      setAlerts(data);
      if (onNew && data.length > prevCount.current) {
        onNew(true);
      }
      prevCount.current = data.length;
    } catch (err) {
      toast.error("Failed to fetch alerts.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAlert(id);
      fetchAlerts();
    } catch {
      toast.error("Failed to delete alert.");
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Alerts</h2>
          <Button size="icon" variant="ghost" onClick={fetchAlerts}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
        {alerts.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {alerts.map((alert) => {
              const variant = alertVariants[alert.type] || alertVariants.DEFAULT;
              return (
                <Alert key={alert.id} className={`flex items-start gap-3 ${variant.color}`}>
                  <div className="mt-1">{variant.icon}</div>
                  <div className="flex-1">
                    <AlertTitle className="flex items-center gap-2">
                      {variant.title}
                      <Badge variant="outline" className="text-[10px]">
                        {alert.for}
                      </Badge>
                    </AlertTitle>
                    <AlertDescription>
                      {alert.message}
                      <span className="block text-xs mt-1 text-muted-foreground">
                        {new Date(alert.triggeredAt).toLocaleString()}
                      </span>
                    </AlertDescription>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(alert.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </Alert>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No alerts available.</p>
        )}
      </CardContent>
    </Card>
  );
}
