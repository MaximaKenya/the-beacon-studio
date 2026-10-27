/**
 * End-to-end check for every automation, through the real HTTP API.
 *
 *   npm run build && npm run automations:e2e
 *
 * For each of the automations it:
 *   1. signs up a trial client  (POST /api/automations/checkout, pay: "trial")
 *   2. signs in to the portal   (request-code → verify-code; the code is shown on screen when Resend is unset)
 *   3. enters data like a client (portal "config" rows, the /a/<slug>/<page> forms, hooks, inbox/notes)
 *   4. runs the schedule        (moves that client's due jobs to "now", then POST /api/automations/tick)
 *   5. checks the results       (logs, Notify queue deliveries, portal metrics, admin Action Center)
 *   6. pauses and resumes it from the portal
 * It also saves Organization inputs: wrong formats must be rejected, and the saved
 * values (+254 phone, KES amounts, opt-out text) must reach messages and portal metrics.
 *
 * Safety: it starts its own `next start` with DATABASE_URL, RESEND_API_KEY, GROQ_API_KEY,
 * Africa's Talking, WhatsApp and Paystack keys removed, and a throwaway data directory.
 * Nothing can be sent. Email rows are recorded as "not sent", phone rows as "waiting".
 * Set E2E_BASE_URL to test a server you started yourself (it must use the same E2E_DATA_DIR).
 */
import { spawn, type ChildProcess } from "child_process";
import { randomBytes } from "crypto";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { TEMPLATE_DEFS } from "../src/automations/templates/public";
import { ORG_INTERNAL_TEMPLATES, orgFieldsFor, type OrgField } from "../src/lib/automations/org-fields";

type Json = Record<string, unknown>;
type Doc = {
  instances: Json[];
  jobs: Json[];
  logs: Json[];
  leads: Json[];
  charges: Json[];
  bookings: Json[];
  reviews: Json[];
  deliveries: Json[];
};

const PORT = Number(process.env.E2E_PORT || 3199);
const OWN_SERVER = !process.env.E2E_BASE_URL;
const BASE = process.env.E2E_BASE_URL || `http://127.0.0.1:${PORT}`;
const ROOT = path.resolve(__dirname, "..");
const WORK = OWN_SERVER ? mkdtempSync(path.join(tmpdir(), "beacon-e2e-")) : "";
const DATA = process.env.E2E_DATA_DIR || (OWN_SERVER ? path.join(WORK, "data") : path.join(ROOT, "data"));
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || randomBytes(12).toString("hex");
const CRON_SECRET = process.env.CRON_SECRET || randomBytes(12).toString("hex");
const RUN = randomBytes(3).toString("hex");
const only = process.argv.slice(2).filter((arg) => !arg.startsWith("-"));

function customer(id: string) {
  return `customer-${id}-${RUN}@beacon-e2e.test`;
}
function owner(id: string) {
  return `owner-${id}-${RUN}@beacon-e2e.test`;
}
const PHONE = "+254711000001";

/** Sample config: the template's demo config, pointed at test addresses (example.com is skipped by design). */
function sampleConfig(id: string): Json {
  const def = TEMPLATE_DEFS.find((item) => item.id === id)!;
  const text = JSON.stringify(def.demoConfig).replace(/demo@example\.com/g, customer(id));
  return JSON.parse(text) as Json;
}

function readDoc(): Doc {
  return JSON.parse(readFileSync(path.join(DATA, "automations.json"), "utf8")) as Doc;
}
function writeDoc(doc: Doc) {
  writeFileSync(path.join(DATA, "automations.json"), JSON.stringify(doc, null, 2));
}

let visitor = 0;
/** One visitor: its own cookie jar and address, so per-IP rate limits apply as they would to real people. */
class Client {
  cookie = "";
  ip = `10.99.${Math.floor(++visitor / 250)}.${visitor % 250}`;
  async call(method: string, url: string, body?: unknown, headers: Record<string, string> = {}) {
    const res = await fetch(`${BASE}${url}`, {
      method,
      headers: { "Content-Type": "application/json", "X-Forwarded-For": this.ip, ...(this.cookie ? { Cookie: this.cookie } : {}), ...headers },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      redirect: "manual",
    });
    const set = res.headers.getSetCookie?.() || [];
    if (set.length) this.cookie = set.map((line) => line.split(";")[0]).join("; ");
    const raw = await res.text();
    if (process.env.E2E_DEBUG) console.error(method, url, res.status, raw.slice(0, 300));
    let json: Json = {};
    try {
      json = JSON.parse(raw) as Json;
    } catch {
      json = { raw: raw.slice(0, 200) };
    }
    return { status: res.status, json };
  }
}

