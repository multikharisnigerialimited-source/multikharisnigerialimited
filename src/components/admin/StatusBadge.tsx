import { cn } from "@/lib/utils";
import type { RegistrationStatus } from "@/lib/admin-data";

const styles: Record<RegistrationStatus, string> = {
  pending: "bg-warning/25 text-warning-foreground",
  approved: "bg-success/15 text-success",
  rejected: "bg-destructive/10 text-destructive",
};

export function StatusBadge({ status }: { status: RegistrationStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize", styles[status])}>
      {status}
    </span>
  );
}
