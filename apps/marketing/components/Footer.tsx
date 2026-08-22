import Link from "next/link";
import { Mark } from "./Mark";

const APP = "https://app.keel.ostenmark.com";
const SALES_EMAIL = "sales@ostenmark.com";

export function Footer() {
  return (
    <footer className="mega-footer">
      <div className="shell">
        {/* Footer Top: Brand & Hosted Status Badges */}
        <div className="footer-top">
          <Link href="/" className="logo" aria-label="Keel Home">
            <Mark className="logo-mark" />
            <span style={{ color: "var(--fg)", fontWeight: 700 }}>Keel</span>
          </Link>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: "0.75rem",
                fontFamily: "var(--mono)",
                border: "1px solid var(--badge-border)",
                background: "var(--badge-bg)",
                padding: "0.35rem 0.85rem",
                borderRadius: "9999px",
                color: "var(--accent)",
                fontWeight: 600,
              }}
            >
              ⚡️ Hosted &amp; Ready Immediately
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                fontFamily: "var(--mono)",
                border: "1px solid var(--surface-glass-border)",
                background: "var(--surface-glass)",
                padding: "0.35rem 0.85rem",
                borderRadius: "9999px",
                color: "var(--fg-muted)",
              }}
            >
              🔑 Bring Your Own AI Key
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                fontFamily: "var(--mono)",
                border: "1px solid var(--surface-glass-border)",
                background: "var(--surface-glass)",
                padding: "0.35rem 0.85rem",
                borderRadius: "9999px",
                color: "var(--fg-muted)",
              }}
            >
              🛡️ Enterprise Ready
            </span>
          </div>
        </div>

        {/* 4-Column Clean Links Grid */}
        <div className="footer-grid">
          {/* Col 1: Product */}
          <div className="footer-col">
            <h4>Product</h4>
            <ul>
              <li>
                <Link href="/features">5 Dynamic Work Views</Link>
              </li>
              <li>
                <Link href="/features">Cycles &amp; Sprints</Link>
              </li>
              <li>
                <Link href="/features">Modules &amp; Roadmaps</Link>
              </li>
              <li>
                <Link href="/features">Pages &amp; Collaborative Docs</Link>
              </li>
              <li>
                <Link href="/features">Bring Your Own AI Key</Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Capabilities */}
          <div className="footer-col">
            <h4>Capabilities</h4>
            <ul>
              <li>
                <Link href="/features">Cmd+K Command Palette</Link>
              </li>
              <li>
                <Link href="/features">Project Chat &amp; Triage</Link>
              </li>
              <li>
                <Link href="/features">Saved Filters &amp; Views</Link>
              </li>
              <li>
                <Link href="/features">Custom Workflow States</Link>
              </li>
              <li>
                <Link href="/about">Quiet Chrome UX</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources */}
          <div className="footer-col">
            <h4>Resources</h4>
            <ul>
              <li>
                <Link href="/docs">Documentation</Link>
              </li>
              <li>
                <Link href="/changelog">Changelog</Link>
              </li>
              <li>
                <Link href="/about">About Keel</Link>
              </li>
              <li>
                <Link href="/contact">Contact Support</Link>
              </li>
              <li>
                <a href={`mailto:${SALES_EMAIL}`}>Talk to sales</a>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & App */}
          <div className="footer-col">
            <h4>Application</h4>
            <ul>
              <li>
                <a href={`${APP}/sign-in`}>Sign In</a>
              </li>
              <li>
                <a href={`${APP}/sign-up`}>Launch Workspace</a>
              </li>
              <li>
                <Link href="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms">Terms of Service</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div>&copy; {new Date().getFullYear()} Keel. Hosted work management for software teams.</div>
          <div style={{ display: "flex", gap: "1.25rem" }}>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <a href={`mailto:${SALES_EMAIL}`}>Talk to sales</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
