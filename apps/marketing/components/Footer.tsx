import Link from "next/link";

import { Mark } from "./Mark";

const REPO = "https://github.com/MuhammadRafay7/keel";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="foot">
          <Link href="/" className="logo">
            <Mark className="logo-mark" />
            <b>Keel</b>
          </Link>
          <div className="foot-links">
            <Link href="/features">Features</Link>
            <Link href="/changelog">Changelog</Link>
            <Link href="/docs">Docs</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <a href={REPO}>Source</a>
          </div>
        </div>
        <p className="fine">
          Keel is open source under the GNU Affero General Public License v3.0. The complete source of this version is{" "}
          <a href={REPO}>available here</a>.
        </p>
      </div>
    </footer>
  );
}
