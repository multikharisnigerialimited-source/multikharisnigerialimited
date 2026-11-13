import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { SKILLS, type Skill } from "./registration-schema";

type Ctx = {
  items: Skill[];
  add: (s: Skill) => void;
  remove: (s: Skill) => void;
  toggle: (s: Skill) => void;
  clear: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
};

const SelectionContext = createContext<Ctx | null>(null);
const KEY = "mnl-course-selection";

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Skill[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        setItems(parsed.filter((s): s is Skill => (SKILLS as readonly string[]).includes(s)));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const persist = useCallback((next: Skill[]) => {
    setItems(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      items,
      add: (s) => !items.includes(s) && persist([...items, s]),
      remove: (s) => persist(items.filter((i) => i !== s)),
      toggle: (s) => persist(items.includes(s) ? items.filter((i) => i !== s) : [...items, s]),
      clear: () => persist([]),
      open,
      setOpen,
    }),
    [items, open, persist],
  );

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error("useSelection must be used inside SelectionProvider");
  return ctx;
}
