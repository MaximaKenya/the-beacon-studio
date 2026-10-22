import assert from "node:assert/strict";
import test from "node:test";
import {
  conversationTranscript,
  leadCategory,
  qualifyFromMessages,
  quoteForNeed,
  scriptedAssistantReply,
} from "@/lib/assistant-guide";

type Beaconish = { role: "user" | "assistant"; content: string };

const slot = { date: "2026-10-23", time: "09:00", label: "Fri, Oct 23 at 9:00 AM" };

test("qualifies needs, industry, budget, timeline, and contact from one note", () => {
  const messages: Beaconish[] = [
    {
      role: "user",
      content:
        "I need appointment reminders for my clinic. Budget under $2k. This month. My name is Amina Yusuf. Email amina@example.com",
    },
  ];
  const qualification = qualifyFromMessages(messages);
  assert.equal(qualification.needs, "automation");
  assert.equal(qualification.industry, "Clinic");
  assert.equal(qualification.budget, "Under $2k");
  assert.equal(qualification.timeline, "This month");
  assert.equal(qualification.name, "Amina Yusuf");
  assert.equal(qualification.email, "amina@example.com");
  assert.equal(leadCategory(qualification), "AI automation · Clinic");
});

test("quotes only published automation ranges", () => {
  const quote = quoteForNeed("automation");
  assert.match(quote, /2,500/);
  assert.match(quote, /6,500/);
  assert.match(quote, /\$1,350/);
  assert.doesNotMatch(quote, /99%|10x|customers saved/i);
});

test("script asks for the need before offering a slot", () => {
  const reply = scriptedAssistantReply([{ role: "user", content: "Hello" }], [slot]);
  assert.match(reply.text, /automation/i);
  assert.equal(reply.offerSlots, false);
});

test("script offers a real slot once contact and the brief are in", () => {
  const messages: Beaconish[] = [
    {
      role: "user",
      content:
        "I need reminders for my clinic. Budget under $2k. This month. My name is Amina Yusuf. Email amina@example.com. Please book a call.",
    },
  ];
  const reply = scriptedAssistantReply(messages, [slot]);
  assert.equal(reply.offerSlots, true);
  assert.match(reply.text, /Fri, Oct 23/);
  assert.match(reply.text, /2,500|\$1,350/);
});

test("transcript keeps both sides and the category", () => {
  const messages: Beaconish[] = [
    { role: "user", content: "I need reminders for my clinic. My name is Amina Yusuf. Email amina@example.com" },
    { role: "assistant", content: "A Pilot starts at the published price." },
  ];
  const text = conversationTranscript(messages);
  assert.match(text, /Category: AI automation · Clinic/);
  assert.match(text, /Visitor: I need reminders/);
  assert.match(text, /Beacon: A Pilot starts/);
});
