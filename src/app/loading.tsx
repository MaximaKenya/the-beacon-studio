import { LighthouseSpinner } from "@/components/brand/LighthouseSpinner";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="sleek-card rounded-3xl px-10 py-8">
        <LighthouseSpinner label="Loading" />
      </div>
    </div>
  );
}
