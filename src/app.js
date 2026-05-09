(function () {
  const { useEffect, useMemo, useState } = React;
  const h = React.createElement;
  const data = window.RECEPTION_DEMO_DATA;

  function cx() {
    return Array.from(arguments).filter(Boolean).join(" ");
  }

  function App() {
    const [stage, setStage] = useState(0);
    const [selectedVenues, setSelectedVenues] = useState(["atelier", "merchant"]);
    const [outreachApproved, setOutreachApproved] = useState(false);
    const [bookingApproved, setBookingApproved] = useState(false);
    const [rsvpSweep, setRsvpSweep] = useState(false);

    useEffect(() => {
      function onKey(event) {
        if (event.key === "ArrowRight") setStage((value) => Math.min(data.stages.length - 1, value + 1));
        if (event.key === "ArrowLeft") setStage((value) => Math.max(0, value - 1));
      }
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, []);

    const progress = Math.round(((stage + 1) / data.stages.length) * 100);
    const activeStageName = data.stages[stage];
    const selectedVenueNames = selectedVenues
      .map((id) => data.venues.find((venue) => venue.id === id)?.name)
      .filter(Boolean);

    const activity = useMemo(
      () => buildActivity(stage, selectedVenueNames, outreachApproved, bookingApproved, rsvpSweep),
      [stage, selectedVenueNames, outreachApproved, bookingApproved, rsvpSweep],
    );

    return h(
      "div",
      { className: "app-shell" },
      h(Header, {
        activeStageName,
        progress,
        onRestart: () => {
          setStage(0);
          setSelectedVenues(["atelier", "merchant"]);
          setOutreachApproved(false);
          setBookingApproved(false);
          setRsvpSweep(false);
        },
      }),
      h(
        "main",
        { className: "workspace" },
        h(StageRail, { stage, setStage }),
        h(
          "section",
          { className: "stage-area", "aria-live": "polite" },
          h(StageContent, {
            stage,
            setStage,
            selectedVenues,
            setSelectedVenues,
            outreachApproved,
            setOutreachApproved,
            bookingApproved,
            setBookingApproved,
            rsvpSweep,
            setRsvpSweep,
          }),
          h(DemoControls, { stage, setStage }),
        ),
        h(AgentPanel, { activity, stage, outreachApproved, bookingApproved }),
      ),
    );
  }

  function Header({ activeStageName, progress, onRestart }) {
    return h(
      "header",
      { className: "topbar" },
      h(
        "div",
        { className: "brand-lockup" },
        h("div", { className: "brand-mark", "aria-hidden": "true" }, "R"),
        h(
          "div",
          null,
          h("p", { className: "eyebrow" }, "Reception investor demo"),
          h("h1", null, "Corporate hospitality, run by an agent"),
        ),
      ),
      h(
        "div",
        { className: "topbar-actions" },
        h(
          "div",
          { className: "progress-wrap" },
          h(
            "div",
            { className: "progress-copy" },
            h("span", null, activeStageName),
            h("strong", null, `${progress}%`),
          ),
          h("div", { className: "progress-track" }, h("div", { className: "progress-bar", style: { width: `${progress}%` } })),
        ),
        h("button", { className: "icon-button", onClick: onRestart, title: "Restart demo", "aria-label": "Restart demo" }, "Restart"),
      ),
    );
  }

  function StageRail({ stage, setStage }) {
    return h(
      "nav",
      { className: "stage-rail", "aria-label": "Demo stages" },
      data.stages.map((name, index) =>
        h(
          "button",
          {
            key: name,
            className: cx("stage-tab", index === stage && "active", index < stage && "complete"),
            onClick: () => setStage(index),
          },
          h("span", { className: "stage-number" }, String(index + 1).padStart(2, "0")),
          h("span", null, name),
        ),
      ),
    );
  }

  function StageContent(props) {
    const stageComponents = [
      () => h(PortfolioStage, props),
      () => h(ConnectStage),
      () => h(BriefStage),
      () => h(SourceStage, props),
      () => h(ApproveStage, props),
      () => h(CoordinateStage),
      () => h(BookStage, props),
      () => h(InviteStage, props),
      () => h(RunStage),
      () => h(ReportStage),
      () => h(TrustStage, props),
    ];

    return h("div", { className: "stage-content" }, stageComponents[props.stage]());
  }

  function PortfolioStage({ setStage }) {
    return h(
      React.Fragment,
      null,
      h(StageHero, {
        kicker: "Monthly command center",
        title: "Ten May events, one operating surface.",
        summary:
          "Reception shows every dinner, roundtable, and off-site in flight with the owner, next decision, SLA pressure, spend, and CRM context on the same screen.",
        stat: "10",
        statLabel: "events running this month",
      }),
      h(
        "div",
        { className: "portfolio-metrics" },
        data.portfolioMetrics.map((metric) =>
          h("article", { className: "metric-card", key: metric[0] }, h("span", null, metric[0]), h("strong", null, metric[1])),
        ),
      ),
      h(
        "div",
        { className: "portfolio-layout" },
        h(
          "section",
          { className: "event-queue" },
          h(
            "div",
            { className: "section-heading" },
            h("div", null, h("p", { className: "eyebrow" }, "Live portfolio"), h("h3", null, "May event queue")),
            h("button", { className: "secondary-button", onClick: () => setStage(2) }, "Open Acme journey"),
          ),
          data.monthlyEvents.map((event) =>
            h(
              "button",
              {
                className: cx("event-row", event.id === "acme" && "featured"),
                key: event.id,
                onClick: () => (event.id === "acme" ? setStage(2) : null),
              },
              h("div", { className: "event-date" }, h("strong", null, event.date), h("span", null, event.time)),
              h(
                "div",
                { className: "event-main" },
                h("div", { className: "event-title-line" }, h("strong", null, event.account), h(StatusBadge, { status: event.health })),
                h("span", null, event.title),
              ),
              h("div", { className: "event-detail" }, h("span", null, event.city), h("strong", null, event.type)),
              h("div", { className: "event-detail" }, h("span", null, "Next action"), h("strong", null, event.nextAction)),
              h("div", { className: "event-detail" }, h("span", null, "SLA"), h("strong", null, event.sla)),
              h("div", { className: "event-detail" }, h("span", null, "Budget"), h("strong", null, event.budget)),
              h("div", { className: "event-detail" }, h("span", null, "Pipeline"), h("strong", null, event.pipeline)),
            ),
          ),
        ),
        h(
          "aside",
          { className: "portfolio-side" },
          h("div", { className: "section-heading compact" }, h("div", null, h("p", { className: "eyebrow" }, "Agent workload"), h("h3", null, "Where the month stands"))),
          h(
            "div",
            { className: "lane-stack" },
            data.portfolioLanes.map((lane) =>
              h("article", { className: "lane-card", key: lane[0] }, h("span", null, lane[0]), h("strong", null, lane[1]), h("p", null, lane[2])),
            ),
          ),
          h(
            "div",
            { className: "calendar-strip" },
            data.monthlyEvents.map((event) =>
              h(
                "button",
                { key: event.id, className: cx("calendar-chip", event.health === "At risk" && "risk", event.health === "Attention" && "attention") },
                h("span", null, event.date.replace("May ", "")),
                h("strong", null, event.account.split(" ")[0]),
              ),
            ),
          ),
          h(
            "div",
            { className: "ops-note" },
            h("strong", null, "Investor readout"),
            h("p", null, "This is the shift from a single helpful agent to a coordination layer: Reception can keep ten parallel event loops moving while only surfacing the seven decisions that need a human."),
          ),
        ),
      ),
    );
  }

  function ConnectStage() {
    return h(
      React.Fragment,
      null,
      h(StageHero, {
        kicker: "Activation",
        title: `${data.persona.name} connects the systems where event work already happens.`,
        summary:
          "Reception starts with read-broad visibility and write-narrow controls, then builds a customer-specific memory from prior dinners, accounts, and outcomes.",
        stat: "24 hr",
        statLabel: "historical backfill target",
      }),
      h(
        "div",
        { className: "connector-grid" },
        data.connectors.map((connector) =>
          h(
            "article",
            { className: "connector-card", key: connector.name },
            h("div", { className: "connector-top" }, h("h3", null, connector.name), h("span", { className: "status-pill" }, connector.status)),
            h("p", null, connector.access),
            h("strong", null, connector.signal),
          ),
        ),
      ),
      h(
        "div",
        { className: "signal-strip" },
        data.learningSignals.map((signal) => h("span", { key: signal }, signal)),
      ),
    );
  }

  function BriefStage() {
    return h(
      React.Fragment,
      null,
      h(StageHero, {
        kicker: "Natural-language brief",
        title: "Mia gives Reception the whole ask in one sentence.",
        summary:
          "The agent extracts the brief, asks only for missing judgment, and turns an unstructured request into durable event state.",
        stat: "95%",
        statLabel: "target extraction accuracy",
      }),
      h(
        "div",
        { className: "brief-layout" },
        h(
          "section",
          { className: "brief-panel" },
          h("p", { className: "chat-label" }, `${data.persona.name} to Reception`),
          h("blockquote", null, data.briefText),
          h(
            "div",
            { className: "agent-reply" },
            h("strong", null, "Reception"),
            h("p", null, "I found the account, likely attendees, budget guardrails, and prior venue preferences. I will source venues and bring back a ranked shortlist for approval."),
          ),
        ),
        h(KeyValueGrid, { items: data.extractedBrief }),
      ),
    );
  }

  function SourceStage({ selectedVenues, setSelectedVenues }) {
    function toggle(id) {
      setSelectedVenues((current) => (current.includes(id) ? current.filter((item) => item !== id) : current.concat(id)));
    }

    return h(
      React.Fragment,
      null,
      h(StageHero, {
        kicker: "Instant sourcing",
        title: "Reception ranks the venue universe, then explains why each option made the cut.",
        summary:
          "The shortlist blends public venue facts, prior Sprig events, vendor responsiveness, and the Acme opportunity context.",
        stat: "8 sec",
        statLabel: "P95 sourcing target",
      }),
      h(
        "div",
        { className: "venue-grid" },
        data.venues.map((venue) =>
          h(
            "article",
            { className: cx("venue-card", selectedVenues.includes(venue.id) && "selected"), key: venue.id },
            h("img", { src: venue.image, alt: `${venue.name} dining room` }),
            h(
              "div",
              { className: "venue-body" },
              h("div", { className: "venue-heading" }, h("h3", null, venue.name), h("span", { className: "score" }, venue.score)),
              h("p", { className: "venue-meta" }, `${venue.cuisine} in ${venue.area}`),
              h(
                "div",
                { className: "venue-facts" },
                [venue.capacity, venue.budget, venue.min, venue.reply].map((fact) => h("span", { key: fact }, fact)),
              ),
              h(
                "ul",
                { className: "reason-list" },
                venue.reasons.map((reason) => h("li", { key: reason }, reason)),
              ),
              h(
                "button",
                { className: cx("choice-button", selectedVenues.includes(venue.id) && "selected"), onClick: () => toggle(venue.id) },
                selectedVenues.includes(venue.id) ? "Approved for outreach" : "Add to outreach",
              ),
            ),
          ),
        ),
      ),
    );
  }

  function ApproveStage({ selectedVenues, outreachApproved, setOutreachApproved }) {
    const emails = data.outreach.filter((email) =>
      selectedVenues.some((id) => data.venues.find((venue) => venue.id === id)?.name === email.venue),
    );

    return h(
      React.Fragment,
      null,
      h(StageHero, {
        kicker: "Bounded autonomy",
        title: "The agent can draft and compare, but Mia approves before anything leaves her brand.",
        summary:
          "Reception applies factual, tone, and policy checks before exposing the irreversible send action.",
        stat: emails.length || 0,
        statLabel: "threads awaiting approval",
      }),
      h(
        "div",
        { className: "approval-layout" },
        h(
          "section",
          { className: "email-stack" },
          emails.map((email) =>
            h(
              "article",
              { className: "email-card", key: email.venue },
              h("div", { className: "email-head" }, h("h3", null, email.venue), h("span", null, "Draft")),
              h("p", { className: "subject" }, email.subject),
              h("p", null, email.body),
            ),
          ),
        ),
        h(
          "aside",
          { className: "gate-panel" },
          h("h3", null, "Approval gate"),
          h(CheckRow, { label: "No invented customer details", state: "Passed" }),
          h(CheckRow, { label: "Budget within guardrail", state: "Passed" }),
          h(CheckRow, { label: "External send requires Mia", state: outreachApproved ? "Approved" : "Waiting" }),
          h(
            "button",
            { className: "primary-button", onClick: () => setOutreachApproved(true) },
            outreachApproved ? "Outreach sent" : "Approve outreach",
          ),
          h("p", { className: "fine-print" }, outreachApproved ? "Vendor threads are now visible in the unified inbox." : "Drafting is reversible. Sending is not."),
        ),
      ),
    );
  }

  function CoordinateStage() {
    return h(
      React.Fragment,
      null,
      h(StageHero, {
        kicker: "Unified coordination",
        title: "Free-form restaurant replies become structured event state.",
        summary:
          "Reception parses availability, pricing, deposit terms, and next actions while keeping the full thread auditable.",
        stat: "92%",
        statLabel: "target parsing accuracy",
      }),
      h(
        "div",
        { className: "reply-grid" },
        data.vendorReplies.map((reply) =>
          h(
            "article",
            { className: "reply-card", key: reply.venue },
            h("div", { className: "reply-head" }, h("h3", null, reply.venue), h("span", null, reply.received)),
            h("p", null, reply.sentiment),
            h(KeyValueGrid, { items: Object.entries(reply.parsed), compact: true }),
            h("strong", null, reply.action),
          ),
        ),
      ),
    );
  }

  function BookStage({ bookingApproved, setBookingApproved }) {
    return h(
      React.Fragment,
      null,
      h(StageHero, {
        kicker: "Booking decision",
        title: "Reception recommends Merchant Room, with every tradeoff visible.",
        summary:
          "The winner clears the budget guardrail, has stronger reliability signal, and includes private host support for the executive-heavy guest list.",
        stat: "$600",
        statLabel: "under total budget guardrail",
      }),
      h(
        "div",
        { className: "decision-layout" },
        h(
          "section",
          { className: "winner-panel" },
          h("img", { src: "assets/venue-merchant.jpg", alt: "Merchant Room dining space" }),
          h(
            "div",
            null,
            h("p", { className: "eyebrow" }, "Recommended venue"),
            h("h2", null, "Merchant Room"),
            h("p", null, "6:30 PM hold, semi-private room for 18, $3,000 F&B minimum, 20 percent deposit."),
            h(
              "div",
              { className: "venue-facts" },
              ["Best reliability signal", "Deposit inside guardrail", "Host included", "Private enough for deal talk"].map((fact) =>
                h("span", { key: fact }, fact),
              ),
            ),
          ),
        ),
        h(
          "aside",
          { className: "gate-panel" },
          h("h3", null, "Irreversible action"),
          h(CheckRow, { label: "Place hold", state: "Needs approval" }),
          h(CheckRow, { label: "Authorize deposit", state: bookingApproved ? "Approved" : "Waiting" }),
          h(CheckRow, { label: "Calendar hold", state: bookingApproved ? "Synced" : "Queued" }),
          h(
            "button",
            { className: "primary-button", onClick: () => setBookingApproved(true) },
            bookingApproved ? "Merchant Room booked" : "Approve booking",
          ),
        ),
      ),
    );
  }

  function InviteStage({ rsvpSweep, setRsvpSweep }) {
    const rows = rsvpSweep
      ? data.attendees.map((row) => (row[2] === "Awaiting" ? [row[0], row[1], "Confirmed", "No restrictions"] : row))
      : data.attendees;

    return h(
      React.Fragment,
      null,
      h(StageHero, {
        kicker: "Campaign management",
        title: "Invites, dietary intake, and attendee updates stay attached to the event.",
        summary:
          "Reception removes the spreadsheet layer while preserving a clean handoff to the restaurant and the account team.",
        stat: rsvpSweep ? "14/14" : "13/14",
        statLabel: "expected confirmations",
      }),
      h(
        "div",
        { className: "attendee-layout" },
        h(DataTable, { headers: ["Guest", "Role", "RSVP", "Dietary"], rows }),
        h(
          "aside",
          { className: "gate-panel" },
          h("h3", null, "Attendee ops"),
          h(CheckRow, { label: "Invite copy personalized", state: "Drafted" }),
          h(CheckRow, { label: "Dietary needs collected", state: rsvpSweep ? "Complete" : "In progress" }),
          h(CheckRow, { label: "Restaurant packet", state: rsvpSweep ? "Ready" : "Queued" }),
          h("button", { className: "primary-button", onClick: () => setRsvpSweep(true) }, rsvpSweep ? "RSVPs synchronized" : "Run RSVP sweep"),
        ),
      ),
    );
  }

  function RunStage() {
    return h(
      React.Fragment,
      null,
      h(StageHero, {
        kicker: "Day-of execution",
        title: "Same-day details route to the right human without reopening the coordination loop.",
        summary:
          "Reception handles routine confirmations, escalates vendor messages by channel, and keeps the event owner out of the inbox spiral.",
        stat: "2 min",
        statLabel: "notification SLA",
      }),
      h(
        "ol",
        { className: "timeline" },
        data.timeline.map((item) => h("li", { key: item[0] }, h("time", null, item[0]), h("span", null, item[1]))),
      ),
    );
  }

  function ReportStage() {
    return h(
      React.Fragment,
      null,
      h(StageHero, {
        kicker: "Post-event ROI",
        title: "The dinner closes as measurable GTM motion, not lost hospitality spend.",
        summary:
          "Reception logs outcomes to the CRM, creates sales follow-ups, captures feedback, and improves the next recommendation set.",
        stat: "9.5 hr",
        statLabel: "coordination time recovered",
      }),
      h(
        "div",
        { className: "outcome-grid" },
        data.outcomes.map((outcome) =>
          h("article", { className: "metric-card", key: outcome[0] }, h("span", null, outcome[0]), h("strong", null, outcome[1])),
        ),
      ),
      h(
        "section",
        { className: "crm-panel" },
        h("h3", null, "HubSpot sync"),
        h("p", null, "Acme Corp expansion opportunity updated with attendees, spend, meeting notes, and follow-up tasks for the AE and CRO."),
      ),
    );
  }

  function TrustStage({ outreachApproved, bookingApproved }) {
    const rows = data.auditTrail.map((row) => {
      if (row[0] === "Mia Chen" && row[1].includes("Approved two")) return [row[0], row[1], outreachApproved ? "Complete" : row[2]];
      if (row[0] === "Mia Chen" && row[1].includes("deposit")) return [row[0], row[1], bookingApproved ? "Complete" : row[2]];
      return row;
    });

    return h(
      React.Fragment,
      null,
      h(StageHero, {
        kicker: "Trust layer",
        title: "The system of record is the agent's memory and the buyer's control plane.",
        summary:
          "Every action is logged with actor, input, output, and autonomy class, giving enterprise buyers governance without killing speed.",
        stat: "0",
        statLabel: "unapproved irreversible actions",
      }),
      h(DataTable, { headers: ["Actor", "Action", "Autonomy"], rows }),
      h(
        "div",
        { className: "investor-close" },
        h("strong", null, "Reception wedge"),
        h("p", null, "Start with private dining, compound a venue and outcome graph, then expand across off-sites, roundtables, conferences, and client experiences."),
      ),
    );
  }

  function StageHero({ kicker, title, summary, stat, statLabel }) {
    return h(
      "section",
      { className: "stage-hero" },
      h("div", null, h("p", { className: "eyebrow" }, kicker), h("h2", null, title), h("p", null, summary)),
      h("div", { className: "hero-stat" }, h("strong", null, stat), h("span", null, statLabel)),
    );
  }

  function KeyValueGrid({ items, compact }) {
    return h(
      "dl",
      { className: cx("kv-grid", compact && "compact") },
      items.map(([label, value]) => h(React.Fragment, { key: label }, h("dt", null, titleCase(label)), h("dd", null, value))),
    );
  }

  function titleCase(value) {
    return String(value)
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (letter) => letter.toUpperCase());
  }

  function CheckRow({ label, state }) {
    return h("div", { className: "check-row" }, h("span", null, label), h("strong", null, state));
  }

  function StatusBadge({ status }) {
    return h("span", { className: cx("status-badge", status.toLowerCase().replace(" ", "-")) }, status);
  }

  function DataTable({ headers, rows }) {
    return h(
      "div",
      { className: "table-wrap" },
      h(
        "table",
        null,
        h("thead", null, h("tr", null, headers.map((header) => h("th", { key: header }, header)))),
        h(
          "tbody",
          null,
          rows.map((row, index) => h("tr", { key: `${row[0]}-${index}` }, row.map((cell, cellIndex) => h("td", { key: `${cell}-${cellIndex}` }, cell)))),
        ),
      ),
    );
  }

  function AgentPanel({ activity, stage, outreachApproved, bookingApproved }) {
    return h(
      "aside",
      { className: "agent-panel" },
      h("div", { className: "agent-panel-head" }, h("p", { className: "eyebrow" }, "Agent state"), h("h2", null, "Reception is working")),
      h(
        "div",
        { className: "agent-metrics" },
        h("div", null, h("span", null, "Autonomy"), h("strong", null, stage >= 4 ? "Human-gated" : stage === 0 ? "Portfolio" : "Reversible")),
        h("div", null, h("span", null, "SLA"), h("strong", null, stage === 0 ? "2 risks" : stage >= 5 ? "On track" : "36 hr")),
      ),
      h(
        "div",
        { className: "mini-status" },
        h("span", { className: cx("dot", outreachApproved && "on") }),
        h("p", null, outreachApproved ? "Vendor outreach approved" : "Outreach held for review"),
      ),
      h(
        "div",
        { className: "mini-status" },
        h("span", { className: cx("dot", bookingApproved && "on") }),
        h("p", null, bookingApproved ? "Booking approved by Mia" : "Deposit approval pending"),
      ),
      h(
        "ol",
        { className: "activity-feed" },
        activity.map((item) =>
          h("li", { key: item.title }, h("span", null, item.time), h("strong", null, item.title), h("p", null, item.detail)),
        ),
      ),
    );
  }

  function DemoControls({ stage, setStage }) {
    return h(
      "footer",
      { className: "demo-controls" },
      h(
        "button",
        { className: "secondary-button", disabled: stage === 0, onClick: () => setStage((value) => Math.max(0, value - 1)) },
        "Back",
      ),
      h("span", null, `${stage + 1} of ${data.stages.length}`),
      h(
        "button",
        { className: "primary-button", disabled: stage === data.stages.length - 1, onClick: () => setStage((value) => Math.min(data.stages.length - 1, value + 1)) },
        "Next",
      ),
    );
  }

  function buildActivity(stage, selectedVenueNames, outreachApproved, bookingApproved, rsvpSweep) {
    const base = [
      { time: "May", title: "Portfolio scanned", detail: "10 events, 7 decisions, 2 SLA risks, and $6.8M pipeline monitored." },
    ];

    if (stage === 0) {
      base.push(
        { time: "Now", title: "Human gates prioritized", detail: "Acme booking, Lattice outreach, and Clearbit sourcing need attention first." },
        { time: "Now", title: "Routine loops continue", detail: "Booked events keep attendee, dietary, and day-of packets moving in the background." },
      );
      return base.reverse();
    }

    base.push(
      { time: "00:02", title: "Brief parsed", detail: "Date, budget, cuisine, headcount, and account context extracted." },
      { time: "00:05", title: "Customer memory loaded", detail: "Prior dinners and attendee feedback are available to the ranker." },
    );

    if (stage >= 3) {
      base.push({
        time: "00:08",
        title: "Shortlist ranked",
        detail: `${selectedVenueNames.length || 0} venues are ready for outreach review.`,
      });
    }
    if (stage >= 4) {
      base.push({
        time: "00:11",
        title: "Approval gate opened",
        detail: outreachApproved ? "Outbound emails sent through Mia's approved channel." : "Drafts are held until Mia approves send.",
      });
    }
    if (stage >= 5) {
      base.push({ time: "00:32", title: "Replies parsed", detail: "Availability, minimums, deposit, and cancellation terms normalized." });
    }
    if (stage >= 6) {
      base.push({
        time: "00:39",
        title: "Booking decision queued",
        detail: bookingApproved ? "Merchant Room hold and calendar sync are complete." : "Deposit and hold require Mia's approval.",
      });
    }
    if (stage >= 7) {
      base.push({
        time: "01:10",
        title: "Attendee ops active",
        detail: rsvpSweep ? "Dietary list and restaurant packet are complete." : "RSVP and dietary intake are in progress.",
      });
    }
    if (stage >= 9) {
      base.push({ time: "09:45", title: "CRM updated", detail: "Acme opportunity now contains event spend, attendees, and next steps." });
    }
    return base.slice(-6).reverse();
  }

  ReactDOM.createRoot(document.getElementById("root")).render(h(App));
})();
