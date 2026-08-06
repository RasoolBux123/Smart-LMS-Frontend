"use client";

import { useEffect, useState } from "react";
import { listUsers, ManagedUser } from "@/lib/api/users";
import AddUserDrawer from "@/app/components/admin/AddUserDrawer";

export default function AdminUsersPage() {
  const [tab, setTab] = useState<"instructor" | "student">("instructor");
  const [instructors, setInstructors] = useState<ManagedUser[]>([]);
  const [students, setStudents] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState<"instructor" | "student" | null>(null);

  async function loadAll() {
    setLoading(true);
    try {
      const [iRes, sRes] = await Promise.all([listUsers("instructor"), listUsers("student")]);
      setInstructors(iRes.data);
      setStudents(sRes.data);
    } catch (err: any) {
      console.error("Failed to load users:", err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function handleCreated(user: ManagedUser) {
    if (user.role === "instructor") setInstructors((prev) => [user, ...prev]);
    else setStudents((prev) => [user, ...prev]);
  }

  const rows = tab === "instructor" ? instructors : students;
  const accent = tab === "instructor" ? "#4F46E5" : "#0D9488";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-slate-900">Manage users</h2>
          <p className="mt-1 text-sm text-slate-500">Create instructor and student accounts.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setDrawer("instructor")}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-white"
            style={{ backgroundColor: "#4F46E5" }}
          >
            + Add instructor
          </button>
          <button
            onClick={() => setDrawer("student")}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-white"
            style={{ backgroundColor: "#0D9488" }}
          >
            + Add student
          </button>
        </div>
      </div>

      <div className="flex gap-2 rounded-xl border border-slate-200 bg-white p-1 w-fit">
        <button
          onClick={() => setTab("instructor")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            tab === "instructor" ? "bg-indigo-50 text-indigo-700" : "text-slate-500"
          }`}
        >
          Instructors ({instructors.length})
        </button>
        <button
          onClick={() => setTab("student")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            tab === "student" ? "bg-teal-50 text-teal-700" : "text-slate-500"
          }`}
        >
          Students ({students.length})
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-slate-400">
                  No {tab}s yet — add one above.
                </td>
              </tr>
            )}
            {rows.map((u) => (
              <tr key={u.id} className="border-b border-slate-50 last:border-0">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: accent }}
                    >
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-medium text-slate-900">{u.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">{u.email}</td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium capitalize text-emerald-700">
                    {u.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddUserDrawer
        role="instructor"
        open={drawer === "instructor"}
        onClose={() => setDrawer(null)}
        onCreated={handleCreated}
      />
      <AddUserDrawer
        role="student"
        open={drawer === "student"}
        onClose={() => setDrawer(null)}
        onCreated={handleCreated}
      />
    </div>
  );
}
