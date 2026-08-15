import { Reveal } from "@/components/Reveal";

export const metadata = { title: "Features" };

const APP = "https://app.keel.ostenmark.com";

export default function Page() {
  return (
    <>
      <section className="page-head">
        <div className="shell">
          <p className="label">Features</p>
          <h1>What Keel actually does</h1>
        </div>
      </section>

      <section className="pad">
        <div className="shell two">
          <Reveal>
            <div>
              <p className="label">Work items</p>
              <h2>The unit everything hangs off.</h2>
              <p className="section-lede">
                An item carries state, priority, assignees, labels, estimates and dates. It nests into sub-items and
                links to other items as blocking, blocked-by, duplicate or related — so dependencies are recorded rather
                than remembered.
              </p>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="cards c2" style={{ marginTop: 0 }}>
              <div className="card">
                <h3>Rich descriptions</h3>
                <p>Full text editing with file uploads, embeds and references to other items.</p>
              </div>
              <div className="card">
                <h3>Activity and comments</h3>
                <p>Every change recorded, with threaded discussion and reactions on the item itself.</p>
              </div>
              <div className="card">
                <h3>Sub-items</h3>
                <p>Break a large item down without losing the parent&rsquo;s view of progress.</p>
              </div>
              <div className="card">
                <h3>Custom states</h3>
                <p>Define your own workflow per project, grouped into backlog, started, done and cancelled.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="band pad">
        <div className="shell">
          <Reveal>
            <p className="label">Planning</p>
            <h2>Cycles for rhythm, modules for structure.</h2>
            <p className="section-lede">
              The two group work differently on purpose. Cycles are about time; modules are about shape.
            </p>
          </Reveal>
          <Reveal delay={80}>
            <div className="cards c2">
              <div className="card">
                <h3>Cycles</h3>
                <p>
                  Time-boxed periods with a start and end date. Burn-down shows whether you will land, and finished
                  cycles archive themselves. Unfinished work transfers forward rather than quietly disappearing.
                </p>
              </div>
              <div className="card">
                <h3>Modules</h3>
                <p>
                  Durable groupings that outlive any single cycle, for splitting a large project into shippable pieces.
                  Each tracks its own progress independently.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="pad">
        <div className="shell">
          <Reveal>
            <p className="label">Views</p>
            <h2>Five layouts, any grouping.</h2>
            <p className="section-lede">
              The same work items render as a list, a board, a calendar, a spreadsheet or a timeline. Group and filter
              by any property, then save that combination as a view — private to you or shared with the project.
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

      <section className="band pad">
        <div className="shell">
          <Reveal>
            <p className="label">Documents and triage</p>
            <h2>The context around the work.</h2>
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
                <p>Charts across the whole workspace, so you can see where work is piling up before it stalls.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="pad">
        <div className="shell cta-band">
          <Reveal>
            <h2>See it for yourself.</h2>
            <p className="section-lede">Create an account and start a project.</p>
            <div className="cta-row">
              <a className="btn btn-accent" href={APP}>
                Get started
              </a>
              <a className="btn btn-outline" href="/docs">
                Read the docs
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
