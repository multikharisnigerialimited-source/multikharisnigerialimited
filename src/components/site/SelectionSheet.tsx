import { Link } from "@tanstack/react-router";
import { GraduationCap, Trash2, ShoppingCart } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useSelection } from "@/lib/selection";

export function SelectionSheet() {
  const { items, remove, clear, open, setOpen } = useSelection();
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 font-display text-navy">
            <ShoppingCart className="h-5 w-5 text-primary" /> Your selected courses
          </SheetTitle>
          <SheetDescription>
            These courses will be pre-selected when you register. You can change them anytime.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-3 overflow-y-auto px-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-sky p-8 text-center">
              <GraduationCap className="h-10 w-10 text-primary" />
              <p className="text-sm text-muted-foreground">No courses selected yet.</p>
              <Button variant="outline" size="sm" asChild onClick={() => setOpen(false)}>
                <Link to="/courses">Browse courses</Link>
              </Button>
            </div>
          ) : (
            items.map((s) => (
              <div key={s} className="flex items-center justify-between rounded-xl border bg-card p-3 shadow-soft">
                <span className="text-sm font-semibold text-navy">{s}</span>
                <Button variant="ghost" size="icon" aria-label={`Remove ${s}`} onClick={() => remove(s)}>
                  <Trash2 className="text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>
        {items.length > 0 && (
          <div className="space-y-2 border-t p-4">
            <Button asChild size="lg" className="w-full" onClick={() => setOpen(false)}>
              <Link to="/register">Proceed to registration</Link>
            </Button>
            <Button variant="ghost" className="w-full" onClick={clear}>
              Clear selection
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
