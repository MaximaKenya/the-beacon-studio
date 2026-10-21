import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyAiHint,
  canonicalPhone,
  extractContactDetailsSync,
  phonesMatch,
  telHref,
  whatsappHrefFor,
} from "./lead-extract";

const SAMPLE = [
  "My name is Amina Wanjiku.",
  "I work at Shule Yetu Ltd.",
  "Budget is KES 150,000.",
  "Call me on 0712 345 678 or +254712345678.",
  "Email amina@shule.co.ke.",
  "We need a website and Microsoft 365.",
].join(" ");

describe("Kenyan phone extraction", () => {
  it("treats +254, 254, and 07xx as the same number", () => {
    assert.equal(canonicalPhone("+254 712 345 678"), canonicalPhone("0712345678"));
    assert.equal(canonicalPhone("254712345678"), "712345678");
    assert.equal(phonesMatch("0712 345 678", "+254712345678"), true);
    assert.equal(phonesMatch("0712345678", "0712345679"), false);
  });

  it("pulls a Kenyan mobile out of a message and skips prices", () => {
    const extracted = extractContactDetailsSync(
      "The pilot is $1,350. Please call 0712 345 678 about a website."
    );
    assert.equal(extracted.phone, "+254712345678");
    assert.equal(extracted.phones.length, 1);
    assert.equal(extracted.services.includes("business-site"), true);
  });

  it("skips the studio number and keeps the visitor number", () => {
    const extracted = extractContactDetailsSync(
      "WhatsApp the studio on 0706 397 373, or call me at +254 701 222 333."
    );
    assert.equal(extracted.phone, "+254701222333");
    assert.equal(extracted.phones.some((phone) => phone.includes("706397373")), false);
  });

  it("builds tel and WhatsApp links", () => {
    assert.equal(telHref("0712345678"), "tel:+254712345678");
    assert.equal(whatsappHrefFor("0712345678"), "https://wa.me/254712345678");
  });
});

describe("message details", () => {
  it("reads name, email, company, budget, and services", () => {
    const extracted = extractContactDetailsSync(SAMPLE);
    assert.equal(extracted.name, "Amina Wanjiku");
    assert.equal(extracted.email, "amina@shule.co.ke");
    assert.equal(extracted.phone, "+254712345678");
    assert.match(extracted.company, /Shule Yetu/);
    assert.match(extracted.budget, /150,000/);
    assert.equal(extracted.services.includes("business-site"), true);
    assert.equal(extracted.services.includes("microsoft-365"), true);
  });

  it("stops a company name at the next sentence and reads a reach-me name", () => {
    const extracted = extractContactDetailsSync(
      "Please reach Kamau Otieno at kamau.work@example.com. Company is Harambee Foods. Budget around KES 150,000 for a school website."
    );
    assert.equal(extracted.name, "Kamau Otieno");
    assert.equal(extracted.email, "kamau.work@example.com");
    assert.equal(extracted.company, "Harambee Foods");
    assert.match(extracted.budget, /150,000/);
  });

  it("keeps a Ltd suffix on the company", () => {
    const extracted = extractContactDetailsSync("I am Amina Wanjiku from Acme Ltd. Call 0712 345 678.");
    assert.equal(extracted.name, "Amina Wanjiku");
    assert.equal(extracted.company, "Acme Ltd");
  });

  it("lets an AI hint fill gaps without replacing regex hits", () => {
    const base = extractContactDetailsSync("Call 0712345678 about firewall help.");
    const merged = applyAiHint(base, {
      name: "Jane Otieno",
      company: "Otieno Clinics",
      budget: "Under $2k",
      phone: "0799000000",
      services: ["Backup & disaster recovery"],
    });
    assert.equal(merged.phone, "+254712345678");
    assert.equal(merged.name, "Jane Otieno");
    assert.equal(merged.company, "Otieno Clinics");
    assert.equal(merged.budget, "Under $2k");
    assert.equal(merged.phones.some((phone) => phonesMatch(phone, "0799000000")), true);
    assert.equal(merged.services.includes("firewall"), true);
    assert.equal(merged.services.includes("backup-dr"), true);
  });
});
