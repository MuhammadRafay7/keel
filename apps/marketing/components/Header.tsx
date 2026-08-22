"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Mark } from "./Mark";
import { ThemeToggle } from "./ThemeToggle";

const APP = "https://app.keel.ostenmark.com";
const REPO = "https://github.com/MuhammadRafay7/keel";

export function Header() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement | null>(null);

  const handleMouseEnter = (menu: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <header className="site-header">
      <div className="shell nav">
        {/* Brand Logo */}
        <Link href="/" className="logo">
          <Mark className="logo-mark" />
          <b style={{ color: "var(--fg)", fontSize: "1.25rem" }}>Keel</b>
        </Link>

        {/* Desktop Navigation */}
        <nav ref={navRef} className="nav-menu" onMouseLeave={handleMouseLeave}>
          {/* Product Dropdown */}
          <div className="nav-item" onMouseEnter={() => handleMouseEnter("product")}>
            <button
              type="button"
              className={`nav-link-btn ${activeDropdown === "product" ? "active" : ""}`}
              onClick={() => setActiveDropdown(activeDropdown === "product" ? null : "product")}
              aria-expanded={activeDropdown === "product"}
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
              <div className="nav-dropdown" onMouseEnter={() => handleMouseEnter("product")}>
                <Link href="/features" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
                  <span className="dropdown-item-title">📋 5 Dynamic Work Views</span>
                  <span className="dropdown-item-desc">List, Kanban, Calendar, Gantt, and Spreadsheet grids</span>
                </Link>
                <Link href="/features" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
                  <span className="dropdown-item-title">🔄 Cycles &amp; Sprints</span>
                  <span className="dropdown-item-desc">Sprint planning, scope locking, and burndown velocity</span>
                </Link>
                <Link href="/features" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
                  <span className="dropdown-item-title">📦 Modules &amp; Epics</span>
                  <span className="dropdown-item-desc">Strategic milestones, roadmap tracking, and rollups</span>
                </Link>
                <Link href="/docs" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
                  <span className="dropdown-item-title">📖 Pages &amp; Collaborative Docs</span>
                  <span className="dropdown-item-desc">Rich markdown with slash commands linked to tasks</span>
                </Link>
              </div>
            )}
          </div>

          {/* Solutions / Platform Dropdown */}
          <div className="nav-item" onMouseEnter={() => handleMouseEnter("platform")}>
            <button
              type="button"
              className={`nav-link-btn ${activeDropdown === "platform" ? "active" : ""}`}
              onClick={() => setActiveDropdown(activeDropdown === "platform" ? null : "platform")}
              aria-expanded={activeDropdown === "platform"}
            >
              Platform
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

            {activeDropdown === "platform" && (
              <div className="nav-dropdown" onMouseEnter={() => handleMouseEnter("platform")}>
                <Link href="/about" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
                  <span className="dropdown-item-title">🐳 Docker Self-Hosting</span>
                  <span className="dropdown-item-desc">Deploy in minutes with Docker Compose or Kubernetes</span>
                </Link>
                <a
                  href={REPO}
                  target="_blank"
                  rel="noreferrer"
                  className="dropdown-item"
                  onClick={() => setActiveDropdown(null)}
                >
                  <span className="dropdown-item-title">🔓 Open Source (AGPL-3.0)</span>
                  <span className="dropdown-item-desc">Full source code access and true data sovereignty</span>
                </a>
                <Link href="/docs" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
                  <span className="dropdown-item-title">⚡️ Architecture &amp; REST APIs</span>
                  <span className="dropdown-item-desc">Next.js, MobX reactive state, and Django backend</span>
                </Link>
              </div>
            )}
          </div>

          <Link href="/about" className="nav-link-btn">
            About
          </Link>
          <Link href="/docs" className="nav-link-btn">
            Docs
          </Link>
          <Link href="/changelog" className="nav-link-btn">
            Changelog
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="nav-actions">
          <ThemeToggle />
          <a
            href={REPO}
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub</span>
          </a>
          <a href={`${APP}/sign-in`} className="btn btn-inverse btn-sm">
            Launch App
          </a>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <Link href="/features" className="nav-link-btn" onClick={() => setMobileMenuOpen(false)}>
            Features
          </Link>
          <Link href="/about" className="nav-link-btn" onClick={() => setMobileMenuOpen(false)}>
            About
          </Link>
          <Link href="/docs" className="nav-link-btn" onClick={() => setMobileMenuOpen(false)}>
            Documentation
          </Link>
          <Link href="/changelog" className="nav-link-btn" onClick={() => setMobileMenuOpen(false)}>
            Changelog
          </Link>
          <a href={REPO} target="_blank" rel="noreferrer" className="btn btn-secondary">
            GitHub Repository
          </a>
          <a href={`${APP}/sign-in`} className="btn btn-inverse">
            Launch App
          </a>
        </div>
      )}
    </header>
  );
}