async function tick() {
  const res = await new Client().call("POST", "/api/automations/tick", {}, { Authorization: `Bearer ${CRON_SECRET}` });
  if (res.status !== 200 || res.json.ok !== true) throw new Error(`tick failed: ${res.status} ${JSON.stringify(res.json)}`);
  return res.json;
}

/** Make this instance's scheduled jobs due now, like the clock reaching them. */
function fastForward(instanceId: string, kinds?: string[]) {
  const doc = readDoc();
  const past = new Date(Date.now() - 60_000).toISOString();
  let moved = 0;
  for (const job of doc.jobs) {
    if (job.instanceId !== instanceId || job.status !== "due") continue;
    if (kinds && !kinds.includes(String(job.kind))) continue;
    job.runAt = past;
    moved += 1;
  }
  writeDoc(doc);
  return moved;
}

type Ctx = {
  id: string;
  portal: Client;
  instance: Json;
  slug: string;
  instanceId: string;
  errors: string[];
  notes: string[];
};

function expect(ctx: Ctx, ok: unknown, message: string) {
  if (!ok) ctx.errors.push(message);
}

async function hook(ctx: Ctx, kind: string, body: Json) {
  const res = await new Client().call("POST", `/api/automations/hooks/${kind}/${ctx.slug}`, body);
  expect(ctx, res.status === 200 && res.json.ok, `hook ${kind}: ${res.status} ${String(res.json.message || "")}`);
  return res.json;
}

async function page(ctx: Ctx, name: string) {
  const html = await fetch(`${BASE}/a/${ctx.slug}/${name}`);
  expect(ctx, html.status === 200, `/a/<slug>/${name} returned ${html.status}`);
  const view = await new Client().call("GET", `/api/automations/public?slug=${ctx.slug}${name === "book" ? "" : `&page=${name}`}`);
  expect(ctx, view.status === 200, `public view for ${name} returned ${view.status}`);
  return view.json;
}

async function saveRows(ctx: Ctx, extra: Json[]) {
  const config = { ...(ctx.instance.config as Json) };
  const rows = Array.isArray(config.entries) ? [...(config.entries as Json[])] : [];
  config.entries = [...rows, ...extra];
  const res = await ctx.portal.call("POST", "/api/automations/portal", { action: "config", id: ctx.instanceId, config });
  expect(ctx, res.json.ok, `portal config save: ${String(res.json.message || "")}`);
}

const soon = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

