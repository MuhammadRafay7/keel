"use client";

import { useState } from "react";
import { HullScene } from "@/components/HullScene";
import { Reveal } from "@/components/Reveal";

const APP = "https://app.keel.ostenmark.com";
const REPO = "https://github.com/MuhammadRafay7/keel";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"board" | "cycles" | "docs" | "intake">("board");

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <HullScene />
        <div className="shell">
          <div className="hero-inner">
            <p className="eyebrow">
              <span className="dot" /> KEEL 1.4 • OPEN SOURCE PROJECT MANAGEMENT
            </p>
            <h1>
              Work that keeps
              <br />
              its course.
            </h1>
            <p className="lede">
              Keel tracks items, sprints, modules, and roadmaps alongside real-time collaborative docs and triage inbox—built on Postgres, and yours to run.
            </p>
            <div className="cta-row">
              <a className="btn btn-accent" href={APP}>
                Create an account
              </a>
              <a className="btn btn-outline" href={REPO}>
                Read the source
              </a>
            </div>
            <ul className="capabilities">
              <li>Work items</li>
              <li>Cycles & Sprints</li>
              <li>Modules</li>
              <li>Saved Views</li>
              <li>Realtime Docs</li>
              <li>Triage Inbox</li>
              <li>Workspace Analytics</li>
            </ul>
          </div>

          {/* Interactive Product UI Showcase (Plane.so & ClickUp style) */}
          <Reveal delay={80}>
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
                    className={`preview-tab ${activeTab === "board" ? "active" : ""}`}
                    onClick={() => setActiveTab("board")}
                  >
                    📋 Kanban Board
                  </button>
                  <button
                    type="button"
                    className={`preview-tab ${activeTab === "cycles" ? "active" : ""}`}
                    onClick={() => setActiveTab("cycles")}
                  >
                    ⚡ Sprint Cycles
                  </button>
                  <button
                    type="button"
                    className={`preview-tab ${activeTab === "docs" ? "active" : ""}`}
                    onClick={() => setActiveTab("docs")}
                  >
                    📝 Collaborative Pages
                  </button>
                  <button
                    type="button"
                    className={`preview-tab ${activeTab === "intake" ? "active" : ""}`}
                    onClick={() => setActiveTab("intake")}
                  >
                    📥 Triage Inbox
                  </button>
                </div>
                <div style={{ width: "60px" }} />
              </div>

              <div className="preview-content">
                {activeTab === "board" && (
                  <div className="kanban-grid">
                    <div className="kanban-col">
                      <div className="kanban-col-header">
                        <span>Backlog</span>
                        <span>3</span>
                      </div>
                      <div className="kanban-card">
                        <div>Refactor Supabase RLS membership helper</div>
                        <span className="tag">BACKEND</span>
                      </div>
                      <div className="kanban-card">
                        <div>Add Dark/Light theme mode selector</div>
                        <span className="tag">FRONTEND</span>
                      </div>
                    </div>
                    <div className="kanban-col">
                      <div className="kanban-col-header">
                        <span>In Progress</span>
                        <span>2</span>
                      </div>
                      <div className="kanban-card">
                        <div>Migrate page editor to serverless mode</div>
                        <span className="tag">CORE</span>
                      </div>
                      <div className="kanban-card">
                        <div>Storage bucket expiring signed URLs</div>
                        <span className="tag">STORAGE</span>
                      </div>
                    </div>
                    <div className="kanban-col">
                      <div className="kanban-col-header">
                        <span>Done</span>
                        <span>4</span>
                      </div>
                      <div className="kanban-card">
                        <div>Rebrand workspace assets and logos</div>
                        <span className="tag">BRAND</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "cycles" && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
                    <div style={{ padding: "1.25rem", borderRadius: "8px", background: "var(--ground)", border: "1px solid var(--line)" }}>
                      <div style={{ fontWeight: 600, fontSize: "1rem" }}>Sprint Cycle 14</div>
                      <div style={{ color: "var(--fg-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>Aug 1 - Aug 15 • 18 work items</div>
                      <div style={{ height: "8px", width: "100%", background: "var(--line)", borderRadius: "999px", marginTop: "1rem", overflow: "hidden" }}>
                        <div style={{ width: "82%", height: "100%", background: "var(--accent)" }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--fg-muted)" }}>
                        <span>82% Completed</span>
                        <span>3 days left</span>
                      </div>
                    </div>
                    <div style={{ padding: "1.25rem", borderRadius: "8px", background: "var(--ground)", border: "1px solid var(--line)" }}>
                      <div style={{ fontWeight: 600, fontSize: "1rem" }}>Module: Supabase Migration</div>
                      <div style={{ color: "var(--fg-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>Cross-cutting roadmap slice</div>
                      <div style={{ height: "8px", width: "100%", background: "var(--line)", borderRadius: "999px", marginTop: "1rem", overflow: "hidden" }}>
                        <div style={{ width: "100%", height: "100%", background: "#10b981" }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--fg-muted)" }}>
                        <span>100% Completed</span>
                        <span>Shipped</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "docs" && (
                  <div style={{ maxWidth: "38rem" }}>
                    <div style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                      Architecture RFC: Serverless Document Storage
                    </div>
                    <p style={{ color: "var(--fg-muted)", fontSize: "0.95rem", lineHeight: 1.65 }}>
                      Collaborative rich-text documents edited by your team in real time. Highlight any paragraph and convert it directly into a work item without leaving the page context.
                    </p>
                    <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", alignItems: "center", fontSize: "0.8125rem", color: "var(--accent)" }}>
                      <span>📄 3 linked work items</span>
                      <span>•</span>
                      <span>👥 4 contributors</span>
                    </div>
                  </div>
                )}

                {activeTab === "intake" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", borderRadius: "8px", background: "var(--ground)", border: "1px solid var(--line)" }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.925rem" }}>Request: Add SAML SSO integration</div>
                        <div style={{ fontSize: "0.8125rem", color: "var(--fg-muted)" }}>From customer feedback • Submitted 2h ago</div>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button type="button" className="btn btn-accent" style={{ padding: "0.35rem 0.75rem", fontSize: "0.8125rem" }}>Accept</button>
                        <button type="button" className="btn btn-outline" style={{ padding: "0.35rem 0.75rem", fontSize: "0.8125rem" }}>Decline</button>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", borderRadius: "8px", background: "var(--ground)", border: "1px solid var(--line)" }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.925rem" }}>Request: Export cycle burndown to CSV</div>
                        <div style={{ fontSize: "0.8125rem", color: "var(--fg-muted)" }}>From workspace inbox • Submitted 5h ago</div>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button type="button" className="btn btn-accent" style={{ padding: "0.35rem 0.75rem", fontSize: "0.8125rem" }}>Accept</button>
                        <button type="button" className="btn btn-outline" style={{ padding: "0.35rem 0.75rem", fontSize: "0.8125rem" }}>Decline</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </div>
        <p className="hero-hint">Drag to turn the hull</p>
      </section>

      {/* The Work Section */}
      <section className="pad">
        <div className="shell two">
          <Reveal>
            <div>
              <p className="label">The work</p>
              <h2>Everything hangs off a work item.</h2>
              <p className="section-lede">
                State, priority, assignees, labels, estimates and dates. Items nest into sub-items and link to each
                other as blocking, duplicate or related — so the shape of the work is visible rather than folklore.
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
                <p>Time-boxed sprints with burn-down tracking. Completed cycles archive themselves.</p>
              </div>
              <div className="card">
                <svg className="icon" viewBox="0 0 48 48" fill="none">
                  <path d="M8 12h32M8 24h20M8 36h26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <h3>Modules</h3>
                <p>Durable groupings that cut across cycles, for splitting a large project into shippable pieces.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Multi-view Section */}
      <section className="band pad">
        <div className="shell">
          <Reveal>
            <p className="label">The view</p>
            <h2>Look at the same work five different ways.</h2>
            <p className="section-lede">
              Group and filter by any property, then save the combination as a view — private to you, or shared with the
              team.
            </p>
            <div className="chips">
              <span className="chip">LIST</span>
              <span className="chip">BOARD</span>
              <span className="chip">CALENDAR</span>
              <span className="chip">SPREADSHEET</span>
              <span className="chip">TIMELINE</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Around the Work Section */}
      <section className="pad">
        <div className="shell">
          <Reveal>
            <p className="label">Around the work</p>
            <h2>Docs and triage, in the same place.</h2>
          </Reveal>
          <Reveal delay={80}>
            <div className="cards c3">
              <div className="card">
                <h3>Pages</h3>
                <p>
                  Collaborative rich-text documents, edited by several people at once. Turn a paragraph into a work item
                  without leaving the page.
                </p>
              </div>
              <div className="card">
                <h3>Intake</h3>
                <p>
                  Requests land in a triage inbox first. Accept, decline, snooze or merge as duplicate before anything
                  reaches the backlog.
                </p>
              </div>
              <div className="card">
                <h3>Analytics</h3>
                <p>Charts across the workspace, so you can see where work is piling up before it stalls.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Call to Action Band */}
      <section className="band pad">
        <div className="shell cta-band">
          <Reveal>
            <p className="label">Get started</p>
            <h2>Open source, and yours to run.</h2>
            <p className="section-lede">
              Keel is AGPL-licensed. Use the hosted version, or read the source and run it yourself.
            </p>
            <div className="cta-row">
              <a className="btn btn-accent" href={APP}>
                Create an account
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
