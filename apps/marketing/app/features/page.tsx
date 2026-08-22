import Link from "next/link";

export const metadata = {
  title: "Features — Keel",
  description:
    "Explore the full suite of Keel features: 5 Work Views, Cycles & Sprints, Modules, Pages & Docs, and Docker Self-Hosting.",
};

const APP = "https://app.keel.ostenmark.com";

export default function FeaturesPage() {
  return (
    <>
      {/* 1. Page Header */}
      <section className="inner-page-head">
        <div className="shell" style={{ textAlign: "center", maxWidth: "48rem" }}>
          <span className="label-badge">CAPABILITIES</span>
          <h1 className="font-satoshi" style={{ margin: "1rem 0" }}>
            Every tool your team needs to plan, track, and ship
          </h1>
          <p className="inner-page-lede" style={{ margin: "0 auto" }}>
            Keel unites work items, agile cycles, roadmap modules, and living markdown documentation into one fast,
            extensible workspace.
          </p>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center", marginTop: "2rem" }}>
            {[
              "Work Items",
              "5 Dynamic Views",
              "Cycles & Sprints",
              "Modules & Epics",
              "Pages & Docs",
              "Power-K (Cmd+K)",
              "Docker Self-Hosting",
              "AGPL-3.0 License",
            ].map((item) => (
              <span
                key={item}
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  padding: "0.35rem 0.85rem",
                  borderRadius: "9999px",
                  background: "var(--surface-glass)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid var(--surface-glass-border)",
                  color: "var(--accent)",
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 2. 5 Dynamic Views */}
      <section className="section-pad">
        <div className="shell">
          <div className="section-header center">
            <span className="label-badge">LAYOUTS &amp; PERSPECTIVES</span>
            <h2 className="font-satoshi">5 Ways to Visualize Your Work</h2>
            <p style={{ color: "var(--fg-muted)", maxWidth: "36rem", margin: "0.5rem auto 0" }}>
              Switch instantly between high-density views with persistent grouping, sorting, and custom property filters.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {[
              {
                icon: "📋",
                title: "List View",
                desc: "High-density hierarchical table with inline cell editing for status, priority, assignees, and dates.",
              },
              {
                icon: "📊",
                title: "Kanban Board",
                desc: "Interactive visual columns with drag-and-drop cards, WIP limits, and custom grouping.",
              },
              {
                icon: "📅",
                title: "Calendar View",
                desc: "Date-based monthly and weekly perspectives for release schedules and milestone deadlines.",
              },
              {
                icon: "📈",
                title: "Gantt Timeline",
                desc: "Cascade dependencies, lead/lag indicators, and milestone forecasting over time.",
              },
              {
                icon: "📑",
                title: "Spreadsheet Grid",
                desc: "Rapid spreadsheet-style entry for managing hundreds of backlog items in seconds.",
              },
              {
                icon: "📖",
                title: "Pages & Docs",
                desc: "Collaborative rich-text markdown documents with slash commands tied directly to tasks.",
              },
            ].map((v) => (
              <div
                key={v.title}
                style={{
                  background: "var(--surface-glass)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid var(--surface-glass-border)",
                  borderRadius: "20px",
                  padding: "1.75rem",
                  boxShadow: "var(--shadow-glass)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <div style={{ fontSize: "1.75rem" }}>{v.icon}</div>
                <h3 style={{ fontSize: "1.15rem", margin: 0 }}>{v.title}</h3>
                <p style={{ color: "var(--fg-muted)", fontSize: "0.875rem", margin: 0, lineHeight: "1.55" }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Planning & Rhythm: Cycles & Modules */}
      <section className="section-pad" style={{ background: "var(--surface-product)" }}>
        <div className="shell">
          <div className="section-header">
            <span className="label-badge">AGILE PLANNING</span>
            <h2 className="font-satoshi">Cycles for sprint cadence, modules for roadmaps</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.75rem" }}>
            <div
              style={{
                background: "var(--surface-glass)",
                backdropFilter: "blur(20px)",
                border: "1px solid var(--surface-glass-border)",
                borderRadius: "24px",
                padding: "2.25rem",
                boxShadow: "var(--shadow-glass)",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔄</div>
              <h3 style={{ marginBottom: "0.75rem" }}>Cycles &amp; Sprints</h3>
              <p style={{ color: "var(--fg-muted)", fontSize: "0.95rem", lineHeight: "1.6", margin: 0 }}>
                Time-boxed sprint periods with automated progress tracking and velocity burn-down metrics. Lock scope
                during active sprints and carry unfinished work forward seamlessly.
              </p>
            </div>

            <div
              style={{
                background: "var(--surface-glass)",
                backdropFilter: "blur(20px)",
                border: "1px solid var(--surface-glass-border)",
                borderRadius: "24px",
                padding: "2.25rem",
                boxShadow: "var(--shadow-glass)",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>📦</div>
              <h3 style={{ marginBottom: "0.75rem" }}>Modules &amp; Epics</h3>
              <p style={{ color: "var(--fg-muted)", fontSize: "0.95rem", lineHeight: "1.6", margin: 0 }}>
                Multi-sprint feature milestones that group related work items across your engineering team with lead
                assignees, target dates, and automatic status rollups.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CTA */}
      <section className="section-pad" style={{ textAlign: "center" }}>
        <div className="shell" style={{ maxWidth: "48rem" }}>
          <div
            style={{
              background: "var(--surface-glass)",
              backdropFilter: "blur(24px)",
              border: "1px solid var(--surface-glass-border)",
              borderRadius: "32px",
              padding: "3.5rem 2rem",
              boxShadow: "var(--shadow-glass-lg)",
            }}
          >
            <h2 className="font-satoshi" style={{ margin: "0 0 1.25rem" }}>
              Ready to ship faster with Keel?
            </h2>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <a className="btn btn-brand btn-lg" href={`${APP}/sign-up`}>
                Launch Keel Free
              </a>
              <Link className="btn btn-secondary btn-lg" href="/docs">
                Read the Documentation
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
