"use client";

import React, { useState, useEffect } from "react";
import {
  ExternalLink,
  Loader2,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import type { Run } from "@/lib/types";

// Custom SVG components for brand logos to ensure version compatibility
function Linkedin({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

// Custom SVG components for brand logos to ensure version compatibility
function Instagram({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function Twitter({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

export default function ChannelsPage() {
  const [activeTab, setActiveTab] = useState<"linkedin" | "instagram" | "x">("linkedin");
  const [completedRuns, setCompletedRuns] = useState<Run[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCompletedRuns = async () => {
    try {
      const res = await fetch("/api/runs");
      if (res.ok) {
        const data: Run[] = await res.json();
        // Filter runs that are completed and have linkedinPost content
        const filtered = data.filter(
          (run) => run.status === "completed" && run.linkedinPost
        );
        setCompletedRuns(filtered);
      }
    } catch (err) {
      console.error("Error fetching completed runs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedRuns();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="font-outfit text-3xl font-bold tracking-tight text-gradient">
          Multi-Platform Layouts
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Review, format, and organize post schedules across social channels.
        </p>
      </div>

      {/* Tabs Layout */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveTab("linkedin")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "linkedin"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Linkedin className="w-4 h-4" />
          LinkedIn
        </button>

        <button
          onClick={() => setActiveTab("instagram")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "instagram"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-zinc-500 cursor-not-allowed"
          }`}
        >
          <Instagram className="w-4 h-4" />
          Instagram
          <span className="text-[9px] font-bold bg-zinc-800/80 text-zinc-400 border border-zinc-700/50 px-1.5 py-0.5 rounded">
            Coming Soon
          </span>
        </button>

        <button
          onClick={() => setActiveTab("x")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "x"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-zinc-500 cursor-not-allowed"
          }`}
        >
          <Twitter className="w-4 h-4" />
          X (Twitter)
          <span className="text-[9px] font-bold bg-zinc-800/80 text-zinc-400 border border-zinc-700/50 px-1.5 py-0.5 rounded">
            Coming Soon
          </span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="py-2">
        {activeTab === "linkedin" && (
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-500 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                <span className="text-sm">Loading drafts database...</span>
              </div>
            ) : completedRuns.length === 0 ? (
              <div className="text-center py-16 border border-zinc-800 border-dashed rounded-xl text-zinc-500 text-sm max-w-2xl mx-auto flex flex-col items-center gap-3">
                <Layers className="w-8 h-8 text-zinc-700" />
                <span>No completed content posts found.</span>
                <p className="text-xs text-zinc-600 max-w-sm">
                  Run a content generation pipeline from the Workspace Console to create LinkedIn posts and infographics.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {completedRuns.map((run) => (
                  <div
                    key={run.id}
                    className="glass-panel border border-zinc-800/80 rounded-xl overflow-hidden flex flex-col bg-zinc-900/10"
                  >
                    {/* Header info */}
                    <div className="p-4 border-b border-zinc-800/80 bg-zinc-900/30 flex items-center justify-between">
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase block">
                          LinkedIn Post
                        </span>
                        <h3 className="font-semibold text-sm text-zinc-200 truncate mt-0.5">
                          {run.keyword}
                        </h3>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(run.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Content text */}
                    <div className="p-4 flex-1">
                      <p className="text-xs text-zinc-300 line-clamp-6 whitespace-pre-wrap leading-relaxed select-text">
                        {run.linkedinPost}
                      </p>
                    </div>

                    {/* Infographic Preview */}
                    {run.infographicUrl && (
                      <div className="px-4 pb-4">
                        <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={run.infographicUrl}
                            alt="Infographic generated draft"
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </div>
                    )}

                    {/* Footer link */}
                    <div className="p-3 border-t border-zinc-800/50 bg-zinc-950/20 flex items-center justify-between mt-auto">
                      <span className="text-[9px] text-zinc-500 font-mono">
                        Pipeline Run: {run.id.substring(0, 8)}...
                      </span>
                      {run.infographicUrl && (
                        <a
                          href={run.infographicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 hover:underline"
                        >
                          View Infographic
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "instagram" && (
          <div className="py-12 text-center text-zinc-500 border border-zinc-800 border-dashed rounded-xl max-w-xl mx-auto flex flex-col items-center gap-3">
            <Instagram className="w-8 h-8 text-zinc-700" />
            <span className="font-semibold text-zinc-400">Instagram Channels Coming Soon</span>
            <p className="text-xs text-zinc-600 max-w-sm">
              We are working on templates designed to automatically slice infographics into Instagram carousel sliders.
            </p>
          </div>
        )}

        {activeTab === "x" && (
          <div className="py-12 text-center text-zinc-500 border border-zinc-800 border-dashed rounded-xl max-w-xl mx-auto flex flex-col items-center gap-3">
            <Twitter className="w-8 h-8 text-zinc-700" />
            <span className="font-semibold text-zinc-400">X (Twitter) Channels Coming Soon</span>
            <p className="text-xs text-zinc-600 max-w-sm">
              Future support for compiling researched trends into highly engaging X text threads.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
