import Link from "next/link";

export const metadata = {
  title: "Features — Keel",
  description:
    "Explore Keel features: 5 Dynamic Views, Cycles & Sprints, Modules, Pages & Docs, Project Chat, and Bring Your Own AI Key across 7 providers.",
};

const APP = "https://app.keel.ostenmark.com";
const SALES_EMAIL = "sales@ostenmark.com";

export default function FeaturesPage() {
  return (
    <>
      {/* 1. Page Header */}
      <section className="inner-page-head">
        <div className="shell" style={{ textAlign: "center", maxWidth: "48rem" }}>
          <span className="label-badge">CAPABILITIES &amp; ARCHITECTURE</span>
          <h1 className="font-heading" style={{ margin: "1rem 0" }}>
            Every tool your team needs to plan, track, and ship
          </h1>
          <p className="inner-page-lede" style={{ margin: "0 auto" }}>
            Keel unites work items, sprint cycles, roadmap modules, collaborative docs, and Bring Your Own AI Key into
            one fast, quiet workspace.
          </p>

          <div
            style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center", marginTop: "2rem" }}
          >
            {[
              "Work Items & Sub-tasks",
              "5 Dynamic Views",
              "Cycles & Sprints",
              "Modules & Epics",
              "Pages & Docs",
              "Bring Your Own AI Key",
              "Cmd+K Palette",
              "Project Chat & Triage",
            ].map((item) => (
              <span
                key={item}
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  padding: "0.35rem 0.85rem",
                  borderRadius: "9999px",
                  background: "var(--badge-bg)",
                  border: "1px solid var(--badge-border)",
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
            <span className="label-badge">PERSPECTIVES</span>
            <h2 className="font-heading">5 Ways to Visualize Your Work</h2>
            <p style={{ color: "var(--fg-muted)", maxWidth: "36rem", margin: "0.5rem auto 0" }}>
              Switch instantly between five views over the exact same underlying data, with saved filters per project.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {[
              {
                icon: "📋",
                title: "List View",
                desc: "High-density hierarchical list with fast inline editing for priority, status, assignees, dates, and sub-items.",
              },
              {
                icon: "📊",
                title: "Kanban Board",
                desc: "Interactive visual columns with drag-and-drop cards, WIP limits, custom grouping, and state gates.",
              },
              {
                icon: "📅",
                title: "Calendar View",
                desc: "Date-based monthly and weekly perspectives for release schedules, milestones, and target delivery dates.",
              },
              {
                icon: "📈",
                title: "Gantt Timeline",
                desc: "Cascade dependencies, lead/lag indicators, and multi-quarter roadmap forecasting over time.",
              },
              {
                icon: "📑",
                title: "Spreadsheet Grid",
                desc: "Rapid spreadsheet-style entry for managing hundreds of backlog work items in seconds.",
              },
              {
                icon: "📖",
                title: "Pages & Docs",
                desc: "Collaborative rich-text markdown documents with slash commands tied directly to tasks and cycles.",
              },
            ].map((v) => (
              <div
                key={v.title}
                style={{
                  background: "var(--surface-glass)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid var(--surface-glass-border)",
                  borderRadius: "24px",
                  padding: "1.75rem",
                  boxShadow: "var(--shadow-glass)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <div style={{ fontSize: "1.75rem" }}>{v.icon}</div>
                <h3 style={{ fontSize: "1.15rem", margin: 0 }}>{v.title}</h3>
                <p style={{ color: "var(--fg-muted)", fontSize: "0.875rem", margin: 0, lineHeight: "1.55" }}>
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Planning & Rhythm: Cycles & Modules */}
      <section className="section-pad" style={{ background: "var(--surface-product)" }}>
        <div className="shell">
          <div className="section-header">
            <span className="label-badge">ENGINEERING RHYTHM</span>
            <h2 className="font-heading">Cycles for sprint cadence, modules for roadmaps</h2>
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
                Time-boxed sprint periods with automated progress tracking and velocity burndown metrics. Lock scope
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
              <h3 style={{ marginBottom: "0.75rem" }}>Modules &amp; Roadmaps</h3>
              <p style={{ color: "var(--fg-muted)", fontSize: "0.95rem", lineHeight: "1.6", margin: 0 }}>
                Longer-running feature workstreams that group related work items across your engineering team with lead
                assignees, target dates, and automatic status rollups.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. AI & Bring Your Own Key */}
      <section className="section-pad">
        <div className="shell">
          <div className="section-header">
            <span className="label-badge">BRING YOUR OWN AI KEY</span>
            <h2 className="font-heading">AI tailored to your provider, with zero token markup</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
            <div
              style={{
                background: "var(--surface-glass)",
                backdropFilter: "blur(20px)",
                border: "1px solid var(--surface-glass-border)",
                borderRadius: "24px",
                padding: "2rem",
                boxShadow: "var(--shadow-glass)",
              }}
            >
              <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>7 Supported Providers</h3>
              <p style={{ color: "var(--fg-muted)", fontSize: "0.9rem", lineHeight: "1.6", margin: 0 }}>
                Bring your API key for Anthropic, OpenAI, Google, xAI, Mistral, DeepSeek, or Groq. Keel never resells
                model usage — your key communicates directly with your provider.
              </p>
            </div>

            <div
              style={{
                background: "var(--surface-glass)",
                backdropFilter: "blur(20px)",
                border: "1px solid var(--surface-glass-border)",
                borderRadius: "24px",
                padding: "2rem",
                boxShadow: "var(--shadow-glass)",
              }}
            >
              <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>Title &amp; Spec Drafting</h3>
              <p style={{ color: "var(--fg-muted)", fontSize: "0.9rem", lineHeight: "1.6", margin: 0 }}>
                Instantly draft clear work item titles, generate acceptance criteria, format markdown technical specs,
                and expand task scope with one click.
              </p>
            </div>

            <div
              style={{
                background: "var(--surface-glass)",
                backdropFilter: "blur(20px)",
                border: "1px solid var(--surface-glass-border)",
                borderRadius: "24px",
                padding: "2rem",
                boxShadow: "var(--shadow-glass)",
              }}
            >
              <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>Workspace Agent Panel</h3>
              <p style={{ color: "var(--fg-muted)", fontSize: "0.9rem", lineHeight: "1.6", margin: 0 }}>
                Built-in agent panel can triage incoming items, assign owners, suggest labels, detect duplicate issues,
                and execute bulk workspace updates safely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Pre-Footer CTA */}
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
            <h2 className="font-heading" style={{ margin: "0 0 1.25rem" }}>
              Ready to experience Keel?
            </h2>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <a className="btn btn-brand btn-lg" href={`${APP}/sign-up`}>
                Launch Workspace
              </a>
              <a className="btn btn-secondary btn-lg" href={`mailto:${SALES_EMAIL}`}>
                Talk to sales
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
