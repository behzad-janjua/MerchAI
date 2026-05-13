import type { AgentRun, OptimizationSuggestion } from "../types";

type Props = {
  suggestion: OptimizationSuggestion | null;
  agentRun: AgentRun | null;
};

function scoreClass(score: number | null | undefined): string {
  if (score == null) return "";
  if (score >= 80) return "score--high";
  if (score >= 60) return "score--mid";
  return "score--low";
}

function money(value: number | null | undefined): string {
  if (value == null || value === 0) return "$0.00";
  return `$${value.toFixed(4)}`;
}

function stepLabel(stepName: string): string {
  return stepName.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

export function SuggestionPanel({ suggestion, agentRun }: Props) {
  const score = suggestion?.score ?? null;

  return (
    <div className="col-right">
      <div className="suggestion-header">
        <h2>AI Suggestion</h2>
        <span className={`suggestion-score ${scoreClass(score)}`}>
          {score != null ? `${score}/100` : "–"}
        </span>
      </div>

      {!suggestion ? (
        <div className="empty" style={{ flex: 1 }}>
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            </svg>
          </div>
          <strong>No suggestion yet</strong>
          <span>Select a listing and run the optimizer to see AI recommendations</span>
        </div>
      ) : (
        <>
          {agentRun && agentRun.steps.length > 0 && (
            <div className="suggestion-section">
              <p className="suggestion-label">Agent steps</p>
              <div className="step-list">
                {agentRun.steps.map((step) => {
                  const totalTokens = (step.inputTokens ?? 0) + (step.outputTokens ?? 0);
                  return (
                    <details
                      key={step.id}
                      className="step-item"
                      open={step.stepName === "final_synthesis"}
                    >
                      <summary>
                        <span>{stepLabel(step.stepName)}</span>
                        <small>{money(step.estimatedCost)}</small>
                      </summary>
                      <div className="step-body">
                        <p>{step.response ?? step.errorMessage ?? "No response recorded."}</p>
                        <p className="step-meta">
                          {step.provider ?? "unknown"} / {step.model ?? "unknown"}
                          {" · "}{totalTokens} tokens
                        </p>
                      </div>
                    </details>
                  );
                })}
              </div>
            </div>
          )}

          {suggestion.improvedTitle && (
            <div className="suggestion-section">
              <p className="suggestion-label">Improved title</p>
              <p className="suggestion-text">{suggestion.improvedTitle}</p>
            </div>
          )}

          <div className="suggestion-section">
            <p className="suggestion-label">Improved description</p>
            <p className="suggestion-text">{suggestion.improvedDescription}</p>
          </div>

          {suggestion.tags.length > 0 && (
            <div className="suggestion-section">
              <p className="suggestion-label">Tags</p>
              <div className="tag-wrap">
                {suggestion.tags.map((tag) => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {suggestion.positioningRecommendations && (
            <div className="suggestion-section">
              <p className="suggestion-label">Positioning</p>
              <p className="suggestion-text">{suggestion.positioningRecommendations}</p>
            </div>
          )}

          {suggestion.seoNotes && (
            <div className="suggestion-section">
              <p className="suggestion-label">SEO notes</p>
              <p className="suggestion-text">{suggestion.seoNotes}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
