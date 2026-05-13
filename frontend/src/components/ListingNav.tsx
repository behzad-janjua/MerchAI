import { useRef } from "react";
import type { CostSummary, ProductListing } from "../types";

type Props = {
  listings: ProductListing[];
  selectedId: string | null;
  costSummary: CostSummary | null;
  onSelect: (id: string) => void;
  onImportCsv: (csv: string) => void;
};

function scoreClass(score: number | null | undefined): string {
  if (score == null) return "";
  if (score >= 80) return "score--high";
  if (score >= 60) return "score--mid";
  return "score--low";
}

function money(value: number | null | undefined): string {
  return `$${(value ?? 0).toFixed(4)}`;
}

export function ListingNav({ listings, selectedId, costSummary, onSelect, onImportCsv }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const csv = ev.target?.result as string;
      onImportCsv(csv);
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="col-left">
      <div className="col-section-header">
        <h2>Listings</h2>
        <span className="count-badge">{listings.length}</span>
      </div>

      <div className="import-strip">
        <label className="import-trigger">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Import CSV
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
          />
        </label>
      </div>

      <div className="listing-nav">
        {listings.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
            </div>
            <strong>No listings yet</strong>
            <span>Import a CSV or create your first listing above</span>
          </div>
        ) : (
          listings.map((listing) => {
            const score = listing.latestSuggestion?.score ?? null;
            const selected = listing.id === selectedId;
            return (
              <button
                key={listing.id}
                className={`listing-item${selected ? " selected" : ""}`}
                onClick={() => onSelect(listing.id)}
                aria-pressed={selected}
              >
                <span className="listing-glyph">{listing.title[0]?.toUpperCase() ?? "?"}</span>
                <span className="listing-meta">
                  <strong>{listing.title}</strong>
                  <small>{listing.productType ?? listing.vendor ?? "Uncategorized"}</small>
                </span>
                {score != null && (
                  <span className={`score-pill ${scoreClass(score)}`}>{score}</span>
                )}
              </button>
            );
          })
        )}
      </div>

      <div className="cost-section">
        <p className="cost-section-label">Usage &amp; cost</p>
        {costSummary ? (
          <>
            <div className="metric-grid">
              <div className="metric-card">
                <strong>{money(costSummary.totalEstimatedCost)}</strong>
                <small>Total cost</small>
              </div>
              <div className="metric-card">
                <strong>{costSummary.totalStepRuns}</strong>
                <small>Agent steps</small>
              </div>
            </div>
            {costSummary.byProviderModel.length > 0 && (
              <div className="provider-list">
                {costSummary.byProviderModel.map((row) => (
                  <div className="provider-row" key={`${row.provider}:${row.model}`}>
                    <div className="provider-row-info">
                      <b>{row.provider}</b>
                      <small>{row.model}</small>
                    </div>
                    <span className="provider-row-cost">{money(row.estimatedCost)}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="muted">Run the optimizer to track costs.</p>
        )}
      </div>
    </div>
  );
}
