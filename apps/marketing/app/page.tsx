import Link from "next/link";
import { LogoCloud } from "@/components/LogoCloud";
import { AiFeatureShowcase } from "@/components/AiFeatureShowcase";
import {
  HeroDashboardMockup,
  ProjectsBentoVisual,
  WikiBentoVisual,
  CyclesBentoVisual,
  ByoAiBentoVisual,
} from "@/components/ProductMockups";
import {
  ListIcon,
  CycleIcon,
  DocIcon,
  ZapIcon,
  TargetIcon,
  TriageIcon,
  PaletteIcon,
  LinkIcon,
  LockIcon,
} from "@/components/Icons";

const APP = "https://app.keel.ostenmark.com";
const SALES_EMAIL = "sales@ostenmark.com";

export default function Home() {
  return (
    <>
      {/* 1. HERO SECTION */}
      <section aria-label="Hero section" className="hero-section" id="hero">
        <div className="shell hero-content">
          <span className="label-badge">HOSTED ENGINEERING WORKSPACE</span>
          <h1 className="hero-title font-heading" style={{ marginTop: "1rem" }}>
            Work management for high-velocity engineering teams.
          </h1>

          <p className="hero-subtitle">
            Keel connects work items, agile sprint cycles, roadmap modules, collaborative docs, and Bring Your Own AI
            Key into one fast, quiet workspace.
          </p>

          <div className="hero-action-row">
            <a href={`${APP}/sign-up`} className="btn btn-brand btn-lg">
              <span>Launch Workspace</span>
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
            <a href={`mailto:${SALES_EMAIL}`} className="btn btn-secondary btn-lg">
              Talk to sales
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
              Hosted &amp; ready immediately
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
              Bring your own AI key
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
              5 views over 1 data model
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
              Keyboard-first navigation
            </span>
          </div>
        </div>

        {/* Dashboard Showcase Frame */}
        <div className="hero-dashboard-preview shell">
          <div className="hero-dashboard-wrapper">
            <HeroDashboardMockup />
          </div>
        </div>
      </section>

      {/* Engineering Social Proof */}
      <LogoCloud />

      {/* 2. BRING YOUR OWN AI KEY (DIFFERENTIATOR SHOWCASE) */}
      <section aria-label="Bring Your Own AI Key" className="section-pad" id="ai-spotlight">
        <div className="shell">
          <div className="section-header center">
            <span className="label-badge">GENUINE DIFFERENTIATOR</span>
            <h2 className="font-heading">Bring your own AI key. Zero reseller markup.</h2>
            <p style={{ color: "var(--fg-muted)", maxWidth: "38rem", margin: "0.75rem auto 0" }}>
              Keel never resells model usage or marks up token pricing. Provide your API key for Anthropic, OpenAI,
              Google, xAI, Mistral, DeepSeek, or Groq — requests go straight to your provider.
            </p>
          </div>

          <AiFeatureShowcase />
        </div>
      </section>

      {/* 3. CORE CAPABILITIES (BENTO GRID) */}
      <section
        aria-label="Core Capabilities"
        className="section-pad"
        style={{ background: "var(--surface-product)" }}
        id="features"
      >
        <div className="shell">
          <div className="section-header center">
            <span className="label-badge">UNIFIED DATA MODEL</span>
            <h2 className="font-heading">One workspace. Five views over the exact same data.</h2>
            <p style={{ color: "var(--fg-muted)", maxWidth: "36rem", margin: "0.5rem auto 0" }}>
              Issues, sprint cycles, roadmaps, and documentation are not separate products bolted together — they are
              the exact same workspace data seen five ways.
            </p>
          </div>

          <div className="products-bento">
            {/* 1. 5 Dynamic Views */}
            <Link href="/features" className="product-bento-card">
              <div className="product-bento-header">
                <div className="product-tag">
                  <ListIcon size={14} /> 5 Dynamic Work Views
                </div>
                <h3>List, Board, Calendar, Table &amp; Timeline</h3>
                <p>
                  Switch effortlessly per project between high-density lists, Kanban boards, monthly calendars,
                  spreadsheet tables, and Gantt timelines with saved filters.
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
                  <CycleIcon size={14} /> Cycles &amp; Sprints
                </div>
                <h3>Sprint planning and burndown velocity</h3>
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
            <Link href="/features" className="product-bento-card">
              <div className="product-bento-header">
                <div className="product-tag">
                  <DocIcon size={14} /> Pages &amp; Collaborative Docs
                </div>
                <h3>Living documentation living beside work</h3>
                <p>
                  Rich collaborative document editor powered by slash commands. Embed work items, sub-tasks, and code
                  blocks directly inside architectural specs.
                </p>
              </div>
              <div className="product-bento-visual">
                <WikiBentoVisual />
              </div>
            </Link>

            {/* 4. Bring Your Own AI Key */}
            <Link href="/features" className="product-bento-card">
              <div className="product-bento-header">
                <div className="product-tag">
                  <TriageIcon size={14} /> Multi-Provider AI Integration
                </div>
                <h3>7 AI providers with direct key integration</h3>
                <p>
                  Connect your API keys across Anthropic, OpenAI, Google, xAI, Mistral, DeepSeek, and Groq. Draft
                  titles, expand specs, and run workspace agent panels.
                </p>
              </div>
              <div className="product-bento-visual">
                <ByoAiBentoVisual />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. FEATURE HIGHLIGHTS */}
      <section aria-label="Engineered for Software Teams" className="section-pad">
        <div className="shell">
          <div className="section-header center">
            <span className="label-badge">BUILT FOR ENGINEERS</span>
            <h2 className="font-heading">Designed for density, speed, and quiet chrome</h2>
          </div>

          <div className="feature-spotlight-grid">
            <div className="feature-spotlight-card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                <ZapIcon size={18} style={{ color: "var(--accent)", flexShrink: 0 }} />
                <h3 style={{ fontSize: "1.15rem", margin: 0, fontWeight: 600 }}>Cmd+K Command Palette</h3>
              </div>
              <p style={{ color: "var(--fg-muted)", margin: 0, fontSize: "0.9375rem", lineHeight: "1.6" }}>
                Universal{" "}
                <code
                  style={{
                    color: "var(--accent)",
                    background: "var(--badge-bg)",
                    padding: "0.15rem 0.4rem",
                    borderRadius: "6px",
                  }}
                >
                  Cmd+K
                </code>{" "}
                palette to jump between projects, toggle views, create work items, and search context instantly.
              </p>
            </div>

            <div className="feature-spotlight-card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                <TargetIcon size={18} style={{ color: "var(--accent)", flexShrink: 0 }} />
                <h3 style={{ fontSize: "1.15rem", margin: 0, fontWeight: 600 }}>Modules &amp; Roadmaps</h3>
              </div>
              <p style={{ color: "var(--fg-muted)", margin: 0, fontSize: "0.9375rem", lineHeight: "1.6" }}>
                Group complex initiatives into strategic modules. Track multi-quarter engineering progress with
                automatic completion rollups and assignees.
              </p>
            </div>

            <div className="feature-spotlight-card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                <TriageIcon size={18} style={{ color: "var(--accent)", flexShrink: 0 }} />
                <h3 style={{ fontSize: "1.15rem", margin: 0, fontWeight: 600 }}>Triage Inbox &amp; Project Chat</h3>
              </div>
              <p style={{ color: "var(--fg-muted)", margin: 0, fontSize: "0.9375rem", lineHeight: "1.6" }}>
                Accept inbound requests into an isolated triage inbox, and converse with your team directly inside
                per-project discussion threads.
              </p>
            </div>

            <div className="feature-spotlight-card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                <PaletteIcon size={18} style={{ color: "var(--accent)", flexShrink: 0 }} />
                <h3 style={{ fontSize: "1.15rem", margin: 0, fontWeight: 600 }}>Theming &amp; Accent Pickers</h3>
              </div>
              <p style={{ color: "var(--fg-muted)", margin: 0, fontSize: "0.9375rem", lineHeight: "1.6" }}>
                First-class Light, Dark, and High-Contrast modes, plus eight accent colors that users select
                independently of light-vs-dark settings.
              </p>
            </div>

            <div className="feature-spotlight-card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                <LinkIcon size={18} style={{ color: "var(--accent)", flexShrink: 0 }} />
                <h3 style={{ fontSize: "1.15rem", margin: 0, fontWeight: 600 }}>
                  Custom States &amp; Work Item Relations
                </h3>
              </div>
              <p style={{ color: "var(--fg-muted)", margin: 0, fontSize: "0.9375rem", lineHeight: "1.6" }}>
                Define custom workflow states, priority levels, estimates, sub-items, and relations (blocking,
                duplicate, related) to reflect your engineering flow.
              </p>
            </div>

            <div className="feature-spotlight-card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                <LockIcon size={18} style={{ color: "var(--accent)", flexShrink: 0 }} />
                <h3 style={{ fontSize: "1.15rem", margin: 0, fontWeight: 600 }}>Role-Based Access &amp; Saved Views</h3>
              </div>
              <p style={{ color: "var(--fg-muted)", margin: 0, fontSize: "0.9375rem", lineHeight: "1.6" }}>
                Granular member, admin, and guest permissions across projects, combined with saved shareable filter sets
                for every teammate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FINAL CALL TO ACTION */}
      <section aria-label="Call to action" className="section-pad" style={{ textAlign: "center" }}>
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
              Experience the speed, quiet chrome, and freedom of a modern hosted work management workspace.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <a href={`${APP}/sign-up`} className="btn btn-brand btn-lg">
                Launch Workspace
              </a>
              <a href={`mailto:${SALES_EMAIL}`} className="btn btn-secondary btn-lg">
                Talk to sales
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
