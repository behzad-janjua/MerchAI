import { motion, AnimatePresence } from "framer-motion";
import type { ProductListing } from "../types";

type Props = {
  selectedListing: ProductListing | null;
  isNew: boolean;
  optimizing: boolean;
  theme: "light" | "dark";
  onNew: () => void;
  onSave: () => void;
  onOptimize: () => void;
  onRefresh: () => void;
  onToggleTheme: () => void;
};

const tap = { whileTap: { scale: 0.96 } };
const iconAnim = {
  initial: { rotate: -30, opacity: 0, scale: 0.7 },
  animate: { rotate: 0, opacity: 1, scale: 1 },
  exit:    { rotate: 30, opacity: 0, scale: 0.7 },
  transition: { duration: 0.18, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] },
};

export function Header({ selectedListing, isNew, optimizing, theme, onNew, onOptimize, onRefresh, onToggleTheme }: Props) {
  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-mark">
          <svg viewBox="0 0 24 24">
            <path d="M2 12h3l2-7 2 14 2-10 2 6 2-3h3" />
          </svg>
        </div>
        <div className="brand-text">
          <span className="brand-name">MerchAI</span>
          <span className="brand-sub">Shopify listing optimizer</span>
        </div>
      </div>

      <div className="header-actions">
        <motion.button className="btn btn-ghost btn-icon" onClick={onRefresh} title="Refresh" {...tap}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
          </svg>
        </motion.button>

        <motion.button
          className="btn btn-ghost btn-icon"
          onClick={onToggleTheme}
          title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          {...tap}
        >
          <AnimatePresence mode="wait" initial={false}>
            {theme === "light" ? (
              <motion.svg key="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ width: 15, height: 15, position: "absolute" }}
                {...iconAnim}>
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </motion.svg>
            ) : (
              <motion.svg key="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ width: 15, height: 15, position: "absolute" }}
                {...iconAnim}>
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.button>

        <div className="header-sep" />

        <motion.button className="btn btn-outline" onClick={onNew} {...tap}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New listing
        </motion.button>

        <motion.button
          className="btn btn-ai"
          onClick={onOptimize}
          disabled={!selectedListing || isNew || optimizing}
          title={!selectedListing || isNew ? "Save a listing first" : "Run AI optimizer"}
          {...tap}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
          </svg>
          {optimizing ? "Optimizing…" : "Run optimizer"}
        </motion.button>
      </div>
    </header>
  );
}
