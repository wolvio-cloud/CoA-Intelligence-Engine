import { statusBadgeClasses, type ValidationStatusKey } from "@/config/brand";

const keys: ValidationStatusKey[] = ["PASS", "WARNING", "FAIL", "REVIEW", "ERROR"];

function isStatusKey(s: string): s is ValidationStatusKey {
  return keys.includes(s as ValidationStatusKey);
}

export function StatusBadge({ status }: { status: string }) {
  const key: ValidationStatusKey = isStatusKey(status) ? status : "REVIEW";
  const { label, className } = statusBadgeClasses[key];

  return (
    <span
      className={`inline-flex items-center justify-center leading-none rounded border px-2 py-0.5 text-[11px] font-medium tracking-tight lg:px-2.5 lg:py-1 lg:text-xs ${className}`}
    >
      {label}
    </span>
  );
}