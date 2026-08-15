import Link from "next/link";

export const metadata = {
  title: "Features — Plane",
  description:
    "Explore the full suite of Plane features: Work items, Cycles, Modules, Views, Wiki, Intake Triage, and Plane AI.",
};

const APP = "https://app.keel.ostenmark.com";

export default function FeaturesPage() {
  return (
    <>
      {/* 1. Page Header */}
      <section className="inner-page-head">
        <div className="shell">
          <span className="label-badge">FEATURES</span>
          <h1 className="font-satoshi">Every capability your team needs to plan, track, and ship</h1>
          <p className="inner-page-lede">
            Plane brings projects, docs, and AI-powered workflows into one unified workspace so teams and agents can
            plan, execute, and stay aligned across every layer of the organization.
          </p>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "2rem" }}>
            {[
              "Work Items",
              "Cycles & Sprints",
              "Modules & Epics",
              "Views",
              "Wiki & Docs",
              "Intake Triage",
              "Analytics",
              "Plane AI",
            ].map((item) => (
              <span
                key={item}
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.75rem",
                  padding: "0.35rem 0.75rem",
                  borderRadius: "999px",
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  color: "var(--fg-muted)",
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Work Items Deep Dive */}
      <section className="section-pad">
        <div className="shell">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "3rem",
              alignItems: "flex-start",
            }}
          >
            <div>
              <span className="label-badge">THE WORK</span>
              <h2 className="font-satoshi" style={{ fontSize: "2.25rem", marginBottom: "1rem" }}>
                Work items: The unit everything hangs off.
              </h2>
              <p style={{ color: "var(--fg-muted)", fontSize: "1.05rem", lineHeight: "1.65", margin: 0 }}>
                State, priority, assignees, labels, estimates and dates. Items nest into sub-items and link to each
                other as blocking, duplicate or related — so the shape of the work is visible rather than folklore.
              </p>

              <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <span style={{ color: "var(--accent-brand-bright)", fontWeight: 700 }}>✓</span>
                  <div>
                    <strong style={{ color: "var(--fg)" }}>Sub-items &amp; Nested Hierarchies</strong>
                    <div style={{ color: "var(--fg-muted)", fontSize: "0.875rem" }}>
                      Break complex tasks down infinitely without losing parent progress rollups.
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <span style={{ color: "var(--accent-brand-bright)", fontWeight: 700 }}>✓</span>
                  <div>
                    <strong style={{ color: "var(--fg)" }}>Issue Dependencies &amp; Relations</strong>
                    <div style={{ color: "var(--fg-muted)", fontSize: "0.875rem" }}>
                      Explicitly define blocking, blocked-by, duplicate, and related links.
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <span style={{ color: "var(--accent-brand-bright)", fontWeight: 700 }}>✓</span>
                  <div>
                    <strong style={{ color: "var(--fg)" }}>Custom Workflow States</strong>
                    <div style={{ color: "var(--fg-muted)", fontSize: "0.875rem" }}>
                      Group workflow stages into Backlog, Unstarted, Started, Completed, and Cancelled.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Vector Card */}
            <div
              style={{
                background: "var(--surface-product)",
                border: "1px solid var(--line)",
                borderRadius: "16px",
                padding: "1.75rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid var(--line)",
                  paddingBottom: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      color: "var(--accent-brand)",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                    }}
                  >
                    #ENG-408
                  </span>
                  <span style={{ fontWeight: 600, color: "var(--fg)" }}>Three.js Antigravity Orbit Canvas</span>
                </div>
                <span
                  style={{
                    background: "rgba(56, 189, 248, 0.12)",
                    color: "#38bdf8",
                    padding: "0.15rem 0.5rem",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    fontFamily: "var(--mono)",
                  }}
                >
                  In Progress
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.8125rem" }}>
                <div>
                  <span style={{ color: "var(--fg-muted)" }}>Priority:</span>
                  <div style={{ fontWeight: 500, color: "#ef4444" }}>Urgent</div>
                </div>
                <div>
                  <span style={{ color: "var(--fg-muted)" }}>Estimate:</span>
                  <div style={{ fontWeight: 500, color: "var(--fg)" }}>5 Points</div>
                </div>
                <div>
                  <span style={{ color: "var(--fg-muted)" }}>Cycle:</span>
                  <div style={{ fontWeight: 500, color: "var(--fg)" }}>Sprint 24</div>
                </div>
                <div>
                  <span style={{ color: "var(--fg-muted)" }}>Assignee:</span>
                  <div style={{ fontWeight: 500, color: "var(--fg)" }}>Elena Rostova</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Planning: Cycles & Modules (Dark Section #0F0F10) */}
      <section className="section-pad section-dark">
        <div className="shell">
          <div className="section-header">
            <span className="label-badge">PLANNING &amp; RHYTHM</span>
            <h2 className="font-satoshi">Cycles for rhythm, modules for structure</h2>
            <p className="section-desc">
              The two group work differently on purpose. Cycles are about time-boxed iterations; modules are about
              durable feature milestones that outlive any single cycle.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
            <div
              style={{
                background: "var(--surface-dark-card)",
                border: "1px solid var(--line-dark)",
                borderRadius: "16px",
                padding: "2rem",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔄</div>
              <h3 style={{ color: "var(--fg-dark-primary)", marginBottom: "0.75rem" }}>Cycles (Sprints)</h3>
              <p style={{ color: "var(--fg-dark-secondary)", fontSize: "0.95rem", lineHeight: "1.6", margin: 0 }}>
                Time-boxed periods with start and end dates. Velocity charts show real-time burn-down as work completes.
                Completed cycles auto-archive, while unfinished work transfers forward cleanly.
              </p>
            </div>

            <div
              style={{
                background: "var(--surface-dark-card)",
                border: "1px solid var(--line-dark)",
                borderRadius: "16px",
                padding: "2rem",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>📦</div>
              <h3 style={{ color: "var(--fg-dark-primary)", marginBottom: "0.75rem" }}>Modules &amp; Epics</h3>
              <p style={{ color: "var(--fg-dark-secondary)", fontSize: "0.95rem", lineHeight: "1.6", margin: 0 }}>
                Durable groupings that cut across cycles, allowing teams to split complex features into shippable
                deliverables with independent status rollups.
              </p>
            </div>

            <div
              style={{
                background: "var(--surface-dark-card)",
                border: "1px solid var(--line-dark)",
                borderRadius: "16px",
                padding: "2rem",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🎯</div>
              <h3 style={{ color: "var(--fg-dark-primary)", marginBottom: "0.75rem" }}>Initiatives &amp; Roadmaps</h3>
              <p style={{ color: "var(--fg-dark-secondary)", fontSize: "0.95rem", lineHeight: "1.6", margin: 0 }}>
                High-level company initiatives that connect multiple projects and teams together, giving leadership a
                single pane of glass across the entire portfolio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Five Views Section */}
      <section className="section-pad">
        <div className="shell">
          <div className="section-header center">
            <span className="label-badge">LAYOUTS &amp; PERSPECTIVES</span>
            <h2 className="font-satoshi">Look at the same work five different ways</h2>
            <p className="section-desc">
              Group and filter by any property, then save the combination as a custom view — private to you, or shared
              with the whole team.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
            {[
              { title: "Kanban Board", desc: "Drag and drop cards across columns to advance workflow states." },
              { title: "Spreadsheet Grid", desc: "Inline bulk editing of assignees, estimates, dates, and labels." },
              { title: "List View", desc: "Clean hierarchical view for scanning large backlogs with instant filters." },
              { title: "Gantt Timeline", desc: "Visualize dependencies, project milestones, and resource scheduling." },
              {
                title: "Calendar View",
                desc: "Date-based scheduling for planning release days and marketing deadlines.",
              },
            ].map((v) => (
              <div
                key={v.title}
                style={{
                  background: "var(--surface-product)",
                  border: "1px solid var(--line)",
                  borderRadius: "12px",
                  padding: "1.5rem",
                }}
              >
                <h4 style={{ marginBottom: "0.5rem" }}>{v.title}</h4>
                <p style={{ color: "var(--fg-muted)", fontSize: "0.875rem", margin: 0, lineHeight: "1.5" }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Pre-Footer CTA Band */}
      <section className="cta-band-section">
        <div className="shell">
          <h2 className="font-satoshi">Ready to experience next-gen project management?</h2>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a className="btn btn-inverse btn-lg" href={`${APP}/sign-up`}>
              Get started free
            </a>
            <Link className="btn btn-secondary btn-lg" href="/contact">
              Talk to sales
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
