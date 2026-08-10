"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddUserDrawer from "@/components/admin/AddUserDrawer";
import { listUsers, type ManagedUser } from "@/lib/api/users";
import { Search, UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [instructors, setInstructors] = useState<ManagedUser[]>([]);
  const [students, setStudents] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"instructor" | "student">("student");

  const loadUsers = async () => {
    setLoading(true);
    try {
      const [i, s] = await Promise.all([
        listUsers("instructor"),
        listUsers("student"),
      ]);
      setInstructors(Array.isArray(i) ? i : i?.data || []);
      setStudents(Array.isArray(s) ? s : s?.data || []);
    } catch {
      toast.error("Users load nahi ho sake");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredInstructors = instructors.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredStudents = students.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddUser = (role: "instructor" | "student") => {
    setSelectedRole(role);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Manage Users</h1>
          <p className="text-sm text-muted-foreground">
            Create instructor and student accounts.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleAddUser("instructor")}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Instructor
          </Button>
          <Button onClick={() => handleAddUser("student")}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Tabs defaultValue="instructors">
        <TabsList>
          <TabsTrigger value="instructors">
            Instructors ({instructors.length})
          </TabsTrigger>
          <TabsTrigger value="students">
            Students ({students.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="instructors" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Instructors</span>
                <Badge variant="secondary">{filteredInstructors.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : filteredInstructors.length === 0 ? (
                <p className="text-sm text-muted-foreground">No instructors found.</p>
              ) : (
                <div className="divide-y divide-border">
                  {filteredInstructors.map((user) => (
                    <div key={user.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <Badge variant="outline">{user.role}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Students</span>
                <Badge variant="secondary">{filteredStudents.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : filteredStudents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No students found.</p>
              ) : (
                <div className="divide-y divide-border">
                  {filteredStudents.map((user) => (
                    <div key={user.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <Badge variant="outline">{user.role}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddUserDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        role={selectedRole}
        onSuccess={loadUsers}
      />
    </div>
  );
}