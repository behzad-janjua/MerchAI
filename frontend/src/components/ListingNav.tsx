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
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
        />
        <button className="btn btn-outline" style={{ fontSize: 12, height: 28, padding: "0 10px" }} onClick={() => fileRef.current?.click()}>
          Import CSV
        </button>
      </div>

      <div className="listing-nav">
        {listings.length === 0 ? (
          <div className="empty" style={{ paddingTop: 40 }}>
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
            </div>
            <strong>No listings yet</strong>
            <span>Import a CSV or create your first listing</span>
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
              >
                <span className="listing-glyph">{listing.title[0]?.toUpperCase() ?? "?"}</span>
                <span className="listing-meta">
                  <strong>{listing.title}</strong>
                  <small>{listing.productType ?? listing.vendor ?? "Uncategorized"}</small>
                </span>
                <span className={`score-pill ${scoreClass(score)}`}>{score ?? "–"}</span>
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
            <div className="provider-list">
              {costSummary.byProviderModel.length === 0 ? (
                <p className="muted">No runs yet.</p>
              ) : (
                costSummary.byProviderModel.map((row) => (
                  <div className="provider-row" key={`${row.provider}:${row.model}`}>
                    <div className="provider-row-info">
                      <b>{row.provider}</b>
                      <small>{row.model}</small>
                    </div>
                    <span className="provider-row-cost">{money(row.estimatedCost)}</span>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <p className="muted">Run the optimizer to track costs.</p>
        )}
      </div>
    </div>
  );
}
