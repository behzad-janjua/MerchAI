import { CircleGauge, Package, Upload } from "lucide-react";
import { type ChangeEvent, useRef } from "react";
import { ProductListing } from "../types";

type ListingsPaneProps = {
  listings: ProductListing[];
  selectedId: string | null;
  onSelect(id: string): void;
  onImport(file: File): void;
  disabled?: boolean;
};

export function ListingsPane({ listings, selectedId, onSelect, onImport, disabled = false }: ListingsPaneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      onImport(file);
      event.target.value = "";
    }
  }

  return (
    <aside className="panel listingsPane">
      <div className="panelHeader">
        <h2>Listings</h2>
        <div className="panelHeaderActions">
          <span>{listings.length}</span>
          <button
            className="iconButton small"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            title="Import CSV"
          >
            <Upload size={16} />
          </button>
          <input
            ref={fileInputRef}
            className="hiddenFile"
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
          />
        </div>
      </div>
      <div className="listingList">
        {listings.map((listing) => (
          <button
            className={listing.id === selectedId ? "listingItem selected" : "listingItem"}
            key={listing.id}
            type="button"
            onClick={() => onSelect(listing.id)}
          >
            <Package size={18} />
            <span className="listingText">
              <strong>{listing.title}</strong>
              <small>{listing.productType || listing.vendor || "Uncategorized"}</small>
            </span>
            <span className="scoreBadge">
              <CircleGauge size={14} />
              {listing.latestSuggestion?.score ?? "--"}
            </span>
          </button>
        ))}
        {listings.length === 0 && <p className="emptyState">No listings yet.</p>}
      </div>
    </aside>
  );
}
