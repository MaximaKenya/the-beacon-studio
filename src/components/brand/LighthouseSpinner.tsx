import { BeaconMark } from "@/components/brand/BeaconMark";

type LighthouseSpinnerProps = {
  size?: number;
  label?: string;
};

/** Route and async loading mark. Uses the live lighthouse, with a soft float. */
export function LighthouseSpinner({ size = 72, label = "Loading" }: LighthouseSpinnerProps) {
  return (
    <div role="status" className="flex flex-col items-center gap-3" aria-live="polite">
      <span className="lighthouse-float inline-flex">
        <BeaconMark size={size} />
      </span>
      <span className="text-sm text-muted">{label}</span>
    </div>
  );
}
