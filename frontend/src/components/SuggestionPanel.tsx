import { CheckCircle2, Search, Tags } from "lucide-react";
import { ProductListing } from "../types";

type SuggestionPanelProps = {
  listing: ProductListing | null;
};

export function SuggestionPanel({ listing }: SuggestionPanelProps) {
  const suggestion = listing?.latestSuggestion;

  return (
    <aside className="panel suggestionPane">
      <div className="panelHeader">
        <h2>Suggestion</h2>
        <span>{suggestion?.score ?? "--"}</span>
      </div>

      {!suggestion && <p className="emptyState">Run an optimization to generate recommendations.</p>}

      {suggestion && (
        <div className="suggestionStack">
          <section>
            <h3>
              <CheckCircle2 size={17} />
              Title
            </h3>
            <p>{suggestion.improvedTitle || listing?.title}</p>
          </section>
          <section>
            <h3>
              <Search size={17} />
              Description
            </h3>
            <p className="descriptionCopy">{suggestion.improvedDescription}</p>
          </section>
          <section>
            <h3>
              <Tags size={17} />
              Tags
            </h3>
            <div className="tagWrap">
              {suggestion.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </section>
          <section>
            <h3>Positioning</h3>
            <p>{suggestion.positioningRecommendations}</p>
          </section>
          <section>
            <h3>SEO</h3>
            <p>{suggestion.seoNotes}</p>
          </section>
        </div>
      )}
    </aside>
  );
}
