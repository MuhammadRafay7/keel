"use client";

import { useState } from "react";
import Link from "next/link";
import { Mark } from "./Mark";
import { ThemeToggle } from "./ThemeToggle";

const APP = "https://app.keel.ostenmark.com";

export function Header() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="shell nav">
        {/* Brand Logo & Wordmark */}
        <Link href="/" className="logo">
          <Mark className="logo-mark" />
          <b style={{ color: "var(--fg)" }}>Keel</b>
        </Link>

        {/* Desktop Navigation Links with Interactive Dropdowns */}
        <nav className="nav-menu" onMouseLeave={() => setActiveDropdown(null)}>
          {/* Product Dropdown */}
          <div className="nav-item" onMouseEnter={() => setActiveDropdown("product")}>
            <button
              type="button"
              className={`nav-link-btn ${activeDropdown === "product" ? "active" : ""}`}
              onClick={() => setActiveDropdown(activeDropdown === "product" ? null : "product")}
            >
              Product
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: "2px" }}>
                <path
                  d="M2.5 4.5L6 8L9.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {activeDropdown === "product" && (
              <div className="nav-dropdown">
                <Link href="/features" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
                  <span className="dropdown-item-title">Projects &amp; Work Items</span>
                  <span className="dropdown-item-desc">Plan, track, and ship with issues, cycles, and modules</span>
                </Link>
                <Link href="/docs" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
                  <span className="dropdown-item-title">Pages &amp; Wiki</span>
                  <span className="dropdown-item-desc">Collaborative rich-text docs tied directly to work</span>
                </Link>
                <Link href="/features" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
                  <span className="dropdown-item-title">Keel AI</span>
                  <span className="dropdown-item-desc">Autonomous agents and workspace context graph</span>
                </Link>
                <Link href="/features" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
                  <span className="dropdown-item-title">Intake Triage</span>
                  <span className="dropdown-item-desc">Triage incoming requests before touching backlogs</span>
                </Link>
              </div>
            )}
          </div>

          {/* Solutions Dropdown */}
          <div className="nav-item" onMouseEnter={() => setActiveDropdown("solutions")}>
            <button
              type="button"
              className={`nav-link-btn ${activeDropdown === "solutions" ? "active" : ""}`}
              onClick={() => setActiveDropdown(activeDropdown === "solutions" ? null : "solutions")}
            >
              Solutions
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: "2px" }}>
                <path
                  d="M2.5 4.5L6 8L9.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {activeDropdown === "solutions" && (
              <div className="nav-dropdown">
                <Link href="/about" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
                  <span className="dropdown-item-title">Enterprise Teams</span>
                  <span className="dropdown-item-desc">SOC 2, SAML SSO, air-gapped deployments</span>
                </Link>
                <Link href="/about" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
                  <span className="dropdown-item-title">Engineering &amp; Agile</span>
                  <span className="dropdown-item-desc">Cycles, sprint velocity, and Git synchronization</span>
                </Link>
                <Link href="/about" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
                  <span className="dropdown-item-title">Startups &amp; Growing Teams</span>
                  <span className="dropdown-item-desc">Fast onboarding and high-speed execution</span>
                </Link>
              </div>
            )}
          </div>

          {/* Resources Dropdown */}
          <div className="nav-item" onMouseEnter={() => setActiveDropdown("resources")}>
            <button
              type="button"
              className={`nav-link-btn ${activeDropdown === "resources" ? "active" : ""}`}
              onClick={() => setActiveDropdown(activeDropdown === "resources" ? null : "resources")}
            >
              Resources
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: "2px" }}>
                <path
                  d="M2.5 4.5L6 8L9.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {activeDropdown === "resources" && (
              <div className="nav-dropdown">
                <Link href="/docs" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
                  <span className="dropdown-item-title">Documentation</span>
                  <span className="dropdown-item-desc">Guides, tutorials, and configuration references</span>
                </Link>
                <Link href="/changelog" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
                  <span className="dropdown-item-title">Changelog</span>
                  <span className="dropdown-item-desc">Latest product updates and release notes</span>
                </Link>
                <Link href="/about" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
                  <span className="dropdown-item-title">Customer Stories</span>
                  <span className="dropdown-item-desc">How engineering teams scale with Keel</span>
                </Link>
              </div>
            )}
          </div>

          <Link href="/about" className="nav-link-btn">
            Pricing
          </Link>
          <Link href="/docs" className="nav-link-btn">
            Self-host Keel
          </Link>
        </nav>

        {/* Right Nav Actions */}
        <div className="nav-actions">
          <ThemeToggle />
          <Link href="/contact" className="btn btn-quiet btn-sm" style={{ display: "none" }}>
            Contact sales
          </Link>
          <a className="btn btn-quiet btn-sm" href={APP}>
            Login
          </a>
          <a className="btn btn-inverse btn-sm" href={`${APP}/sign-up`}>
            Get started free
          </a>
          <button
            type="button"
            className="mobile-menu-btn"
            aria-label="Toggle navigation"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <Link
            href="/features"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: "1.1rem", fontWeight: 600 }}
          >
            Features
          </Link>
          <Link href="/docs" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: "1.1rem", fontWeight: 600 }}>
            Documentation
          </Link>
          <Link
            href="/changelog"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: "1.1rem", fontWeight: 600 }}
          >
            Changelog
          </Link>
          <Link href="/about" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: "1.1rem", fontWeight: 600 }}>
            About &amp; Pricing
          </Link>
          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: "1.1rem", fontWeight: 600 }}
          >
            Contact Sales
          </Link>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
            <a className="btn btn-secondary" href={APP}>
              Login
            </a>
            <a className="btn btn-inverse" href={`${APP}/sign-up`}>
              Get started free
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
