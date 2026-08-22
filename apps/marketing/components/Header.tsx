"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Mark } from "./Mark";
import { ThemeToggle } from "./ThemeToggle";

const APP = "https://app.keel.ostenmark.com";
const SALES_EMAIL = "sales@ostenmark.com";

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
        <Link href="/" className="logo" aria-label="Keel Home">
          <Mark className="logo-mark" />
          <span style={{ color: "var(--fg)", fontWeight: 700, fontSize: "1.25rem" }}>Keel</span>
        </Link>

        {/* Desktop Navigation */}
        <nav ref={navRef} className="nav-menu" aria-label="Main Navigation" onMouseLeave={handleMouseLeave}>
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
                  <span className="dropdown-item-desc">
                    List, Board, Calendar, Table spreadsheet &amp; Timeline Gantt
                  </span>
                </Link>
                <Link href="/features" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
                  <span className="dropdown-item-title">🔄 Cycles &amp; Sprints</span>
                  <span className="dropdown-item-desc">
                    Time-boxed iterations, scope locking &amp; burndown tracking
                  </span>
                </Link>
                <Link href="/features" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
                  <span className="dropdown-item-title">📦 Modules &amp; Roadmaps</span>
                  <span className="dropdown-item-desc">Multi-sprint feature initiatives and milestone rollups</span>
                </Link>
                <Link href="/features" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
                  <span className="dropdown-item-title">📖 Pages &amp; Collaborative Docs</span>
                  <span className="dropdown-item-desc">Rich documents tied directly to active work items</span>
                </Link>
                <Link href="/features" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
                  <span className="dropdown-item-title">🔑 Bring Your Own AI Key</span>
                  <span className="dropdown-item-desc">Direct Anthropic, OpenAI, Google, Groq API key integration</span>
                </Link>
              </div>
            )}
          </div>

          <Link href="/features" className="nav-link-btn">
            Features
          </Link>
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
          <a href={`mailto:${SALES_EMAIL}`} className="btn btn-secondary btn-sm">
            Talk to sales
          </a>
          <a href={`${APP}/sign-in`} className="btn btn-brand btn-sm">
            Launch Workspace
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
          <Link href="/contact" className="nav-link-btn" onClick={() => setMobileMenuOpen(false)}>
            Contact
          </Link>
          <a href={`mailto:${SALES_EMAIL}`} className="btn btn-secondary">
            Talk to sales
          </a>
          <a href={`${APP}/sign-in`} className="btn btn-brand">
            Launch Workspace
          </a>
        </div>
      )}
    </header>
  );
}
