import Link from "next/link";
import { HullScene } from "@/components/HullScene";
import {
  HeroDashboardMockup,
  ProjectsBentoVisual,
  WikiBentoVisual,
  CyclesBentoVisual,
  SelfHostBentoVisual,
} from "@/components/ProductMockups";

const APP = "https://app.keel.ostenmark.com";
const REPO = "https://github.com/MuhammadRafay7/keel";

export default function Home() {
  return (
    <>
      {/* 1. HERO SECTION WITH APPLE-STYLE THREE.JS FLUID AMBIENT VISUAL & INTERACTIVE PREVIEW */}
      <section aria-label="Hero section" className="hero-section" id="hero">
        <HullScene />

        <div className="shell hero-content">
          <Link href="/changelog" className="hero-eyebrow">
            <span className="hero-eyebrow-pulse" />
            <span className="hero-eyebrow-text">Keel 1.4 Released</span>
            <span className="hero-eyebrow-sep">·</span>
            <span className="hero-eyebrow-sub">Modern Open-Source Work Management</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="hero-eyebrow-arrow">
              <path
                d="M4.5 2.5L8 6L4.5 9.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>

          <h1 className="hero-title font-satoshi">
            Project management built for
            <br />
            <span className="hero-title-gradient">speed, precision, and craft.</span>
          </h1>

          <p className="hero-subtitle">
            Keel unites work items, agile cycles, roadmap modules, and collaborative markdown docs into one fast,
            extensible workspace. Self-host with Docker or deploy to your private cloud.
          </p>

          <div className="hero-cta-group">
            <a className="btn btn-brand btn-lg" href={`${APP}/sign-up`}>
              <span>Get Started Free</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M6 3L11 8L6 13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <a className="btn btn-secondary btn-lg" href={REPO} target="_blank" rel="noreferrer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>Star on GitHub</span>
            </a>
          </div>

          <div className="hero-trust-row">
            <span className="hero-trust-item">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              AGPL-3.0 Open Source
            </span>
            <span className="hero-trust-item">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Docker &amp; Cloud Ready
            </span>
            <span className="hero-trust-item">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              100% Data Sovereignty
            </span>
            <span className="hero-trust-item">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Sub-50ms Keyboard First
            </span>
          </div>
        </div>

        {/* Apple Window Dashboard Preview with Cinematic Glow Aura */}
        <div className="hero-dashboard-preview shell">
          <div className="hero-dashboard-glow" aria-hidden="true" />
          <div className="hero-dashboard-wrapper">
            <HeroDashboardMockup />
          </div>
        </div>
      </section>

      {/* 2. CORE CAPABILITIES (BENTO GRID WITH GLASS CARDS) */}
      <section aria-label="Core Capabilities" className="section-pad" id="features">
        <div className="shell">
          <div className="section-header center">
            <span className="label-badge">ARCHITECTURE &amp; FEATURES</span>
            <h2 className="font-satoshi">
              Everything your team needs
              <br />
              to plan, execute, and deliver
            </h2>
          </div>

          <div className="products-bento">
            {/* 1. 5 Dynamic Views */}
            <Link href="/features" className="product-bento-card">
              <div className="product-bento-header">
                <div className="product-tag">
                  <span>📋</span> 5 Dynamic Work Views
                </div>
                <h3>List, Kanban, Calendar, Gantt &amp; Spreadsheet</h3>
                <p>
                  View your issues the way you think. Switch effortlessly between high-density lists, Kanban boards,
                  timeline Gantt charts, and spreadsheet-style grids with inline cell editing.
                </p>
              </div>
              <div className="product-bento-visual">
                <ProjectsBentoVisual />
              </div>
            </Link>

            {/* 2. Agile Cycles & Sprints */}
            <Link href="/features" className="product-bento-card">
              <div className="product-bento-header">
                <div className="product-tag">
                  <span>🔄</span> Agile Cycles &amp; Sprints
                </div>
                <h3>Sprint planning and velocity tracking</h3>
                <p>
                  Create time-boxed iterations, lock scope, track burndown charts, and analyze team velocity across
                  active, upcoming, and completed sprint cycles.
                </p>
              </div>
              <div className="product-bento-visual">
                <CyclesBentoVisual />
              </div>
            </Link>

            {/* 3. Pages & Collaborative Docs */}
            <Link href="/docs" className="product-bento-card">
              <div className="product-bento-header">
                <div className="product-tag">
                  <span>📖</span> Pages &amp; Collaborative Docs
                </div>
                <h3>Living documentation tied directly to work</h3>
                <p>
                  Rich-text editor powered by slash commands (<code style={{ color: "var(--accent)" }}>/</code>). Embed
                  work items, checklists, and code snippets directly inside your architectural specs.
                </p>
              </div>
              <div className="product-bento-visual">
                <WikiBentoVisual />
              </div>
            </Link>

            {/* 4. Self-Hosting & Data Sovereignty */}
            <Link href="/about" className="product-bento-card">
              <div className="product-bento-header">
                <div className="product-tag">
                  <span>🐳</span> 100% Data Sovereignty
                </div>
                <h3>Self-host anywhere with Docker Compose</h3>
                <p>
                  AGPL-3.0 licensed open-source core. Deploy on your own servers, AWS, GCP, or bare metal with complete
                  air-gapped capability and zero telemetry lock-in.
                </p>
              </div>
              <div className="product-bento-visual">
                <SelfHostBentoVisual />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. FEATURE HIGHLIGHTS */}
      <section className="section-pad" style={{ background: "var(--surface-product)" }}>
        <div className="shell">
          <div className="section-header center">
            <span className="label-badge">CRAFTED FOR SPEED</span>
            <h2 className="font-satoshi">Engineered for high-performing engineering teams</h2>
          </div>

          <div className="feature-spotlight-grid">
            <div className="feature-spotlight-card">
              <div className="feature-icon-circle">⚡️</div>
              <h3 style={{ fontSize: "1.2rem", margin: 0 }}>Power-K Command Palette</h3>
              <p style={{ color: "var(--fg-muted)", margin: 0, fontSize: "0.9375rem", lineHeight: "1.6" }}>
                Universal <code style={{ color: "var(--accent)" }}>Cmd+K</code> search to instantly jump between
                projects, toggle views, create tasks, and switch themes without touching your mouse.
              </p>
            </div>

            <div className="feature-spotlight-card">
              <div className="feature-icon-circle">🎯</div>
              <h3 style={{ fontSize: "1.2rem", margin: 0 }}>Modules &amp; Roadmaps</h3>
              <p style={{ color: "var(--fg-muted)", margin: 0, fontSize: "0.9375rem", lineHeight: "1.6" }}>
                Group complex initiatives into strategic modules. Track multi-quarter progress with automatic completion
                rollups and lead assignees.
              </p>
            </div>

            <div className="feature-spotlight-card">
              <div className="feature-icon-circle">📥</div>
              <h3 style={{ fontSize: "1.2rem", margin: 0 }}>Intake &amp; Triage Inbox</h3>
              <p style={{ color: "var(--fg-muted)", margin: 0, fontSize: "0.9375rem", lineHeight: "1.6" }}>
                Accept inbound requests into an isolated triage inbox. Accept, reject, or convert them into backlog
                items before they pollute your active sprint.
              </p>
            </div>

            <div className="feature-spotlight-card">
              <div className="feature-icon-circle">🎨</div>
              <h3 style={{ fontSize: "1.2rem", margin: 0 }}>Dark &amp; Light Theming</h3>
              <p style={{ color: "var(--fg-muted)", margin: 0, fontSize: "0.9375rem", lineHeight: "1.6" }}>
                Tailored high-contrast and subtle tinted neutral palettes for day and night. Seamlessly matches your
                system preferences.
              </p>
            </div>

            <div className="feature-spotlight-card">
              <div className="feature-icon-circle">🔗</div>
              <h3 style={{ fontSize: "1.2rem", margin: 0 }}>Custom Fields &amp; Labels</h3>
              <p style={{ color: "var(--fg-muted)", margin: 0, fontSize: "0.9375rem", lineHeight: "1.6" }}>
                Define custom states, estimates, priority levels, labels, and relations (blocking, duplicate, related)
                to reflect your exact workflow.
              </p>
            </div>

            <div className="feature-spotlight-card">
              <div className="feature-icon-circle">🔐</div>
              <h3 style={{ fontSize: "1.2rem", margin: 0 }}>Role-Based Access Control</h3>
              <p style={{ color: "var(--fg-muted)", margin: 0, fontSize: "0.9375rem", lineHeight: "1.6" }}>
                Granular member, admin, and guest permissions across workspaces and projects to keep sensitive planning
                secure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FINAL CALL TO ACTION */}
      <section className="section-pad" style={{ textAlign: "center" }}>
        <div className="shell" style={{ maxWidth: "48rem" }}>
          <div
            style={{
              background: "var(--surface-glass)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid var(--surface-glass-border)",
              borderRadius: "32px",
              padding: "3.5rem 2rem",
              boxShadow: "var(--shadow-glass-lg)",
            }}
          >
            <span className="label-badge">GET STARTED TODAY</span>
            <h2 className="font-satoshi" style={{ margin: "1rem 0 1.25rem" }}>
              Take control of your team&apos;s work.
            </h2>
            <p
              style={{
                color: "var(--fg-muted)",
                fontSize: "1.1rem",
                lineHeight: "1.6",
                margin: "0 auto 2.25rem",
                maxWidth: "36rem",
              }}
            >
              Experience the speed, responsiveness, and freedom of a modern open-source work management platform.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <a href={`${APP}/sign-up`} className="btn btn-brand btn-lg">
                Launch Keel Free
              </a>
              <a href={REPO} target="_blank" rel="noreferrer" className="btn btn-secondary btn-lg">
                View Source on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
