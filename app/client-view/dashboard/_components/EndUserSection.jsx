"use client";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EndUserList from "./EndUserList";
import AddEndUserForm from "./AddEndUserForm";

export default function EndUserSection() {
  const [clientId, setClientId] = useState("");
  const [used, setUsed] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("clientInfo");
    if (stored) setClientId(JSON.parse(stored).clientId);
  }, []);

  return (
    <Tabs defaultValue="list" className="w-full">
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="list">End Users</TabsTrigger>
        <TabsTrigger value="add">Add End User</TabsTrigger>
      </TabsList>
      <TabsContent value="list">
        <EndUserList clientId={clientId} onDeps={setUsed} />
      </TabsContent>
      <TabsContent value="add">
        <AddEndUserForm used={used} />
      </TabsContent>
    </Tabs>
  );
}
