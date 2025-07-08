"use client"
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
    visitRequestByGuard,
    getVisitorLogsForGuard,
    getScheduledVisitors,
    getCheckedInVisitors,
    validateVisitor,
    checkoutVisitor,
  } from "@/actions/visitor";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

const purposeOptions = ["Client Meeting", "Maintenance", "Delivery", "Interview"];

export default function GuardView() {
  const [request, setRequest] = useState({ name: "", purpose: "", clientId: "" });
  const [selectedVisitor, setSelectedVisitor] = useState("");
  const [otp, setOtp] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [scheduled, setScheduled] = useState([]);
  const [checkedIn, setCheckedIn] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [loadingScheduled, setLoadingScheduled] = useState(false);
  const [loadingCheckedIn, setLoadingCheckedIn] = useState(false);
  const [operation, setOperation] = useState("checkin");


  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const data = await getVisitorLogsForGuard();
      setLogs(data);
    } catch (err) {
      toast.error("Failed to load logs.");
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchScheduled = async () => {
    setLoadingScheduled(true);
    try {
      const data = await getScheduledVisitors();
      setScheduled(data);
    } catch (err) {
      toast.error("Failed to load visitors.");
    } finally {
      setLoadingScheduled(false);
    }
  };

  const fetchCheckedIn = async () => {
    setLoadingCheckedIn(true);
    try {
      const data = await getCheckedInVisitors();
      setCheckedIn(data);
    } catch (err) {
      toast.error("Failed to load visitors.");
    } finally {
      setLoadingCheckedIn(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchScheduled();
    fetchCheckedIn();
    const interval = setInterval(() => {
      fetchLogs();
      fetchScheduled();
      fetchCheckedIn();
    }, 10000);
    return () => clearInterval(interval);
  }, []);



  const handleRequestSubmit = async () => {
    const client = JSON.parse(localStorage.getItem("clientInfo"));
    request.clientId = client.clientId;
    setRequestLoading(true);
    try {
      await visitRequestByGuard(request);
      toast.success("Visit request raised successfully.");
      setRequest({ name: "", purpose: "", clientId: "" });
    } catch (err) {
      toast.error("Failed to raise visit request.");
    } finally {
      setRequestLoading(false);
    }
  };

  const handleOperationAction = async () => {
    setOtpLoading(true);
    try {
      if (operation === "checkin") {
        await validateVisitor({ visitorId: selectedVisitor, otp });
        toast.success("Visitor validated");
        setOtp("");
      } else {
        await checkoutVisitor(selectedVisitor);
        toast.success("Visitor checked out");
      }
      setSelectedVisitor("");
      fetchLogs();
      fetchScheduled();
      fetchCheckedIn();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <h2 className="text-4xl font-bold mb-8 text-center">Employee Portal</h2>
      <Card className="shadow-xl">
        <CardContent className="p-6 md:p-8">
          <Tabs defaultValue="request">
            <TabsList className="w-full grid grid-cols-3 mb-6 border rounded-md overflow-hidden">
              <TabsTrigger value="request" className="text-sm">Request for Visit</TabsTrigger>
              <TabsTrigger value="validate" className="text-sm">Validate Visit</TabsTrigger>
              <TabsTrigger value="logs" className="text-sm">Visit Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="request">
              <div className="space-y-5">
                <div className="space-y-1">
                  <Label htmlFor="visitor-name">Visitor Name</Label>
                  <Input
                    id="visitor-name"
                    placeholder="Enter visitor name"
                    value={request.name}
                    onChange={(e) => setRequest({ ...request, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Purpose of Visit</Label>
                  <Select onValueChange={(value) => setRequest({ ...request, purpose: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      {purposeOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleRequestSubmit}
                  disabled={!request.name || !request.purpose || requestLoading}
                  className="w-full text-md"
                >
                  {requestLoading ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="validate">
              <div className="space-y-5">
                <div className="space-y-1">
                  <Label>Operation</Label>
                  <Select onValueChange={setOperation} defaultValue="checkin">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select operation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checkin">Check In</SelectItem>
                      <SelectItem value="checkout">Check Out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label>Select Visitor</Label>
                  <Select onValueChange={(value) => setSelectedVisitor(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose visitor" />
                    </SelectTrigger>
                    <SelectContent>
                      {(operation === "checkin" ? scheduled : checkedIn).map((visitor) => (
                        <SelectItem key={visitor.id} value={visitor.id}>
                          {visitor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {operation === "checkin" && (
                  <div className="space-y-1">
                    <Label>Enter OTP</Label>
                    <Input
                      placeholder="Enter OTP received by visitor"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>
                )}

                <Button
                  onClick={handleOperationAction}
                  disabled={
                    !selectedVisitor ||
                    (operation === "checkin" && !otp) ||
                    otpLoading
                  }
                  className="w-full text-md"
                >
                  {otpLoading
                    ? operation === "checkin"
                      ? "Validating..."
                      : "Processing..."
                    : operation === "checkin"
                    ? "Validate OTP"
                    : "Check Out"}
                </Button>

                {operation === "checkin" && (
                  <>
                    <div className="flex items-center my-4">
                      <Separator className="flex-1" />
                      <span className="px-2 text-muted-foreground text-sm">or</span>
                      <Separator className="flex-1" />
                    </div>
                    <div className="text-center">
                      <Button className="text-sm">Scan QR Code</Button>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="logs">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Visitor Request Logs</h3>
                  <Button onClick={fetchLogs} size="icon" variant="ghost">
                     <RefreshCw className={`h-4 w-4 ${loadingLogs ? "animate-spin" : ""}`} />
                  </Button>
                </div>

                {logs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No visitor requests found.</p>
                ) : (
                  <div className="overflow-auto">
                    <table className="w-full text-sm text-left border-collapse">
                      <thead className="bg-muted">
                        <tr>
                          <th className="p-2 border-b">Name</th>
                          <th className="p-2 border-b">Purpose</th>
                          <th className="p-2 border-b">Requested</th>
                          <th className="p-2 border-b">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {logs.map((log) => (
                          <tr key={log.id}>
                            <td className="p-2">{log.name}</td>
                            <td className="p-2">{log.purpose}</td>
                            <td className="p-2">{new Date(log.createdAt).toLocaleString()}</td>
                            <td className="p-2">
                              <span className="px-2 py-1 text-xs rounded bg-gray-200">
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}