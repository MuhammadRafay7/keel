"use client";

import { useState, useEffect, useRef } from "react";

interface AiFeature {
  id: string;
  title: string;
  desc: string;
  badge: string;
}

const FEATURES: AiFeature[] = [
  {
    id: "answers",
    title: "Answers from across your workspace",
    desc: "Ask Keel AI anything. Status on a cycle, blockers on a project, what changed in a doc last week. It reads across your complete workspace.",
    badge: "KNOWLEDGE GRAPH & CONTEXT",
  },
  {
    id: "agents",
    title: "Agents that do the work for you",
    desc: "Built-in agents handle the busywork. Triage incoming requests, assign owners, track blockers, and ship updates automatically.",
    badge: "AUTONOMOUS TRIAGE AGENTS",
  },
  {
    id: "slack",
    title: "Works where your team already talks",
    desc: "Bring Keel AI into Slack or Teams. Turn conversations into work items, get updates, and keep projects moving without switching tools.",
    badge: "SLACK & TEAMS INTEGRATION",
  },
];

const DURATION_MS = 6000;

export function AiFeatureShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();
    setProgress(0);

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / DURATION_MS) * 100);
      setProgress(pct);

      if (elapsed >= DURATION_MS) {
        setActiveIndex((prev) => (prev + 1) % FEATURES.length);
        startTimeRef.current = Date.now();
        setProgress(0);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [activeIndex]);

  const handleTabClick = (index: number) => {
    setActiveIndex(index);
    startTimeRef.current = Date.now();
    setProgress(0);
  };

  return (
    <div className="ai-tabs-container">
      {/* Visual Preview Window */}
      <div className="ai-preview-window">
        {activeIndex === 0 && (
          <div
            style={{
              padding: "2rem",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              background: "linear-gradient(135deg, #131b24 0%, #0d1217 100%)",
              color: "#f8fafc",
            }}
          >
            {/* Top Bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span
                  style={{
                    display: "inline-block",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#38bdf8",
                    boxShadow: "0 0 8px #38bdf8",
                  }}
                />
                <span style={{ fontFamily: "var(--mono)", fontSize: "0.8125rem", color: "#38bdf8" }}>
                  Keel AI Context Engine
                </span>
              </div>
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.75rem",
                  color: "#94a3b8",
                  border: "1px solid #2c2e30",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "6px",
                }}
              >
                12 projects · 4 cycles · 142 docs indexed
              </span>
            </div>

            {/* Prompt & Context Stream */}
            <div
              style={{
                background: "rgba(24, 26, 27, 0.8)",
                border: "1px solid #2c2e30",
                borderRadius: "12px",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.85rem",
                maxWidth: "48rem",
                margin: "0 auto",
                width: "100%",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#e4e6e7" }}>
                  &quot;What are the critical blockers for Sprint 24 across Mobile and Web?&quot;
                </span>
              </div>
              <div
                style={{
                  borderLeft: "2px solid #38bdf8",
                  paddingLeft: "1rem",
                  fontSize: "0.875rem",
                  color: "#cacdce",
                  lineHeight: "1.5",
                }}
              >
                <p style={{ margin: "0 0 0.5rem" }}>
                  Found <b>2 blockers</b> tied to cycle <b>Sprint 24</b>:
                </p>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                  }}
                >
                  <li>
                    <span style={{ color: "#ef4444", fontWeight: 600 }}>[BLOCKER]</span> #KEEL-402: OAuth token refresh
                    race on iOS (Assigned to Duane)
                  </li>
                  <li>
                    <span style={{ color: "#f59e0b", fontWeight: 600 }}>[WAITING]</span> #KEEL-419: Postgres schema
                    migration approval on air-gapped staging
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Status */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "0.75rem",
                color: "#64748b",
              }}
            >
              <span>Verified across Git commits, issue states &amp; Wiki documentation</span>
              <span style={{ color: "#38bdf8" }}>Latency: 142ms · 100% Deterministic</span>
            </div>
          </div>
        )}

        {activeIndex === 1 && (
          <div
            style={{
              padding: "2rem",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              background: "linear-gradient(135deg, #171f28 0%, #0e141a 100%)",
              color: "#f8fafc",
            }}
          >
            {/* Top Bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span
                  style={{
                    display: "inline-block",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#10b981",
                    boxShadow: "0 0 8px #10b981",
                  }}
                />
                <span style={{ fontFamily: "var(--mono)", fontSize: "0.8125rem", color: "#10b981" }}>
                  Autonomous Agent: Intake Triage &amp; Lifecycle
                </span>
              </div>
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.75rem",
                  color: "#10b981",
                  background: "rgba(16, 185, 129, 0.1)",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "6px",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                }}
              >
                RUNNING · 14 actions taken today
              </span>
            </div>

            {/* Agent Actions Stream */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "1rem",
                width: "100%",
              }}
            >
              <div
                style={{
                  background: "rgba(24, 26, 27, 0.9)",
                  border: "1px solid #2c2e30",
                  borderRadius: "10px",
                  padding: "1rem",
                }}
              >
                <div
                  style={{ fontSize: "0.75rem", color: "#38bdf8", fontFamily: "var(--mono)", marginBottom: "0.35rem" }}
                >
                  ACTION 1: AUTO-TRIAGE
                </div>
                <div style={{ fontSize: "0.875rem", color: "#e4e6e7", fontWeight: 500 }}>
                  Incoming support email from @Sony parsed
                </div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.25rem" }}>
                  Created issue #SONY-108, assigned label: Security
                </div>
              </div>
              <div
                style={{
                  background: "rgba(24, 26, 27, 0.9)",
                  border: "1px solid #2c2e30",
                  borderRadius: "10px",
                  padding: "1rem",
                }}
              >
                <div
                  style={{ fontSize: "0.75rem", color: "#a855f7", fontFamily: "var(--mono)", marginBottom: "0.35rem" }}
                >
                  ACTION 2: DUPLICATE DETECTION
                </div>
                <div style={{ fontSize: "0.875rem", color: "#e4e6e7", fontWeight: 500 }}>
                  Linked #KEEL-455 as duplicate of #KEEL-380
                </div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.25rem" }}>
                  Confidence: 96% · Merged discussion threads
                </div>
              </div>
            </div>

            {/* Bottom Status */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "0.75rem",
                color: "#64748b",
              }}
            >
              <span>Humans in the loop configured: 1-click approvals enabled</span>
              <span style={{ color: "#e4e6e7" }}>Full audit trail stored in Postgres</span>
            </div>
          </div>
        )}

        {activeIndex === 3 || activeIndex === 2 ? (
          <div
            style={{
              padding: "2rem",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              background: "linear-gradient(135deg, #1b1625 0%, #0d0f15 100%)",
              color: "#f8fafc",
            }}
          >
            {/* Top Bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span
                  style={{
                    display: "inline-block",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#e879f9",
                    boxShadow: "0 0 8px #e879f9",
                  }}
                />
                <span style={{ fontFamily: "var(--mono)", fontSize: "0.8125rem", color: "#e879f9" }}>
                  ChatOps: @Keel in Slack #engineering-general
                </span>
              </div>
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.75rem",
                  color: "#CACDCE",
                  border: "1px solid #2c2e30",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "6px",
                }}
              >
                Slack Bot &amp; Microsoft Teams
              </span>
            </div>

            {/* Slack Mockup Box */}
            <div
              style={{
                background: "#181a1b",
                border: "1px solid #2c2e30",
                borderRadius: "12px",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                maxWidth: "48rem",
                margin: "0 auto",
                width: "100%",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                    background: "#006399",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "0.8125rem",
                  }}
                >
                  K
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "#e4e6e7" }}>Keel App</span>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>BOT · 10:42 AM</span>
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "#cacdce", marginTop: "0.25rem", lineHeight: "1.5" }}>
                    Created work item <b>#ENG-882: Air-gapped Helm chart upgrade for v1.5</b> in Project{" "}
                    <i>Platform Infrastructure</i>.
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        background: "#2c2e30",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "4px",
                        color: "#38bdf8",
                      }}
                    >
                      Cycle: Sprint 24
                    </span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        background: "#2c2e30",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "4px",
                        color: "#10b981",
                      }}
                    >
                      Assignee: Duane
                    </span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        background: "#2c2e30",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "4px",
                        color: "#e879f9",
                      }}
                    >
                      Priority: Urgent
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Status */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "0.75rem",
                color: "#64748b",
              }}
            >
              <span>2-way realtime thread synchronization</span>
              <span style={{ color: "#38bdf8" }}>Available on Slack App Directory</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Tabs Navigation with Synchronized Progress Line */}
      <div className="ai-tabs-nav">
        {FEATURES.map((feat, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={feat.id}
              type="button"
              className={`ai-tab-btn ${isActive ? "active" : ""}`}
              onClick={() => handleTabClick(idx)}
            >
              {isActive && <div className="ai-tab-progress" style={{ width: `${progress}%` }} />}
              <div className="ai-tab-title">{feat.title}</div>
              <div className="ai-tab-desc">{feat.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
