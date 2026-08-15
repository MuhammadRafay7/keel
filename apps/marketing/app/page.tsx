"use client";

import { useState } from "react";
import { HullScene } from "@/components/HullScene";
import { Reveal } from "@/components/Reveal";

const APP = "https://app.keel.ostenmark.com";
const REPO = "https://github.com/MuhammadRafay7/keel";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"loop" | "workspaces" | "realtime" | "analytics">("loop");

  return (
    <>
      {/* Background Ambient Glows */}
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />

      {/* Hero Section */}
      <section className="hero">
        <HullScene />
        <div className="shell">
          <div className="hero-inner">
            <p className="eyebrow">
              <span className="dot" /> ANTIGRAVITY ENGINE 2.0 • AGENTIC WORKSPACE
            </p>
            <h1>
              Build, Orchestrate, and Scale{" "}
              <span className="gradient-text">at the Speed of Thought.</span>
            </h1>
            <p className="lede">
              Keel seamlessly unites work items, cycles, roadmaps, and collaborative documents into an open-source, serverless-native suite powered by Postgres.
            </p>
            <div className="cta-row">
              <a className="btn btn-accent" href={APP}>
                Launch Application <span>→</span>
              </a>
              <a className="btn btn-outline" href={REPO}>
                Explore Repository
              </a>
            </div>
            <ul className="capabilities">
              <li>• Work Items & Sub-tasks</li>
              <li>• Time-boxed Cycles</li>
              <li>• Cross-cutting Modules</li>
              <li>• Realtime Collaborative Pages</li>
              <li>• Intake Triage Inbox</li>
              <li>• Advanced Analytics</li>
            </ul>
          </div>

          {/* Interactive Live App Preview */}
          <Reveal delay={100}>
            <div className="preview-wrapper">
              <div className="preview-header">
                <div className="dots">
                  <div className="dot-control dot-red" />
                  <div className="dot-control dot-yellow" />
                  <div className="dot-control dot-green" />
                </div>
                <div className="preview-tabs">
                  <button
                    type="button"
                    className={`preview-tab ${activeTab === "loop" ? "active" : ""}`}
                    onClick={() => setActiveTab("loop")}
                  >
                    ⚡ Autonomous Agent Loop
                  </button>
                  <button
                    type="button"
                    className={`preview-tab ${activeTab === "workspaces" ? "active" : ""}`}
                    onClick={() => setActiveTab("workspaces")}
                  >
                    📂 Workspaces & Cycles
                  </button>
                  <button
                    type="button"
                    className={`preview-tab ${activeTab === "realtime" ? "active" : ""}`}
                    onClick={() => setActiveTab("realtime")}
                  >
                    📝 Collaborative Pages
                  </button>
                  <button
                    type="button"
                    className={`preview-tab ${activeTab === "analytics" ? "active" : ""}`}
                    onClick={() => setActiveTab("analytics")}
                  >
                    📊 Workspace Analytics
                  </button>
                </div>
                <div style={{ width: "60px" }} />
              </div>

              <div className="preview-content">
                {activeTab === "loop" && (
                  <div style={{ fontFamily: "var(--mono)", fontSize: "0.9rem", color: "#e2e8f0" }}>
                    <div style={{ color: "#38bdf8", marginBottom: "0.75rem" }}>
                      &gt; Initializing Antigravity Agentic Planner v2.0...
                    </div>
                    <div style={{ color: "#94a3b8" }}>
                      [INFO] Connecting to Supabase database clusters... Connected.
                      <br />
                      [INFO] RLS security verification passed: 110 tables secured.
                      <br />
                      [INFO] Syncing work item sequence allocation for project KEEL-01...
                      <br />
                      [STATUS] All background cycles and intake triage triggers active.
                    </div>
                    <div style={{ marginTop: "1rem", color: "#34d399" }}>
                      ✓ Task Execution Ready — Zero latency serverless architecture deployed on Vercel.
                    </div>
                  </div>
                )}

                {activeTab === "workspaces" && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                    <div style={{ padding: "1.25rem", borderRadius: "8px", background: "rgba(30, 41, 59, 0.6)", border: "1px solid var(--line)" }}>
                      <div style={{ color: "#38bdf8", fontWeight: 600, fontSize: "0.95rem" }}>Sprint Cycle 14</div>
                      <div style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "0.25rem" }}>18 items • 82% complete</div>
                      <div style={{ height: "6px", width: "100%", background: "#1e293b", borderRadius: "999px", marginTop: "0.75rem", overflow: "hidden" }}>
                        <div style={{ width: "82%", height: "100%", background: "linear-gradient(90deg, #38bdf8, #818cf8)" }} />
                      </div>
                    </div>
                    <div style={{ padding: "1.25rem", borderRadius: "8px", background: "rgba(30, 41, 59, 0.6)", border: "1px solid var(--line)" }}>
                      <div style={{ color: "#818cf8", fontWeight: 600, fontSize: "0.95rem" }}>Module: Engine v2</div>
                      <div style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "0.25rem" }}>6 work items linked</div>
                      <div style={{ height: "6px", width: "100%", background: "#1e293b", borderRadius: "999px", marginTop: "0.75rem", overflow: "hidden" }}>
                        <div style={{ width: "100%", height: "100%", background: "linear-gradient(90deg, #818cf8, #c084fc)" }} />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "realtime" && (
                  <div style={{ color: "#e2e8f0" }}>
                    <div style={{ fontSize: "1.25rem", fontWeight: 600, color: "#f8fafc", marginBottom: "0.5rem" }}>
                      Architecture RFC: Serverless Document Storage
                    </div>
                    <p style={{ color: "#94a3b8", fontSize: "0.95rem", lineHeight: 1.6 }}>
                      Document pages support single-writer autosave and collaborative TipTap rich-text editing with TipTap extensions, code blocks, callouts, and inline mentions.
                    </p>
                  </div>
                )}

                {activeTab === "analytics" && (
                  <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "#38bdf8", fontSize: "1.5rem", fontWeight: 700 }}>110 Tables</div>
                      <div style={{ color: "#94a3b8", fontSize: "0.875rem" }}>RLS Security Enabled</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "#34d399", fontSize: "1.5rem", fontWeight: "700" }}>100% Serverless</div>
                      <div style={{ color: "#94a3b8", fontSize: "0.875rem" }}>Hosted on Vercel + Supabase</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "#c084fc", fontSize: "1.5rem", fontWeight: "700" }}>0ms Latency</div>
                      <div style={{ color: "#94a3b8", fontSize: "0.875rem" }}>Direct Postgres Edge Access</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </div>
        <p className="hero-hint">Drag orbital hull to inspect</p>
      </section>

      {/* Feature Showcase Grid */}
      <section className="pad">
        <div className="shell two">
          <Reveal>
            <div>
              <p className="label">The Work Engine</p>
              <h2>Everything hangs off a work item.</h2>
              <p className="section-lede">
                State, priority, assignees, labels, estimates, and target dates. Items nest into sub-items and link to each other seamlessly.
              </p>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="cards c2" style={{ marginTop: 0 }}>
              <div className="card">
                <svg className="icon" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="15" stroke="currentColor" strokeWidth="3" />
                  <path d="M24 14v10l7 4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <h3>Cycles</h3>
                <p>Time-boxed sprints with burn-down tracking and automated archive routines.</p>
              </div>
              <div className="card">
                <svg className="icon" viewBox="0 0 48 48" fill="none">
                  <path d="M8 12h32M8 24h20M8 36h26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <h3>Modules</h3>
                <p>Durable groupings that cut across cycles to split large goals into shippable pieces.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Multi-view Section */}
      <section className="band pad">
        <div className="shell">
          <Reveal>
            <p className="label">Flexible Views</p>
            <h2>Visualize work across 5 distinct dimensions.</h2>
            <p className="section-lede">
              Filter and group by any property, then save your customized setup as private or shared views.
            </p>
            <div className="chips">
              <span className="chip">LIST VIEW</span>
              <span className="chip">KANBAN BOARD</span>
              <span className="chip">CALENDAR</span>
              <span className="chip">SPREADSHEET</span>
              <span className="chip">GANTT TIMELINE</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Triad Features */}
      <section className="pad">
        <div className="shell">
          <Reveal>
            <p className="label">Productivity Suite</p>
            <h2>Docs, Triage, and Analytics in one place.</h2>
          </Reveal>
          <Reveal delay={80}>
            <div className="cards c3">
              <div className="card">
                <h3>Collaborative Pages</h3>
                <p>
                  Rich-text documents edited seamlessly. Convert paragraphs into work items without leaving your document.
                </p>
              </div>
              <div className="card">
                <h3>Intake Inbox</h3>
                <p>
                  Requests land in a triage inbox first. Accept, decline, snooze, or merge before touching your backlog.
                </p>
              </div>
              <div className="card">
                <h3>Analytics Engine</h3>
                <p>Realtime metrics and aggregate charts across your workspace to spot bottlenecks instantly.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="band pad">
        <div className="shell cta-band">
          <Reveal>
            <p className="label">Get Started Today</p>
            <h2>Open Source, High Performance, Yours to Run.</h2>
            <p className="section-lede">
              Keel is AGPL-licensed and built for modern agentic workflows. Run it locally or deploy on Vercel + Supabase.
            </p>
            <div className="cta-row">
              <a className="btn btn-accent" href={APP}>
                Create an Account <span>→</span>
              </a>
              <a className="btn btn-outline" href={REPO}>
                View on GitHub
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