/** Client input per automation, as they would enter it. */
const feed: Record<string, (ctx: Ctx) => Promise<void>> = {
  async lead(ctx) {
    await page(ctx, "lead");
    const out = await hook(ctx, "lead", { name: "Amina Test", email: customer(ctx.id), phone: PHONE, message: "We need invoice reminders next month.", note: "" });
    if (ctx.id === "lead-reply") expect(ctx, typeof out.reply === "string" && out.reply, "lead reply text missing");
  },
  async faq(ctx) {
    const widget = await fetch(`${BASE}/api/automations/widget/${ctx.slug}`);
    expect(ctx, widget.status === 200, `widget script returned ${widget.status}`);
    const out = await hook(ctx, "faq", { name: "Visitor", email: customer(ctx.id), message: "When do you reply?" });
    expect(ctx, typeof out.reply === "string" && out.reply, "faq answer missing");
  },
  async review(ctx) {
    await page(ctx, "review");
    await hook(ctx, "review", { name: "Amina", email: customer(ctx.id), phone: PHONE });
    const low = await new Client().call("POST", "/api/automations/public", { action: "review", slug: ctx.slug, score: 2, comment: "Slow service", name: "Amina", email: customer(ctx.id) });
    expect(ctx, low.json.ok && low.json.high === false, "low score was not flagged");
    const high = await new Client().call("POST", "/api/automations/public", { action: "review", slug: ctx.slug, score: ctx.id === "nps" ? 10 : 5, name: "Brian" });
    expect(ctx, high.json.ok && high.json.high === true && high.json.google, "high score did not return the review link");
  },
  async rsvp(ctx) {
    await page(ctx, "rsvp");
    await hook(ctx, "rsvp", { name: "Guest One", email: customer(ctx.id), phone: PHONE, note: "yes", message: "yes" });
  },
  async intake(ctx) {
    await page(ctx, "request");
    await hook(ctx, "intake", { name: "Tenant 4B", email: customer(ctx.id), phone: PHONE, message: "The kitchen tap is leaking." });
  },
  async inbox(ctx) {
    const res = await ctx.portal.call("POST", "/api/automations/portal", { action: "inbox", id: ctx.instanceId, from: customer(ctx.id), subject: "Refund", body: "I want a refund for last month." });
    expect(ctx, res.json.ok, `portal inbox: ${String(res.json.message || "")}`);
  },
  async notes(ctx) {
    const res = await ctx.portal.call("POST", "/api/automations/portal", { action: "notes", id: ctx.instanceId, notes: "Agreed to start Monday. Max owns the checklist." });
    expect(ctx, res.json.ok, `portal notes: ${String(res.json.message || "")}`);
  },
};

async function feedBooking(ctx: Ctx) {
  const view = await page(ctx, "book");
  const slots = (view.slots as { start: string }[]) || [];
  expect(ctx, slots.length > 0, "no booking slots");
  if (!slots.length) return;
  const slot = slots[slots.length - 1].start;
  const res = await new Client().call("POST", "/api/automations/public", { action: "book", slug: ctx.slug, start: slot, name: "Amina", email: customer(ctx.id), phone: PHONE });
  expect(ctx, res.json.ok, `booking: ${String(res.json.message || "")}`);
  const ics = await fetch(`${BASE}/api/automations/bookings/${(readDoc().bookings.find((b) => b.instanceId === ctx.instanceId) || {}).id}/ics`);
  expect(ctx, ics.status === 200, `booking .ics returned ${ics.status}`);
}

/** Rows a client adds in the portal after signup, by automation. */
function addedRow(id: string): Json | null {
  const email = customer(id);
  switch (id) {
    case "invoice-reminders":
    case "subscription-renewal":
    case "debt-collection":
    case "sacco-repayments":
    case "school-fees":
    case "rent-collection":
      return { name: "Added Row", email, phone: PHONE, amountKes: 1500, date: soon(5), note: "added in portal" };
    case "greetings":
      return { name: "Added Row", email, phone: PHONE, date: soon(10), kind: "anniversary" };
    case "staff-shifts":
      return { name: "Added Row", email, phone: PHONE, date: soon(2), note: "night shift" };
    case "doc-expiry":
      return { name: "Added Row", email, date: soon(30), note: "Permit" };
    case "clinic-recall":
      return { name: "Added Row", email, phone: PHONE, date: soon(-170), note: "check-up" };
    case "low-stock":
      return { name: "Added Row", qty: 1, reorderAt: 3 };
    case "onboarding":
    case "lead-nurture":
    case "abandoned-quote":
      return { name: "Added Row", email, phone: PHONE };
    case "custom-reminder":
      return { name: "Added Row", email, phone: PHONE, note: "added" };
    case "rsvp":
      return { name: "Added Row", email, date: String(sampleConfig(id).eventDate) };
    default:
      return null;
  }
}

const ORG_OPT_OUT = "Reply STOP to opt out.";

