import Link from "next/link";
import { Mark } from "./Mark";
import { ThemeToggle } from "./ThemeToggle";

const APP = "https://app.keel.ostenmark.com";

export function Header() {
  return (
    <header className="site-header">
      <div className="shell nav">
        <Link href="/" className="logo">
          <Mark className="logo-mark" />
          <b>Keel</b>
        </Link>
        <nav className="nav-links">
          <Link href="/features">Features</Link>
          <Link href="/changelog">Changelog</Link>
          <Link href="/docs">Docs</Link>
          <Link href="/about">About</Link>
        </nav>
        <div className="nav-actions">
          <ThemeToggle />
          <a className="btn btn-quiet" href={APP}>
            Sign in
          </a>
          <a className="btn btn-accent" href={APP}>
            Get started
          </a>
        </div>
      </div>
    </header>
  );
}
