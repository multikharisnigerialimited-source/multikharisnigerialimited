import { cn } from "@/lib/utils";

export function PaymentBadge({ paid, className }: { paid: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-bold",
        paid ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive",
        className,
      )}
    >
      {paid ? "Paid" : "Unpaid"}
    </span>
  );
}