/** A valid sample for each field type (money in KES, as a client types it). */
function sampleOrg(field: OrgField): unknown {
  switch (field.type) {
    case "money":
      return "1,500";
    case "percent":
      return String(Math.min(field.max ?? 100, 10));
    case "integer":
      return String(Math.max(field.min ?? 0, Math.min(field.max ?? 10, 3)));
    case "date":
      return soon(30);
    case "time":
      return "08:30";
    case "phone":
      return "0712 345 678";
    case "email":
      return owner("org");
    case "url":
      return "https://thebeaconstudio.co.ke/review";
    case "select":
      return field.options?.[0]?.value;
    case "multiselect":
      return [field.options?.[0]?.value];
    case "boolean":
      return true;
    case "text":
      return field.key === "mpesaPaybill" ? "522522" : field.key === "optOutText" ? ORG_OPT_OUT : "E2E value";
    case "rows":
      return [Object.fromEntries((field.columns || []).map((c) => [c.key, sampleOrg({ ...c, section: "custom" } as OrgField)]))];
  }
}

async function orgInputs(ctx: Ctx) {
  const fields = orgFieldsFor(ctx.id);
  const save = (org: Json) => ctx.portal.call("POST", "/api/automations/portal", { action: "org", id: ctx.instanceId, org });
  const firstMoney = fields.find((f) => f.type === "money" || f.type === "percent" || f.type === "integer");
  const bads: [string, unknown][] = [
    ["contactPhone", "12345"],
    ["contactEmail", "not-an-email"],
    ["website", "javascript:alert(1)"],
    ["openTime", "25:00"],
  ];
  if (firstMoney) bads.push([firstMoney.key, "abc"]);
  for (const [key, value] of bads) {
    const res = await save({ values: { [key]: value } });
    expect(ctx, res.status === 400 && res.json.ok === false && String(res.json.message || "").length > 5, `Organization input ${key}=${String(value)} was not rejected (${res.status})`);
  }
  const badCustom = await save({ values: {}, custom: [{ label: "Tier", type: "percent", value: "150" }] });
  expect(ctx, badCustom.status === 400, "custom percent 150 was not rejected");

  const values = Object.fromEntries(fields.filter((f) => f.required || ["contactPhone", "optOutText", "signOff"].includes(f.key)).map((f) => [f.key, sampleOrg(f)]));
  values.contactPhone = "0712 345 678";
  values.optOutText = ORG_OPT_OUT;
  values.signOff = "Asante, the E2E team";
  const ok = await save({ values, custom: [{ label: "Loyalty tier", type: "text", value: "Gold" }] });
  expect(ctx, ok.status === 200 && ok.json.ok, `Organization inputs save failed: ${String(ok.json.message || "")}`);
  expect(ctx, (ok.json.completeness as Json)?.ready === true, "required Organization inputs still reported missing");
  const stored = (readDoc().instances.find((item) => item.id === ctx.instanceId)?.config as Json)?.org as { values: Json; custom: Json[] } | undefined;
  expect(ctx, stored?.values.contactPhone === "+254712345678", `phone not normalised to +254 (${String(stored?.values.contactPhone)})`);
  const money = fields.find((f) => f.type === "money" && values[f.key] !== undefined);
  if (money) expect(ctx, stored?.values[money.key] === 150000, `money ${money.key} not stored as integer cents (${String(stored?.values[money.key])})`);
  expect(ctx, stored?.custom.some((c) => c.id === "loyalty_tier" && c.value === "Gold"), "custom field not stored");
  const snap = await ctx.portal.call("GET", "/api/automations/portal");
  ctx.instance = ((snap.json.instances as Json[]) || [])[0] || ctx.instance;
}

function countFor(doc: Doc, key: keyof Doc, instanceId: string) {
  return (doc[key] as Json[]).filter((row) => row.instanceId === instanceId).length;
}

