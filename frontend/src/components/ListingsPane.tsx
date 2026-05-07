import { CircleGauge, Package } from "lucide-react";
import { ProductListing } from "../types";

type ListingsPaneProps = {
  listings: ProductListing[];
  selectedId: string | null;
  onSelect(id: string): void;
};

export function ListingsPane({ listings, selectedId, onSelect }: ListingsPaneProps) {
  return (
    <aside className="panel listingsPane">
      <div className="panelHeader">
        <h2>Listings</h2>
        <span>{listings.length}</span>
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
