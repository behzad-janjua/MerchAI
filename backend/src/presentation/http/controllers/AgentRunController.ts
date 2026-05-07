import { Request, Response } from "express";
import { GetAgentRunCostSummaryService } from "../../../application/services/GetAgentRunCostSummaryService.js";
import { GetAgentRunService } from "../../../application/services/GetAgentRunService.js";
import { AgentRunSerializer } from "../serializers/AgentRunSerializer.js";

export class AgentRunController {
  constructor(
    private readonly getAgentRun: GetAgentRunService,
    private readonly getCostSummary: GetAgentRunCostSummaryService,
    private readonly serializer: AgentRunSerializer
  ) {}

  show = async (request: Request, response: Response): Promise<void> => {
    const run = await this.getAgentRun.execute(this.paramId(request));
    response.json(this.serializer.serialize(run));
  };

  costSummary = async (_request: Request, response: Response): Promise<void> => {
    response.json(await this.getCostSummary.execute());
  };

  private paramId(request: Request): string {
    const value = request.params.id;
    return Array.isArray(value) ? value[0] : value;
  }
}