async function runOne(id: string, admin: Client): Promise<{ id: string; ok: boolean; errors: string[]; notes: string[] }> {
  const def = TEMPLATE_DEFS.find((item) => item.id === id)!;
  const ctx: Ctx = { id, portal: new Client(), instance: {}, slug: "", instanceId: "", errors: [], notes: [] };
  // 1. sign up
  const email = owner(id);
  const signup = await new Client().call("POST", "/api/automations/checkout", {
    templateIds: [id],
    configs: { [id]: sampleConfig(id) },
    billing: "monthly",
    pay: "trial",
    ownerName: "E2E Owner",
    ownerEmail: email,
    businessName: `E2E ${id}`,
  });
  if (!signup.json.ok) return { id, ok: false, errors: [`signup: ${String(signup.json.message)}`], notes: [] };
  // 2. portal sign-in
  const code = await ctx.portal.call("POST", "/api/portal/auth", { action: "request-code", email });
  if (!code.json.code) return { id, ok: false, errors: [`portal code not issued: ${JSON.stringify(code.json)}`], notes: [] };
  const verify = await ctx.portal.call("POST", "/api/portal/auth", { action: "verify-code", email, code: code.json.code });
  if (!verify.json.ok) return { id, ok: false, errors: ["portal verify failed"], notes: [] };
  const snap = await ctx.portal.call("GET", "/api/automations/portal");
  const instance = ((snap.json.instances as Json[]) || [])[0];
  if (!instance) return { id, ok: false, errors: ["no instance in portal"], notes: [] };
  ctx.instance = instance;
  ctx.slug = String(instance.slug);
  ctx.instanceId = String(instance.id);
  expect(ctx, instance.status === "active", `status after signup is ${String(instance.status)}`);
  expect(ctx, snap.json.trial && (snap.json.trial as Json).days, "portal shows no trial days");
  const before = readDoc();
  const jobsAfterSignup = countFor(before, "jobs", ctx.instanceId);
  const chargesAfterSignup = countFor(before, "charges", ctx.instanceId);

  // 2b. Organization inputs: wrong formats are rejected, good values are normalised and stored
  await orgInputs(ctx);

  // 3. client data entry
  const row = addedRow(id);
  if (row) await saveRows(ctx, [row]);
  const afterSave = readDoc();
  if (row && def.behavior === "payment-cycle") {
    expect(ctx, countFor(afterSave, "charges", ctx.instanceId) === chargesAfterSignup + 1, `new ledger row made ${countFor(afterSave, "charges", ctx.instanceId) - chargesAfterSignup} charges, expected 1`);
  }
  if (row && (def.behavior === "date-reminder" || def.behavior === "sequence")) {
    const steps = String((ctx.instance.config as Json).steps || "").split(/\n+/).filter((line) => line.trim()).length;
    const added = countFor(afterSave, "jobs", ctx.instanceId) - jobsAfterSignup;
    const want = def.behavior === "sequence" ? steps : 1;
    expect(ctx, added === want, `new row scheduled ${added} jobs, expected ${want} (0 = not scheduled, more = rows at signup scheduled twice)`);
  }
  if (def.page === "book") await feedBooking(ctx);
  else if (def.hook !== "none" && feed[def.hook]) await feed[def.hook](ctx);

  // 4. run the schedule (twice: some runs schedule a follow-up that is due straight away)
  for (let i = 0; i < 2; i += 1) {
    fastForward(ctx.instanceId, ["payment-reminder", "sequence", "date-reminder", "custom-reminder", "digest", "draft", "stock", "appointment-reminder"]);
    await tick();
  }

  // 5. verify
  const doc = readDoc();
  const mine = doc.instances.find((item) => item.id === ctx.instanceId) as Json & { stats: Json };
  const deliveries = doc.deliveries.filter((d) => d.instanceId === ctx.instanceId);
  const logs = doc.logs.filter((l) => l.instanceId === ctx.instanceId);
  const failedJobs = doc.jobs.filter((j) => j.instanceId === ctx.instanceId && j.failed);
  const errors = logs.filter((l) => l.level === "error");
  expect(ctx, errors.length === 0, `error logs: ${errors.map((l) => l.message).join("; ")}`);
  expect(ctx, failedJobs.length === 0, `${failedJobs.length} failed jobs`);
  expect(ctx, logs.some((l) => /Free for \d+ days/.test(String(l.message))), "trial log missing");
  expect(ctx, deliveries.length > 0, "nothing in the Notify queue (no delivery rows)");
  expect(ctx, deliveries.every((d) => d.status !== "sent"), "a message was actually sent");
  expect(ctx, Number(mine.stats.runs) > 0, "runs metric is 0");
  expect(ctx, Number(mine.stats.messages) > 0, "messages metric is 0");
  if (deliveries.some((d) => d.channel !== "email")) {
    expect(ctx, deliveries.filter((d) => d.channel !== "email").every((d) => d.status === "waiting"), "phone message not queued as waiting");
  }
  const leadsExpected = ["lead", "faq", "intake"].includes(def.hook) && def.behavior !== "date-reminder";
  if (leadsExpected) expect(ctx, countFor(doc, "leads", ctx.instanceId) > 0, "lead not saved");
  if (def.behavior === "review") expect(ctx, countFor(doc, "reviews", ctx.instanceId) === 2, "reviews not saved");
  if (def.page === "book") {
    expect(ctx, countFor(doc, "bookings", ctx.instanceId) === 1, "booking not saved");
    expect(ctx, Number(mine.stats.reminders) > 0, "appointment reminder did not run");
  }
  if (def.behavior === "payment-cycle") {
    expect(ctx, Number(mine.stats.reminders) > 0, "no payment reminder ran");
    const charge = doc.charges.find((c) => c.instanceId === ctx.instanceId && c.status === "unpaid");
    const paid = await ctx.portal.call("POST", "/api/automations/portal", { action: "mark-paid", chargeId: charge?.id });
    expect(ctx, paid.json.ok, "mark paid failed");
    const left = readDoc().jobs.filter((j) => j.chargeId === charge?.id && j.status === "due").length;
    expect(ctx, left === 0, "reminders still scheduled after Mark paid");
  }
  if (def.behavior === "digest" || def.behavior === "custom-report" || def.behavior === "groq-draft" || def.behavior === "threshold-alert") {
    expect(ctx, doc.jobs.some((j) => j.instanceId === ctx.instanceId && j.status === "due" && j.kind !== "renewal"), "next run not rescheduled");
  }

  const customerMessages = deliveries.filter((d) => !String(d.to || "").startsWith("owner-"));
  if (customerMessages.length && !ORG_INTERNAL_TEMPLATES.has(id)) {
    expect(ctx, customerMessages.some((d) => String(d.text || "").includes(ORG_OPT_OUT)), "opt-out text from Organization inputs did not reach the customer message");
    expect(ctx, customerMessages.some((d) => String(d.text || "").includes("+254712345678")), "contact phone (+254) from Organization inputs did not reach the message");
  }

  const portal = await ctx.portal.call("GET", "/api/automations/portal");
  const savedOrg = ((((portal.json.instances as Json[]) || [])[0]?.config as Json)?.org as Json) || {};
  expect(ctx, (savedOrg.values as Json)?.contactPhone === "+254712345678", "portal does not return saved Organization inputs");
  const view = ((portal.json.instances as Json[]) || [])[0] || {};
  expect(ctx, Number((view.stats as Json)?.runs) > 0, "portal does not show runs");
  expect(ctx, ((portal.json.logs as Json[]) || []).length > 0, "portal shows no activity log");
  expect(ctx, portal.json.analytics, "portal analytics missing");
  const usage = portal.json.usage as { sms: { waiting?: number; total?: number } } | undefined;
  expect(ctx, usage && usage.sms, "portal Notify usage missing");

  // admin sees the client and the attention items
  const adminView = await admin.call("GET", "/api/admin/automations");
  const clients = (adminView.json.clients as Json[]) || [];
  expect(ctx, clients.some((c) => c.email === email), "client missing from admin");
  const actions = ((adminView.json.actions as Json[]) || []).map((a) => String(a.id));
  expect(ctx, actions.includes("signups"), "admin Action Center has no new-trial item");

  // 6. pause and resume from the portal
  const paused = await ctx.portal.call("POST", "/api/automations/portal", { action: "pause", id: ctx.instanceId });
  expect(ctx, paused.json.ok, "pause failed");
  if (def.hook !== "none" && def.hook !== "inbox" && def.hook !== "notes") {
    const blocked = await new Client().call("POST", `/api/automations/hooks/${def.hook}/${ctx.slug}`, { name: "x" });
    expect(ctx, blocked.status === 409, `paused automation still accepted input (${blocked.status})`);
  }
  const resumed = await ctx.portal.call("POST", "/api/automations/portal", { action: "resume", id: ctx.instanceId });
  expect(ctx, resumed.json.ok, `resume failed: ${String(resumed.json.message || "")}`);
  ctx.notes.push(`deliveries=${deliveries.length} (${[...new Set(deliveries.map((d) => `${d.channel}:${d.status}`))].join(", ")}) runs=${String(mine.stats.runs)}`);
  return { id, ok: ctx.errors.length === 0, errors: ctx.errors, notes: ctx.notes };
}

