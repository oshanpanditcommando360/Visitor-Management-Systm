"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getEndUsersByClient,
  deleteEndUser,
  updateEndUserCredentials,
} from "@/actions/enduser";
import { toast } from "sonner";

const fmt = (v) =>
  v.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

export default function EndUserList({ clientId, onDeps }) {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ email: "", password: "" });

  const fetchUsers = async () => {
    try {
      const data = await getEndUsersByClient(clientId);
      setUsers(data);
      if (onDeps) onDeps(data.map((u) => u.department));
    } catch {
      toast.error("Failed to load end users");
    }
  };

  useEffect(() => {
    if (clientId) fetchUsers();
  }, [clientId]);

  const handleDelete = async (id) => {
    try {
      await deleteEndUser(id);
      toast.success("Deleted");
      fetchUsers();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleUpdate = async (id) => {
    try {
      await updateEndUserCredentials({ id, ...form });
      toast.success("Updated");
      setEditing(null);
      setForm({ email: "", password: "" });
      fetchUsers();
    } catch {
      toast.error("Failed to update");
    }
  };

  return (
    <Card className="overflow-x-auto">
      <CardContent className="p-4">
        {users.length ? (
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-muted">
              <tr>
                <th className="p-2 border-b font-medium">Name</th>
                <th className="p-2 border-b font-medium">Department</th>
                <th className="p-2 border-b font-medium">Email</th>
                <th className="p-2 border-b font-medium">Post</th>
                <th className="p-2 border-b font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => (
                <tr key={u.id} className="align-top">
                  <td className="p-2">{u.name}</td>
                  <td className="p-2">{fmt(u.department)}</td>
                  <td className="p-2">
                    {editing === u.id ? (
                      <Input
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder={u.email}
                      />
                    ) : (
                      u.email
                    )}
                  </td>
                  <td className="p-2">{u.post}</td>
                  <td className="p-2 space-x-2">
                    {editing === u.id ? (
                      <>
                        <Input
                          type="password"
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                          placeholder="New password"
                          className="mb-2"
                        />
                        <Button size="sm" onClick={() => handleUpdate(u.id)}>
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" onClick={() => {setEditing(u.id); setForm({ email: u.email, password: "" });}}>
                          Update
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(u.id)}>
                          Delete
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-muted-foreground">No end users added.</p>
        )}
      </CardContent>
    </Card>
  );
}
