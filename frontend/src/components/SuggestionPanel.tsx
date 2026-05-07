import { CheckCircle2, ListChecks, Search, Tags } from "lucide-react";
import { AgentRun, ProductListing } from "../types";

type SuggestionPanelProps = {
  listing: ProductListing | null;
  agentRun: AgentRun | null;
};

export function SuggestionPanel({ listing, agentRun }: SuggestionPanelProps) {
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
              <ListChecks size={17} />
              Agent Steps
            </h3>
            {agentRun?.steps.length ? (
              <div className="stepList">
                {agentRun.steps.map((step) => (
                  <details key={step.id} open={step.stepName === "final_synthesis"}>
                    <summary>
                      <span>{formatStepName(step.stepName)}</span>
                      <small>{formatCurrency(step.estimatedCost ?? 0)}</small>
                    </summary>
                    <p className="descriptionCopy">{step.response || step.errorMessage || "No response recorded."}</p>
                    <small className="mutedLine">
                      {step.provider ?? "unknown"} / {step.model ?? "unknown"} - {(step.inputTokens ?? 0) + (step.outputTokens ?? 0)} tokens
                    </small>
                  </details>
                ))}
              </div>
            ) : (
              <p className="mutedLine">Run details will appear after the latest agent run is loaded.</p>
            )}
          </section>
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

function formatStepName(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatCurrency(value: number): string {
  return `$${value.toFixed(4)}`;
}
