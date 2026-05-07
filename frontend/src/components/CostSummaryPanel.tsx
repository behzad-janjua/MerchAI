import { BarChart3, Coins } from "lucide-react";
import { AgentRunCostSummary } from "../types";

type CostSummaryPanelProps = {
  summary: AgentRunCostSummary | null;
};

export function CostSummaryPanel({ summary }: CostSummaryPanelProps) {
  return (
    <aside className="panel costPane">
      <div className="panelHeader">
        <h2>Cost</h2>
        <span>{formatCurrency(summary?.totalEstimatedCost ?? 0)}</span>
      </div>

      {!summary && <p className="emptyState">Run the agent to populate cost data.</p>}

      {summary && (
        <div className="costStack">
          <div className="metricGrid">
            <div>
              <Coins size={17} />
              <strong>{formatCurrency(summary.totalEstimatedCost)}</strong>
              <small>estimated total</small>
            </div>
            <div>
              <BarChart3 size={17} />
              <strong>{summary.totalStepRuns}</strong>
              <small>agent steps</small>
            </div>
          </div>

          <section>
            <h3>Provider Mix</h3>
            <div className="providerList">
              {summary.byProviderModel.map((group) => (
                <div key={`${group.provider}-${group.model}`}>
                  <strong>{group.provider}</strong>
                  <small>{group.model}</small>
                  <span>{formatCurrency(group.estimatedCost)}</span>
                </div>
              ))}
              {summary.byProviderModel.length === 0 && <p className="emptyState compact">No step costs yet.</p>}
            </div>
          </section>
        </div>
      )}
    </aside>
  );
}

function formatCurrency(value: number): string {
  return `$${value.toFixed(4)}`;
}
