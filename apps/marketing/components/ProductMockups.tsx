"use client";

import { useState } from "react";
import {
  ListIcon,
  KanbanIcon,
  CalendarIcon,
  GanttIcon,
  TableIcon,
  CycleIcon,
  ModuleIcon,
  DocIcon,
  TriageIcon,
} from "./Icons";

export function HeroDashboardMockup() {
  const [activeTab, setActiveTab] = useState<"list" | "board" | "calendar" | "gantt" | "table">("list");
  const [activeSidebar, setActiveSidebar] = useState<"issues" | "cycles" | "modules" | "pages" | "ai">("issues");

  const featureTabs = [
    { id: "issues", label: "Projects & 5 Views", Icon: ListIcon },
    { id: "cycles", label: "Agile Cycles & Sprints", Icon: CycleIcon },
    { id: "modules", label: "Modules & Epics", Icon: ModuleIcon },
    { id: "pages", label: "Pages & Docs", Icon: DocIcon },
    { id: "ai", label: "Bring Your Own AI Key", Icon: TriageIcon },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", width: "100%", alignItems: "center" }}>
      {/* Feature Switcher Bar */}
      <div className="hero-feature-switcher-bar">
        {featureTabs.map((f) => {
          const TabIcon = f.Icon;
          return (
            <button
              key={f.id}
              type="button"
              className={`hero-feature-tab ${activeSidebar === f.id ? "active" : ""}`}
              onClick={() => setActiveSidebar(f.id as typeof activeSidebar)}
            >
              <TabIcon size={14} className="hero-feature-tab-icon" />
              <span className="hero-feature-tab-label">{f.label}</span>
            </button>
          );
        })}
      </div>

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
          width: "100%",
          boxSizing: "border-box",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* macOS Window Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.85rem 1.25rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            background: "rgba(30, 41, 59, 0.6)",
            backdropFilter: "blur(16px)",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ display: "flex", gap: "0.45rem" }}>
              <span
                style={{
                  width: "11px",
                  height: "11px",
                  borderRadius: "50%",
                  background: "#ff5f56",
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  width: "11px",
                  height: "11px",
                  borderRadius: "50%",
                  background: "#ffbd2e",
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  width: "11px",
                  height: "11px",
                  borderRadius: "50%",
                  background: "#27c93f",
                  display: "inline-block",
                }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600, color: "#f1f5f9" }}>
              <span>Keel Workspace / Engineering Team</span>
            </div>
          </div>

          {/* View Switcher Pills */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "rgba(15, 23, 42, 0.7)",
              padding: "0.25rem",
              borderRadius: "9999px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            {[
              { id: "list", label: "List", Icon: ListIcon },
              { id: "board", label: "Board", Icon: KanbanIcon },
              { id: "calendar", label: "Calendar", Icon: CalendarIcon },
              { id: "gantt", label: "Gantt", Icon: GanttIcon },
              { id: "table", label: "Table", Icon: TableIcon },
            ].map((v) => {
              const VIcon = v.Icon;
              const isSelected = activeSidebar === "issues" && activeTab === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setActiveSidebar("issues");
                    setActiveTab(v.id as "list" | "board" | "calendar" | "gantt" | "table");
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    border: "none",
                    background: isSelected ? "#7c3aed" : "transparent",
                    color: isSelected ? "#ffffff" : "#94a3b8",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    padding: "0.35rem 0.75rem",
                    borderRadius: "9999px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    boxShadow: isSelected ? "0 2px 8px rgba(124, 58, 237, 0.4)" : "none",
                  }}
                >
                  <VIcon size={12} />
                  <span>{v.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Cycle Pill */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span
              style={{
                background: "rgba(167, 139, 250, 0.12)",
                color: "#a78bfa",
                padding: "0.25rem 0.65rem",
                borderRadius: "9999px",
                fontSize: "0.75rem",
                fontFamily: "var(--mono)",
                fontWeight: 600,
                border: "1px solid rgba(167, 139, 250, 0.25)",
              }}
            >
              Sprint Cycle 14 · 82% Complete
            </span>
          </div>
        </div>

        {/* Main App Body */}
        <div style={{ display: "grid", gridTemplateColumns: "210px 1fr", minHeight: "400px" }}>
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
                  fontWeight: 600,
                }}
              >
                Views &amp; Work
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                {[
                  { id: "issues", label: "Issues (48)", Icon: ListIcon },
                  { id: "cycles", label: "Cycles & Sprints", Icon: CycleIcon },
                  { id: "modules", label: "Modules & Epics", Icon: ModuleIcon },
                  { id: "pages", label: "Pages & Docs", Icon: DocIcon },
                  { id: "ai", label: "BYO AI Key Settings", Icon: TriageIcon },
                ].map((item) => {
                  const SIcon = item.Icon;
                  const isSelected = activeSidebar === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveSidebar(item.id as typeof activeSidebar)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.45rem 0.75rem",
                        background: isSelected ? "rgba(124, 58, 237, 0.2)" : "transparent",
                        color: isSelected ? "#a78bfa" : "#94a3b8",
                        borderRadius: "10px",
                        fontWeight: 600,
                        fontSize: "0.8125rem",
                        border: isSelected ? "1px solid rgba(167, 139, 250, 0.3)" : "1px solid transparent",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <SIcon size={14} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
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
                  fontWeight: 600,
                }}
              >
                Projects
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <div style={{ padding: "0.4rem 0.75rem", color: "#f8fafc", fontWeight: 500, fontSize: "0.8125rem" }}>
                  • Web Engine
                </div>
                <div style={{ padding: "0.4rem 0.75rem", color: "#94a3b8", fontSize: "0.8125rem" }}>• API Backend</div>
                <div style={{ padding: "0.4rem 0.75rem", color: "#94a3b8", fontSize: "0.8125rem" }}>• Mobile Apps</div>
              </div>
            </div>
          </div>

          {/* Canvas View */}
          <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem", overflowX: "auto" }}>
            {/* View Filter Controls */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <span
                  style={{
                    padding: "0.3rem 0.65rem",
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: "8px",
                    color: "#cbd5e1",
                    fontSize: "0.75rem",
                  }}
                >
                  Filter: Active ▾
                </span>
                <span
                  style={{
                    padding: "0.3rem 0.65rem",
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: "8px",
                    color: "#cbd5e1",
                    fontSize: "0.75rem",
                  }}
                >
                  Group: State ▾
                </span>
                <span
                  style={{
                    padding: "0.3rem 0.65rem",
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: "8px",
                    color: "#cbd5e1",
                    fontSize: "0.75rem",
                  }}
                >
                  Sort: Priority ▾
                </span>
              </div>
              <span
                style={{
                  padding: "0.35rem 0.85rem",
                  background: "#7c3aed",
                  color: "#ffffff",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  boxShadow: "0 2px 8px rgba(124, 58, 237, 0.4)",
                }}
              >
                + New Issue
              </span>
            </div>

            {/* Dynamic Content */}
            {activeSidebar === "cycles" ? (
              <div
                style={{
                  background: "rgba(30, 41, 59, 0.4)",
                  borderRadius: "16px",
                  padding: "1.25rem",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <div>
                    <h4 style={{ margin: 0, color: "#f8fafc" }}>Sprint Cycle 14</h4>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>14 Work Items · Burndown on track</span>
                  </div>
                  <span
                    style={{
                      background: "#7c3aed",
                      color: "#fff",
                      padding: "0.2rem 0.65rem",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}
                  >
                    Active
                  </span>
                </div>
                <div
                  style={{
                    height: "8px",
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: "9999px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: "82%",
                      height: "100%",
                      background: "linear-gradient(90deg, #7c3aed, #a78bfa)",
                      borderRadius: "9999px",
                    }}
                  />
                </div>
              </div>
            ) : activeSidebar === "modules" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {[
                  { name: "BYO AI Model Integration Engine", progress: "88%", count: "12 items" },
                  { name: "5 Dynamic Views & Saved Filter Sets", progress: "95%", count: "24 items" },
                  { name: "Collaborative Pages Slash Commands", progress: "60%", count: "8 items" },
                ].map((m) => (
                  <div
                    key={m.name}
                    style={{
                      background: "rgba(30, 41, 59, 0.4)",
                      padding: "1rem",
                      borderRadius: "14px",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <span style={{ fontWeight: 600, color: "#f8fafc" }}>{m.name}</span>
                      <span style={{ color: "#a78bfa", fontWeight: 600 }}>{m.progress}</span>
                    </div>
                    <div
                      style={{
                        height: "6px",
                        background: "rgba(255,255,255,0.06)",
                        borderRadius: "9999px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: m.progress,
                          height: "100%",
                          background: "linear-gradient(90deg, #7c3aed, #a78bfa)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : activeSidebar === "pages" ? (
              <div
                style={{
                  background: "rgba(30, 41, 59, 0.4)",
                  borderRadius: "16px",
                  padding: "1.25rem",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f8fafc", marginBottom: "0.5rem" }}>
                  Engineering Architecture Specs
                </div>
                <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: "0 0 1rem" }}>
                  Living collaborative markdown pages living beside active issues and sprint cycles.
                </p>
                <div
                  style={{
                    padding: "0.75rem",
                    background: "rgba(15, 23, 42, 0.6)",
                    borderRadius: "10px",
                    borderLeft: "3px solid #7c3aed",
                    color: "#a78bfa",
                    fontSize: "0.75rem",
                  }}
                >
                  Type <code>/</code> for slash commands to embed active issues, sub-items, and checklists.
                </div>
              </div>
            ) : activeSidebar === "ai" ? (
              <div
                style={{
                  background: "rgba(30, 27, 46, 0.6)",
                  borderRadius: "16px",
                  padding: "1.25rem",
                  border: "1px solid rgba(167, 139, 250, 0.3)",
                }}
              >
                <div style={{ fontSize: "1rem", fontWeight: 700, color: "#a78bfa", marginBottom: "0.5rem" }}>
                  Bring Your Own API Key Configuration
                </div>
                <p style={{ color: "#94a3b8", fontSize: "0.8125rem", margin: "0 0 1rem" }}>
                  Configure your API key for Anthropic, OpenAI, Google, xAI, Mistral, DeepSeek, or Groq. Keel never
                  resells model usage.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  <div
                    style={{
                      background: "rgba(15, 23, 42, 0.7)",
                      padding: "0.6rem 0.8rem",
                      borderRadius: "8px",
                      fontSize: "0.75rem",
                      color: "#f8fafc",
                    }}
                  >
                    Anthropic API Key: <span style={{ color: "#10b981" }}>● Active (sk-ant-...)</span>
                  </div>
                  <div
                    style={{
                      background: "rgba(15, 23, 42, 0.7)",
                      padding: "0.6rem 0.8rem",
                      borderRadius: "8px",
                      fontSize: "0.75rem",
                      color: "#f8fafc",
                    }}
                  >
                    OpenAI API Key: <span style={{ color: "#10b981" }}>● Active (sk-proj-...)</span>
                  </div>
                </div>
              </div>
            ) : (
              /* ISSUES LIST/BOARD VIEW */
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {[
                  {
                    id: "KEEL-101",
                    title: "Implement Bring Your Own AI Key setting across 7 model providers",
                    priority: "Urgent",
                    state: "In Progress",
                    color: "#ef4444",
                  },
                  {
                    id: "KEEL-102",
                    title: "Unify 5 dynamic work views (List, Board, Calendar, Table, Gantt)",
                    priority: "High",
                    state: "In Progress",
                    color: "#f59e0b",
                  },
                  {
                    id: "KEEL-103",
                    title: "Collaborative Pages document editor with slash command embeds",
                    priority: "Medium",
                    state: "In Progress",
                    color: "#7c3aed",
                  },
                  {
                    id: "KEEL-104",
                    title: "Per-project discussion chat & intake triage inbox",
                    priority: "Medium",
                    state: "Done",
                    color: "#10b981",
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.65rem 0.85rem",
                      background: "rgba(30, 41, 59, 0.4)",
                      borderRadius: "10px",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span style={{ color: "#64748b", fontFamily: "var(--mono)", fontSize: "0.75rem" }}>
                        {item.id}
                      </span>
                      <span style={{ color: "#f8fafc", fontWeight: 500 }}>{item.title}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: item.color,
                          background: `${item.color}15`,
                          padding: "0.15rem 0.5rem",
                          borderRadius: "4px",
                          fontWeight: 600,
                        }}
                      >
                        {item.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
        {["📋 List", "📊 Board", "📅 Calendar", "📈 Gantt", "📑 Table"].map((label, idx) => (
          <span
            key={label}
            style={{
              padding: "0.3rem 0.65rem",
              background: idx === 0 ? "rgba(124, 58, 237, 0.15)" : "rgba(0,0,0,0.04)",
              color: idx === 0 ? "#7c3aed" : "var(--fg-muted)",
              borderRadius: "9999px",
              fontWeight: 600,
              fontSize: "0.75rem",
            }}
          >
            {label}
          </span>
        ))}
      </div>
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--surface-glass-border)",
          borderRadius: "12px",
          padding: "0.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", fontWeight: 600 }}>
          <span>Sprint Cycle #14 Progress</span>
          <span style={{ color: "#7c3aed" }}>82% Complete</span>
        </div>
        <div
          style={{
            height: "6px",
            width: "100%",
            background: "rgba(0,0,0,0.06)",
            borderRadius: "9999px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: "82%",
              background: "linear-gradient(90deg, #7c3aed, #a78bfa)",
              borderRadius: "9999px",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function CyclesBentoVisual() {
  return (
    <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--surface-glass-border)",
          borderRadius: "12px",
          padding: "0.85rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 600, fontSize: "0.8125rem" }}>⚡️ Sprint 14 · Scope Locked</span>
          <span style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: 600 }}>● 6 Days Left</span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.75rem", color: "var(--fg-muted)" }}>
          <span>48 Total Pts</span> · <span>38 Done</span> · <span>10 Remaining</span>
        </div>
      </div>
    </div>
  );
}

export function PagesBentoVisual() {
  return (
    <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--surface-glass-border)",
          borderRadius: "12px",
          padding: "0.85rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.4rem",
          fontSize: "0.8125rem",
        }}
      >
        <div style={{ fontWeight: 600 }}>📄 System Architecture &amp; Specs</div>
        <div style={{ color: "var(--fg-muted)", fontSize: "0.75rem" }}>
          Type / to embed work items, sprint cycles, or sub-tasks...
        </div>
      </div>
    </div>
  );
}

export function ByoAiBentoVisual() {
  return (
    <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div
        style={{
          background: "rgba(15, 23, 42, 0.95)",
          color: "#a78bfa",
          padding: "0.85rem",
          borderRadius: "12px",
          fontFamily: "var(--mono)",
          fontSize: "0.75rem",
          border: "1px solid rgba(167, 139, 250, 0.25)",
        }}
      >
        <div>🔑 API Key: sk-ant-api03-... (Anthropic)</div>
        <div style={{ color: "#10b981", marginTop: "0.25rem" }}>✔ Direct provider routing · 0% reseller markup</div>
      </div>
    </div>
  );
}

export const WikiBentoVisual = PagesBentoVisual;
export const SelfHostBentoVisual = ByoAiBentoVisual;
