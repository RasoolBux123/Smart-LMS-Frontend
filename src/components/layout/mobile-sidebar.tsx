"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";
import { navFor } from "@/constants/nav";
import { useAuth } from "@/hooks/useAuth";

export function MobileSidebar({
  role,
  open,
  onOpenChange,
}: {
  role: Role;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const items = navFor(role);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0 lg:hidden" />
        <DialogPrimitive.Content className="fixed inset-y-0 left-0 z-50 flex h-full w-72 flex-col bg-sidebar text-sidebar-foreground animate-in slide-in-from-left duration-200 lg:hidden">
          <DialogPrimitive.Title className="sr-only">
            Navigation
          </DialogPrimitive.Title>
          <div className="flex h-16 items-center justify-between px-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-accent/20">
                <GraduationCap className="h-4.5 w-4.5 text-sidebar-accent" />
              </div>
              <span className="font-display text-sm font-semibold text-white">
                SmartLMS
              </span>
            </div>
            <DialogPrimitive.Close className="rounded-lg p-1.5 text-sidebar-foreground hover:bg-white/5">
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-2">
            {items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.label + item.href}
                  href={item.href}
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-active text-white"
                      : "text-sidebar-foreground hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-white/5 p-3">
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                logout();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-[18px] w-[18px]" />
              <span>Log out</span>
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
