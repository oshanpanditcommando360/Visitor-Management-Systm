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
  const [newRequests,setNewRequests]=useState(false);
  const [newAlerts,setNewAlerts]=useState(false);
  const [newRecords,setNewRecords]=useState(false);
  useEffect(()=>{
    const load = async () => {
      const data = await getCurrentEndUser();
      if(data) setUser(data);
    };
    load();
  },[]);

  useEffect(() => {
    if(activeSection === "requests") setNewRequests(false);
    if(activeSection === "alerts") setNewAlerts(false);
    if(activeSection === "records") setNewRecords(false);
  }, [activeSection]);

  const sections = {
    requests: <IncomingRequests user={user} onNew={setNewRequests} />,
    add: <AddVisitor user={user} />,
    records: <VisitorRecords user={user} onNew={setNewRecords} />,
    alerts: <Alerts user={user} onNew={setNewAlerts} />,
  };

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
          className="relative"
          onClick={() => setActiveSection("requests")}
        >
          Incoming Requests
          {newRequests && activeSection !== "requests" && (
            <span className="absolute top-0 right-0 mt-1 mr-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </Button>
        {user.canAddVisitor && (
          <Button variant={activeSection === "add" ? "default" : "outline"} onClick={()=>setActiveSection("add")}>Add a Visitor</Button>
        )}
        <Button
          variant={activeSection === "records" ? "default" : "outline"}
          className="relative"
          onClick={()=>setActiveSection("records")}
        >
          Visitor Records
          {newRecords && activeSection !== "records" && (
            <span className="absolute top-0 right-0 mt-1 mr-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </Button>
        <Button
          variant={activeSection === "alerts" ? "default" : "outline"}
          className="relative"
          onClick={()=>setActiveSection("alerts")}
        >
          Alerts
          {newAlerts && activeSection !== "alerts" && (
            <span className="absolute top-0 right-0 mt-1 mr-1 w-2 h-2 bg-red-500 rounded-full" />
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
