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
    id: "byokey",
    title: "Bring your own API key across 7 providers",
    desc: "Use your own key for Anthropic, OpenAI, Google, xAI, Mistral, DeepSeek, or Groq. Keel never resells model usage — your key goes directly to your provider.",
    badge: "ZERO MODEL MARKUP",
  },
  {
    id: "drafting",
    title: "Draft & refine titles, descriptions & docs",
    desc: "Draft clear work item titles, expand acceptance criteria, format markdown specs, and ask questions across your complete workspace context.",
    badge: "WORKSPACE CONTEXT ENGINE",
  },
  {
    id: "agentpanel",
    title: "Agent panel that acts on your workspace",
    desc: "Built-in agent panel can triage incoming items, assign owners, suggest labels, detect duplicates, and execute bulk updates directly.",
    badge: "WORKSPACE AGENT PANEL",
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
              minHeight: "360px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              background: "linear-gradient(135deg, #130f24 0%, #0d0a18 100%)",
              color: "#f8fafc",
            }}
          >
            {/* Top Bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span
                  style={{
                    display: "inline-block",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#a78bfa",
                    boxShadow: "0 0 10px #a78bfa",
                  }}
                />
                <span style={{ fontFamily: "var(--mono)", fontSize: "0.8125rem", color: "#a78bfa", fontWeight: 600 }}>
                  Workspace AI Settings · Bring Your Own Key
                </span>
              </div>
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.75rem",
                  color: "#a78bfa",
                  background: "rgba(167, 139, 250, 0.12)",
                  padding: "0.2rem 0.65rem",
                  borderRadius: "6px",
                  border: "1px solid rgba(167, 139, 250, 0.25)",
                }}
              >
                0% Reseller Markup · Direct Provider Routing
              </span>
            </div>

            {/* Provider Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "0.85rem",
                margin: "1.25rem 0",
              }}
            >
              {[
                { name: "Anthropic", model: "Claude 3.5 Sonnet", active: true, color: "#a78bfa" },
                { name: "OpenAI", model: "GPT-4o / o3-mini", active: true, color: "#10b981" },
                { name: "Google", model: "Gemini 1.5 Pro", active: true, color: "#38bdf8" },
                { name: "xAI", model: "Grok 2", active: true, color: "#f59e0b" },
                { name: "Mistral", model: "Mistral Large", active: false, color: "#94a3b8" },
                { name: "DeepSeek", model: "DeepSeek R1 / V3", active: true, color: "#8b5cf6" },
                { name: "Groq", model: "Llama 3.3 70B (Fast)", active: true, color: "#ec4899" },
              ].map((p) => (
                <div
                  key={p.name}
                  style={{
                    background: p.active ? "rgba(30, 27, 46, 0.8)" : "rgba(20, 20, 28, 0.4)",
                    border: p.active ? `1px solid ${p.color}40` : "1px solid rgba(255, 255, 255, 0.06)",
                    borderRadius: "12px",
                    padding: "0.75rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#f8fafc" }}>{p.name}</div>
                    <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{p.model}</div>
                  </div>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontFamily: "var(--mono)",
                      padding: "0.15rem 0.45rem",
                      borderRadius: "4px",
                      background: p.active ? `${p.color}20` : "rgba(255, 255, 255, 0.05)",
                      color: p.active ? p.color : "#64748b",
                      border: p.active ? `1px solid ${p.color}40` : "none",
                    }}
                  >
                    {p.active ? "Key Set" : "Configure"}
                  </span>
                </div>
              ))}
            </div>

            {/* Bottom Status */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "0.75rem",
                color: "#64748b",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <span>API keys encrypted in transit &amp; at rest. Never stored in telemetry.</span>
              <span style={{ color: "#a78bfa" }}>Your key → Your provider</span>
            </div>
          </div>
        )}

        {activeIndex === 1 && (
          <div
            style={{
              padding: "2rem",
              height: "100%",
              minHeight: "360px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              background: "linear-gradient(135deg, #15102a 0%, #0c0919 100%)",
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
                    backgroundColor: "#8b5cf6",
                    boxShadow: "0 0 10px #8b5cf6",
                  }}
                />
                <span style={{ fontFamily: "var(--mono)", fontSize: "0.8125rem", color: "#8b5cf6", fontWeight: 600 }}>
                  Title &amp; Description Assistant
                </span>
              </div>
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.75rem",
                  color: "#94a3b8",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "6px",
                }}
              >
                Claude 3.5 Sonnet (User Key)
              </span>
            </div>

            {/* Prompt & Context Stream */}
            <div
              style={{
                background: "rgba(25, 20, 42, 0.8)",
                border: "1px solid rgba(139, 92, 246, 0.25)",
                borderRadius: "14px",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.85rem",
                maxWidth: "48rem",
                margin: "1rem auto",
                width: "100%",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#f8fafc" }}>
                  Draft Work Item: &quot;Refactor MobX state store re-hydration logic&quot;
                </span>
              </div>
              <div
                style={{
                  borderLeft: "2px solid #8b5cf6",
                  paddingLeft: "1rem",
                  fontSize: "0.875rem",
                  color: "#cbd5e1",
                  lineHeight: "1.5",
                }}
              >
                <p style={{ margin: "0 0 0.5rem", fontWeight: 600, color: "#a78bfa" }}>
                  AI Suggested Acceptance Criteria:
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
                  <li>Ensure state persistence initializes before initial view render.</li>
                  <li>Add type guards for legacy workspace schema migrations.</li>
                  <li>Link related issue #ENG-304 and Module &quot;State Architecture&quot;.</li>
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
              <span>Instant inline drafting with 1-click apply</span>
              <span style={{ color: "#8b5cf6" }}>Latency: 180ms</span>
            </div>
          </div>
        )}

        {activeIndex === 2 && (
          <div
            style={{
              padding: "2rem",
              height: "100%",
              minHeight: "360px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              background: "linear-gradient(135deg, #180e2d 0%, #0d081b 100%)",
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
                    boxShadow: "0 0 10px #10b981",
                  }}
                />
                <span style={{ fontFamily: "var(--mono)", fontSize: "0.8125rem", color: "#10b981", fontWeight: 600 }}>
                  Workspace Agent Panel
                </span>
              </div>
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.75rem",
                  color: "#10b981",
                  background: "rgba(16, 185, 129, 0.1)",
                  padding: "0.2rem 0.65rem",
                  borderRadius: "6px",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                }}
              >
                ACTIVE · 8 Workspace Actions Taken
              </span>
            </div>

            {/* Agent Actions Stream */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "1rem",
                width: "100%",
                margin: "1rem 0",
              }}
            >
              <div
                style={{
                  background: "rgba(28, 20, 48, 0.8)",
                  border: "1px solid rgba(167, 139, 250, 0.2)",
                  borderRadius: "12px",
                  padding: "1rem",
                }}
              >
                <div
                  style={{ fontSize: "0.75rem", color: "#a78bfa", fontFamily: "var(--mono)", marginBottom: "0.35rem" }}
                >
                  ACTION 1: INTAKE TRIAGE
                </div>
                <div style={{ fontSize: "0.875rem", color: "#f8fafc", fontWeight: 500 }}>
                  Customer report parsed into work item
                </div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.25rem" }}>
                  Assigned priority: High · Label: Auth
                </div>
              </div>
              <div
                style={{
                  background: "rgba(28, 20, 48, 0.8)",
                  border: "1px solid rgba(167, 139, 250, 0.2)",
                  borderRadius: "12px",
                  padding: "1rem",
                }}
              >
                <div
                  style={{ fontSize: "0.75rem", color: "#10b981", fontFamily: "var(--mono)", marginBottom: "0.35rem" }}
                >
                  ACTION 2: DUPLICATE DETECTION
                </div>
                <div style={{ fontSize: "0.875rem", color: "#f8fafc", fontWeight: 500 }}>
                  Linked #KEEL-402 as relation to #KEEL-310
                </div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.25rem" }}>
                  Confidence: 94% · Merged sub-items
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
              <span>Agents operate within user workspace permissions</span>
              <span style={{ color: "#a78bfa" }}>Human approval required for state changes</span>
            </div>
          </div>
        )}
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
