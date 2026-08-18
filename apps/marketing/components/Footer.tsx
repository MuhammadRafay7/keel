import Link from "next/link";
import { Mark } from "./Mark";

const REPO = "https://github.com/MuhammadRafay7/keel";
const APP = "https://app.keel.ostenmark.com";

export function Footer() {
  return (
    <footer className="mega-footer">
      <div className="shell">
        {/* Footer Top: Logo & Open Source License Badge */}
        <div className="footer-top">
          <Link href="/" className="logo">
            <Mark className="logo-mark" />
            <b style={{ color: "var(--fg)" }}>Keel</b>
          </Link>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: "0.75rem",
                fontFamily: "var(--mono)",
                border: "1px solid var(--surface-glass-border)",
                background: "var(--badge-bg)",
                padding: "0.35rem 0.85rem",
                borderRadius: "9999px",
                color: "var(--accent)",
                fontWeight: 600,
              }}
            >
              🔓 AGPL-3.0 Open Source
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
              🐳 Docker Ready
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
              🔒 100% Data Sovereignty
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
                <Link href="/features">5 Dynamic Views</Link>
              </li>
              <li>
                <Link href="/features">Cycles &amp; Sprints</Link>
              </li>
              <li>
                <Link href="/features">Modules &amp; Roadmaps</Link>
              </li>
              <li>
                <Link href="/docs">Pages &amp; Docs</Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Platform */}
          <div className="footer-col">
            <h4>Platform</h4>
            <ul>
              <li>
                <Link href="/about">Docker Self-Hosting</Link>
              </li>
              <li>
                <Link href="/about">Data Sovereignty</Link>
              </li>
              <li>
                <a href={REPO} target="_blank" rel="noreferrer">
                  GitHub Repository
                </a>
              </li>
              <li>
                <a href={`${REPO}/blob/staging/COPYRIGHT.txt`} target="_blank" rel="noreferrer">
                  AGPL-3.0 License
                </a>
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
                <Link href="/contact">Contact &amp; Support</Link>
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
                <a href={`${APP}/sign-up`}>Create Workspace</a>
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
          <div>&copy; {new Date().getFullYear()} Keel Contributors. Open source work management.</div>
          <div style={{ display: "flex", gap: "1.25rem" }}>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <a href={REPO} target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
