import { randomUUID } from "crypto";
import { AsyncLocalStorage } from "node:async_hooks";
import type { SandboxStep, SandboxStepKind } from "@/lib/automations/types";

const current = new AsyncLocalStorage<SandboxStep[]>();

export function traceStep(step: { kind: SandboxStepKind; title: string; detail: string }) {
  const steps = current.getStore();
  if (!steps) return;
  steps.push({
    id: randomUUID(),
    kind: step.kind,
    title: step.title.slice(0, 180),
    detail: step.detail.slice(0, 4000),
  });
}

export function runWithTrace<T>(steps: SandboxStep[], fn: () => Promise<T>): Promise<T> {
  return current.run(steps, fn);
}
