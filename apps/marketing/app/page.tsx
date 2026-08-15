import Link from "next/link";
import { HullScene } from "@/components/HullScene";
import { LogoCloud } from "@/components/LogoCloud";
import { AiFeatureShowcase } from "@/components/AiFeatureShowcase";
import {
  HeroDashboardMockup,
  ProjectsBentoVisual,
  WikiBentoVisual,
  AiBentoVisual,
  DeskBentoVisual,
} from "@/components/ProductMockups";

const APP = "https://app.keel.ostenmark.com";

export default function Home() {
  return (
    <>
      {/* 1. HERO SECTION WITH ANTIGRAVITY 3D INTERACTIVE CANVAS & 3D MOCKUP */}
      <section aria-label="Hero section" className="hero-section" id="hero">
        <HullScene />

        <div className="shell hero-content">
          <div className="hero-eyebrow">Cloud, self-hosted and air-gapped ready</div>

          <h1 className="hero-title font-satoshi">
            Project management and knowledge
            <br />
            management for teams and agents
          </h1>

          <p className="hero-subtitle">
            Plane brings projects, docs, and AI-powered workflows into one unified workspace so teams and agents can
            plan, execute, and stay aligned.
          </p>

          <div className="hero-cta-group">
            <a className="btn btn-inverse btn-lg" href={`${APP}/sign-up`}>
              Try Plane Business for 14 days
            </a>
            <Link className="btn btn-secondary btn-lg" href="/contact">
              Talk to a human &rarr;
            </Link>
          </div>
        </div>

        {/* 3D Dashboard Preview Mockup */}
        <div className="hero-dashboard-preview shell">
          <div className="hero-dashboard-wrapper">
            <HeroDashboardMockup />
          </div>
        </div>
      </section>

      {/* 2. LOGO CLOUD (ENTERPRISE SOCIAL PROOF) */}
      <LogoCloud />

      {/* 3. THE PLATFORM (FOUR PRODUCTS IN ONE WORKSPACE) */}
      <section aria-label="Products" className="section-pad" id="products">
        <div className="shell">
          <div className="section-header center">
            <span className="label-badge">THE PLATFORM</span>
            <h2 className="font-satoshi">
              Four products in one workspace
              <br />
              for your whole org
            </h2>
          </div>

          <div className="products-bento">
            {/* 1. Projects */}
            <Link href="/features" className="product-bento-card">
              <div className="product-bento-header">
                <div className="product-tag">
                  <span>⚡️</span> Projects
                </div>
                <h3>Project management that matches how your team works</h3>
                <p>
                  Initiatives set the direction. Projects, epics, and cycles break it down. Progress connects across
                  every layer.
                </p>
              </div>
              <div className="product-bento-visual">
                <ProjectsBentoVisual />
              </div>
            </Link>

            {/* 2. Wiki */}
            <Link href="/docs" className="product-bento-card">
              <div className="product-bento-header">
                <div className="product-tag">
                  <span>📖</span> Wiki
                </div>
                <h3>Documentation built in for tribal knowledge</h3>
                <p>
                  Company knowledge in one place. Tied directly to the work that created it. Never stale, never lost.
                </p>
              </div>
              <div className="product-bento-visual">
                <WikiBentoVisual />
              </div>
            </Link>

            {/* 3. Plane AI */}
            <Link href="/features" className="product-bento-card">
              <div className="product-bento-header">
                <div className="product-tag">
                  <span>✨</span> Plane AI
                </div>
                <h3>AI that knows your work, not just your prompts</h3>
                <p>
                  Assign agents to work items. Summarize progress across projects. Triage, draft, and act using the full
                  context of your workspace.
                </p>
              </div>
              <div className="product-bento-visual">
                <AiBentoVisual />
              </div>
            </Link>

            {/* 4. Desk */}
            <div className="product-bento-card">
              <div className="product-bento-header">
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <div className="product-tag" style={{ marginBottom: 0 }}>
                    <span>📥</span> Desk
                  </div>
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: 600,
                      background: "rgba(100, 116, 139, 0.2)",
                      padding: "0.15rem 0.5rem",
                      borderRadius: "999px",
                      textTransform: "uppercase",
                      color: "var(--fg-muted)",
                    }}
                  >
                    Coming Soon
                  </span>
                </div>
                <h3>Customer support that lives where your work does</h3>
                <p>
                  Turn requests into trackable work items. Route to the right team and close the loop automatically.
                </p>
              </div>
              <div className="product-bento-visual">
                <DeskBentoVisual />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TESTIMONIALS & CASE STUDIES BENTO GRID */}
      <section className="section-pad" style={{ background: "var(--surface-product)" }}>
        <div className="shell">
          <div className="testimonial-grid">
            {/* Featured Duane Arnett FortyAU Story */}
            <Link href="/about" className="testimonial-card-story testimonial-card-featured">
              <div style={{ fontSize: "1.1rem", fontWeight: 700, letterSpacing: "0.08em" }}>40AU</div>
              <div>
                <h3 style={{ fontSize: "1.25rem", color: "#ffffff", marginBottom: "1rem" }}>
                  Why FortyAU replaced Monday and Trello with Plane for flexible, self-hosted project delivery
                </h3>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    color: "#38bdf8",
                    fontWeight: 500,
                  }}
                >
                  Read customer story &rarr;
                </span>
              </div>
            </Link>

            {/* Duane Arnett Quote Block */}
            <div className="testimonial-card-main">
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="var(--accent-brand-bright)"
                  style={{ opacity: 0.8 }}
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p style={{ fontSize: "1.35rem", lineHeight: "1.5", margin: 0, color: "var(--fg)", fontWeight: 430 }}>
                  &ldquo;The Plane team is creating a product that our business has been needing for years. Modern
                  features, flexible workflows, without sacrificing reporting abilities.&rdquo;
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  borderTop: "1px solid var(--line)",
                  paddingTop: "1.25rem",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: "var(--fg)" }}>Duane Arnett</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--fg-muted)" }}>FortyAU</div>
                </div>
              </div>
            </div>

            {/* MinimalArt Story */}
            <Link href="/about" className="testimonial-card-story">
              <div style={{ fontWeight: 700, color: "var(--fg)" }}>minimalart</div>
              <div>
                <h4 style={{ color: "var(--fg)", marginBottom: "0.5rem" }}>
                  Why MinimalArt replaced ClickUp with Plane for simpler project management
                </h4>
                <span style={{ fontSize: "0.875rem", color: "var(--accent-brand)", fontWeight: 500 }}>
                  Read customer story &rarr;
                </span>
              </div>
            </Link>

            {/* VATES Story */}
            <Link href="/about" className="testimonial-card-story">
              <div style={{ fontWeight: 700, color: "var(--fg)" }}>VATES</div>
              <div>
                <h4 style={{ color: "var(--fg)", marginBottom: "0.5rem" }}>
                  Why VATES replaced a Trello alternative with Plane as they scaled
                </h4>
                <span style={{ fontSize: "0.875rem", color: "var(--accent-brand)", fontWeight: 500 }}>
                  Read customer story &rarr;
                </span>
              </div>
            </Link>

            {/* INITS Story */}
            <Link href="/about" className="testimonial-card-story">
              <div style={{ fontWeight: 700, color: "var(--fg)" }}>INITS</div>
              <div>
                <h4 style={{ color: "var(--fg)", marginBottom: "0.5rem" }}>
                  How INITS built a real-world innovation lab for students with Plane
                </h4>
                <span style={{ fontSize: "0.875rem", color: "var(--accent-brand)", fontWeight: 500 }}>
                  Read customer story &rarr;
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. PLANE AI DEEP DIVE (DARK SECTION #0F0F10) */}
      <section aria-label="Insight" className="section-pad section-dark" id="insight">
        <div className="shell">
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
            <div style={{ maxWidth: "48rem" }}>
              <span className="label-badge">PLANE AI</span>
              <h2 className="font-satoshi">AI that works because it knows your context</h2>
              <p className="section-desc">
                Plane was not retrofitted for AI, it was built around it. Plane AI reads across every project, cycle,
                doc, and thread in your workspace. Agents take real assignments and do real work.
              </p>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1.75rem", flexWrap: "wrap" }}>
                <a className="btn btn-inverse" href={`${APP}/sign-up`}>
                  Get started free
                </a>
                <Link className="btn btn-secondary" href="/contact">
                  Talk to a human &rarr;
                </Link>
              </div>
            </div>

            {/* Interactive Tab Showcase Component */}
            <AiFeatureShowcase />
          </div>
        </div>
      </section>

      {/* 6. JIRA & LINEAR MIGRATION SECTION */}
      <section aria-label="Migrate" className="section-pad" id="migrate">
        <div className="shell">
          <div className="section-header center">
            <h2 className="font-satoshi">
              Two Fortune 10 companies
              <br />
              chose Plane for their Jira migration.
            </h2>
            <p className="section-desc">
              Get out of Jira, Linear, ClickUp, Asana, or Monday without leaving your data behind. Full migration
              support from day one, whether you&apos;re moving 50 people or 10,000.
            </p>
            <div
              style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1.75rem", flexWrap: "wrap" }}
            >
              <a className="btn btn-inverse" href={`${APP}/sign-up`}>
                Get started free
              </a>
              <Link className="btn btn-secondary" href="/contact">
                Talk to a migration expert &rarr;
              </Link>
            </div>
          </div>

          {/* 3-Week Timeline */}
          <div className="migration-timeline">
            {/* Week 1 */}
            <div className="timeline-step">
              <div>
                <span className="timeline-week">WEEK 1</span>
                <h3>Discovery and set-up.</h3>
              </div>
              <ul>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span>We run discovery scripts on your existing setup</span>
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span>We map every issue, attachment, comment, and automation</span>
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span>You get a migration plan tailored to your organization</span>
                </li>
              </ul>
            </div>

            {/* Week 2 */}
            <div className="timeline-step">
              <div>
                <span className="timeline-week">WEEK 2</span>
                <h3>Run in parallel</h3>
              </div>
              <ul>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span>Define workflows that match how your team actually works</span>
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span>Connect to Slack, GitHub, Figma, and 50+ tools</span>
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span>Set up initiatives, cycles, and team structures</span>
                </li>
              </ul>
            </div>

            {/* Week 3 */}
            <div className="timeline-step">
              <div>
                <span className="timeline-week">WEEK 3</span>
                <h3>Cut over and onboard</h3>
              </div>
              <ul>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span>Experience a tool that moves as fast as you do</span>
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span>AI already knows your projects, your blockers, your priorities</span>
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span>No more fighting your software to get work done</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CORE CAPABILITIES SECTION */}
      <section aria-label="Core Capabilities" className="section-pad" style={{ background: "var(--surface-product)" }}>
        <div className="shell">
          <div style={{ display: "flex", flexDirection: "column", gap: "3.5rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: "1.5rem",
              }}
            >
              <div style={{ maxWidth: "38rem" }}>
                <span className="label-badge">CORE CAPABILITIES</span>
                <h2 className="font-satoshi">Flexible features for every project, and all teams</h2>
              </div>
              <p style={{ maxWidth: "34rem", color: "var(--fg-muted)", fontSize: "1.0625rem", margin: 0 }}>
                Plane is fast to set up and easy to adapt. Multiple views, time-boxed cycles, built-in docs, and
                real-time dashboards help teams plan and ship without fighting their tools.
              </p>
            </div>

            {/* 2 Large Showcase Cards */}
            <div
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}
            >
              {/* Multi-view card */}
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  borderRadius: "16px",
                  padding: "2rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                <div>
                  <h3 style={{ fontSize: "1.35rem", marginBottom: "0.5rem" }}>Every view your team needs</h3>
                  <p style={{ color: "var(--fg-muted)", margin: 0, fontSize: "0.95rem" }}>
                    Board, Spreadsheet, List, Gantt. Switch instantly. Every role sees the work that matters to them.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {["LIST", "BOARD", "SPREADSHEET", "GANTT / TIMELINE", "CALENDAR"].map((view) => (
                    <span
                      key={view}
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "0.75rem",
                        padding: "0.35rem 0.75rem",
                        borderRadius: "999px",
                        background: "var(--surface-product)",
                        border: "1px solid var(--line)",
                        color: "var(--fg-muted)",
                      }}
                    >
                      {view}
                    </span>
                  ))}
                </div>
              </div>

              {/* Real-time Dashboards card */}
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  borderRadius: "16px",
                  padding: "2rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                <div>
                  <h3 style={{ fontSize: "1.35rem", marginBottom: "0.5rem" }}>Real-time dashboards without setup</h3>
                  <p style={{ color: "var(--fg-muted)", margin: 0, fontSize: "0.95rem" }}>
                    Track cycle velocity, workload, blockers, and scope changes with dashboards that populate
                    automatically. No manual status decks.
                  </p>
                </div>
                <div
                  style={{
                    background: "var(--surface-product)",
                    padding: "1rem",
                    borderRadius: "10px",
                    border: "1px solid var(--line)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.8125rem",
                      color: "var(--fg-muted)",
                    }}
                  >
                    <span>Sprint Velocity</span>
                    <span style={{ color: "#10b981", fontWeight: 600 }}>42 pts / cycle (+18%)</span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "8px",
                      background: "var(--line)",
                      borderRadius: "999px",
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ width: "82%", height: "100%", background: "#006399" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Feature Sub-cards */}
            <div
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}
            >
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  borderRadius: "12px",
                  padding: "1.5rem",
                }}
              >
                <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>🔄</div>
                <h4 style={{ marginBottom: "0.4rem" }}>Cycles and sprints</h4>
                <p style={{ color: "var(--fg-muted)", fontSize: "0.875rem", margin: 0 }}>
                  Time-box work with velocity tracking and burndown charts built in.
                </p>
              </div>
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  borderRadius: "12px",
                  padding: "1.5rem",
                }}
              >
                <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>📝</div>
                <h4 style={{ marginBottom: "0.4rem" }}>Documentation built-in</h4>
                <p style={{ color: "var(--fg-muted)", fontSize: "0.875rem", margin: 0 }}>
                  Rich documentation features that live alongside projects.
                </p>
              </div>
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  borderRadius: "12px",
                  padding: "1.5rem",
                }}
              >
                <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>🎯</div>
                <h4 style={{ marginBottom: "0.4rem" }}>Initiatives and epics</h4>
                <p style={{ color: "var(--fg-muted)", fontSize: "0.875rem", margin: 0 }}>
                  Align team-level work to org-level goals with rollup tracking.
                </p>
              </div>
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  borderRadius: "12px",
                  padding: "1.5rem",
                }}
              >
                <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>⚡️</div>
                <h4 style={{ marginBottom: "0.4rem" }}>Workflows and approvals</h4>
                <p style={{ color: "var(--fg-muted)", fontSize: "0.875rem", margin: 0 }}>
                  Automate handoffs, reviews, and stage gates without plugins.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. SELF-HOSTED SECTION (DARK #0F0F10) */}
      <section aria-label="Self-hosted" className="section-pad section-dark" id="self-hosted">
        <div className="shell">
          <div style={{ display: "flex", flexDirection: "column", gap: "3.5rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: "1.5rem",
              }}
            >
              <div style={{ maxWidth: "42rem" }}>
                <span className="label-badge">SELF-HOSTED</span>
                <h2 className="font-satoshi">Self-host without compromise, on-prem and air-gapped</h2>
              </div>
              <div style={{ maxWidth: "34rem" }}>
                <p className="section-desc" style={{ marginTop: 0 }}>
                  The only modern project management platform built for environments where you control every layer.
                </p>
                <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
                  <Link className="btn btn-inverse" href="/docs">
                    Self-host Plane
                  </Link>
                  <Link className="btn btn-secondary" href="/contact">
                    Talk to a human &rarr;
                  </Link>
                </div>
              </div>
            </div>

            {/* 3 Pillars */}
            <div
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}
            >
              <div
                style={{
                  background: "var(--surface-dark-card)",
                  border: "1px solid var(--line-dark)",
                  borderRadius: "12px",
                  padding: "1.75rem",
                }}
              >
                <h4 style={{ color: "var(--fg-dark-primary)", marginBottom: "0.5rem" }}>Prime CLI</h4>
                <p style={{ color: "var(--fg-dark-secondary)", fontSize: "0.9rem", margin: 0, lineHeight: "1.5" }}>
                  Install, configure, upgrade, back up, and monitor your instance with single commands. Multi-instance
                  support and custom domain setup built in.
                </p>
              </div>

              <div
                style={{
                  background: "var(--surface-dark-card)",
                  border: "1px solid var(--line-dark)",
                  borderRadius: "12px",
                  padding: "1.75rem",
                }}
              >
                <h4 style={{ color: "var(--fg-dark-primary)", marginBottom: "0.5rem" }}>Docker and Kubernetes</h4>
                <p style={{ color: "var(--fg-dark-secondary)", fontSize: "0.9rem", margin: 0, lineHeight: "1.5" }}>
                  Deploy with Docker for quick setup or Kubernetes with Helm charts for production scale. Bring your own
                  Postgres, Redis, and S3-compatible storage.
                </p>
              </div>

              <div
                style={{
                  background: "var(--surface-dark-card)",
                  border: "1px solid var(--line-dark)",
                  borderRadius: "12px",
                  padding: "1.75rem",
                }}
              >
                <h4 style={{ color: "var(--fg-dark-primary)", marginBottom: "0.5rem" }}>God Mode</h4>
                <p style={{ color: "var(--fg-dark-secondary)", fontSize: "0.9rem", margin: 0, lineHeight: "1.5" }}>
                  One admin panel for your entire instance. Configure SMTP, authentication methods, SSO, workspace
                  security, and telemetry preferences from a single screen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. MOBILE APPS SECTION (DARK) */}
      <section aria-label="Download" className="section-pad section-dark" id="download" style={{ borderTop: "none" }}>
        <div className="shell">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "3rem",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <span className="label-badge">MOBILE</span>
                <h2 className="font-satoshi" style={{ fontSize: "2.25rem" }}>
                  Your entire workspace on your mobile on both our Cloud and your self-hosted instance
                </h2>
              </div>

              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <a
                  href="https://github.com/makeplane/plane"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: "#181a1b",
                    border: "1px solid #2c2e30",
                    borderRadius: "12px",
                    padding: "1rem 1.25rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    color: "#e4e6e7",
                    fontWeight: 500,
                  }}
                >
                  Download for iOS &rarr;
                </a>
                <a
                  href="https://github.com/makeplane/plane"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: "#181a1b",
                    border: "1px solid #2c2e30",
                    borderRadius: "12px",
                    padding: "1rem 1.25rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    color: "#e4e6e7",
                    fontWeight: 500,
                  }}
                >
                  Download for Android &rarr;
                </a>
              </div>
            </div>

            <div
              style={{
                background: "#181a1b",
                border: "1px solid #2c2e30",
                borderRadius: "20px",
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #2c2e30",
                  paddingBottom: "0.75rem",
                }}
              >
                <span style={{ fontWeight: 600, color: "#38bdf8" }}>Plane Mobile Native</span>
                <span style={{ fontSize: "0.75rem", color: "#10b981" }}>Sync: Online</span>
              </div>
              <div
                style={{
                  background: "#0f0f10",
                  borderRadius: "10px",
                  padding: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Today&apos;s Assigned Work</span>
                <div style={{ fontWeight: 500, color: "#f8fafc" }}>#ENG-402: Production cluster readiness check</div>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      background: "#2c2e30",
                      padding: "0.15rem 0.4rem",
                      borderRadius: "4px",
                      color: "#38bdf8",
                    }}
                  >
                    In Progress
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. EXTEND PLANE (APPS, AGENTS & MARKETPLACE) */}
      <section aria-label="Apps" className="section-pad" id="apps">
        <div className="shell">
          <div className="section-header center">
            <h2 className="font-satoshi">Extend Plane with apps, agents, and your own integrations</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
            <div
              style={{
                background: "var(--surface-product)",
                border: "1px solid var(--line)",
                borderRadius: "16px",
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              <div>
                <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Browse the Marketplace</h3>
                <p style={{ color: "var(--fg-muted)", margin: 0, fontSize: "0.95rem" }}>
                  GitHub, GitLab, Slack, Sentry, and more. Sync issues, track PRs, and import from Jira, Linear, Asana,
                  ClickUp or Monday.
                </p>
              </div>
              <Link href="/docs" style={{ color: "var(--accent-brand)", fontWeight: 500, marginTop: "auto" }}>
                Go to Marketplace &rarr;
              </Link>
            </div>

            <div
              style={{
                background: "var(--surface-product)",
                border: "1px solid var(--line)",
                borderRadius: "16px",
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              <div>
                <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Build your own with MCP</h3>
                <p style={{ color: "var(--fg-muted)", margin: 0, fontSize: "0.95rem" }}>
                  Open API, webhooks, OAuth apps, and a native Model Context Protocol (MCP) server. Build custom AI
                  agents that work directly inside Plane.
                </p>
              </div>
              <Link href="/docs" style={{ color: "var(--accent-brand)", fontWeight: 500, marginTop: "auto" }}>
                Read developer docs &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 11. ENTERPRISE SECURITY & COMPLIANCE */}
      <section
        aria-label="Enterprise"
        className="section-pad"
        style={{ background: "var(--surface-product)" }}
        id="enterprise"
      >
        <div className="shell">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "1.5rem",
              marginBottom: "3.5rem",
            }}
          >
            <div style={{ maxWidth: "38rem" }}>
              <h2 className="font-satoshi">Enterprise-grade security, compliance, and control</h2>
            </div>
            <p style={{ maxWidth: "34rem", color: "var(--fg-muted)", fontSize: "1.0625rem", margin: 0 }}>
              Plane meets the security and compliance standards your InfoSec team requires, across cloud and self-hosted
              deployments.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: "16px",
                padding: "2rem",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🛡️</div>
              <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Certified across four standards</h3>
              <p style={{ color: "var(--fg-muted)", fontSize: "0.9rem", margin: 0 }}>
                SOC 2, ISO 27001, GDPR, and CCPA compliance out of the box. Independently audited, continuously
                monitored.
              </p>
            </div>

            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: "16px",
                padding: "2rem",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚡️</div>
              <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Fully committed uptime SLA</h3>
              <p style={{ color: "var(--fg-muted)", fontSize: "0.9rem", margin: 0 }}>
                Automatic backups, real-time scaling, and multi-layer failovers. Built to stay up when it matters most.
              </p>
            </div>

            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: "16px",
                padding: "2rem",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔑</div>
              <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Identity &amp; access at every layer</h3>
              <p style={{ color: "var(--fg-muted)", fontSize: "0.9rem", margin: 0 }}>
                SSO, SAML, and LDAP across every workspace. Authenticate your way.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 12. DEVELOPERS & PROJECTOPS SECTION (DARK) */}
      <section aria-label="Developers" className="section-pad section-dark" id="developers">
        <div className="shell">
          <div className="section-header center">
            <span className="label-badge">LOVED BY DEVELOPERS AND PROJECTOPS ADMINS</span>
            <h2 className="font-satoshi">
              Every setting versioned, reviewed, and
              <br />
              deployed from your terminal.
            </h2>
          </div>

          <div
            style={{
              background: "var(--surface-dark-card)",
              border: "1px solid var(--line-dark)",
              borderRadius: "16px",
              padding: "2rem",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "2rem",
              alignItems: "center",
            }}
          >
            <div
              style={{
                background: "#0b1015",
                borderRadius: "10px",
                padding: "1.5rem",
                fontFamily: "var(--mono)",
                fontSize: "0.8125rem",
                color: "#38bdf8",
                border: "1px solid #1e293b",
                lineHeight: "1.6",
              }}
            >
              <span style={{ color: "#64748b" }}># plane-compose.yaml</span>
              <br />
              version: &quot;1.0&quot;
              <br />
              project:
              <br />
              &nbsp;&nbsp;name: &quot;Platform Infrastructure&quot;
              <br />
              &nbsp;&nbsp;cycles:
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;sprint_duration: 14d
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;auto_archive: true
              <br />
              &nbsp;&nbsp;agents:
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;- name: &quot;triage-bot&quot;
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;model: &quot;claude-3-5-sonnet&quot;
            </div>

            <div>
              <h3 style={{ fontSize: "1.5rem", color: "var(--fg-dark-primary)", marginBottom: "0.75rem" }}>
                Plane Compose for Projects-as-Code
              </h3>
              <p
                style={{
                  color: "var(--fg-dark-secondary)",
                  fontSize: "0.95rem",
                  lineHeight: "1.6",
                  margin: "0 0 1.5rem",
                }}
              >
                Define projects in YAML, version in Git, deploy from your terminal. Start treating project configuration
                as the infrastructure it is.
              </p>
              <Link href="/docs" style={{ color: "#38bdf8", fontWeight: 500 }}>
                Learn more about Projects-as-Code &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 13. PRE-FOOTER CTA BAND */}
      <section aria-label="Cta" className="cta-band-section" id="cta">
        <div className="shell">
          <h2 className="font-satoshi">Next-gen project management starts here</h2>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a className="btn btn-inverse btn-lg" href={`${APP}/sign-up`}>
              Get started free
            </a>
            <Link className="btn btn-secondary btn-lg" href="/contact">
              Talk to a migration expert
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
