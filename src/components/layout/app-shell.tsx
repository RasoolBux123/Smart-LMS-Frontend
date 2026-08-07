"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import type { Role, User } from "@/types";

export function AppShell({
  role,
  user,
  children,
}: {
  role: Role;
  user: User;
  children: React.ReactNode;
}) {
  useEffect(() => {
    window.localStorage.setItem("meridian-role", role);
  }, [role]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role={role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar role={role} user={user} />
        <motion.main
          key={role}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex-1 p-4 sm:p-6 lg:p-8"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
