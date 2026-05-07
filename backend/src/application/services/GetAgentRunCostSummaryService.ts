import {
  AgentRunCostSummary,
  AgentRunRepository
} from "../../domain/repositories/AgentRunRepository.js";

export class GetAgentRunCostSummaryService {
  constructor(private readonly agentRuns: AgentRunRepository) {}

  execute(): Promise<AgentRunCostSummary> {
    return this.agentRuns.costSummary();
  }
}
