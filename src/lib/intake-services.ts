import { siteConfig } from "@/data/site";

export function normalizeServiceIds(input: {
  projectType?: string;
  projectTypes?: unknown;
}): string[] {
  const fromArray = Array.isArray(input.projectTypes)
    ? input.projectTypes
        .filter((id): id is string => typeof id === "string" && id.trim().length > 0)
        .map((id) => id.trim())
    : [];
  const unique = [...new Set(fromArray)];
  if (unique.length) return unique;
  const single = typeof input.projectType === "string" ? input.projectType.trim() : "";
  return single ? [single] : [];
}

export function isKnownService(id: string): boolean {
  return siteConfig.intake.projectTypes.some((item) => item.id === id);
}

export function serviceLabel(id: string): string {
  return siteConfig.intake.projectTypes.find((item) => item.id === id)?.label ?? id;
}

export function serviceLabels(ids: string[]): string {
  const labels = ids.map(serviceLabel).filter(Boolean);
  return labels.join(", ");
}
