"use client"
import { useState, useEffect, useRef } from "react";
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
    checkInVisitorByQr,
  } from "@/actions/visitor";
import {
  contractorRequestByGuard,
  getContractorLogsForGuard,
  getScheduledContractors,
  getCheckedInContractors,
  validateContractor,
  checkoutContractor,
  checkInContractorByQr,
} from "@/actions/contractor";
import { getCurrentClient } from "@/actions/session";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import dynamic from "next/dynamic";
import Webcam from "react-webcam";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
const BarcodeScanner = dynamic(
  () => import("react-qr-barcode-scanner"),
  { ssr: false }
);

const purposeOptions = ["Client Meeting", "Maintenance", "Delivery", "Interview"];
const departments = ["FINANCE", "ADMIN", "HR", "IT", "OPERATIONS"];
const fmt = (v) => v.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

export default function GuardView() {
  const [request, setRequest] = useState({ name: "", purpose: "", department: "", clientId: "", vehicleImage: "" });
  const [contractorReq, setContractorReq] = useState({ name: "", material: "", vehicleImage: "", materialImage: "", clientId: "" });
  const [selectedVisitor, setSelectedVisitor] = useState("");
  const [selectedContractor, setSelectedContractor] = useState("");
  const [otp, setOtp] = useState("");
  const [validationPlate, setValidationPlate] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [contractorLogs, setContractorLogs] = useState([]);
  const [scheduled, setScheduled] = useState([]);
  const [scheduledContractors, setScheduledContractors] = useState([]);
  const [checkedIn, setCheckedIn] = useState([]);
  const [checkedInContractors, setCheckedInContractors] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [loadingContractorLogs, setLoadingContractorLogs] = useState(false);
  const [loadingScheduled, setLoadingScheduled] = useState(false);
  const [loadingScheduledContractors, setLoadingScheduledContractors] = useState(false);
  const [loadingCheckedIn, setLoadingCheckedIn] = useState(false);
  const [loadingCheckedInContractors, setLoadingCheckedInContractors] = useState(false);
  const [operation, setOperation] = useState("checkin");
  const [operationContractor, setOperationContractor] = useState("checkin");
  const [showScanner, setShowScanner] = useState(false);
  const [scanProcessing, setScanProcessing] = useState(false);
  const [showPlateScanner, setShowPlateScanner] = useState(false);
  const [showMaterialScanner, setShowMaterialScanner] = useState(false);
  const [showCheckPlateScanner, setShowCheckPlateScanner] = useState(false);
  const [showCheckMaterialScanner, setShowCheckMaterialScanner] = useState(false);
  const webcamRef = useRef(null);
  const [validationMaterial, setValidationMaterial] = useState("");


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

  const fetchContractorLogs = async () => {
    setLoadingContractorLogs(true);
    try {
      const data = await getContractorLogsForGuard();
      setContractorLogs(data);
    } catch (err) {
      toast.error("Failed to load logs.");
    } finally {
      setLoadingContractorLogs(false);
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

  const fetchScheduledCons = async () => {
    setLoadingScheduledContractors(true);
    try {
      const data = await getScheduledContractors();
      setScheduledContractors(data);
    } catch (err) {
      toast.error("Failed to load contractors.");
    } finally {
      setLoadingScheduledContractors(false);
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

  const fetchCheckedInCons = async () => {
    setLoadingCheckedInContractors(true);
    try {
      const data = await getCheckedInContractors();
      setCheckedInContractors(data);
    } catch (err) {
      toast.error("Failed to load contractors.");
    } finally {
      setLoadingCheckedInContractors(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchContractorLogs();
    fetchScheduled();
    fetchScheduledCons();
    fetchCheckedIn();
    fetchCheckedInCons();
    const interval = setInterval(() => {
      fetchLogs();
      fetchContractorLogs();
      fetchScheduled();
      fetchScheduledCons();
      fetchCheckedIn();
      fetchCheckedInCons();
    }, 10000);
    return () => clearInterval(interval);
  }, []);




  const handleRequestSubmit = async () => {
    const client = await getCurrentClient();
    const requestData = { ...request };
    if (client?.clientId) {
      requestData.clientId = client.clientId;
    }
    setRequestLoading(true);
    try {
      await visitRequestByGuard(requestData);
      toast.success("Visit request raised successfully.");
      setRequest({ name: "", purpose: "", department: "", clientId: "", vehicleImage: "" });
      fetchLogs();
      fetchScheduled();
    } catch (err) {
      toast.error("Failed to raise visit request.");
    } finally {
      setRequestLoading(false);
    }
  };

  const handleContractorRequest = async () => {
    const client = await getCurrentClient();
    const req = { ...contractorReq };
    if (client?.clientId) req.clientId = client.clientId;
    setRequestLoading(true);
    try {
      await contractorRequestByGuard(req);
      toast.success("Contractor request raised successfully.");
      setContractorReq({ name: "", material: "", vehicleImage: "", materialImage: "", clientId: "" });
      fetchContractorLogs();
      fetchScheduledCons();
    } catch (err) {
      toast.error("Failed to raise contractor request.");
    } finally {
      setRequestLoading(false);
    }
  };

  const handleOperationAction = async () => {
    setOtpLoading(true);
    try {
      if (operation === "checkin") {
        await validateVisitor({
          visitorId: selectedVisitor,
          otp,
          vehicleImage: validationPlate || undefined,
        });
        toast.success("Visitor validated");
        setOtp("");
        setValidationPlate("");
      } else {
        await checkoutVisitor(selectedVisitor);
        toast.success("Visitor checked out");
      }
      setSelectedVisitor("");
      setOperation("checkin");
      fetchLogs();
      fetchScheduled();
      fetchCheckedIn();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOperationContractor = async () => {
    setOtpLoading(true);
    try {
      if (operationContractor === "checkin") {
        await validateContractor({
          contractorId: selectedContractor,
          otp,
          vehicleImage: validationPlate || undefined,
        });
        toast.success("Contractor validated");
        setOtp("");
        setValidationPlate("");
      } else {
        await checkoutContractor(selectedContractor);
        toast.success("Contractor checked out");
      }
      setSelectedContractor("");
      setOperationContractor("checkin");
      fetchContractorLogs();
      fetchScheduledCons();
      fetchCheckedInCons();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleQrUpdate = async (err, result) => {
    if (result && !scanProcessing) {
      setScanProcessing(true);
      setShowScanner(false);
      try {
        await checkInVisitorByQr(
          result.text,
          validationPlate || undefined
        );
        setValidationPlate("");
        toast.success("Visitor validated");
        fetchLogs();
        fetchScheduled();
        fetchCheckedIn();
      } catch (error) {
        toast.error(error.message);
      } finally {
        setScanProcessing(false);
      }
    }
  };

  const handleQrUpdateContractor = async (err, result) => {
    if (result && !scanProcessing) {
      setScanProcessing(true);
      setShowScanner(false);
      try {
        await checkInContractorByQr(
          result.text,
          validationPlate || undefined
        );
        setValidationPlate("");
        toast.success("Contractor validated");
        fetchContractorLogs();
        fetchScheduledCons();
        fetchCheckedInCons();
      } catch (error) {
        toast.error(error.message);
      } finally {
        setScanProcessing(false);
      }
    }
  };

  const handlePlateCapture = () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;
    setRequest((prev) => ({ ...prev, vehicleImage: imageSrc }));
    toast.success("Plate captured");
    setShowPlateScanner(false);
  };

  const handleMaterialCapture = () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;
    setContractorReq((p) => ({ ...p, materialImage: imageSrc }));
    toast.success("Material captured");
    setShowMaterialScanner(false);
  };

  const handleCheckPlateCapture = () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;
    setValidationPlate(imageSrc);
    toast.success("Plate captured");
    setShowCheckPlateScanner(false);
  };

  const handleCheckMaterialCapture = () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;
    setValidationMaterial(imageSrc);
    toast.success("Material captured");
    setShowCheckMaterialScanner(false);
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <h2 className="text-4xl font-bold mb-8 text-center">Employee Portal</h2>
      <Card className="shadow-xl">
        <CardContent className="p-6 md:p-8">
          <Tabs defaultValue="request">
            <TabsList className="w-full grid grid-cols-3 mb-6 border rounded-md overflow-hidden">
              <TabsTrigger value="request" className="text-sm">Request Visit</TabsTrigger>
              <TabsTrigger value="validate" className="text-sm">Validate Visit</TabsTrigger>
              <TabsTrigger value="logs" className="text-sm">Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="request">
              <Tabs defaultValue="visitor">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="visitor" className="text-sm">Visitor</TabsTrigger>
                  <TabsTrigger value="contractor" className="text-sm">Contractor</TabsTrigger>
                </TabsList>

                <TabsContent value="visitor">
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
                      <Select onValueChange={(v) => setRequest({ ...request, purpose: v })}>
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
                    <div className="space-y-1">
                      <Label>Department</Label>
                      <Select onValueChange={(v) => setRequest({ ...request, department: v })}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((d) => (
                            <SelectItem key={d} value={d}>
                              {fmt(d)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Dialog open={showPlateScanner} onOpenChange={setShowPlateScanner}>
                      <DialogTrigger asChild>
                        <Button type="button" variant="secondary" className="w-full text-md">
                          Capture License Plate
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="text-center">
                        <DialogHeader>
                          <DialogTitle>Capture License Plate</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4 flex flex-col items-center space-y-4">
                          <Webcam ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode: { exact: "environment" } }} />
                          <Button onClick={handlePlateCapture} className="mt-2">Capture</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <p className="text-sm text-muted-foreground text-center">
                      {request.vehicleImage ? "Plate captured" : "Vehicle No.: N/A"}
                    </p>
                    <Button
                      onClick={handleRequestSubmit}
                      disabled={!request.name || !request.purpose || !request.department || requestLoading}
                      className="w-full text-md"
                    >
                      {requestLoading ? "Submitting..." : "Submit Request"}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="contractor">
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <Label>Contractor Name</Label>
                      <Input
                        placeholder="Enter contractor name"
                        value={contractorReq.name}
                        onChange={(e) => setContractorReq({ ...contractorReq, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Material Type</Label>
                      <Input
                        placeholder="Material"
                        value={contractorReq.material}
                        onChange={(e) => setContractorReq({ ...contractorReq, material: e.target.value })}
                      />
                    </div>
                    <Dialog open={showPlateScanner} onOpenChange={setShowPlateScanner}>
                      <DialogTrigger asChild>
                        <Button type="button" variant="secondary" className="w-full text-md">
                          Capture License Plate
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="text-center">
                        <DialogHeader>
                          <DialogTitle>Capture Plate</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4 flex flex-col items-center space-y-4">
                          <Webcam ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode: { exact: "environment" } }} />
                          <Button onClick={handlePlateCapture} className="mt-2">Capture</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Dialog open={showMaterialScanner} onOpenChange={setShowMaterialScanner}>
                      <DialogTrigger asChild>
                        <Button type="button" variant="secondary" className="w-full text-md">
                          Capture Material Image
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="text-center">
                        <DialogHeader>
                          <DialogTitle>Capture Material</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4 flex flex-col items-center space-y-4">
                          <Webcam ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode: { exact: "environment" } }} />
                          <Button onClick={handleMaterialCapture} className="mt-2">Capture</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <p className="text-sm text-muted-foreground text-center">
                      {contractorReq.vehicleImage ? "Plate captured" : "Vehicle No.: N/A"}
                    </p>
                    <Button
                      onClick={handleContractorRequest}
                      disabled={!contractorReq.name || requestLoading}
                      className="w-full text-md"
                    >
                      {requestLoading ? "Submitting..." : "Submit Contractor"}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="validate">
              <Tabs defaultValue="visitorv">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="visitorv" className="text-sm">Visitor</TabsTrigger>
                  <TabsTrigger value="contractorv" className="text-sm">Contractor</TabsTrigger>
                </TabsList>

                <TabsContent value="visitorv">
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
                      <Select onValueChange={(v) => setSelectedVisitor(v)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose visitor" />
                        </SelectTrigger>
                        <SelectContent>
                          {(operation === "checkin" ? scheduled : checkedIn).map((v) => (
                            <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
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
                    {operation === "checkin" && (
                      <div className="space-y-2 text-center">
                        <Dialog open={showCheckPlateScanner} onOpenChange={setShowCheckPlateScanner}>
                          <DialogTrigger asChild>
                            <Button variant="secondary" className="w-full text-sm">Capture License Plate</Button>
                          </DialogTrigger>
                          <DialogContent className="text-center">
                            <DialogHeader>
                              <DialogTitle>Capture License Plate</DialogTitle>
                            </DialogHeader>
                            <div className="mt-4 flex flex-col items-center space-y-4">
                              <Webcam ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode: { exact: "environment" } }} />
                              <Button onClick={handleCheckPlateCapture} className="mt-2">Capture</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <p className="text-sm text-muted-foreground">{validationPlate ? "Plate captured" : "Vehicle No.: N/A"}</p>
                      </div>
                    )}
                    <Button
                      onClick={handleOperationAction}
                      disabled={!selectedVisitor || (operation === "checkin" && !otp) || otpLoading}
                      className="w-full text-md"
                    >
                      {otpLoading ? (operation === "checkin" ? "Validating..." : "Processing...") : operation === "checkin" ? "Validate OTP" : "Check Out"}
                    </Button>
                    {operation === "checkin" && (
                      <>
                        <div className="flex items-center my-4">
                          <Separator className="flex-1" />
                          <span className="px-2 text-muted-foreground text-sm">or</span>
                          <Separator className="flex-1" />
                        </div>
                        <div className="text-center">
                          <Dialog open={showScanner} onOpenChange={setShowScanner}>
                            <DialogTrigger asChild>
                              <Button className="text-sm">Scan QR Code</Button>
                            </DialogTrigger>
                            <DialogContent className="text-center">
                              <DialogHeader>
                                <DialogTitle>Scan Visitor QR</DialogTitle>
                              </DialogHeader>
                              <div className="mt-4 flex justify-center">
                                <BarcodeScanner width={300} height={300} onUpdate={handleQrUpdate} />
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="contractorv">
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <Label>Operation</Label>
                      <Select onValueChange={setOperationContractor} defaultValue="checkin">
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
                      <Label>Select Contractor</Label>
                      <Select onValueChange={(v) => setSelectedContractor(v)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose contractor" />
                        </SelectTrigger>
                        <SelectContent>
                          {(operationContractor === "checkin" ? scheduledContractors : checkedInContractors).map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {operationContractor === "checkin" && (
                      <div className="space-y-1">
                        <Label>Enter OTP</Label>
                        <Input placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
                      </div>
                    )}
                    {operationContractor === "checkin" && (
                      <div className="space-y-2 text-center">
                        <Dialog open={showCheckPlateScanner} onOpenChange={setShowCheckPlateScanner}>
                          <DialogTrigger asChild>
                            <Button variant="secondary" className="w-full text-sm">Capture License Plate</Button>
                          </DialogTrigger>
                          <DialogContent className="text-center">
                            <DialogHeader>
                              <DialogTitle>Capture License Plate</DialogTitle>
                            </DialogHeader>
                            <div className="mt-4 flex flex-col items-center space-y-4">
                              <Webcam ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode: { exact: "environment" } }} />
                              <Button onClick={handleCheckPlateCapture} className="mt-2">Capture</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <p className="text-sm text-muted-foreground">{validationPlate ? "Plate captured" : "Vehicle No.: N/A"}</p>
                      </div>
                    )}
                    <Button
                      onClick={handleOperationContractor}
                      disabled={!selectedContractor || (operationContractor === "checkin" && !otp) || otpLoading}
                      className="w-full text-md"
                    >
                      {otpLoading ? (operationContractor === "checkin" ? "Validating..." : "Processing...") : operationContractor === "checkin" ? "Validate OTP" : "Check Out"}
                    </Button>
                    {operationContractor === "checkin" && (
                      <>
                        <div className="flex items-center my-4">
                          <Separator className="flex-1" />
                          <span className="px-2 text-muted-foreground text-sm">or</span>
                          <Separator className="flex-1" />
                        </div>
                        <div className="text-center">
                          <Dialog open={showScanner} onOpenChange={setShowScanner}>
                            <DialogTrigger asChild>
                              <Button className="text-sm">Scan QR Code</Button>
                            </DialogTrigger>
                            <DialogContent className="text-center">
                              <DialogHeader>
                                <DialogTitle>Scan Contractor QR</DialogTitle>
                              </DialogHeader>
                              <div className="mt-4 flex justify-center">
                                <BarcodeScanner width={300} height={300} onUpdate={handleQrUpdateContractor} />
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="logs">
              <Tabs defaultValue="visitorl">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="visitorl" className="text-sm">Visitor</TabsTrigger>
                  <TabsTrigger value="contractorl" className="text-sm">Contractor</TabsTrigger>
                </TabsList>
                <TabsContent value="visitorl">
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
                      <div className="overflow-x-auto">
                        <table className="min-w-[500px] w-full text-xs md:text-sm text-left border-collapse">
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
                                  <span className="px-2 py-1 text-xs rounded bg-gray-200">{log.status}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="contractorl">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Contractor Logs</h3>
                      <Button onClick={fetchContractorLogs} size="icon" variant="ghost">
                        <RefreshCw className={`h-4 w-4 ${loadingContractorLogs ? "animate-spin" : ""}`} />
                      </Button>
                    </div>
                    {contractorLogs.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No contractor logs found.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-[500px] w-full text-xs md:text-sm text-left border-collapse">
                          <thead className="bg-muted">
                            <tr>
                              <th className="p-2 border-b">Name</th>
                              <th className="p-2 border-b">Material</th>
                              <th className="p-2 border-b">Requested</th>
                              <th className="p-2 border-b">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {contractorLogs.map((c) => (
                              <tr key={c.id}>
                                <td className="p-2">{c.name}</td>
                                <td className="p-2">{c.material}</td>
                                <td className="p-2">{new Date(c.createdAt).toLocaleString()}</td>
                                <td className="p-2">
                                  <span className="px-2 py-1 text-xs rounded bg-gray-200">{c.status}</span>
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}