import { motion, AnimatePresence } from "framer-motion";
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

function stepLabel(name: string): string {
  return name.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

const sectionVariants = {
  hidden: { opacity: 0, y: 6 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.055, duration: 0.22, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] },
  }),
};

export function SuggestionPanel({ suggestion, agentRun }: Props) {
  const score = suggestion?.score ?? null;

  const sections = suggestion
    ? [
        suggestion.improvedTitle
          ? { key: "title", label: "Improved title", content: <p className="suggestion-text">{suggestion.improvedTitle}</p> }
          : null,
        { key: "desc", label: "Improved description", content: <p className="suggestion-text">{suggestion.improvedDescription}</p> },
        suggestion.tags.length > 0
          ? {
              key: "tags",
              label: "Suggested tags",
              content: (
                <div className="tag-wrap">
                  {suggestion.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
                </div>
              ),
            }
          : null,
        suggestion.positioningRecommendations
          ? { key: "pos", label: "Positioning", content: <p className="suggestion-text">{suggestion.positioningRecommendations}</p> }
          : null,
        suggestion.seoNotes
          ? { key: "seo", label: "SEO notes", content: <p className="suggestion-text">{suggestion.seoNotes}</p> }
          : null,
        agentRun && agentRun.steps.length > 0
          ? {
              key: "steps",
              label: "Agent steps",
              content: (
                <div className="step-list">
                  {agentRun.steps.map((step) => (
                    <details key={step.id} className="step-item" open={step.stepName === "final_synthesis"}>
                      <summary>
                        <span>{stepLabel(step.stepName)}</span>
                        <small>
                          {((step.inputTokens ?? 0) + (step.outputTokens ?? 0)) > 0
                            ? `${(step.inputTokens ?? 0) + (step.outputTokens ?? 0)} tok · `
                            : ""}
                          {money(step.estimatedCost)}
                        </small>
                      </summary>
                      <div className="step-body">
                        <p>{step.response ?? step.errorMessage ?? "No response recorded."}</p>
                        {(step.provider || step.model) && (
                          <p className="step-meta">{[step.provider, step.model].filter(Boolean).join(" / ")}</p>
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              ),
            }
          : null,
      ].filter(Boolean) as { key: string; label: string; content: React.ReactNode }[]
    : [];

  return (
    <div className="col-right">
      <div className="suggestion-header">
        <h2>AI Suggestion</h2>
        <AnimatePresence>
          {score != null && (
            <motion.span
              key={score}
              className={`suggestion-score ${scoreClass(score)}`}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] }}
            >
              {score}/100
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {!suggestion ? (
          <motion.div
            key="empty"
            className="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              </svg>
            </div>
            <strong>No suggestion yet</strong>
            <span>Select a listing and run the optimizer to get AI recommendations</span>
          </motion.div>
        ) : (
          <motion.div
            key={suggestion.id ?? "suggestion"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {sections.map((section, i) => (
              <motion.div
                key={section.key}
                className="suggestion-section"
                custom={i}
                variants={sectionVariants}
                initial="hidden"
                animate="show"
              >
                <p className="suggestion-label">{section.label}</p>
                {section.content}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
