import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const STEP_LABELS = ["Personal", "Category", "Training", "Review", "Done"];
export const STEP_TITLES = [
  "PERSONAL INFORMATION",
  "PARTICIPANT CATEGORY",
  "TRAINING DETAILS",
  "REVIEW YOUR INFORMATION",
  "REGISTRATION SUCCESSFUL",
];

export function Stepper({ step }: { step: number }) {
  return (
    <div>
      <ol className="flex items-center" aria-label="Registration progress">
        {STEP_LABELS.map((label, i) => {
          const n = i + 1;
          const done = n < step;
          const active = n === step;
          return (
            <li key={label} className={cn("flex items-center", i < STEP_LABELS.length - 1 && "flex-1")}>
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all sm:h-10 sm:w-10",
                    done && "bg-primary text-primary-foreground",
                    active && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    !done && !active && "bg-secondary text-navy/50",
                  )}
                  aria-current={active ? "step" : undefined}
                >
                  {done ? <Check className="h-4.5 w-4.5" /> : n}
                </span>
                <span
                  className={cn(
                    "hidden text-[11px] font-semibold sm:block",
                    active || done ? "text-navy" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <span className="mx-1.5 mb-0 h-1 flex-1 overflow-hidden rounded-full bg-secondary sm:mb-5">
                  <span
                    className="block h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: done ? "100%" : "0%" }}
                  />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
