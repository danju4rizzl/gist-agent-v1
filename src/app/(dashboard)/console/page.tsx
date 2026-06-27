"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Loader2,
  ChevronDown,
  ChevronUp,
  Monitor,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ClipboardCheck,
  Copy,
  Sparkles,
} from "lucide-react";
import type { RunWithSteps, Run } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function ConsolePage() {
  const [keyword, setKeyword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runs, setRuns] = useState<Run[]>([]);
  const [selectedRun, setSelectedRun] = useState<RunWithSteps | null>(null);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
  const [isLoadingRuns, setIsLoadingRuns] = useState(true);
  const [copied, setCopied] = useState(false);

  // Fetch runs list
  const fetchRuns = async () => {
    try {
      const res = await fetch("/api/runs");
      if (res.ok) {
        const data = await res.json();
        setRuns(data);
      }
    } catch (err) {
      console.error("Error fetching runs:", err);
    } finally {
      setIsLoadingRuns(false);
    }
  };

  // Fetch single run details
  const fetchRunDetails = async (runId: string) => {
    try {
      const res = await fetch(`/api/runs/${runId}`);
      if (res.ok) {
        const data = (await res.json()) as RunWithSteps;
        setSelectedRun(data);
      }
    } catch (err) {
      console.error("Error fetching run details:", err);
    }
  };

  // Poll for runs and details
  useEffect(() => {
    fetchRuns();
    const interval = setInterval(() => {
      fetchRuns();
      if (expandedRunId) {
        fetchRunDetails(expandedRunId);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [expandedRunId]);

  // Handle run details expansion toggle
  const toggleExpand = async (runId: string) => {
    if (expandedRunId === runId) {
      setExpandedRunId(null);
      setSelectedRun(null);
    } else {
      setExpandedRunId(runId);
      setSelectedRun(null); // Clear previous
      await fetchRunDetails(runId);
    }
  };

  // Trigger manually from UI
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword }),
      });

      if (!res.ok) {
        throw new Error("Failed to trigger pipeline");
      }

      const result = await res.json();
      setKeyword("");
      fetchRuns();
      // Expand the newly created run immediately
      toggleExpand(result.run.id);
    } catch (err) {
      console.error(err);
      alert("Error starting generator pipeline. Make sure API keys are configured.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy post text helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-950/80 text-emerald-400 border-emerald-500/20";
      case "failed":
        return "bg-red-950/80 text-red-400 border-red-500/20";
      case "pending":
        return "bg-zinc-900 text-zinc-400 border-zinc-700/50";
      case "researching":
        return "bg-blue-950/80 text-blue-400 border-blue-500/20";
      case "writing":
        return "bg-purple-950/80 text-purple-400 border-purple-500/20";
      case "designing":
        return "bg-amber-950/80 text-amber-400 border-amber-500/20";
      case "archiving":
        return "bg-cyan-950/80 text-cyan-400 border-cyan-500/20";
      default:
        return "bg-zinc-900 text-zinc-400 border-zinc-700/50";
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Title */}
      <div>
        <h1 className="font-outfit text-3xl font-bold tracking-tight text-gradient">
          Content Workspace
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Research keyword topics, generate drafts, and review live workflow statuses.
        </p>
      </div>

      {/* manual input trigger */}
      <div className="glass-panel rounded-xl p-5 border border-zinc-800/80 bg-zinc-900/10">
        <form onSubmit={handleGenerate} className="space-y-4">
          <label className="block text-sm font-medium text-zinc-300">
            Keyword or Topic Input
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="e.g. electric vehicles market share, quantum computing advances..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full bg-zinc-950/60 border border-zinc-800 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 rounded-lg py-3 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all"
                disabled={isSubmitting}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !keyword.trim()}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-semibold text-sm rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-400/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-zinc-950" />
                  Generate Post & Art
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Runs History */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-200">Execution Runs</h2>

        {isLoadingRuns && runs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-500 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            <span className="text-sm">Loading execution runs...</span>
          </div>
        ) : runs.length === 0 ? (
          <div className="text-center py-12 border border-zinc-800 border-dashed rounded-xl text-zinc-500 text-sm">
            No execution runs found. Submit a keyword above or send a keyword to your Telegram Bot to start.
          </div>
        ) : (
          <div className="space-y-3">
            {runs.map((run) => {
              const isExpanded = expandedRunId === run.id;
              return (
                <div
                  key={run.id}
                  className={cn(
                    "glass-panel rounded-xl border border-zinc-800/80 transition-all duration-200 overflow-hidden",
                    isExpanded && "border-zinc-700 bg-zinc-900/20"
                  )}
                >
                  {/* Card Header clickable */}
                  <div
                    onClick={() => toggleExpand(run.id)}
                    className="p-4 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-zinc-900/30 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {run.source === "telegram" ? (
                        <div className="w-8 h-8 rounded-lg bg-cyan-950/40 border border-cyan-800/20 flex items-center justify-center text-cyan-400">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-emerald-950/40 border border-emerald-800/20 flex items-center justify-center text-emerald-400">
                          <Monitor className="w-4 h-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm text-zinc-200 truncate">
                          {run.keyword}
                        </h3>
                        <p className="text-[10px] text-zinc-500 mt-0.5">
                          ID: {run.id} • {new Date(run.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 text-xs font-medium rounded-full border capitalize",
                          getStatusColor(run.status)
                        )}
                      >
                        {run.status}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-zinc-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-zinc-500" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="border-t border-zinc-800/60 p-5 bg-zinc-950/30">
                      {!selectedRun ? (
                        <div className="flex items-center justify-center py-6 text-zinc-500 gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                          <span className="text-xs">Loading execution logs...</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Left: Step Timeline */}
                          <div className="lg:col-span-1 space-y-4">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                              Step Timeline
                            </h4>
                            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-800">
                              {/* Research Step */}
                              <div className="relative">
                                <div className="absolute -left-[23px] top-0.5">
                                  {getStepIcon(selectedRun.status, "researching", selectedRun.steps, "research")}
                                </div>
                                <div className="text-xs font-medium text-zinc-300">Web Research</div>
                                <div className="text-[10px] text-zinc-500 mt-0.5">
                                  Search Tavily & Summarize via Gemini
                                </div>
                              </div>

                              {/* Copywriting Step */}
                              <div className="relative">
                                <div className="absolute -left-[23px] top-0.5">
                                  {getStepIcon(selectedRun.status, "writing", selectedRun.steps, "copywriting")}
                                </div>
                                <div className="text-xs font-medium text-zinc-300">Draft Post</div>
                                <div className="text-[10px] text-zinc-500 mt-0.5">
                                  Generate engaging LinkedIn post text
                                </div>
                              </div>

                              {/* Design Step */}
                              <div className="relative">
                                <div className="absolute -left-[23px] top-0.5">
                                  {getStepIcon(selectedRun.status, "designing", selectedRun.steps, "design")}
                                </div>
                                <div className="text-xs font-medium text-zinc-300">Generate Infographic</div>
                                <div className="text-[10px] text-zinc-500 mt-0.5">
                                  Create graphic prompt & call Nano Banana Pro
                                </div>
                              </div>

                              {/* Notion Archiving */}
                              <div className="relative">
                                <div className="absolute -left-[23px] top-0.5">
                                  {getStepIcon(selectedRun.status, "archiving", selectedRun.steps, "notion_archive")}
                                </div>
                                <div className="text-xs font-medium text-zinc-300">Notion Archive</div>
                                <div className="text-[10px] text-zinc-500 mt-0.5">
                                  Store draft metadata to Notion Calendar
                                </div>
                              </div>
                            </div>

                            {selectedRun.errorMessage && (
                              <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-400 rounded-lg text-xs break-all">
                                <span className="font-semibold block mb-1">Execution Error:</span>
                                {selectedRun.errorMessage}
                              </div>
                            )}
                          </div>

                          {/* Right: Draft Previews */}
                          <div className="lg:col-span-2 space-y-5">
                            {selectedRun.status === "failed" && !selectedRun.linkedinPost && (
                              <div className="h-full flex items-center justify-center text-zinc-500 text-sm border border-zinc-800/80 rounded-xl p-8 bg-zinc-900/5">
                                Execution failed before drafting posts. Check step timelines for details.
                              </div>
                            )}

                            {selectedRun.status !== "failed" && !selectedRun.linkedinPost && (
                              <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-sm border border-zinc-800/80 rounded-xl p-8 bg-zinc-900/5 gap-2">
                                <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                                <span>Generating your content draft...</span>
                              </div>
                            )}

                            {selectedRun.linkedinPost && (
                              <div className="space-y-4">
                                {/* Post box */}
                                <div className="glass-panel border border-zinc-800 rounded-xl p-4 bg-zinc-900/30 relative">
                                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-3">
                                    <span className="text-xs font-bold text-zinc-400">LinkedIn Draft</span>
                                    <button
                                      onClick={() => handleCopy(selectedRun.linkedinPost ?? "")}
                                      className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-md transition-all cursor-pointer"
                                      title="Copy post content"
                                    >
                                      {copied ? (
                                        <ClipboardCheck className="w-4 h-4 text-emerald-400" />
                                      ) : (
                                        <Copy className="w-4 h-4" />
                                      )}
                                    </button>
                                  </div>
                                  <p className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed select-text">
                                    {selectedRun.linkedinPost}
                                  </p>
                                </div>

                                {/* Image Infographic Box */}
                                <div className="glass-panel border border-zinc-800 rounded-xl p-4 bg-zinc-900/30">
                                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-3">
                                    <span className="text-xs font-bold text-zinc-400">Infographic Visual</span>
                                    {selectedRun.infographicUrl && (
                                      <a
                                        href={selectedRun.infographicUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 font-medium hover:underline"
                                      >
                                        Open Fullsize
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    )}
                                  </div>

                                  {!selectedRun.infographicUrl ? (
                                    selectedRun.status === "completed" || selectedRun.status === "failed" ? (
                                      <div className="text-center py-6 text-xs text-zinc-500">
                                        No image was generated.
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-center py-12 text-zinc-500 gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                                        <span className="text-xs">Generating visual infographic...</span>
                                      </div>
                                    )
                                  ) : (
                                    <div className="relative aspect-square max-w-sm mx-auto overflow-hidden rounded-lg border border-zinc-800">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={selectedRun.infographicUrl}
                                        alt="Infographic generated via Nano Banana Pro"
                                        className="object-cover w-full h-full"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Icon mapper for step status visualization
function getStepIcon(
  runStatus: string,
  currentStatusStage: string,
  steps: any[],
  stepLogName: string
) {
  const step = steps.find((s) => s.stepName === stepLogName);

  if (step) {
    if (step.status === "completed") {
      return (
        <div className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
        </div>
      );
    }
    if (step.status === "failed") {
      return (
        <div className="w-5 h-5 rounded-full bg-red-950 border border-red-500/30 flex items-center justify-center text-red-400">
          <XCircle className="w-3.5 h-3.5" />
        </div>
      );
    }
    if (step.status === "running") {
      return (
        <div className="w-5 h-5 rounded-full bg-blue-950 border border-blue-500/30 flex items-center justify-center text-blue-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        </div>
      );
    }
  }

  // Fallbacks based on orchestrator status
  if (runStatus === "failed") {
    return (
      <div className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
        <XCircle className="w-3.5 h-3.5" />
      </div>
    );
  }

  if (runStatus === currentStatusStage) {
    return (
      <div className="w-5 h-5 rounded-full bg-blue-950 border border-blue-500/30 flex items-center justify-center text-blue-400">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
      <Clock className="w-3.5 h-3.5" />
    </div>
  );
}
