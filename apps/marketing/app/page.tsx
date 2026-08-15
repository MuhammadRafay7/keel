import { HullScene } from "@/components/HullScene";
import { Reveal } from "@/components/Reveal";

const APP = "https://app.keel.ostenmark.com";
const REPO = "https://github.com/MuhammadRafay7/keel";

export default function Home() {
  return (
    <>
      <section className="hero">
        <HullScene />
        <div className="shell">
          <div className="hero-inner">
            <p className="eyebrow">
              <span className="dot" /> Open source project management
            </p>
            <h1>
              Work that keeps
              <br />
              its course.
            </h1>
            <p className="lede">
              Keel tracks what your team is doing — items, cycles, modules and roadmaps — with the documents and triage
              that go around them. Built on Postgres, and yours to run.
            </p>
            <div className="cta-row">
              <a className="btn btn-accent" href={APP}>
                Create an account
              </a>
              <a className="btn btn-outline" href={REPO}>
                Read the source
              </a>
            </div>
            <ul className="capabilities">
              <li>Work items</li>
              <li>Cycles</li>
              <li>Modules</li>
              <li>Views</li>
              <li>Pages</li>
              <li>Intake</li>
              <li>Analytics</li>
            </ul>
          </div>
        </div>
        <p className="hero-hint">Drag to turn the hull</p>
      </section>

      <section className="pad">
        <div className="shell two">
          <Reveal>
            <div>
              <p className="label">The work</p>
              <h2>Everything hangs off a work item.</h2>
              <p className="section-lede">
                State, priority, assignees, labels, estimates and dates. Items nest into sub-items and link to each
                other as blocking, duplicate or related — so the shape of the work is visible rather than folklore.
              </p>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="cards c2" style={{ marginTop: 0 }}>
              <div className="card">
                <svg className="icon" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="15" stroke="currentColor" strokeWidth="4" />
                  <path d="M24 14v10l7 4" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
                <h3>Cycles</h3>
                <p>Time-boxed sprints with burn-down tracking. Completed cycles archive themselves.</p>
              </div>
              <div className="card">
                <svg className="icon" viewBox="0 0 48 48" fill="none">
                  <path d="M8 12h32M8 24h20M8 36h26" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
                <h3>Modules</h3>
                <p>Durable groupings that cut across cycles, for splitting a large project into shippable pieces.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="band pad">
        <div className="shell">
          <Reveal>
            <p className="label">The view</p>
            <h2>Look at the same work five different ways.</h2>
            <p className="section-lede">
              Group and filter by any property, then save the combination as a view — private to you, or shared with the
              team.
            </p>
            <div className="chips">
              <span className="chip">LIST</span>
              <span className="chip">BOARD</span>
              <span className="chip">CALENDAR</span>
              <span className="chip">SPREADSHEET</span>
              <span className="chip">TIMELINE</span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="pad">
        <div className="shell">
          <Reveal>
            <p className="label">Around the work</p>
            <h2>Docs and triage, in the same place.</h2>
          </Reveal>
          <Reveal delay={80}>
            <div className="cards c3">
              <div className="card">
                <h3>Pages</h3>
                <p>
                  Collaborative rich-text documents, edited by several people at once. Turn a paragraph into a work item
                  without leaving the page.
                </p>
              </div>
              <div className="card">
                <h3>Intake</h3>
                <p>
                  Requests land in a triage inbox first. Accept, decline, snooze or merge as duplicate before anything
                  reaches the backlog.
                </p>
              </div>
              <div className="card">
                <h3>Analytics</h3>
                <p>Charts across the workspace, so you can see where work is piling up before it stalls.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="band pad">
        <div className="shell cta-band">
          <Reveal>
            <p className="label">Get started</p>
            <h2>Open source, and yours to run.</h2>
            <p className="section-lede">
              Keel is AGPL-licensed. Use the hosted version, or read the source and run it yourself.
            </p>
            <div className="cta-row">
              <a className="btn btn-accent" href={APP}>
                Create an account
              </a>
              <a className="btn btn-outline" href={REPO}>
                View on GitHub
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
