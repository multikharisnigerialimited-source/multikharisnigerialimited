import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Banknote, CheckCircle2, CircleDollarSign, Clock, CreditCard, Eye, Inbox, Loader2, Save, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaymentBadge } from "./PaymentBadge";
import { PayoutNote } from "@/components/payment/PayCard";
import { fullName, paymentsQuery, saveCourseFees, setPaymentStatus, type Registration } from "@/lib/admin-data";
import { courseFeesQuery } from "@/lib/fees";
import { formatNaira, nairaToKobo, totalFee } from "@/lib/money";
import { SKILLS } from "@/lib/registration-schema";
import { cn } from "@/lib/utils";

export function PaymentTracker({ regs }: { regs: Registration[] }) {
  const qc = useQueryClient();
  const { data: fees = {} } = useQuery(courseFeesQuery);
  const { data: payments = [], isLoading: loadingPayments } = useQuery(paymentsQuery);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState<string | null>(null);

  const due = (r: Registration) => r.amount_due || totalFee(r.courses, fees);

  const stats = useMemo(() => {
    const paid = regs.filter((r) => r.payment_status === "paid");
    const unpaid = regs.filter((r) => r.payment_status !== "paid");
    return {
      collected: paid.reduce((s, r) => s + r.amount_paid, 0),
      outstanding: unpaid.reduce((s, r) => s + (r.amount_due || totalFee(r.courses, fees)), 0),
      paid: paid.length,
      unpaid: unpaid.length,
    };
  }, [regs, fees]);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return regs.filter((r) => {
      if (filter === "paid" && r.payment_status !== "paid") return false;
      if (filter === "unpaid" && r.payment_status === "paid") return false;
      return !t || `${r.reference} ${fullName(r)} ${r.email} ${r.phone}`.toLowerCase().includes(t);
    });
  }, [regs, q, filter]);

  async function toggle(r: Registration) {
    const paid = r.payment_status !== "paid";
    const amount = due(r);
    const msg = paid
      ? `Mark ${fullName(r)} as PAID (${formatNaira(amount)})? Use this for cash or bank transfer payments.`
      : `Mark ${fullName(r)} as UNPAID?`;
    if (!window.confirm(msg)) return;
    setBusy(r.id);
    try {
      await setPaymentStatus(r, paid, amount);
      await qc.invalidateQueries({ queryKey: ["registrations"] });
      await qc.invalidateQueries({ queryKey: ["registration", r.id] });
      toast.success(paid ? "Marked as paid" : "Marked as unpaid");
    } catch {
      toast.error("Could not update the payment status");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Money icon={Banknote} label="Total Collected" value={formatNaira(stats.collected)} accent />
        <Money icon={CircleDollarSign} label="Outstanding" value={formatNaira(stats.outstanding)} />
        <Money icon={CheckCircle2} label="Paid Applicants" value={String(stats.paid)} />
        <Money icon={Clock} label="Unpaid Applicants" value={String(stats.unpaid)} />
      </div>
      <div className="rounded-2xl bg-sky p-4">
        <PayoutNote />
      </div>

      <section className="space-y-3">
        <div className="grid gap-3 rounded-2xl bg-card p-4 shadow-soft md:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, reference…" className="h-11 rounded-xl pl-9" aria-label="Search payments" />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="h-11 w-full rounded-xl md:w-44" aria-label="Payment status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All payments</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {list.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-card py-12 text-center shadow-soft">
            <Inbox className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">No applicants match.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-card shadow-soft">
            <ul className="divide-y divide-border/60">
              {list.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <div className="min-w-[180px] flex-1">
                    <p className="font-semibold text-navy">{fullName(r)}</p>
                    <p className="font-mono text-xs text-muted-foreground">{r.reference}</p>
                  </div>
                  <div className="w-28 text-sm">
                    <p className="text-xs text-muted-foreground">Fee</p>
                    <p className="font-semibold text-navy">{due(r) ? formatNaira(due(r)) : "Not set"}</p>
                  </div>
                  <div className="w-28 text-sm">
                    <p className="text-xs text-muted-foreground">Paid</p>
                    <p className="font-semibold text-navy">{formatNaira(r.amount_paid)}</p>
                  </div>
                  <div className="w-28 text-xs text-muted-foreground">
                    <PaymentBadge paid={r.payment_status === "paid"} />
                    {r.paid_at && <p className="mt-1">{new Date(r.paid_at).toLocaleDateString("en-NG")}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={r.payment_status === "paid" ? "ghost" : "success"}
                      size="sm"
                      disabled={busy === r.id || (r.payment_status !== "paid" && !due(r))}
                      onClick={() => toggle(r)}
                    >
                      {busy === r.id && <Loader2 className="animate-spin" />}
                      {r.payment_status === "paid" ? "Mark unpaid" : "Mark paid"}
                    </Button>
                    <Button asChild variant="subtle" size="sm">
                      <Link to="/admin/$id" params={{ id: r.id }}><Eye /> View</Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl bg-card p-5 shadow-soft">
          <h2 className="flex items-center gap-2 text-lg font-bold text-navy"><CreditCard className="h-5 w-5 text-primary" /> Card transactions</h2>
          <p className="text-sm text-muted-foreground">Every card payment attempt made on the website</p>
          {loadingPayments ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : payments.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No card payments yet.</p>
          ) : (
            <ul className="mt-4 max-h-[480px] divide-y divide-border/60 overflow-y-auto">
              {payments.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-navy">
                      {p.registrations ? `${p.registrations.surname} ${p.registrations.first_name}` : "—"}
                    </p>
                    <p className="truncate font-mono text-[11px] text-muted-foreground">{p.reference}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(p.created_at).toLocaleString("en-NG")}
                      {p.card_last4 && ` · ${p.card_brand ?? "Card"} •••• ${p.card_last4}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-navy">{formatNaira(p.amount)}</p>
                    <TxStatus status={p.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <FeesEditor fees={fees} />
      </div>
    </div>
  );
}

function TxStatus({ status }: { status: string }) {
  const style =
    status === "success" ? "text-success" : status === "pending" ? "text-warning-foreground" : "text-destructive";
  const label = status === "success" ? "Successful" : status === "pending" ? "Pending" : status === "abandoned" ? "Abandoned" : "Failed";
  return <span className={cn("text-xs font-bold", style)}>{label}</span>;
}

function FeesEditor({ fees }: { fees: Record<string, number> }) {
  const qc = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValues(Object.fromEntries(SKILLS.map((s) => [s, fees[s] ? String(fees[s] / 100) : ""])));
  }, [fees]);

  async function save() {
    const rows: { course: string; amount: number }[] = [];
    for (const s of SKILLS) {
      const raw = values[s]?.trim() ?? "";
      const amount = raw === "" ? 0 : nairaToKobo(raw);
      if (amount === null) {
        toast.error(`Enter a valid amount for ${s}`);
        return;
      }
      rows.push({ course: s, amount });
    }
    setSaving(true);
    try {
      await saveCourseFees(rows);
      await qc.invalidateQueries({ queryKey: ["course-fees"] });
      toast.success("Course fees saved");
    } catch {
      toast.error("Could not save course fees");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl bg-card p-5 shadow-soft">
      <h2 className="text-lg font-bold text-navy">Course fees</h2>
      <p className="text-sm text-muted-foreground">Applicants pay the total for the courses they select.</p>
      <div className="mt-4 space-y-2.5">
        {SKILLS.map((s) => (
          <label key={s} className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-navy">{s}</span>
            <span className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">₦</span>
              <Input
                inputMode="decimal"
                value={values[s] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [s]: e.target.value }))}
                placeholder="0"
                aria-label={`Fee for ${s}`}
                className="h-10 w-32 rounded-xl pl-7 text-right"
              />
            </span>
          </label>
        ))}
      </div>
      <Button className="mt-5 w-full" onClick={save} disabled={saving}>
        {saving ? <Loader2 className="animate-spin" /> : <Save />} Save fees
      </Button>
    </section>
  );
}

function Money({ icon: Icon, label, value, accent }: { icon: typeof Banknote; label: string; value: string; accent?: boolean }) {
  return (
    <div className={accent ? "rounded-2xl bg-gradient-navy p-4 text-navy-foreground shadow-card sm:p-5" : "rounded-2xl bg-card p-4 shadow-soft sm:p-5"}>
      <Icon className={accent ? "h-6 w-6 text-primary" : "h-6 w-6 text-primary"} />
      <p className={cn("mt-3 font-display text-2xl font-extrabold sm:text-3xl", !accent && "text-navy")}>{value}</p>
      <p className={accent ? "text-xs font-semibold opacity-90" : "text-xs font-semibold text-muted-foreground"}>{label}</p>
    </div>
  );
}
