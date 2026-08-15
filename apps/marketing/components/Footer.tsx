import Link from "next/link";
import { Mark } from "./Mark";

const REPO = "https://github.com/MuhammadRafay7/keel";
const APP = "https://app.keel.ostenmark.com";

export function Footer() {
  return (
    <footer className="mega-footer">
      <div className="shell">
        {/* Footer Top: Logo & Compliance Badges */}
        <div className="footer-top">
          <Link href="/" className="logo">
            <Mark className="logo-mark" />
            <b style={{ color: "#ffffff" }}>Plane</b>
          </Link>

          <div className="footer-compliance-badges">
            <span
              style={{
                fontSize: "0.75rem",
                fontFamily: "var(--mono)",
                border: "1px solid #334155",
                padding: "0.35rem 0.75rem",
                borderRadius: "999px",
                color: "#cbd5e1",
              }}
            >
              ✓ SOC 2 Type II
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                fontFamily: "var(--mono)",
                border: "1px solid #334155",
                padding: "0.35rem 0.75rem",
                borderRadius: "999px",
                color: "#cbd5e1",
              }}
            >
              ✓ ISO 27001
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                fontFamily: "var(--mono)",
                border: "1px solid #334155",
                padding: "0.35rem 0.75rem",
                borderRadius: "999px",
                color: "#cbd5e1",
              }}
            >
              ✓ GDPR &amp; HIPAA
            </span>
          </div>
        </div>

        {/* 6-Column Links Grid */}
        <div className="footer-grid">
          {/* Col 1 */}
          <div className="footer-col">
            <h4>Product</h4>
            <ul>
              <li>
                <Link href="/features">Project Management</Link>
              </li>
              <li>
                <Link href="/docs">Wiki &amp; Docs</Link>
              </li>
              <li>
                <Link href="/features">Plane AI</Link>
              </li>
              <li>
                <Link href="/features">Plane Compose</Link>
              </li>
            </ul>
            <h4 style={{ marginTop: "1.75rem" }}>Self-hosted</h4>
            <ul>
              <li>
                <Link href="/docs">Commercial Edition</Link>
              </li>
              <li>
                <Link href="/docs">Airgapped Edition</Link>
              </li>
              <li>
                <Link href="/docs">Prime Portal</Link>
              </li>
            </ul>
          </div>

          {/* Col 2 */}
          <div className="footer-col">
            <h4>Features</h4>
            <ul>
              <li>
                <Link href="/features">Work items</Link>
              </li>
              <li>
                <Link href="/features">Work item types</Link>
              </li>
              <li>
                <Link href="/features">Intake Triage</Link>
              </li>
              <li>
                <Link href="/features">Cycles &amp; Sprints</Link>
              </li>
              <li>
                <Link href="/features">Workflows &amp; Approvals</Link>
              </li>
              <li>
                <Link href="/features">Epics &amp; Initiatives</Link>
              </li>
              <li>
                <Link href="/features">Dashboards</Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="footer-col">
            <h4>Plans &amp; Pricing</h4>
            <ul>
              <li>
                <Link href="/about">Pro Plan</Link>
              </li>
              <li>
                <Link href="/about">Business Plan</Link>
              </li>
              <li>
                <Link href="/about">Enterprise-grid</Link>
              </li>
            </ul>
            <h4 style={{ marginTop: "1.75rem" }}>Use Cases</h4>
            <ul>
              <li>
                <Link href="/about">Engineering</Link>
              </li>
              <li>
                <Link href="/about">Agile Teams</Link>
              </li>
              <li>
                <Link href="/about">Product Management</Link>
              </li>
              <li>
                <Link href="/about">Operations</Link>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="footer-col">
            <h4>Industries</h4>
            <ul>
              <li>
                <Link href="/about">Aerospace</Link>
              </li>
              <li>
                <Link href="/about">Defense</Link>
              </li>
              <li>
                <Link href="/about">Healthcare</Link>
              </li>
              <li>
                <Link href="/about">Government</Link>
              </li>
              <li>
                <Link href="/about">Finance</Link>
              </li>
            </ul>
            <h4 style={{ marginTop: "1.75rem" }}>Compare</h4>
            <ul>
              <li>
                <Link href="/about">Plane vs Jira</Link>
              </li>
              <li>
                <Link href="/about">Plane vs Linear</Link>
              </li>
              <li>
                <Link href="/about">Plane vs ClickUp</Link>
              </li>
              <li>
                <Link href="/about">Plane vs Monday</Link>
              </li>
            </ul>
          </div>

          {/* Col 5 */}
          <div className="footer-col">
            <h4>Learn</h4>
            <ul>
              <li>
                <Link href="/changelog">The Plane Blog</Link>
              </li>
              <li>
                <Link href="/changelog">What&apos;s New (Changelog)</Link>
              </li>
              <li>
                <Link href="/docs">Documentation</Link>
              </li>
              <li>
                <Link href="/docs">Developer API Docs</Link>
              </li>
            </ul>
            <h4 style={{ marginTop: "1.75rem" }}>Support</h4>
            <ul>
              <li>
                <Link href="/contact">Support Forum</Link>
              </li>
              <li>
                <Link href="/contact">System Status</Link>
              </li>
              <li>
                <Link href="/contact">Talk to Sales</Link>
              </li>
            </ul>
          </div>

          {/* Col 6 */}
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li>
                <Link href="/about">About Plane</Link>
              </li>
              <li>
                <Link href="/terms">Terms &amp; Conditions</Link>
              </li>
              <li>
                <Link href="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/about">Security Standards</Link>
              </li>
              <li>
                <a href={REPO}>GitHub Repository</a>
              </li>
            </ul>
            <h4 style={{ marginTop: "1.75rem" }}>Action</h4>
            <ul>
              <li>
                <a href={`${APP}/sign-up`}>Get Started Free</a>
              </li>
              <li>
                <Link href="/contact">Switch to Plane</Link>
              </li>
              <li>
                <Link href="/contact">General Inquiries</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom: App Downloads & Social Links */}
        <div className="footer-bottom">
          <div className="footer-apps">
            <a href="https://github.com/makeplane/plane" target="_blank" rel="noreferrer" className="footer-app-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.54c.64-.78 1.08-1.86.96-2.94-1 .04-2.13.67-2.79 1.45-.58.68-1.1 1.77-.96 2.83 1.12.09 2.19-.56 2.79-1.34z" />
              </svg>
              Download for Mac
            </a>
            <a href="https://github.com/makeplane/plane" target="_blank" rel="noreferrer" className="footer-app-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
              </svg>
              Download for Windows
            </a>
            <a href="https://github.com/makeplane/plane" target="_blank" rel="noreferrer" className="footer-app-btn">
              Download for iOS
            </a>
            <a href="https://github.com/makeplane/plane" target="_blank" rel="noreferrer" className="footer-app-btn">
              Download for Android
            </a>
          </div>

          <div className="footer-socials">
            <a
              href="https://github.com/makeplane/plane"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="footer-social-link"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
            <a
              href="https://twitter.com/planepowers"
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter"
              className="footer-social-link"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://linkedin.com/company/planepowers"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="footer-social-link"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.2a1.64 1.64 0 1 0 1.64 1.64A1.64 1.64 0 0 0 7.83 6.2z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
