"use client";
import { useEffect, useState } from "react";

export default function EndUserDashboard(){
  const [user,setUser]=useState(null);
  useEffect(()=>{
    const stored = localStorage.getItem("endUserInfo");
    if(stored) setUser(JSON.parse(stored));
  },[]);

  if(!user) return null;
  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user.name}</h1>
      <p className="text-gray-600">Department: {user.department}</p>
      <p className="text-gray-600">Post: {user.post}</p>
    </div>
  );
}
