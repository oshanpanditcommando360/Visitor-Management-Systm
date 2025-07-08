"use client"
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { visitRequestByGuard } from "@/actions/visitor";
import { getVisitorLogsForGuard } from "@/actions/visitor";
import { toast } from "sonner";

const mockVisitors = [
  { id: "v1", name: "Michael Scott" },
  { id: "v2", name: "Pam Beesly" },
];

const purposeOptions = ["Client Meeting", "Maintenance", "Delivery", "Interview"];

export default function GuardView() {
  const [request, setRequest] = useState({ name: "", purpose: "", clientId: "" });
  const [selectedVisitor, setSelectedVisitor] = useState("");
  const [otp, setOtp] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [otpValidated, setOtpValidated] = useState(false);
  const [logs, setLogs] = useState([]);


  const fetchLogs = async () => {
    try {
      const data = await getVisitorLogsForGuard();
      console.log(data);
      setLogs(data);
    } catch (err) {
      toast.error("Failed to load logs.");
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);



  const handleRequestSubmit = async () => {
    const client = JSON.parse(localStorage.getItem("clientInfo"));
    request.clientId = client.clientId;
    const visitor = await visitRequestByGuard(request);
    setSubmitted(true);
  };

  const handleOtpValidation = () => {
    console.log("OTP Submitted:", { visitor: selectedVisitor, otp });
    setOtpValidated(true);
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
                  disabled={!request.name || !request.purpose}
                  className="w-full text-md"
                >
                  Submit Request
                </Button>
                {submitted && <p className="text-green-600 text-sm text-center">Visit request raised successfully.</p>}
              </div>
            </TabsContent>

            <TabsContent value="validate">
              <div className="space-y-5">
                <div className="space-y-1">
                  <Label>Select Visitor</Label>
                  <Select onValueChange={(value) => setSelectedVisitor(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose visitor" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockVisitors.map((visitor) => (
                        <SelectItem key={visitor.id} value={visitor.name}>
                          {visitor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label>Enter OTP</Label>
                  <Input
                    placeholder="Enter OTP received by visitor"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleOtpValidation}
                  disabled={!selectedVisitor || !otp}
                  className="w-full text-md"
                >
                  Validate OTP
                </Button>

                <div className="flex items-center my-4">
                  <Separator className="flex-1" />
                  <span className="px-2 text-muted-foreground text-sm">or</span>
                  <Separator className="flex-1" />
                </div>

                <div className="text-center">
                  <Button className="text-sm">Scan QR Code</Button>
                </div>

                {otpValidated && <p className="text-blue-600 text-sm text-center">OTP validated successfully.</p>}
              </div>
            </TabsContent>

            <TabsContent value="logs">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Visitor Request Logs</h3>
                  <Button onClick={fetchLogs} size="sm">
                     Refresh Logs
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