async function waitForServer() {
  for (let i = 0; i < 120; i += 1) {
    try {
      const res = await fetch(`${BASE}/api/health`);
      if (res.status < 500) return;
    } catch {
      /* starting */
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Server did not start.");
}

function startServer(): ChildProcess {
  if (!existsSync(path.join(ROOT, ".next", "BUILD_ID"))) throw new Error("Run `npm run build` first.");
  // A copy of the app root so the throwaway data/ does not touch the repo's data/.
  cpSync(path.join(ROOT, ".next"), path.join(WORK, ".next"), { recursive: true });
  for (const name of ["package.json", "next.config.ts", "public"]) cpSync(path.join(ROOT, name), path.join(WORK, name), { recursive: true });
  symlinkSync(path.join(ROOT, "node_modules"), path.join(WORK, "node_modules"), "dir");
  const env: NodeJS.ProcessEnv = { ...process.env, ADMIN_PASSWORD, CRON_SECRET, PORTAL_SECRET: randomBytes(12).toString("hex"), NODE_ENV: "production", PORT: String(PORT) };
  for (const key of ["DATABASE_URL", "RESEND_API_KEY", "GROQ_API_KEY", "AT_USERNAME", "AT_API_KEY", "WHATSAPP_TOKEN", "WHATSAPP_PHONE_ID", "PAYSTACK_SECRET_KEY"]) delete env[key];
  const bin = path.join(ROOT, "node_modules", "next", "dist", "bin", "next");
  const child = spawn(process.execPath, [bin, "start", "-p", String(PORT), "-H", "127.0.0.1"], { cwd: WORK, env, stdio: ["ignore", "pipe", "pipe"] });
  const log: string[] = [];
  child.stdout?.on("data", (d) => log.push(String(d)));
  child.stderr?.on("data", (d) => log.push(String(d)));
  child.on("exit", (code) => {
    if (code && code !== 0) console.error(log.join("").slice(-2000));
  });
  return child;
}

async function main() {
  const server = OWN_SERVER ? startServer() : null;
  try {
    await waitForServer();
    const admin = new Client();
    const login = await admin.call("POST", "/api/admin/auth", { password: ADMIN_PASSWORD });
    if (!login.json.ok) throw new Error(`Admin login failed (${login.status} ${String(login.json.error || login.json.raw || "")}).`);
    const guide = await fetch(`${BASE}/how-it-works`);
    const html = await guide.text();
    const missing = TEMPLATE_DEFS.filter((def) => !html.includes(`id="${def.id}"`)).map((def) => def.id);
    console.log(`${guide.status === 200 && !missing.length ? "PASS" : "FAIL"}  /how-it-works page   ${missing.length ? `missing cards: ${missing.join(", ")}` : `${TEMPLATE_DEFS.length} cards`}`);
    if (guide.status !== 200 || missing.length) process.exitCode = 1;
    const ids = TEMPLATE_DEFS.map((item) => item.id).filter((id) => !only.length || only.includes(id));
    const results = [];
    for (const id of ids) {
      const result = await runOne(id, admin).catch((error: unknown) => ({ id, ok: false, errors: [error instanceof Error ? error.message : String(error)], notes: [] as string[] }));
      results.push(result);
      console.log(`${result.ok ? "PASS" : "FAIL"}  ${id.padEnd(22)} ${result.ok ? result.notes.join(" ") : result.errors.join(" | ")}`);
    }
    const adminView = await admin.call("GET", "/api/admin/automations");
    const actions = ((adminView.json.actions as Json[]) || []).map((a) => String(a.id));
    console.log(`Admin attention items: ${actions.join(", ")}`);
    const failed = results.filter((r) => !r.ok);
    console.log(`${results.length - failed.length}/${results.length} automations passed.`);
    if (failed.length) process.exitCode = 1;
  } finally {
    server?.kill("SIGTERM");
    if (OWN_SERVER && !process.env.E2E_KEEP) rmSync(WORK, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
