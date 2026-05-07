import { AgentRun } from "../../domain/entities/AgentRun.js";
import { NotFoundError } from "../../domain/errors/NotFoundError.js";
import { AgentRunRepository } from "../../domain/repositories/AgentRunRepository.js";

export class GetAgentRunService {
  constructor(private readonly agentRuns: AgentRunRepository) {}

  async execute(id: string): Promise<AgentRun> {
    const run = await this.agentRuns.findById(id);

    if (!run) {
      throw new NotFoundError("AgentRun", id);
    }

    return run;
  }
}
