"use client";
import { useState, useEffect } from "react";
import { getCurrentClient } from "@/actions/session";
import { Button } from "@/components/ui/button";
import IncomingRequests from "./_components/IncomingRequests";
import AddVisitor from "./_components/AddVisitor";
import VisitorRecords from "./_components/VisitorRecords";
import Alerts from "./_components/Alerts";
import EndUserSection from "./_components/EndUserSection";

export default function ClientDashboard() {
  const [activeSection, setActiveSection] = useState("requests");
  const [clientData, setClientData] = useState(null);
  const [newAlerts, setNewAlerts] = useState(false);
  const [newRequests, setNewRequests] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await getCurrentClient();
      if (data) setClientData(data);
    };
    load();
  }, []);

  useEffect(() => {
    if (activeSection === "alerts") setNewAlerts(false);
    if (activeSection === "requests") setNewRequests(false);
  }, [activeSection]);


  const renderSection = () => {
    switch (activeSection) {
      case "requests":
        return <IncomingRequests onNew={setNewRequests} />;
      case "add":
        return <AddVisitor />;
      case "enduser":
        return <EndUserSection />;
      case "records":
        return <VisitorRecords />;
      case "alerts":
        return <Alerts onNew={setNewAlerts} />;
      default:
        return null;
    }
  };

  if (!clientData) return null;

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Welcome, {clientData.name}</h1>
          <p className="text-gray-600 text-sm md:text-base">{clientData.email}</p>
          <p className="text-gray-600 text-sm md:text-base">Department: {clientData.department}</p>
        </div>
        <div className="text-gray-600 text-sm md:text-base">
          <span className="font-medium">Phone:</span> {clientData.phone}
        </div>
      </header>

      <nav className="flex flex-wrap gap-2 border-b pb-2 mb-4">
        <Button
          variant={activeSection === "requests" ? "default" : "outline"}
          className={newRequests && activeSection !== "requests" ? "border-yellow-500" : ""}
          onClick={() => setActiveSection("requests")}
        >
          Incoming Requests
        </Button>
        <Button variant={activeSection === "add" ? "default" : "outline"} onClick={() => setActiveSection("add")}>Add a Visitor</Button>
        <Button variant={activeSection === "enduser" ? "default" : "outline"} onClick={() => setActiveSection("enduser")}>End Users</Button>
        <Button variant={activeSection === "records" ? "default" : "outline"} onClick={() => setActiveSection("records")}>Visitor Records</Button>
        <Button
          variant={activeSection === "alerts" ? "default" : "outline"}
          className={newAlerts && activeSection !== "alerts" ? "border-yellow-500" : ""}
          onClick={() => setActiveSection("alerts")}
        >
          Alerts
        </Button>
      </nav>

      <section className="bg-white p-4 rounded-lg shadow-md">
        {renderSection()}
      </section>
    </div>
  );
}
