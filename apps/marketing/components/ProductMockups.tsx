"use client";

import { useState } from "react";

export function HeroDashboardMockup() {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: "rgba(15, 23, 42, 0.95)",
        color: "#f8fafc",
        fontSize: "0.8125rem",
        userSelect: "none",
        borderRadius: "24px",
        overflow: "hidden",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
      }}
    >
      {/* Apple Window Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.85rem 1.25rem",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          background: "rgba(30, 41, 59, 0.6)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* Traffic Light Dots */}
          <div style={{ display: "flex", gap: "0.45rem" }}>
            <span style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#ff5f56" }} />
            <span style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#ffbd2e" }} />
            <span style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#27c93f" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600, color: "#f1f5f9" }}>
            <span>⚡️ Keel Workspace &gt; Platform Core</span>
          </div>
        </div>

        {/* View Switcher Pills */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(15, 23, 42, 0.6)",
            padding: "0.2rem",
            borderRadius: "9999px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          {[
            { id: "list", label: "📋 List" },
            { id: "board", label: "📊 Board" },
            { id: "calendar", label: "📅 Calendar" },
            { id: "gantt", label: "📈 Gantt" },
            { id: "table", label: "📑 Table" },
          ].map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setActiveTab(v.id)}
              style={{
                border: "none",
                background: activeTab === v.id ? "#0284c7" : "transparent",
                color: activeTab === v.id ? "#ffffff" : "#94a3b8",
                fontWeight: 600,
                fontSize: "0.75rem",
                padding: "0.3rem 0.75rem",
                borderRadius: "9999px",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span
            style={{
              background: "rgba(56, 189, 248, 0.12)",
              color: "#38bdf8",
              padding: "0.25rem 0.65rem",
              borderRadius: "9999px",
              fontSize: "0.75rem",
              fontFamily: "var(--mono)",
              fontWeight: 600,
              border: "1px solid rgba(56, 189, 248, 0.25)",
            }}
          >
            Cycle 14 · In Progress
          </span>
        </div>
      </div>

      {/* Main App Body */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "380px" }}>
        {/* Left Sidebar */}
        <div
          style={{
            borderRight: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "1rem",
            background: "rgba(15, 23, 42, 0.4)",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "0.6875rem",
                fontFamily: "var(--mono)",
                color: "#64748b",
                textTransform: "uppercase",
                marginBottom: "0.5rem",
                letterSpacing: "0.06em",
              }}
            >
              Views &amp; Work
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              <div
                style={{
                  padding: "0.45rem 0.75rem",
                  background: "rgba(2, 132, 199, 0.2)",
                  borderRadius: "10px",
                  color: "#38bdf8",
                  fontWeight: 600,
                  border: "1px solid rgba(56, 189, 248, 0.2)",
                }}
              >
                📋 Issues (48)
              </div>
              <div style={{ padding: "0.45rem 0.75rem", color: "#94a3b8" }}>🔄 Cycles / Sprints</div>
              <div style={{ padding: "0.45rem 0.75rem", color: "#94a3b8" }}>📦 Modules &amp; Epics</div>
              <div style={{ padding: "0.45rem 0.75rem", color: "#94a3b8" }}>📖 Pages &amp; Docs</div>
              <div style={{ padding: "0.45rem 0.75rem", color: "#94a3b8" }}>📥 Intake Triage</div>
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: "0.6875rem",
                fontFamily: "var(--mono)",
                color: "#64748b",
                textTransform: "uppercase",
                marginBottom: "0.5rem",
                letterSpacing: "0.06em",
              }}
            >
              Active Projects
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              <div style={{ padding: "0.45rem 0.75rem", color: "#94a3b8" }}>🌐 Web Application</div>
              <div style={{ padding: "0.45rem 0.75rem", color: "#94a3b8" }}>⚡️ API Engine</div>
              <div style={{ padding: "0.45rem 0.75rem", color: "#94a3b8" }}>📱 Mobile Clients</div>
            </div>
          </div>
        </div>

        {/* Content Canvas */}
        <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Controls Bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <span style={{ padding: "0.3rem 0.65rem", background: "rgba(255, 255, 255, 0.06)", borderRadius: "8px", color: "#cbd5e1", fontSize: "0.75rem" }}>
                Filter: All Active ▾
              </span>
              <span style={{ padding: "0.3rem 0.65rem", background: "rgba(255, 255, 255, 0.06)", borderRadius: "8px", color: "#cbd5e1", fontSize: "0.75rem" }}>
                Group: Status ▾
              </span>
              <span style={{ padding: "0.3rem 0.65rem", background: "rgba(255, 255, 255, 0.06)", borderRadius: "8px", color: "#cbd5e1", fontSize: "0.75rem" }}>
                Sort: Priority ▾
              </span>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <span style={{ padding: "0.3rem 0.75rem", background: "#0284c7", color: "#ffffff", borderRadius: "8px", fontWeight: 600, fontSize: "0.75rem" }}>
                + New Issue
              </span>
            </div>
          </div>

          {/* Table / List Groups */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {/* In Progress Group */}
            <div style={{ background: "rgba(30, 41, 59, 0.4)", borderRadius: "14px", border: "1px solid rgba(255, 255, 255, 0.06)", overflow: "hidden" }}>
              <div style={{ padding: "0.65rem 1rem", background: "rgba(30, 41, 59, 0.6)", fontWeight: 600, color: "#38bdf8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>🟡 In Progress (3)</span>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Sprint Cycle 14</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "0.65rem 1rem", borderTop: "1px solid rgba(255, 255, 255, 0.04)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ color: "#ef4444", fontSize: "0.75rem" }}>🔴 High</span>
                    <span style={{ color: "#f8fafc", fontWeight: 500 }}>KEEL-104: Virtualized table rendering for 10k+ rows</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: "#94a3b8", fontSize: "0.75rem" }}>
                    <span>Due tomorrow</span>
                    <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#0284c7", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.65rem", fontWeight: 700 }}>MR</span>
                  </div>
                </div>
                <div style={{ padding: "0.65rem 1rem", borderTop: "1px solid rgba(255, 255, 255, 0.04)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ color: "#f59e0b", fontSize: "0.75rem" }}>🟡 Medium</span>
                    <span style={{ color: "#f8fafc", fontWeight: 500 }}>KEEL-108: Prosemirror slash-commands for issue embeddings</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: "#94a3b8", fontSize: "0.75rem" }}>
                    <span>Due Aug 24</span>
                    <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#10b981", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.65rem", fontWeight: 700 }}>AK</span>
                  </div>
                </div>
                <div style={{ padding: "0.65rem 1rem", borderTop: "1px solid rgba(255, 255, 255, 0.04)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ color: "#38bdf8", fontSize: "0.75rem" }}>🔵 Normal</span>
                    <span style={{ color: "#f8fafc", fontWeight: 500 }}>KEEL-112: Docker Compose multi-arch arm64/amd64 build</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: "#94a3b8", fontSize: "0.75rem" }}>
                    <span>Due Aug 26</span>
                    <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#8b5cf6", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.65rem", fontWeight: 700 }}>DL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectsBentoVisual() {
  return (
    <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <span style={{ padding: "0.3rem 0.65rem", background: "rgba(2, 132, 199, 0.15)", color: "#0284c7", borderRadius: "9999px", fontWeight: 600, fontSize: "0.75rem" }}>📋 List</span>
        <span style={{ padding: "0.3rem 0.65rem", background: "rgba(0,0,0,0.05)", color: "var(--fg-muted)", borderRadius: "9999px", fontSize: "0.75rem" }}>📊 Kanban</span>
        <span style={{ padding: "0.3rem 0.65rem", background: "rgba(0,0,0,0.05)", color: "var(--fg-muted)", borderRadius: "9999px", fontSize: "0.75rem" }}>📅 Calendar</span>
        <span style={{ padding: "0.3rem 0.65rem", background: "rgba(0,0,0,0.05)", color: "var(--fg-muted)", borderRadius: "9999px", fontSize: "0.75rem" }}>📈 Gantt</span>
        <span style={{ padding: "0.3rem 0.65rem", background: "rgba(0,0,0,0.05)", color: "var(--fg-muted)", borderRadius: "9999px", fontSize: "0.75rem" }}>📑 Spreadsheet</span>
      </div>
      <div style={{ background: "var(--surface)", border: "1px solid var(--surface-glass-border)", borderRadius: "12px", padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8125rem", fontWeight: 600 }}>
          <span>Sprint Cycle #14 Progress</span>
          <span style={{ color: "#0284c7" }}>82% Complete</span>
        </div>
        <div style={{ height: "6px", width: "100%", background: "rgba(0,0,0,0.06)", borderRadius: "9999px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: "82%", background: "linear-gradient(90deg, #0284c7, #38bdf8)", borderRadius: "9999px" }} />
        </div>
      </div>
    </div>
  );
}

export function WikiBentoVisual() {
  return (
    <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--surface-glass-border)", borderRadius: "12px", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--fg)" }}>
          📘 Architecture Decision: State Management
        </div>
        <div style={{ fontSize: "0.78125rem", color: "var(--fg-muted)", lineHeight: "1.4" }}>
          Type <code style={{ background: "rgba(2, 132, 199, 0.1)", color: "#0284c7", padding: "0.1rem 0.3rem", borderRadius: "4px" }}>/</code> for slash commands to embed tasks, sub-issues, and live burndown charts.
        </div>
      </div>
    </div>
  );
}

export function CyclesBentoVisual() {
  return (
    <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--surface-glass-border)", borderRadius: "12px", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>🔄 Sprint Velocity &amp; Burnup</span>
          <span style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: 600 }}>+18% Velocity</span>
        </div>
        <div style={{ display: "flex", gap: "0.35rem", alignItems: "flex-end", height: "45px", paddingTop: "0.5rem" }}>
          {[
            { id: "bar-1", height: "30%" },
            { id: "bar-2", height: "45%" },
            { id: "bar-3", height: "60%" },
            { id: "bar-4", height: "50%" },
            { id: "bar-5", height: "75%" },
            { id: "bar-6", height: "90%" },
            { id: "bar-7", height: "85%" },
            { id: "bar-8", height: "100%", active: true },
          ].map((bar) => (
            <div
              key={bar.id}
              style={{
                flex: 1,
                height: bar.height,
                background: bar.active ? "#0284c7" : "rgba(2, 132, 199, 0.25)",
                borderRadius: "4px",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SelfHostBentoVisual() {
  return (
    <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--surface-glass-border)", borderRadius: "12px", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem", fontFamily: "var(--mono)" }}>
        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>$ docker compose up -d</div>
        <div style={{ fontSize: "0.75rem", color: "#10b981" }}>✓ PostgreSQL 16 ready</div>
        <div style={{ fontSize: "0.75rem", color: "#10b981" }}>✓ Redis Cache ready</div>
        <div style={{ fontSize: "0.75rem", color: "#0284c7" }}>🚀 Keel Web + API running on :3000</div>
      </div>
    </div>
  );
}
