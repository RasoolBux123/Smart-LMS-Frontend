"use client";

import { useEffect, useState } from "react";
import {
  listCourses,
  listModules,
  listMaterials,
  Course,
  Module,
  Material,
} from "@/lib/api/courses";
import { ChevronDown, ChevronRight, BookOpen } from "lucide-react";

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [modulesByCourse, setModulesByCourse] = useState<Record<string, Module[]>>({});
  const [materialsByModule, setMaterialsByModule] = useState<Record<string, Material[]>>({});
  const [activeModule, setActiveModule] = useState<string | null>(null);

  useEffect(() => {
    listCourses()
      .then((res) => setCourses(res.data))
      .finally(() => setLoading(false));
  }, []);

  async function toggleCourse(courseId: string) {
    if (expanded === courseId) {
      setExpanded(null);
      return;
    }
    setExpanded(courseId);
    if (!modulesByCourse[courseId]) {
      const res = await listModules(courseId);
      setModulesByCourse((prev) => ({ ...prev, [courseId]: res.data }));
    }
  }

  async function openModule(moduleId: string) {
    setActiveModule(activeModule === moduleId ? null : moduleId);
    if (!materialsByModule[moduleId]) {
      const res = await listMaterials(moduleId);
      setMaterialsByModule((prev) => ({ ...prev, [moduleId]: res.data }));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-slate-900">My courses</h2>
        <p className="mt-1 text-sm text-slate-500">Open modules and learning materials from your enrollments.</p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
          <BookOpen className="mx-auto mb-3 text-slate-300" size={28} />
          <p className="text-sm text-slate-400">
            You are not enrolled yet. Ask your instructor to enroll you.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((c) => {
            const open = expanded === c.id;
            const modules = modulesByCourse[c.id] || [];
            return (
              <div key={c.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => toggleCourse(c.id)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <div>
                    <p className="font-medium text-slate-900">{c.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">
                      {c.description || "No description"}
                    </p>
                  </div>
                  {open ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                </button>
                {open && (
                  <div className="space-y-3 border-t border-slate-100 bg-teal-50/30 px-5 py-4">
                    {modules.length === 0 ? (
                      <p className="text-sm text-slate-400">No modules published yet.</p>
                    ) : (
                      modules.map((m) => (
                        <div key={m.id} className="rounded-xl border border-slate-200 bg-white p-4">
                          <button
                            type="button"
                            onClick={() => openModule(m.id)}
                            className="flex w-full items-center justify-between text-left"
                          >
                            <span className="text-sm font-medium text-slate-800">{m.title}</span>
                            {activeModule === m.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>
                          {activeModule === m.id && (
                            <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                              {(materialsByModule[m.id] || []).length === 0 ? (
                                <p className="text-xs text-slate-400">No materials yet.</p>
                              ) : (
                                (materialsByModule[m.id] || []).map((mat) => (
                                  <div key={mat.id} className="rounded-lg bg-slate-50 px-3 py-2">
                                    <p className="text-sm font-medium text-slate-800">{mat.title}</p>
                                    {mat.content && (
                                      <p className="mt-1 whitespace-pre-wrap text-xs text-slate-500">{mat.content}</p>
                                    )}
                                    {mat.url && (
                                      <a href={mat.url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-teal-700 underline">
                                        Open link
                                      </a>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
