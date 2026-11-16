import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, Loader2, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteRegistration } from "@/lib/admin.functions";
import { fullName, receiptUrlQuery, updateReference, type ReceiptCheckInfo, type Registration } from "@/lib/admin-data";
import { formatNaira } from "@/lib/money";

export function DeleteCandidateButton({ r, onDeleted }: { r: Registration; onDeleted?: () => void }) {
  const del = useServerFn(deleteRegistration);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm"><Trash2 /> Delete</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {fullName(r)}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes registration <strong>{r.reference}</strong>, the passport photo, payment receipt and
            payment records. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={busy}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                await del({ data: { id: r.id } });
                await qc.invalidateQueries({ queryKey: ["registrations"] });
                qc.removeQueries({ queryKey: ["registration", r.id] });
                toast.success("Candidate deleted");
                if (onDeleted) onDeleted();
                else navigate({ to: "/admin" });
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Could not delete this candidate.");
                setBusy(false);
              }
            }}
          >
            {busy && <Loader2 className="animate-spin" />} Delete permanently
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function EditableReference({ r }: { r: Registration }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(r.reference);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!editing) {
    return (
      <p className="mt-1 flex items-center gap-2 font-mono text-sm font-bold text-primary">
        {r.reference}
        <button
          type="button"
          className="no-print rounded-md p-1 text-muted-foreground hover:bg-sky hover:text-primary"
          aria-label="Edit registration number"
          onClick={() => {
            setValue(r.reference);
            setError(null);
            setEditing(true);
          }}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </p>
    );
  }

  async function save() {
    setBusy(true);
    const msg = await updateReference(r.id, value);
    setBusy(false);
    if (msg) {
      setError(msg);
      return;
    }
    await qc.invalidateQueries({ queryKey: ["registration", r.id] });
    await qc.invalidateQueries({ queryKey: ["registrations"] });
    toast.success("Registration number updated");
    setEditing(false);
  }

  return (
    <div className="no-print mt-2">
      <div className="flex items-center gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value.toUpperCase())}
          aria-label="Registration number"
          className="h-9 w-56 rounded-lg font-mono text-sm uppercase"
          onKeyDown={(e) => e.key === "Enter" && save()}
          autoFocus
        />
        <Button size="sm" onClick={save} disabled={busy} aria-label="Save registration number">
          {busy ? <Loader2 className="animate-spin" /> : <Check />}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setEditing(false)} disabled={busy} aria-label="Cancel">
          <X />
        </Button>
      </div>
      {error && <p role="alert" className="mt-1 text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

export function ReceiptPanel({ r }: { r: Registration }) {
  const { data: url } = useQuery(receiptUrlQuery(r.receipt_path));
  if (!r.receipt_path) return null;
  const c = (r.receipt_check ?? {}) as ReceiptCheckInfo;
  return (
    <section>
      <h2 className="mb-2 font-display text-xs font-bold uppercase tracking-[0.15em] text-primary">Payment Receipt (bank transfer)</h2>
      <div className="flex flex-col gap-4 rounded-2xl bg-surface p-4 sm:flex-row">
        {url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="shrink-0">
            <img src={url} alt="Payment receipt" className="h-56 w-40 rounded-xl border object-cover object-top" />
          </a>
        ) : (
          <div className="flex h-56 w-40 items-center justify-center rounded-xl bg-sky"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        )}
        <dl className="flex-1 space-y-1.5 text-sm">
          <p className={c.is_receipt ? "font-bold text-success" : "font-bold text-destructive"}>
            Automatic check: {c.is_receipt ? "looks like a valid payment receipt" : "not confirmed as a receipt"}
          </p>
          {c.reason && <p className="text-muted-foreground">{c.reason}</p>}
          <Info l="Amount on receipt" v={c.amount_naira != null ? formatNaira(Math.round(c.amount_naira * 100)) : null} />
          <Info l="Paid to" v={[c.recipient_name, c.recipient_account].filter(Boolean).join(" · ") || null} />
          <Info l="Matches our account" v={c.recipient_matches ?? null} />
          <Info l="Bank" v={c.bank ?? null} />
          <Info l="Date" v={c.transaction_date ?? null} />
          <Info l="Transaction ref" v={c.transaction_reference ?? null} />
          <p className="pt-2 text-xs text-muted-foreground">Confirm the money arrived in your account, then use “Mark paid” in the Payments tab.</p>
        </dl>
      </div>
    </section>
  );
}

function Info({ l, v }: { l: string; v: string | null }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 pb-1.5">
      <dt className="text-muted-foreground">{l}</dt>
      <dd className="text-right font-semibold text-navy">{v ?? "—"}</dd>
    </div>
  );
}
