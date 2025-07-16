"use client";
import { useEffect, useState } from "react";
import { getCurrentEndUser } from "@/actions/session";
import { Button } from "@/components/ui/button";
import IncomingRequests from "./_components/IncomingRequests";
import AddVisitor from "./_components/AddVisitor";
import VisitorRecords from "./_components/VisitorRecords";
import Alerts from "./_components/Alerts";

export default function EndUserDashboard(){
  const [user,setUser]=useState(null);
  const [activeSection,setActiveSection]=useState("requests");
  const [newAlerts,setNewAlerts]=useState(0);
  const [newRequests,setNewRequests]=useState(0);
  const [newRecords,setNewRecords]=useState(0);
  useEffect(()=>{
    const load = async () => {
      const data = await getCurrentEndUser();
      if(data) setUser(data);
    };
    load();
  },[]);

  useEffect(() => {
    if (activeSection === "alerts") setNewAlerts(0);
    if (activeSection === "requests") setNewRequests(0);
    if (activeSection === "records") setNewRecords(0);
  }, [activeSection]);

  const sections = user
    ? {
        requests: (
          <IncomingRequests
            user={user}
            onNew={(n) => setNewRequests((c) => c + n)}
          />
        ),
        add: user.canAddVisitor ? <AddVisitor user={user} /> : null,
        records: (
          <VisitorRecords user={user} onNew={(n) => setNewRecords((c) => c + n)} />
        ),
        alerts: <Alerts user={user} onNew={(n) => setNewAlerts((c) => c + n)} />,
      }
    : {};

  if(!user) return null;

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
        <p className="text-gray-600">Department: {user.department}</p>
        <p className="text-gray-600">Post: {user.post}</p>
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
        {user.canAddVisitor && (
          <Button variant={activeSection === "add" ? "default" : "outline"} onClick={()=>setActiveSection("add")}>Add a Visitor</Button>
        )}
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
        {Object.entries(sections).map(([key, comp]) => (
          <div key={key} className={activeSection === key ? "block" : "hidden"}>
            {comp}
          </div>
        ))}
      </section>
    </div>
  );
}
