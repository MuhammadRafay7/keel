export function HeroDashboardMockup() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: "#0f0f10",
        color: "#f8fafc",
        fontSize: "0.8125rem",
        userSelect: "none",
      }}
    >
      {/* App Header Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.75rem 1.25rem",
          borderBottom: "1px solid #1e293b",
          background: "#131b24",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444" }} />
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#f59e0b" }} />
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600, color: "#e4e6e7" }}>
            <span>⚡️ Plane Core / Platform Engineering</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span
            style={{
              background: "rgba(56, 189, 248, 0.12)",
              color: "#38bdf8",
              padding: "0.2rem 0.6rem",
              borderRadius: "999px",
              fontSize: "0.75rem",
              fontFamily: "var(--mono)",
            }}
          >
            Sprint 24 · Active
          </span>
          <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>84% Completed</span>
        </div>
      </div>

      {/* Main App Body */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "360px" }}>
        {/* Sidebar */}
        <div
          style={{
            borderRight: "1px solid #1e293b",
            padding: "1rem",
            background: "#0b1015",
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
              }}
            >
              Workflows
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <div
                style={{
                  padding: "0.4rem 0.6rem",
                  background: "#1e293b",
                  borderRadius: "6px",
                  color: "#38bdf8",
                  fontWeight: 500,
                }}
              >
                📋 All Work Items (48)
              </div>
              <div style={{ padding: "0.4rem 0.6rem", color: "#94a3b8" }}>🔄 Cycles &amp; Sprints</div>
              <div style={{ padding: "0.4rem 0.6rem", color: "#94a3b8" }}>📦 Modules &amp; Epics</div>
              <div style={{ padding: "0.4rem 0.6rem", color: "#94a3b8" }}>📖 Wiki &amp; Docs</div>
              <div style={{ padding: "0.4rem 0.6rem", color: "#94a3b8" }}>📥 Intake Triage</div>
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
              }}
            >
              AI Agents
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <div
                style={{
                  padding: "0.3rem 0.6rem",
                  color: "#10b981",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }} /> @TriageBot
                (Live)
              </div>
              <div
                style={{
                  padding: "0.3rem 0.6rem",
                  color: "#a855f7",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#a855f7" }} /> @Summarizer
                (Idle)
              </div>
            </div>
          </div>
        </div>

        {/* Main Kanban Content */}
        <div
          style={{
            padding: "1.25rem",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1rem",
            background: "#0f1720",
          }}
        >
          {/* Column 1: In Progress */}
          <div
            style={{
              background: "#131b24",
              borderRadius: "10px",
              border: "1px solid #1e293b",
              padding: "0.85rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                color: "#f59e0b",
                fontWeight: 600,
                fontSize: "0.75rem",
                fontFamily: "var(--mono)",
              }}
            >
              <span>IN PROGRESS (3)</span>
              <span style={{ background: "rgba(245, 158, 11, 0.15)", padding: "0.1rem 0.4rem", borderRadius: "4px" }}>
                68%
              </span>
            </div>
            <div
              style={{
                background: "#1a2330",
                borderRadius: "8px",
                padding: "0.75rem",
                border: "1px solid #283548",
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
              }}
            >
              <div style={{ fontSize: "0.75rem", color: "#38bdf8", fontFamily: "var(--mono)" }}>#KEEL-402</div>
              <div style={{ color: "#f8fafc", fontWeight: 500 }}>Implement Model Context Protocol (MCP) Server</div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "0.25rem",
                  fontSize: "0.6875rem",
                  color: "#94a3b8",
                }}
              >
                <span>Backend · High</span>
                <span
                  style={{ background: "#006399", color: "#ffffff", padding: "0.1rem 0.35rem", borderRadius: "4px" }}
                >
                  Duane
                </span>
              </div>
            </div>
            <div
              style={{
                background: "#1a2330",
                borderRadius: "8px",
                padding: "0.75rem",
                border: "1px solid #283548",
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
              }}
            >
              <div style={{ fontSize: "0.75rem", color: "#38bdf8", fontFamily: "var(--mono)" }}>#KEEL-408</div>
              <div style={{ color: "#f8fafc", fontWeight: 500 }}>Three.js Antigravity Physics Orbit Interaction</div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "0.25rem",
                  fontSize: "0.6875rem",
                  color: "#94a3b8",
                }}
              >
                <span>Frontend · Urgent</span>
                <span
                  style={{ background: "#0284c7", color: "#ffffff", padding: "0.1rem 0.35rem", borderRadius: "4px" }}
                >
                  Elena
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: In Review */}
          <div
            style={{
              background: "#131b24",
              borderRadius: "10px",
              border: "1px solid #1e293b",
              padding: "0.85rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                color: "#a855f7",
                fontWeight: 600,
                fontSize: "0.75rem",
                fontFamily: "var(--mono)",
              }}
            >
              <span>IN REVIEW (2)</span>
              <span style={{ background: "rgba(168, 85, 247, 0.15)", padding: "0.1rem 0.4rem", borderRadius: "4px" }}>
                PRs Open
              </span>
            </div>
            <div
              style={{
                background: "#1a2330",
                borderRadius: "8px",
                padding: "0.75rem",
                border: "1px solid #283548",
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
              }}
            >
              <div style={{ fontSize: "0.75rem", color: "#a855f7", fontFamily: "var(--mono)" }}>#KEEL-395</div>
              <div style={{ color: "#f8fafc", fontWeight: 500 }}>Multi-tenant Air-gapped SSO SAML Provider</div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "0.25rem",
                  fontSize: "0.6875rem",
                  color: "#94a3b8",
                }}
              >
                <span>Security · Review</span>
                <span
                  style={{ background: "#6366f1", color: "#ffffff", padding: "0.1rem 0.35rem", borderRadius: "4px" }}
                >
                  Alex
                </span>
              </div>
            </div>
          </div>

          {/* Column 3: Done */}
          <div
            style={{
              background: "#131b24",
              borderRadius: "10px",
              border: "1px solid #1e293b",
              padding: "0.85rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                color: "#10b981",
                fontWeight: 600,
                fontSize: "0.75rem",
                fontFamily: "var(--mono)",
              }}
            >
              <span>DONE (18)</span>
              <span style={{ background: "rgba(16, 185, 129, 0.15)", padding: "0.1rem 0.4rem", borderRadius: "4px" }}>
                Shipped
              </span>
            </div>
            <div
              style={{
                background: "#1a2330",
                borderRadius: "8px",
                padding: "0.75rem",
                border: "1px solid #283548",
                opacity: 0.85,
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
              }}
            >
              <div style={{ fontSize: "0.75rem", color: "#10b981", fontFamily: "var(--mono)" }}>#KEEL-372</div>
              <div style={{ color: "#f8fafc", textDecoration: "line-through" }}>
                Jira &amp; Linear Importer Migration Script
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "0.25rem",
                  fontSize: "0.6875rem",
                  color: "#94a3b8",
                }}
              >
                <span>Passed CI/CD</span>
                <span style={{ color: "#10b981" }}>✓ Merged</span>
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
    <div
      style={{
        background: "#131b24",
        border: "1px solid #1e293b",
        borderRadius: "10px",
        padding: "1rem",
        color: "#f8fafc",
        fontSize: "0.75rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #1e293b",
          paddingBottom: "0.5rem",
          marginBottom: "0.75rem",
        }}
      >
        <span style={{ fontWeight: 600, color: "#38bdf8" }}>Platform Roadmap 2026</span>
        <span style={{ color: "#94a3b8", fontFamily: "var(--mono)" }}>Sprint 24 · 12 Issues</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div
          style={{
            background: "#1c2633",
            padding: "0.5rem",
            borderRadius: "6px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>🚀 Global CDN Cache Layer</span>
          <span style={{ color: "#10b981" }}>Done</span>
        </div>
        <div
          style={{
            background: "#1c2633",
            padding: "0.5rem",
            borderRadius: "6px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>⚡️ Real-time WebSocket Gateway</span>
          <span style={{ color: "#38bdf8" }}>In Progress</span>
        </div>
      </div>
    </div>
  );
}

export function WikiBentoVisual() {
  return (
    <div
      style={{
        background: "#131b24",
        border: "1px solid #1e293b",
        borderRadius: "10px",
        padding: "1rem",
        color: "#f8fafc",
        fontSize: "0.75rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          borderBottom: "1px solid #1e293b",
          paddingBottom: "0.5rem",
          marginBottom: "0.75rem",
        }}
      >
        <span>📄</span>
        <span style={{ fontWeight: 600, color: "#e4e6e7" }}>Engineering Handbook / Architecture Specs</span>
      </div>
      <div style={{ color: "#94a3b8", lineHeight: "1.4", fontFamily: "var(--mono)", fontSize: "0.7rem" }}>
        # Storage Architecture
        <br />- PostgreSQL 16 + Citus distributed cluster
        <br />- S3 Compatible Asset Storage with zero-knowledge encryption
        <br />- Linked work items: #ENG-104, #ENG-105
      </div>
    </div>
  );
}

export function AiBentoVisual() {
  return (
    <div
      style={{
        background: "#131b24",
        border: "1px solid #1e293b",
        borderRadius: "10px",
        padding: "1rem",
        color: "#f8fafc",
        fontSize: "0.75rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #1e293b",
          paddingBottom: "0.5rem",
          marginBottom: "0.75rem",
        }}
      >
        <span style={{ fontWeight: 600, color: "#a855f7" }}>Plane Agent Task Run</span>
        <span style={{ color: "#10b981", fontFamily: "var(--mono)" }}>● Active</span>
      </div>
      <div
        style={{
          background: "#0b1015",
          borderRadius: "6px",
          padding: "0.6rem",
          fontFamily: "var(--mono)",
          fontSize: "0.7rem",
          color: "#38bdf8",
        }}
      >
        &gt; Analyzing repository commits...
        <br />
        &gt; Auto-generating changelog draft for v1.5
        <br />
        &gt; Linked 14 issues, 6 contributors
      </div>
    </div>
  );
}

export function DeskBentoVisual() {
  return (
    <div
      style={{
        background: "#131b24",
        border: "1px solid #1e293b",
        borderRadius: "10px",
        padding: "1rem",
        color: "#f8fafc",
        fontSize: "0.75rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #1e293b",
          paddingBottom: "0.5rem",
          marginBottom: "0.75rem",
        }}
      >
        <span style={{ fontWeight: 600, color: "#f59e0b" }}>Customer Intake Triage</span>
        <span
          style={{
            background: "rgba(245, 158, 11, 0.15)",
            color: "#f59e0b",
            padding: "0.1rem 0.4rem",
            borderRadius: "4px",
          }}
        >
          3 New
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        <div
          style={{
            background: "#1c2633",
            padding: "0.45rem",
            borderRadius: "6px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>Email: SAML SSO setup assistance</span>
          <span style={{ color: "#38bdf8" }}>Accept → #SEC-99</span>
        </div>
      </div>
    </div>
  );
}
