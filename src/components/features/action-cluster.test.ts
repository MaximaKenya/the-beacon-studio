import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { siteConfig } from "@/data/site";
import { channelLabel } from "@/lib/lead-model";
import {
  ASSISTANT_COMPACT_LABEL,
  CLUSTER_ACTION_LABELS,
  clusterActions,
  clusterPlacement,
} from "./action-cluster";

const ASSISTANT_NAME = "The Beacon Studio AI";

describe("action cluster", () => {
  it("names the assistant once and offers each contact action once", () => {
    assert.equal(siteConfig.assistant.name, ASSISTANT_NAME);
    assert.match(siteConfig.assistant.greeting, new RegExp(`I'm ${ASSISTANT_NAME}`));
    assert.equal(ASSISTANT_COMPACT_LABEL, "AI");
    assert.deepEqual(
      clusterActions({ assistant: true, phone: true, booking: true }),
      ["chat", "whatsapp", "call", "book"]
    );
    assert.deepEqual(Object.values(CLUSTER_ACTION_LABELS), [
      "Chat with AI",
      "WhatsApp",
      "Call",
      "Book a call",
    ]);
    const labels = Object.values(CLUSTER_ACTION_LABELS);
    assert.equal(new Set(labels).size, labels.length);
  });

  it("hides for the chat panel, booking modal, and splash, and never stacks on a mobile bar", () => {
    const clear = {
      chatOpen: false,
      bookingOpen: false,
      splashOpen: false,
      bottomBar: false,
      narrow: false,
      cornerBlocked: false,
    };
    assert.equal(clusterPlacement(clear), "docked");
    assert.equal(clusterPlacement({ ...clear, chatOpen: true }), "hidden");
    assert.equal(clusterPlacement({ ...clear, bookingOpen: true }), "hidden");
    assert.equal(clusterPlacement({ ...clear, splashOpen: true }), "hidden");
    assert.equal(clusterPlacement({ ...clear, cornerBlocked: true }), "hidden");
    assert.equal(clusterPlacement({ ...clear, bottomBar: true, narrow: true }), "hidden");
    assert.equal(clusterPlacement({ ...clear, bottomBar: true, narrow: false }), "lifted");
    assert.equal(
      clusterPlacement({ ...clear, bottomBar: true, narrow: false, cornerBlocked: true }),
      "hidden"
    );
  });

  it("mounts one cluster and drops the duplicate bottom controls", () => {
    const overlays = readFileSync("src/components/features/DeferredOverlays.tsx", "utf8");
    assert.match(overlays, /ActionCluster/);
    for (const gone of ["WhatsAppButton", "FloatingBookCTA", "MobileAuditBar", "ChatWidget"]) {
      assert.doesNotMatch(overlays, new RegExp(gone));
    }

    const chat = readFileSync("src/components/features/BeaconAiChat.tsx", "utf8");
    assert.match(chat, /siteConfig\.assistant\.name/);
    assert.match(chat, /siteConfig\.assistant\.greeting/);
    assert.doesNotMatch(chat, /bottom-32/);
    assert.doesNotMatch(chat, /Beacon AI/);
    assert.doesNotMatch(chat, /I'm Glow/);

    const cluster = readFileSync("src/components/features/ActionCluster.tsx", "utf8");
    assert.match(cluster, /action-pill/);
    assert.match(cluster, /safe-area-inset-bottom/);
    assert.match(cluster, /safe-area-inset-right/);
    assert.doesNotMatch(cluster, /border/);
    assert.doesNotMatch(cluster, /#25D366/);
    assert.match(cluster, /h-5 w-5/);

    const css = readFileSync("src/app/globals.css", "utf8");
    assert.match(css, /\.action-pill/);
    assert.match(css, /\[data-theme="light"\] \.action-pill/);
    assert.match(css, /\[data-theme="dark"\] \.action-pill/);

    assert.equal(channelLabel("beacon-ai"), ASSISTANT_NAME);
  });
});
