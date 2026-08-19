"use client";

import { useState } from "react";

export function HeroDashboardMockup() {
  const [activeTab, setActiveTab] = useState<"list" | "board" | "calendar" | "gantt" | "table">("list");
  const [activeSidebar, setActiveSidebar] = useState<"issues" | "cycles" | "modules" | "pages" | "triage">("issues");

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
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* 1. Apple macOS Window Header */}
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
          {/* macOS Window Controls */}
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
            <span>⚡️ Keel Workspace &gt; Platform Core</span>
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
            { id: "list", label: "📋 List" },
            { id: "board", label: "📊 Board" },
            { id: "calendar", label: "📅 Calendar" },
            { id: "gantt", label: "📈 Gantt" },
            { id: "table", label: "📑 Table" },
          ].map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => {
                setActiveSidebar("issues");
                setActiveTab(v.id as "list" | "board" | "calendar" | "gantt" | "table");
              }}
              style={{
                border: "none",
                background: activeSidebar === "issues" && activeTab === v.id ? "#0284c7" : "transparent",
                color: activeSidebar === "issues" && activeTab === v.id ? "#ffffff" : "#94a3b8",
                fontWeight: 600,
                fontSize: "0.75rem",
                padding: "0.35rem 0.8rem",
                borderRadius: "9999px",
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxShadow:
                  activeSidebar === "issues" && activeTab === v.id ? "0 2px 8px rgba(2, 132, 199, 0.4)" : "none",
              }}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Active Cycle Pill */}
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
            Cycle 14 · 82% Done
          </span>
        </div>
      </div>

      {/* 2. Main App Body */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "410px" }}>
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
                { id: "issues", label: "📋 Issues (48)" },
                { id: "cycles", label: "🔄 Cycles & Sprints" },
                { id: "modules", label: "📦 Modules & Epics" },
                { id: "pages", label: "📖 Pages & Docs" },
                { id: "triage", label: "📥 Intake Triage" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSidebar(item.id as typeof activeSidebar)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0.45rem 0.75rem",
                    background: activeSidebar === item.id ? "rgba(2, 132, 199, 0.2)" : "transparent",
                    color: activeSidebar === item.id ? "#38bdf8" : "#94a3b8",
                    borderRadius: "10px",
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                    border: activeSidebar === item.id ? "1px solid rgba(56, 189, 248, 0.2)" : "1px solid transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                >
                  {item.label}
                </button>
              ))}
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
              Active Projects
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              <div style={{ padding: "0.45rem 0.75rem", color: "#94a3b8", fontSize: "0.8125rem" }}>
                🌐 Web Application
              </div>
              <div style={{ padding: "0.45rem 0.75rem", color: "#94a3b8", fontSize: "0.8125rem" }}>⚡️ API Engine</div>
              <div style={{ padding: "0.45rem 0.75rem", color: "#94a3b8", fontSize: "0.8125rem" }}>
                📱 Mobile Clients
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Content Canvas */}
        <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem", overflowX: "auto" }}>
          {/* Controls Bar */}
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
                  background: "rgba(255, 255, 255, 0.06)",
                  borderRadius: "8px",
                  color: "#cbd5e1",
                  fontSize: "0.75rem",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                Filter: All Active ▾
              </span>
              <span
                style={{
                  padding: "0.3rem 0.65rem",
                  background: "rgba(255, 255, 255, 0.06)",
                  borderRadius: "8px",
                  color: "#cbd5e1",
                  fontSize: "0.75rem",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                Group: Status ▾
              </span>
              <span
                style={{
                  padding: "0.3rem 0.65rem",
                  background: "rgba(255, 255, 255, 0.06)",
                  borderRadius: "8px",
                  color: "#cbd5e1",
                  fontSize: "0.75rem",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                Sort: Priority ▾
              </span>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <span
                style={{
                  padding: "0.35rem 0.85rem",
                  background: "#0284c7",
                  color: "#ffffff",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  boxShadow: "0 2px 6px rgba(2, 132, 199, 0.3)",
                }}
              >
                + New Issue
              </span>
            </div>
          </div>

          {/* VIEW RENDERER */}
          {activeSidebar === "cycles" ? (
            /* CYCLES VIEW */
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div
                style={{
                  background: "rgba(30, 41, 59, 0.5)",
                  borderRadius: "16px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  padding: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "1rem", color: "#f8fafc" }}>⚡️ Sprint Cycle #14 (Current)</h4>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                      Aug 15 - Aug 29 · 14 Work Items · Scope Locked
                    </span>
                  </div>
                  <span
                    style={{
                      background: "#0284c7",
                      color: "#fff",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "9999px",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                    }}
                  >
                    Active Sprint
                  </span>
                </div>
                <div
                  style={{
                    height: "8px",
                    background: "rgba(255, 255, 255, 0.08)",
                    borderRadius: "9999px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: "82%",
                      height: "100%",
                      background: "linear-gradient(90deg, #0284c7, #38bdf8)",
                      borderRadius: "9999px",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "0.75rem",
                    textAlign: "center",
                  }}
                >
                  <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "0.75rem", borderRadius: "10px" }}>
                    <div style={{ color: "#38bdf8", fontWeight: 700, fontSize: "1.125rem" }}>32 pts</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.7rem" }}>Completed</div>
                  </div>
                  <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "0.75rem", borderRadius: "10px" }}>
                    <div style={{ color: "#f59e0b", fontWeight: 700, fontSize: "1.125rem" }}>8 pts</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.7rem" }}>In Progress</div>
                  </div>
                  <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "0.75rem", borderRadius: "10px" }}>
                    <div style={{ color: "#10b981", fontWeight: 700, fontSize: "1.125rem" }}>96%</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.7rem" }}>Burndown Health</div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeSidebar === "modules" ? (
            /* MODULES VIEW */
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                { name: "⚡️ Realtime Presence Engine", status: "In Progress", progress: "74%", count: "12 issues" },
                { name: "🔐 SAML SSO & RBAC Engine", status: "In Progress", progress: "90%", count: "8 issues" },
                { name: "📱 iOS & macOS Native Clients", status: "Planning", progress: "35%", count: "18 issues" },
              ].map((m) => (
                <div
                  key={m.name}
                  style={{
                    background: "rgba(30, 41, 59, 0.4)",
                    borderRadius: "14px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    padding: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 600, color: "#f8fafc" }}>{m.name}</span>
                    <span style={{ fontSize: "0.75rem", color: "#38bdf8", fontWeight: 600 }}>{m.progress}</span>
                  </div>
                  <div
                    style={{
                      height: "6px",
                      background: "rgba(255, 255, 255, 0.06)",
                      borderRadius: "9999px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: m.progress,
                        height: "100%",
                        background: "linear-gradient(90deg, #0284c7, #38bdf8)",
                        borderRadius: "9999px",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : activeSidebar === "pages" ? (
            /* PAGES & DOCS VIEW */
            <div
              style={{
                background: "rgba(30, 41, 59, 0.4)",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "#f8fafc" }}>
                📄 Technical Architecture Spec v2.4
              </div>
              <p style={{ color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>
                Keel provides a unified workspace architecture with MobX reactive state management, Django REST
                backends, and full AGPL-3.0 data ownership.
              </p>
              <div
                style={{
                  padding: "0.75rem",
                  background: "rgba(15, 23, 42, 0.6)",
                  borderRadius: "10px",
                  borderLeft: "3px solid #0284c7",
                  color: "#38bdf8",
                  fontSize: "0.75rem",
                }}
              >
                Type <code>/</code> for slash commands to embed active issues, cycles, burndown charts, and markdown
                tables.
              </div>
            </div>
          ) : activeTab === "board" ? (
            /* 2. KANBAN BOARD VIEW */
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(210px, 1fr))",
                gap: "0.85rem",
                alignItems: "start",
              }}
            >
              {/* Column: To Do */}
              <div
                style={{
                  background: "rgba(30, 41, 59, 0.4)",
                  borderRadius: "16px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  padding: "0.75rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.65rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.25rem 0.5rem",
                  }}
                >
                  <span style={{ fontWeight: 600, color: "#94a3b8", fontSize: "0.75rem", textTransform: "uppercase" }}>
                    ⚪️ Backlog (2)
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "#64748b" }}>+</span>
                </div>
                <div
                  style={{
                    background: "rgba(15, 23, 42, 0.7)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    padding: "0.85rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#ef4444", fontSize: "0.7rem", fontWeight: 700 }}>🔴 High</span>
                    <span style={{ color: "#64748b", fontSize: "0.7rem" }}>KEEL-114</span>
                  </div>
                  <span style={{ color: "#f8fafc", fontWeight: 500, lineHeight: 1.4 }}>
                    Realtime collaboration presence broadcast
                  </span>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "0.25rem",
                    }}
                  >
                    <span style={{ color: "#94a3b8", fontSize: "0.7rem" }}>Due Aug 28</span>
                    <span
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        background: "#0284c7",
                        color: "#fff",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                      }}
                    >
                      AK
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    background: "rgba(15, 23, 42, 0.7)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    padding: "0.85rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#f59e0b", fontSize: "0.7rem", fontWeight: 700 }}>🟡 Medium</span>
                    <span style={{ color: "#64748b", fontSize: "0.7rem" }}>KEEL-118</span>
                  </div>
                  <span style={{ color: "#f8fafc", fontWeight: 500, lineHeight: 1.4 }}>
                    S3 direct upload presigned URL handler
                  </span>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "0.25rem",
                    }}
                  >
                    <span style={{ color: "#94a3b8", fontSize: "0.7rem" }}>Due Sep 2</span>
                    <span
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        background: "#10b981",
                        color: "#fff",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                      }}
                    >
                      MR
                    </span>
                  </div>
                </div>
              </div>

              {/* Column: In Progress */}
              <div
                style={{
                  background: "rgba(30, 41, 59, 0.5)",
                  borderRadius: "16px",
                  border: "1px solid rgba(56, 189, 248, 0.2)",
                  padding: "0.75rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.65rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.25rem 0.5rem",
                  }}
                >
                  <span style={{ fontWeight: 600, color: "#38bdf8", fontSize: "0.75rem", textTransform: "uppercase" }}>
                    🟡 In Progress (3)
                  </span>
                  <span
                    style={{
                      background: "rgba(56, 189, 248, 0.15)",
                      color: "#38bdf8",
                      borderRadius: "9999px",
                      padding: "0.1rem 0.45rem",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                    }}
                  >
                    3
                  </span>
                </div>
                <div
                  style={{
                    background: "rgba(15, 23, 42, 0.8)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    padding: "0.85rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#ef4444", fontSize: "0.7rem", fontWeight: 700 }}>🔴 High</span>
                    <span style={{ color: "#64748b", fontSize: "0.7rem" }}>KEEL-104</span>
                  </div>
                  <span style={{ color: "#f8fafc", fontWeight: 500, lineHeight: 1.4 }}>
                    Virtualized table rendering for 10k+ rows
                  </span>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "0.25rem",
                    }}
                  >
                    <span style={{ color: "#ef4444", fontSize: "0.7rem", fontWeight: 600 }}>Due Tomorrow</span>
                    <span
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        background: "#0284c7",
                        color: "#fff",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                      }}
                    >
                      MR
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    background: "rgba(15, 23, 42, 0.8)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    padding: "0.85rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#f59e0b", fontSize: "0.7rem", fontWeight: 700 }}>🟡 Medium</span>
                    <span style={{ color: "#64748b", fontSize: "0.7rem" }}>KEEL-108</span>
                  </div>
                  <span style={{ color: "#f8fafc", fontWeight: 500, lineHeight: 1.4 }}>
                    Prosemirror slash-commands for embeddings
                  </span>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "0.25rem",
                    }}
                  >
                    <span style={{ color: "#94a3b8", fontSize: "0.7rem" }}>Due Aug 24</span>
                    <span
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        background: "#8b5cf6",
                        color: "#fff",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                      }}
                    >
                      AK
                    </span>
                  </div>
                </div>
              </div>

              {/* Column: Done */}
              <div
                style={{
                  background: "rgba(30, 41, 59, 0.4)",
                  borderRadius: "16px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  padding: "0.75rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.65rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.25rem 0.5rem",
                  }}
                >
                  <span style={{ fontWeight: 600, color: "#10b981", fontSize: "0.75rem", textTransform: "uppercase" }}>
                    🟢 Done (2)
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "#10b981" }}>✓</span>
                </div>
                <div
                  style={{
                    background: "rgba(15, 23, 42, 0.7)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    padding: "0.85rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    opacity: 0.85,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#10b981", fontSize: "0.7rem", fontWeight: 700 }}>🟢 Low</span>
                    <span style={{ color: "#64748b", fontSize: "0.7rem" }}>KEEL-99</span>
                  </div>
                  <span style={{ color: "#94a3b8", fontWeight: 500, textDecoration: "line-through", lineHeight: 1.4 }}>
                    MobX reactive workspace store hydration
                  </span>
                </div>
                <div
                  style={{
                    background: "rgba(15, 23, 42, 0.7)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    padding: "0.85rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    opacity: 0.85,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#10b981", fontSize: "0.7rem", fontWeight: 700 }}>🟢 Low</span>
                    <span style={{ color: "#64748b", fontSize: "0.7rem" }}>KEEL-101</span>
                  </div>
                  <span style={{ color: "#94a3b8", fontWeight: 500, textDecoration: "line-through", lineHeight: 1.4 }}>
                    Apple glass UI tokens & squircle cards
                  </span>
                </div>
              </div>
            </div>
          ) : activeTab === "calendar" ? (
            /* 3. CALENDAR VIEW */
            <div
              style={{
                background: "rgba(30, 41, 59, 0.4)",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                  paddingBottom: "0.5rem",
                }}
              >
                <span style={{ fontWeight: 700, color: "#f8fafc" }}>August 2026 · Sprint Cycle 14</span>
                <span style={{ fontSize: "0.75rem", color: "#38bdf8" }}>Week 34 (Aug 18 - 24)</span>
              </div>
              <div
                style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.5rem", minHeight: "180px" }}
              >
                {[
                  { day: "Mon 18", tasks: [{ id: "KEEL-99", title: "Store hydration", status: "done" }] },
                  { day: "Tue 19", tasks: [{ id: "KEEL-104", title: "Virtualized tables", status: "active" }] },
                  { day: "Wed 20", tasks: [{ id: "KEEL-108", title: "Slash commands", status: "active" }] },
                  { day: "Thu 21", tasks: [{ id: "KEEL-112", title: "Docker multi-arch", status: "active" }] },
                  { day: "Fri 22", tasks: [{ id: "KEEL-114", title: "Presence broadcast", status: "pending" }] },
                ].map((col) => (
                  <div
                    key={col.day}
                    style={{
                      background: "rgba(15, 23, 42, 0.6)",
                      borderRadius: "10px",
                      padding: "0.5rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.4rem",
                    }}
                  >
                    <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#94a3b8" }}>{col.day}</span>
                    {col.tasks.map((t) => (
                      <div
                        key={t.id}
                        style={{
                          background:
                            t.status === "done"
                              ? "rgba(16, 185, 129, 0.2)"
                              : t.status === "active"
                                ? "rgba(2, 132, 199, 0.25)"
                                : "rgba(255, 255, 255, 0.06)",
                          border:
                            t.status === "done"
                              ? "1px solid rgba(16, 185, 129, 0.4)"
                              : t.status === "active"
                                ? "1px solid rgba(56, 189, 248, 0.3)"
                                : "1px solid rgba(255, 255, 255, 0.08)",
                          borderRadius: "8px",
                          padding: "0.4rem 0.5rem",
                          fontSize: "0.7rem",
                          color: t.status === "done" ? "#10b981" : t.status === "active" ? "#38bdf8" : "#cbd5e1",
                          fontWeight: 600,
                        }}
                      >
                        <div style={{ fontSize: "0.65rem", opacity: 0.8 }}>{t.id}</div>
                        <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {t.title}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === "gantt" ? (
            /* 4. GANTT TIMELINE VIEW */
            <div
              style={{
                background: "rgba(30, 41, 59, 0.4)",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                  paddingBottom: "0.5rem",
                }}
              >
                <span style={{ fontWeight: 700, color: "#f8fafc" }}>Roadmap &amp; Timeline Execution</span>
                <span style={{ fontSize: "0.75rem", color: "#38bdf8" }}>Aug 15 - Aug 30</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {[
                  {
                    name: "⚡️ Sprint Cycle 14 Execution",
                    start: "5%",
                    width: "75%",
                    color: "linear-gradient(90deg, #0284c7, #38bdf8)",
                  },
                  { name: "KEEL-104: Virtualized rendering", start: "10%", width: "40%", color: "#ef4444" },
                  { name: "KEEL-108: Prosemirror editor", start: "25%", width: "45%", color: "#f59e0b" },
                  { name: "KEEL-112: Docker Compose multi-arch", start: "40%", width: "50%", color: "#38bdf8" },
                ].map((bar) => (
                  <div key={bar.name} style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "#cbd5e1", fontWeight: 500 }}>{bar.name}</span>
                    <div
                      style={{
                        height: "18px",
                        background: "rgba(15, 23, 42, 0.6)",
                        borderRadius: "6px",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          left: bar.start,
                          width: bar.width,
                          height: "100%",
                          background: bar.color,
                          borderRadius: "6px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === "table" ? (
            /* 5. SPREADSHEET TABLE VIEW */
            <div
              style={{
                background: "rgba(30, 41, 59, 0.4)",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "90px 1.8fr 120px 100px 100px",
                  padding: "0.65rem 1rem",
                  background: "rgba(15, 23, 42, 0.7)",
                  fontWeight: 600,
                  color: "#94a3b8",
                  fontSize: "0.725rem",
                  textTransform: "uppercase",
                }}
              >
                <span>ID</span>
                <span>Title</span>
                <span>State</span>
                <span>Priority</span>
                <span>Assignee</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {[
                  {
                    id: "KEEL-104",
                    title: "Virtualized table rendering for 10k+ rows",
                    state: "In Progress",
                    prio: "🔴 High",
                    avatar: "MR",
                    prioColor: "#ef4444",
                  },
                  {
                    id: "KEEL-108",
                    title: "Prosemirror slash-commands for embeddings",
                    state: "In Progress",
                    prio: "🟡 Medium",
                    avatar: "AK",
                    prioColor: "#f59e0b",
                  },
                  {
                    id: "KEEL-112",
                    title: "Docker Compose multi-arch arm64/amd64 build",
                    state: "In Progress",
                    prio: "🔵 Normal",
                    avatar: "DL",
                    prioColor: "#38bdf8",
                  },
                  {
                    id: "KEEL-114",
                    title: "Realtime collaboration presence broadcast",
                    state: "Backlog",
                    prio: "🔴 High",
                    avatar: "AK",
                    prioColor: "#ef4444",
                  },
                  {
                    id: "KEEL-99",
                    title: "MobX reactive workspace store hydration",
                    state: "Done",
                    prio: "🟢 Low",
                    avatar: "MR",
                    prioColor: "#10b981",
                  },
                ].map((row, rIdx) => (
                  <div
                    key={row.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "90px 1.8fr 120px 100px 100px",
                      padding: "0.65rem 1rem",
                      borderTop: "1px solid rgba(255, 255, 255, 0.04)",
                      alignItems: "center",
                      background: rIdx % 2 === 0 ? "transparent" : "rgba(255, 255, 255, 0.02)",
                    }}
                  >
                    <span style={{ fontFamily: "var(--mono)", color: "#64748b", fontSize: "0.75rem" }}>{row.id}</span>
                    <span style={{ color: "#f8fafc", fontWeight: 500 }}>{row.title}</span>
                    <span
                      style={{
                        color: row.state === "Done" ? "#10b981" : row.state === "In Progress" ? "#38bdf8" : "#94a3b8",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                      }}
                    >
                      {row.state}
                    </span>
                    <span style={{ color: row.prioColor, fontSize: "0.75rem", fontWeight: 600 }}>{row.prio}</span>
                    <span
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        background: "#0284c7",
                        color: "#fff",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                      }}
                    >
                      {row.avatar}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* 1. DEFAULT LIST VIEW */
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {/* In Progress Group */}
              <div
                style={{
                  background: "rgba(30, 41, 59, 0.4)",
                  borderRadius: "14px",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "0.65rem 1rem",
                    background: "rgba(30, 41, 59, 0.6)",
                    fontWeight: 600,
                    color: "#38bdf8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span>🟡 In Progress (3)</span>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Sprint Cycle 14</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div
                    style={{
                      padding: "0.65rem 1rem",
                      borderTop: "1px solid rgba(255, 255, 255, 0.04)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span style={{ color: "#ef4444", fontSize: "0.75rem", fontWeight: 700 }}>🔴 High</span>
                      <span style={{ color: "#f8fafc", fontWeight: 500 }}>
                        KEEL-104: Virtualized table rendering for 10k+ rows
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        color: "#94a3b8",
                        fontSize: "0.75rem",
                      }}
                    >
                      <span>Due tomorrow</span>
                      <span
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          background: "#0284c7",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontSize: "0.65rem",
                          fontWeight: 700,
                        }}
                      >
                        MR
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "0.65rem 1rem",
                      borderTop: "1px solid rgba(255, 255, 255, 0.04)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span style={{ color: "#f59e0b", fontSize: "0.75rem", fontWeight: 700 }}>🟡 Medium</span>
                      <span style={{ color: "#f8fafc", fontWeight: 500 }}>
                        KEEL-108: Prosemirror slash-commands for issue embeddings
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        color: "#94a3b8",
                        fontSize: "0.75rem",
                      }}
                    >
                      <span>Due Aug 24</span>
                      <span
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          background: "#10b981",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontSize: "0.65rem",
                          fontWeight: 700,
                        }}
                      >
                        AK
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "0.65rem 1rem",
                      borderTop: "1px solid rgba(255, 255, 255, 0.04)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span style={{ color: "#38bdf8", fontSize: "0.75rem", fontWeight: 700 }}>🔵 Normal</span>
                      <span style={{ color: "#f8fafc", fontWeight: 500 }}>
                        KEEL-112: Docker Compose multi-arch arm64/amd64 build
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        color: "#94a3b8",
                        fontSize: "0.75rem",
                      }}
                    >
                      <span>Due Aug 26</span>
                      <span
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          background: "#8b5cf6",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontSize: "0.65rem",
                          fontWeight: 700,
                        }}
                      >
                        DL
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProjectsBentoVisual() {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {[
          { id: "list", label: "📋 List" },
          { id: "board", label: "📊 Kanban" },
          { id: "calendar", label: "📅 Calendar" },
          { id: "gantt", label: "📈 Gantt" },
          { id: "table", label: "📑 Spreadsheet" },
        ].map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setActiveTab(v.id)}
            style={{
              border: "none",
              padding: "0.3rem 0.65rem",
              background: activeTab === v.id ? "rgba(2, 132, 199, 0.15)" : "rgba(0,0,0,0.05)",
              color: activeTab === v.id ? "#0284c7" : "var(--fg-muted)",
              borderRadius: "9999px",
              fontWeight: activeTab === v.id ? 600 : 400,
              fontSize: "0.75rem",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {v.label}
          </button>
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.8125rem",
            fontWeight: 600,
          }}
        >
          <span>Sprint Cycle #14 Progress</span>
          <span style={{ color: "#0284c7" }}>82% Complete</span>
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
              background: "linear-gradient(90deg, #0284c7, #38bdf8)",
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
        <div style={{ fontWeight: 600 }}>📄 Release Notes v2.4</div>
        <div style={{ color: "var(--fg-muted)", fontSize: "0.75rem" }}>
          Type / to embed issues or cycles directly into docs...
        </div>
      </div>
    </div>
  );
}

export function DockerBentoVisual() {
  return (
    <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div
        style={{
          background: "rgba(15, 23, 42, 0.95)",
          color: "#38bdf8",
          padding: "0.85rem",
          borderRadius: "12px",
          fontFamily: "var(--mono)",
          fontSize: "0.75rem",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div>$ docker compose up -d</div>
        <div style={{ color: "#10b981", marginTop: "0.25rem" }}>✔ All 6 containers started healthy</div>
      </div>
    </div>
  );
}

export const WikiBentoVisual = PagesBentoVisual;
export const SelfHostBentoVisual = DockerBentoVisual;
