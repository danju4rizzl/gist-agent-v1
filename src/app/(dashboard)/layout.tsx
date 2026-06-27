"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Share2,
  Settings as SettingsIcon,
  Menu,
  X,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  href: string;
  icon: React.ComponentType<any>;
  label: string;
  active: boolean;
  onClick?: () => void;
}

function SidebarItem({
  href,
  icon: Icon,
  label,
  active,
  onClick,
}: SidebarItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
        active
          ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-500/5"
          : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60"
      )}
    >
      <Icon className={cn("w-5 h-5", active ? "text-emerald-400" : "text-zinc-400")} />
      {label}
    </Link>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigation = [
    { href: "/console", icon: LayoutDashboard, label: "Content Workspace" },
    { href: "/channels", icon: Share2, label: "Multi-Platform Channels" },
    { href: "/settings", icon: SettingsIcon, label: "Connection & Keys" },
  ];

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-zinc-900/40 border-r border-zinc-800/80 p-5 shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Compass className="w-5 h-5 text-zinc-950 stroke-[2.5]" />
          </div>
          <span className="font-outfit text-xl font-bold tracking-tight text-gradient">
            Gist Agent V1
          </span>
        </div>

        <nav className="flex-1 flex flex-col gap-1.5">
          {navigation.map((item) => (
            <SidebarItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={pathname === item.href}
            />
          ))}
        </nav>

        <div className="mt-auto border-t border-zinc-800/60 pt-4 px-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center font-semibold text-zinc-300">
              U
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-zinc-300">Personal Account</span>
              <span className="text-[10px] text-zinc-500">Single User Mode</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-zinc-950/80 backdrop-blur-sm">
          <div className="flex flex-col w-64 bg-zinc-900 border-r border-zinc-800 p-5">
            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center">
                  <Compass className="w-5 h-5 text-zinc-950 stroke-[2.5]" />
                </div>
                <span className="font-outfit text-xl font-bold tracking-tight text-gradient">
                  Gist Agent V1
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 hover:bg-zinc-800 rounded-md text-zinc-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 flex flex-col gap-1.5">
              {navigation.map((item) => (
                <SidebarItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  active={pathname === item.href}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
            </nav>

            <div className="mt-auto border-t border-zinc-800 pt-4 px-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-semibold text-zinc-300">
                  U
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-zinc-300">Personal Account</span>
                  <span className="text-[10px] text-zinc-500">Single User Mode</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex md:hidden items-center justify-between h-16 border-b border-zinc-800/80 px-4 bg-zinc-900/20 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center">
              <Compass className="w-5 h-5 text-zinc-950 stroke-[2.5]" />
            </div>
            <span className="font-outfit text-lg font-bold tracking-tight text-gradient">
              Gist Agent
            </span>
          </div>

          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 hover:bg-zinc-900 rounded-md text-zinc-400"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Content Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
