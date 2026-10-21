import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { abandonedNudgeDue, composeAbandonedEmail, draftWasBooked, NUDGE_AFTER_MS, type BookingDraft } from "./booking-drafts";
import { studioComparison } from "../data/comparison";
import { industryLandings } from "../data/landings";
import { applyMagicConsume, composePortalSignIn, type PortalMagicLink } from "./portal-magic";
import { usesPostgres } from "./pg";
import { mutateJsonFile } from "./storage";
import { claimIsFresh, jobClaimable } from "./tick-claim";
import { formatSlotInZone } from "./visitor-time";

const NOW = Date.parse("2026-10-21T12:00:00.000Z");

function draft(partial: Partial<BookingDraft> = {}): BookingDraft {
  return {
    id: "draft-1",
    email: "amina@example.com",
    name: "Amina",
    startedAt: new Date(NOW - NUDGE_AFTER_MS - 60_000).toISOString(),
    updatedAt: new Date(NOW - NUDGE_AFTER_MS - 60_000).toISOString(),
    ...partial,
  };
}

describe("tick claims", () => {
  it("treats a fresh claim as taken and a stale claim as free", () => {
    assert.equal(claimIsFresh(new Date(NOW - 60_000).toISOString(), NOW), true);
    assert.equal(claimIsFresh(new Date(NOW - 21 * 60 * 1000).toISOString(), NOW), false);
    assert.equal(claimIsFresh(undefined, NOW), false);
  });

  it("does not claim a job that is already running inside the window", () => {
    const due = { status: "due", runAt: new Date(NOW - 1000).toISOString() };
    assert.equal(jobClaimable(due, NOW), true);
    assert.equal(
      jobClaimable({ status: "running", runAt: due.runAt, claimedAt: new Date(NOW - 1000).toISOString() }, NOW),
      false
    );
    assert.equal(
      jobClaimable({ status: "running", runAt: due.runAt, claimedAt: new Date(NOW - 21 * 60 * 1000).toISOString() }, NOW),
      true
    );
    assert.equal(jobClaimable({ status: "done", runAt: due.runAt }, NOW), false);
  });

  it("serializes two claims on the same document", async () => {
    if (usesPostgres()) return;
    const filename = "tick-claim-test.json";
    try {
      await mutateJsonFile(filename, { n: 0 }, (current) => current);
      await Promise.all(
        [0, 1, 2, 3, 4].map(() =>
          mutateJsonFile<{ n: number }>(filename, { n: 0 }, async (current) => {
            await new Promise((resolve) => setTimeout(resolve, 5));
            return { n: current.n + 1 };
          })
        )
      );
      let value = 0;
      await mutateJsonFile<{ n: number }>(filename, { n: 0 }, (current) => {
        value = current.n;
        return current;
      });
      assert.equal(value, 5);
    } finally {
      await unlink(path.join(process.cwd(), "data", filename)).catch(() => undefined);
    }
  });
});

describe("abandoned booking nudge", () => {
  it("waits about two hours, then allows one nudge", () => {
    const fresh = draft({ updatedAt: new Date(NOW - 30 * 60 * 1000).toISOString() });
    assert.equal(abandonedNudgeDue(fresh, NOW), false);
    assert.equal(abandonedNudgeDue(draft(), NOW), true);
    assert.equal(abandonedNudgeDue(draft({ nudgeSentAt: new Date(NOW).toISOString() }), NOW), false);
    assert.equal(abandonedNudgeDue(draft({ nudgeOptOut: true }), NOW), false);
    assert.equal(abandonedNudgeDue(draft({ completedAt: new Date(NOW).toISOString() }), NOW), false);
    assert.equal(abandonedNudgeDue(draft(), NOW, true), false);
  });

  it("treats a booking saved after the draft as finished", () => {
    const row = draft();
    assert.equal(draftWasBooked(row, [{ email: "amina@example.com", createdAt: new Date(NOW).toISOString() }]), true);
    assert.equal(
      draftWasBooked(row, [{ email: "amina@example.com", createdAt: new Date(NOW - 7 * 24 * 60 * 60 * 1000).toISOString() }]),
      false
    );
  });

  it("includes one unsubscribe link and does not promise a second email", () => {
    const letter = composeAbandonedEmail(draft());
    assert.match(letter.html, /api\/booking-drafts\/draft-1\/unsubscribe/);
    assert.match(letter.text, /will not send another note/i);
    assert.match(letter.html, /Pick a time/);
  });
});

describe("portal magic link", () => {
  it("works once", () => {
    const links: PortalMagicLink[] = [
      {
        token: "once",
        email: "amina@example.com",
        createdAt: new Date(NOW).toISOString(),
        expiresAt: new Date(NOW + 15 * 60 * 1000).toISOString(),
      },
    ];
    const first = applyMagicConsume(links, "once", NOW);
    assert.equal(first.email, "amina@example.com");
    const second = applyMagicConsume(first.links, "once", NOW + 1000);
    assert.equal(second.email, null);
  });

  it("rejects an expired link", () => {
    const links: PortalMagicLink[] = [
      {
        token: "old",
        email: "amina@example.com",
        createdAt: new Date(NOW - 20 * 60 * 1000).toISOString(),
        expiresAt: new Date(NOW - 1000).toISOString(),
      },
    ];
    assert.equal(applyMagicConsume(links, "old", NOW).email, null);
  });

  it("puts the link first and keeps the code", () => {
    const letter = composePortalSignIn({
      email: "amina@example.com",
      code: "123456",
      magicUrl: "https://thebeaconstudio.co.ke/api/portal/magic?token=abc",
    });
    assert.match(letter.html, /api\/portal\/magic\?token=abc/);
    assert.match(letter.text, /123456/);
    assert.match(letter.text, /works once/i);
  });
});

describe("industry workflows and comparison", () => {
  it("gives each requested industry one local workflow", () => {
    const slugs = ["retail", "real-estate", "clinics", "schools", "restaurants", "saccos"];
    for (const slug of slugs) {
      const page = industryLandings.find((item) => item.slug === slug);
      assert.ok(page, slug);
      assert.equal(page?.workflow?.steps.length, 3, slug);
      assert.ok(page?.workflow?.title);
    }
  });

  it("compares hire, freelancer, and the studio", () => {
    assert.deepEqual(
      studioComparison.map((item) => item.id),
      ["hire", "freelancer", "beacon"]
    );
    assert.match(studioComparison.map((item) => item.title).join(" "), /The Beacon Studio/);
  });
});

describe("visitor timezone", () => {
  it("converts a Nairobi slot into the visitor zone", () => {
    assert.match(formatSlotInZone("2026-10-22", "10:00", "Africa/Nairobi"), /10:00/i);
    assert.match(formatSlotInZone("2026-10-22", "10:00", "Europe/London"), /8:00/i);
  });
});
