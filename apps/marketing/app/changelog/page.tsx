export const metadata = {
  title: "Changelog — Keel",
  description: "Recent product updates, releases, improvements, and fixes in Keel.",
};

const APP = "https://app.keel.ostenmark.com";

export default function ChangelogPage() {
  const releases = [
    {
      version: "v1.4.1",
      date: "15 Aug 2026",
      status: "shipped",
      title: "Keel Platform UI & Antigravity 3D Hero",
      items: [
        "Updated Keel landing page layout with 15 platform sections.",
        "Interactive 3D Antigravity quantum core hero canvas with particle gravity physics.",
        "Interactive Keel AI feature tabs with auto-synchronized progress timers.",
        "Comprehensive Mega Footer with compliance seals and desktop/mobile app download links.",
      ],
    },
    {
      version: "v1.4.0",
      date: "10 Aug 2026",
      status: "shipped",
      title: "Model Context Protocol (MCP) Server & AI Agents",
      items: [
        "Native MCP server support allowing AI agents to triage and execute work items.",
        "Slack & Microsoft Teams bot integration with 2-way real-time discussion syncing.",
        "Duplicate issue detection with 96% AI semantic matching.",
      ],
    },
    {
      version: "v1.3.2",
      date: "01 Aug 2026",
      status: "shipped",
      title: "Self-Hosted Prime CLI & Kubernetes Helm Charts",
      items: [
        "One-command instance upgrades, backups, and health monitoring via Prime CLI.",
        "Production-grade Kubernetes Helm charts with HA Postgres and Redis clustering.",
        "Air-gapped deployment bundles for enterprise private clouds.",
      ],
    },
    {
      version: "v1.3.0",
      date: "15 Jul 2026",
      status: "shipped",
      title: "Real-Time Collaborative Pages & Five Layout Views",
      items: [
        "Collaborative Pages with real-time multi-person editing and work item embeddings.",
        "Gantt Timeline and Spreadsheet Grid layouts added alongside Board and List.",
        "Custom workflow state automations and stage gates.",
      ],
    },
  ];

  return (
    <>
      {/* 1. Page Header */}
      <section className="inner-page-head">
        <div className="shell">
          <span className="label-badge">CHANGELOG</span>
          <h1 className="font-satoshi">What shipped, and what&apos;s coming next</h1>
          <p className="inner-page-lede">
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
                      color: "var(--accent-brand-bright)",
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
                    <span className={`changelog-badge ${rel.status}`}>
                      {rel.status === "shipped" ? "✓ Shipped" : "In Progress"}
                    </span>
                  </div>

                  <ul
                    style={{
                      listStyle: "disc",
                      paddingLeft: "1.25rem",
                      margin: "0.5rem 0 0",
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
      <section className="cta-band-section">
        <div className="shell">
          <h2 className="font-satoshi">Never miss a release</h2>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a className="btn btn-inverse btn-lg" href={`${APP}/sign-up`}>
              Try Keel now
            </a>
            <a className="btn btn-secondary btn-lg" href="https://github.com/MuhammadRafay7/keel">
              Star on GitHub
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
