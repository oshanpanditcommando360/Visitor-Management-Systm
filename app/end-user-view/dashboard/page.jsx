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
  useEffect(()=>{
    const load = async () => {
      const data = await getCurrentEndUser();
      if(data) setUser(data);
    };
    load();
  },[]);

  const renderSection = () => {
    if(!user) return null;
    switch(activeSection){
      case "requests":
        return <IncomingRequests user={user} />;
      case "add":
        return <AddVisitor user={user} />;
      case "records":
        return <VisitorRecords user={user} />;
      case "alerts":
        return <Alerts user={user} />;
      default:
        return null;
    }
  };

  if(!user) return null;

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
        <p className="text-gray-600">Department: {user.department}</p>
        <p className="text-gray-600">Post: {user.post}</p>
      </header>

      <nav className="flex space-x-4 border-b pb-2 mb-4">
        <Button variant={activeSection === "requests" ? "default" : "outline"} onClick={()=>setActiveSection("requests")}>Incoming Requests</Button>
        {user.canAddVisitor && (
          <Button variant={activeSection === "add" ? "default" : "outline"} onClick={()=>setActiveSection("add")}>Add a Visitor</Button>
        )}
        <Button variant={activeSection === "records" ? "default" : "outline"} onClick={()=>setActiveSection("records")}>Visitor Records</Button>
        <Button variant={activeSection === "alerts" ? "default" : "outline"} onClick={()=>setActiveSection("alerts")}>Alerts</Button>
      </nav>

      <section className="bg-white p-4 rounded-lg shadow-md">
        {renderSection()}
      </section>
    </div>
  );
}
