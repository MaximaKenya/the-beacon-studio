import { BeaconCreekMark } from "@/components/brand/BeaconCreekMark";

type LighthouseSpinnerProps = {
  size?: number;
  label?: string;
};

/** Route and async loading mark. Beacon Creek mark with a looping creek shimmer (static under reduced motion). */
export function LighthouseSpinner({ size = 72, label = "Loading" }: LighthouseSpinnerProps) {
  return (
    <div role="status" className="flex flex-col items-center gap-3" aria-live="polite">
      <span className="inline-flex">
        <BeaconCreekMark size={size} variant="loop" />
      </span>
      <span className="text-sm text-muted">{label}</span>
    </div>
  );
}
