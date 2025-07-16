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
  const [newAlerts, setNewAlerts] = useState(0);
  const [newRequests, setNewRequests] = useState(0);
  const [newRecords, setNewRecords] = useState(0);

  useEffect(() => {
    const load = async () => {
      const data = await getCurrentClient();
      if (data) setClientData(data);
    };
    load();
  }, []);

  useEffect(() => {
    if (activeSection === "alerts") setNewAlerts(0);
    if (activeSection === "requests") setNewRequests(0);
    if (activeSection === "records") setNewRecords(0);
  }, [activeSection]);


  const sections = {
    requests: <IncomingRequests onNew={(n) => setNewRequests((c) => c + n)} />,
    add: <AddVisitor />,
    enduser: <EndUserSection />,
    records: <VisitorRecords onNew={(n) => setNewRecords((c) => c + n)} />,
    alerts: <Alerts onNew={(n) => setNewAlerts((c) => c + n)} />,
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
          onClick={() => setActiveSection("requests")}
          className="relative"
        >
          Incoming Requests
          {newRequests > 0 && activeSection !== "requests" && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white rounded-full px-1 text-xs">
              {newRequests}
            </span>
          )}
        </Button>
        <Button variant={activeSection === "add" ? "default" : "outline"} onClick={() => setActiveSection("add")}>Add a Visitor</Button>
        <Button variant={activeSection === "enduser" ? "default" : "outline"} onClick={() => setActiveSection("enduser")}>End Users</Button>
        <Button
          variant={activeSection === "records" ? "default" : "outline"}
          onClick={() => setActiveSection("records")}
          className="relative"
        >
          Visitor Records
          {newRecords > 0 && activeSection !== "records" && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white rounded-full px-1 text-xs">
              {newRecords}
            </span>
          )}
        </Button>
        <Button
          variant={activeSection === "alerts" ? "default" : "outline"}
          onClick={() => setActiveSection("alerts")}
          className="relative"
        >
          Alerts
          {newAlerts > 0 && activeSection !== "alerts" && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white rounded-full px-1 text-xs">
              {newAlerts}
            </span>
          )}
        </Button>
      </nav>

      <section className="bg-white p-4 rounded-lg shadow-md">
        {Object.entries(sections).map(([key, component]) => (
          <div key={key} className={activeSection === key ? "block" : "hidden"}>
            {component}
          </div>
        ))}
      </section>
    </div>
  );
}
