import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BATCHES = ["A", "B", "C", "D", "E", "F"];

/** Admin control for the batch letter used in new registration numbers (e.g. MNL-2026C-000010). */
export function BatchSetting() {
  const qc = useQueryClient();
  const { data: batch } = useQuery({
    queryKey: ["current-batch"],
    queryFn: async () => {
      const { data, error } = await supabase.from("app_settings").select("value").eq("key", "current_batch").maybeSingle();
      if (error) throw error;
      return data?.value ?? "A";
    },
  });
  const year = new Date().getFullYear();

  async function change(v: string) {
    const { error } = await supabase.from("app_settings").update({ value: v, updated_at: new Date().toISOString() }).eq("key", "current_batch");
    if (error) {
      toast.error("Could not change the batch. Please try again.");
      return;
    }
    qc.setQueryData(["current-batch"], v);
    toast.success(`New registrations will now be numbered MNL-${year}${v}-…`);
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border bg-card px-4 py-2 shadow-soft">
      <div className="text-xs">
        <p className="font-bold text-navy">Current batch</p>
        <p className="text-muted-foreground">MNL-{year}{batch ?? "…"}-000001</p>
      </div>
      <Select value={batch ?? ""} onValueChange={(v) => void change(v)}>
        <SelectTrigger aria-label="Current batch" className="h-10 w-28 rounded-xl">
          <SelectValue placeholder="Batch" />
        </SelectTrigger>
        <SelectContent>
          {BATCHES.map((b) => (
            <SelectItem key={b} value={b}>
              Batch {b}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
