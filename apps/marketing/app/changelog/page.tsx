export const metadata = {
  title: "Changelog — Keel",
  description: "Recent product updates, releases, feature improvements, and fixes in Keel.",
};

const APP = "https://app.keel.ostenmark.com";
const SALES_EMAIL = "sales@ostenmark.com";

export default function ChangelogPage() {
  const releases = [
    {
      version: "v1.4.1",
      date: "18 Aug 2026",
      status: "shipped",
      title: "Violet UI Redesign & BYO AI Key Integration",
      items: [
        "Updated Keel workspace marketing experience with refined violet design direction.",
        "Highlighting Bring Your Own AI Key across 7 model providers with zero reseller markup.",
        "Updated product navigation and commercial inquiry flows pointing to Talk to Sales.",
        "Refined 5-view data model mockups and interactive AI feature showcase.",
      ],
    },
    {
      version: "v1.4.0",
      date: "10 Aug 2026",
      status: "shipped",
      title: "7 AI Model Providers & Workspace Agent Panel",
      items: [
        "Direct API key integration for Anthropic, OpenAI, Google, xAI, Mistral, DeepSeek, and Groq.",
        "Inline AI title and description drafting with single-click acceptance criteria expansion.",
        "Autonomous workspace agent panel for intake triage, label assignment, and duplicate detection.",
        "Zero token markup guarantee — requests route straight to user's AI provider.",
      ],
    },
    {
      version: "v1.3.2",
      date: "01 Aug 2026",
      status: "shipped",
      title: "5 Dynamic Views & Saved Filter Sets",
      items: [
        "Unifying List, Board, Calendar, Table spreadsheet, and Timeline Gantt over identical work item data.",
        "Per-project saved shareable filter sets with persistent sorting and grouping.",
        "Sub-50ms UI state transitions and universal Cmd+K command palette search.",
      ],
    },
    {
      version: "v1.3.0",
      date: "15 Jul 2026",
      status: "shipped",
      title: "Collaborative Pages & Project Chat",
      items: [
        "Real-time collaborative Pages document editor living beside active work items.",
        "Slash commands (/) to embed work items, sprint cycles, and sub-task checklists into docs.",
        "Per-project discussion threads and intake triage inbox.",
      ],
    },
  ];

  return (
    <>
      {/* 1. Page Header */}
      <section className="inner-page-head">
        <div className="shell" style={{ textAlign: "center", maxWidth: "48rem" }}>
          <span className="label-badge">CHANGELOG</span>
          <h1 className="font-heading" style={{ margin: "1rem 0" }}>
            What shipped in Keel
          </h1>
          <p className="inner-page-lede" style={{ margin: "0 auto" }}>
            A continuous record of releases, new features, performance enhancements, and system upgrades across Keel.
          </p>
        </div>
      </section>

      {/* 2. Changelog Entries Timeline */}
      <section className="section-pad">
        <div className="shell" style={{ maxWidth: "56rem" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {releases.map((rel) => (
              <div key={rel.version} className="changelog-entry">
                <div>
                  <div className="changelog-date">{rel.date}</div>
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.75rem",
                      color: "var(--accent)",
                      fontWeight: 600,
                      marginTop: "0.25rem",
                    }}
                  >
                    {rel.version}
                  </div>
                </div>

                <div className="changelog-body">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                    <h3 style={{ margin: 0, fontSize: "1.25rem" }}>{rel.title}</h3>
                    <span className={`changelog-badge ${rel.status}`}>✓ Shipped</span>
                  </div>

                  <ul
                    style={{
                      listStyle: "disc",
                      paddingLeft: "1.25rem",
                      margin: "0.75rem 0 0",
                      color: "var(--fg-muted)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.4rem",
                    }}
                  >
                    {rel.items.map((item) => (
                      <li key={item} style={{ fontSize: "0.9375rem", lineHeight: "1.6" }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Pre-Footer CTA */}
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
              Experience the latest Keel updates
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
