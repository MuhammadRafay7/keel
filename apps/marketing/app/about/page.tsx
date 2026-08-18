export const metadata = {
  title: "About — Keel",
  description:
    "Learn about Keel's mission to build an open-source, high-speed work management system with complete data sovereignty.",
};

const APP = "https://app.keel.ostenmark.com";
const REPO = "https://github.com/MuhammadRafay7/keel";

export default function AboutPage() {
  return (
    <>
      {/* 1. Page Header */}
      <section className="inner-page-head">
        <div className="shell" style={{ textAlign: "center", maxWidth: "48rem" }}>
          <span className="label-badge">MISSION &amp; VALUES</span>
          <h1 className="font-satoshi" style={{ margin: "1rem 0" }}>
            Work management that keeps its course
          </h1>
          <p className="inner-page-lede" style={{ margin: "0 auto" }}>
            Keel is designed for modern engineering teams: enough structure to maintain high velocity and visibility,
            with complete data sovereignty and zero vendor lock-in.
          </p>
        </div>
      </section>

      {/* 2. Values Bento Grid */}
      <section className="section-pad">
        <div className="shell">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.75rem" }}>
            <div
              style={{
                background: "var(--surface-glass)",
                backdropFilter: "blur(20px)",
                border: "1px solid var(--surface-glass-border)",
                borderRadius: "24px",
                padding: "2.25rem",
                boxShadow: "var(--shadow-glass)",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div style={{ fontSize: "2rem" }}>🎯</div>
              <h3 style={{ fontSize: "1.35rem", margin: 0 }}>Built for Speed &amp; Craft</h3>
              <p style={{ color: "var(--fg-muted)", margin: 0, lineHeight: "1.65" }}>
                A keel is the structural backbone of a ship that keeps it steady and on course. Keel was built from the
                ground up to give engineering teams a fast, reliable, keyboard-first tool without bureaucratic bloat.
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
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div style={{ fontSize: "2rem" }}>🔓</div>
              <h3 style={{ fontSize: "1.35rem", margin: 0 }}>Open Source &amp; Self-Hosted</h3>
              <p style={{ color: "var(--fg-muted)", margin: 0, lineHeight: "1.65" }}>
                Keel is AGPL-3.0 licensed. Inspect every line of code, run your own instance with Docker Compose, and
                deploy in private or air-gapped infrastructure with 100% data ownership.
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
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div style={{ fontSize: "2rem" }}>⚡️</div>
              <h3 style={{ fontSize: "1.35rem", margin: 0 }}>Modular Architecture</h3>
              <p style={{ color: "var(--fg-muted)", margin: 0, lineHeight: "1.65" }}>
                Built on Next.js, MobX reactive state management, TypeScript, Tailwind CSS, and Python/Django REST
                APIs. Designed to scale smoothly from 5-person startups to enterprise teams.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CTA */}
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
              Join the Keel Community
            </h2>
            <p style={{ color: "var(--fg-muted)", fontSize: "1.1rem", margin: "0 0 2rem" }}>
              Contribute to the codebase, report feedback, or deploy your self-hosted instance today.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <a href={REPO} target="_blank" rel="noreferrer" className="btn btn-brand btn-lg">
                View on GitHub
              </a>
              <a href={`${APP}/sign-up`} className="btn btn-secondary btn-lg">
                Try Hosted App
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
