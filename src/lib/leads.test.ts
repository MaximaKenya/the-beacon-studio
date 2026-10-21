import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { extractContactDetailsSync } from "./lead-extract";
import {
  channelFor,
  composeDraft,
  emptyLeadFilters,
  filterLeads,
  filtersFromSearchParams,
  scoreBand,
  upsertLeadList,
  writeFiltersToParams,
  type StudioLead,
} from "./leads";

function lead(partial: Partial<StudioLead> & Pick<StudioLead, "id" | "email">): StudioLead {
  return {
    createdAt: "2026-07-19T09:00:00.000Z",
    updatedAt: "2026-07-19T09:00:00.000Z",
    name: "Amina",
    phone: "",
    company: "",
    budget: "",
    services: [],
    category: "",
    source: "contact-form",
    channel: "contact-form",
    sources: ["contact-form"],
    status: "new",
    score: 30,
    message: "",
    kind: "contact",
    sourceId: partial.id,
    refs: [`contact:${partial.id}`],
    ...partial,
  };
}

describe("lead capture merge", () => {
  it("maps sources into the filter channels", () => {
    assert.equal(channelFor("contact-form", "contact"), "contact-form");
    assert.equal(channelFor("quick-lead:automation", "contact"), "contact-form");
    assert.equal(channelFor("audit-booking", "booking"), "booking");
    assert.equal(channelFor("", "intake"), "start-a-project");
    assert.equal(channelFor("email", "email"), "email");
    assert.equal(channelFor("beacon-ai", "contact"), "beacon-ai");
  });

  it("dedupes the same person by phone even when the format differs", () => {
    const first = composeDraft(
      { kind: "contact", sourceId: "c1", source: "contact-form", name: "Amina", phone: "0712345678", message: "Hello from the form" },
      extractContactDetailsSync("")
    );
    const created = upsertLeadList([], first);
    assert.equal(created.created, true);
    const second = composeDraft(
      {
        kind: "booking",
        sourceId: "b1",
        source: "booking",
        channel: "booking",
        phone: "+254 712 345 678",
        company: "Shule Yetu",
        message: "Booked an audit",
      },
      extractContactDetailsSync("We need a website. Budget is KES 80,000.")
    );
    const merged = upsertLeadList(created.leads, second);
    assert.equal(merged.created, false);
    assert.equal(merged.leads.length, 1);
    assert.equal(merged.lead?.company, "Shule Yetu");
    assert.equal(merged.lead?.sources.includes("booking"), true);
    assert.equal(merged.lead?.sources.includes("contact-form"), true);
    assert.equal(merged.lead?.services.includes("business-site"), true);
    assert.match(merged.lead?.budget || "", /80,000/);
  });

  it("fills a missing phone from the message body", () => {
    const draft = composeDraft(
      {
        kind: "contact",
        sourceId: "c2",
        source: "contact-form",
        name: "Max",
        email: "max@example.com",
        message: "Please text 0711 222 333. I work at Acme Ltd.",
      },
      extractContactDetailsSync("Please text 0711 222 333. I work at Acme Ltd.")
    );
    assert.equal(draft.phone, "+254711222333");
    assert.match(draft.company ?? "", /Acme/);
  });
});

describe("lead filters", () => {
  const rows = [
    lead({
      id: "1",
      email: "a@example.com",
      name: "Amina Wanjiku",
      company: "Shule Yetu",
      channel: "start-a-project",
      sources: ["start-a-project"],
      source: "start-a-project",
      status: "new",
      score: 85,
      services: ["business-site"],
      category: "A website for my business",
      createdAt: "2026-07-19T09:00:00.000Z",
      message: "School website",
    }),
    lead({
      id: "2",
      email: "b@example.com",
      name: "Owen",
      channel: "email",
      sources: ["email"],
      source: "email",
      status: "contacted",
      score: 20,
      services: ["buffet:Sales"],
      createdAt: "2026-08-02T09:00:00.000Z",
      message: "Following up",
    }),
  ];

  it("filters by source, status, category, score, date, and text", () => {
    assert.equal(filterLeads(rows, { ...emptyLeadFilters(), source: "start-a-project" }).length, 1);
    assert.equal(filterLeads(rows, { ...emptyLeadFilters(), status: "contacted" })[0]?.email, "b@example.com");
    assert.equal(filterLeads(rows, { ...emptyLeadFilters(), category: "business-site" }).length, 1);
    assert.equal(filterLeads(rows, { ...emptyLeadFilters(), category: "buffet:Sales" }).length, 1);
    assert.equal(scoreBand(85), "80");
    assert.equal(filterLeads(rows, { ...emptyLeadFilters(), score: "80" }).length, 1);
    assert.equal(filterLeads(rows, { ...emptyLeadFilters(), score: "low" })[0]?.id, "2");
    assert.equal(filterLeads(rows, { ...emptyLeadFilters(), from: "2026-08-01", to: "2026-08-03" }).length, 1);
    assert.equal(filterLeads(rows, { ...emptyLeadFilters(), q: "shule" }).length, 1);
    assert.equal(filterLeads(rows, { ...emptyLeadFilters(), q: "missing" }).length, 0);
  });

  it("round-trips filters through the query string", () => {
    const params = new URLSearchParams("panel=1");
    writeFiltersToParams(params, {
      q: "amina",
      source: "contact-form",
      status: "new",
      category: "business-site",
      score: "80",
      from: "2026-07-01",
      to: "2026-07-31",
    });
    const parsed = filtersFromSearchParams(params);
    assert.equal(parsed.q, "amina");
    assert.equal(parsed.source, "contact-form");
    assert.equal(parsed.category, "business-site");
    assert.equal(parsed.score, "80");
    assert.equal(params.get("panel"), "1");
    writeFiltersToParams(params, emptyLeadFilters());
    assert.equal(params.get("q"), null);
    assert.equal(params.get("panel"), "1");
  });
});
