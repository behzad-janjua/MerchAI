import type { ProductListing } from "../types";

type Props = {
  selectedListing: ProductListing | null;
  isNew: boolean;
  optimizing: boolean;
  onNew: () => void;
  onSave: () => void;
  onOptimize: () => void;
  onRefresh: () => void;
};

export function Header({ selectedListing, isNew, optimizing, onNew, onOptimize, onRefresh }: Props) {
  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-mark">
          <svg viewBox="0 0 24 24">
            <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" />
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          </svg>
        </div>
        <div className="brand-text">
          <span className="brand-name">MerchAI</span>
          <span className="brand-sub">Shopify listing optimizer</span>
        </div>
      </div>

      <div className="header-actions">
        <button className="btn btn-ghost btn-icon" onClick={onRefresh} title="Refresh listings">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
          </svg>
        </button>

        <div className="header-sep" />

        <button className="btn btn-outline" onClick={onNew}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New listing
        </button>

        <button
          className="btn btn-ai"
          onClick={onOptimize}
          disabled={!selectedListing || isNew || optimizing}
          title={!selectedListing || isNew ? "Save a listing first, then run the optimizer" : "Run AI optimizer"}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
          </svg>
          {optimizing ? "Optimizing…" : "Run optimizer"}
        </button>
      </div>
    </header>
  );
}
