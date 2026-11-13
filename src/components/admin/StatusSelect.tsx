import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateStatus, type Registration, type RegistrationStatus } from "@/lib/admin-data";

export function StatusSelect({ reg, className }: { reg: Registration; className?: string }) {
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: (s: RegistrationStatus) => updateStatus(reg.id, s),
    onMutate: async (s) => {
      await qc.cancelQueries({ queryKey: ["registrations"] });
      const prev = qc.getQueryData<Registration[]>(["registrations"]);
      qc.setQueryData<Registration[]>(["registrations"], (old) => old?.map((r) => (r.id === reg.id ? { ...r, status: s } : r)));
      qc.setQueryData<Registration | null>(["registration", reg.id], (old) => (old ? { ...old, status: s } : old));
      return { prev };
    },
    onError: (_e, _s, ctx) => {
      if (ctx?.prev) qc.setQueryData(["registrations"], ctx.prev);
      qc.invalidateQueries({ queryKey: ["registration", reg.id] });
      toast.error("Could not update status");
    },
    onSuccess: (_d, s) => toast.success(`${reg.reference} marked as ${s}`),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["registrations"] });
      qc.invalidateQueries({ queryKey: ["registration", reg.id] });
    },
  });
  return (
    <Select value={reg.status} onValueChange={(v) => m.mutate(v as RegistrationStatus)} disabled={m.isPending}>
      <SelectTrigger className={className ?? "h-9 w-32 rounded-lg text-xs"} aria-label="Application status">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="approved">Approved</SelectItem>
        <SelectItem value="rejected">Rejected</SelectItem>
      </SelectContent>
    </Select>
  );
}
