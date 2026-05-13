require "rails_helper"

RSpec.describe "Api::V1::AgentRuns", type: :request do
  let(:headers) { { "Accept" => "application/json" } }

  describe "GET /api/v1/agent_runs/cost_summary" do
    it "returns an empty cost summary" do
      get "/api/v1/agent_runs/cost_summary", headers: headers
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["totalEstimatedCost"]).to eq(0)
      expect(body["byProviderModel"]).to eq([])
    end
  end

  describe "GET /api/v1/agent_runs/:id" do
    let!(:agent_run) { create(:agent_run) }

    it "returns the agent run" do
      get "/api/v1/agent_runs/#{agent_run.id}", headers: headers
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["id"]).to eq(agent_run.id)
      expect(body["status"]).to eq("completed")
      expect(body["steps"]).to eq([])
    end

    it "returns 404 for a nonexistent run" do
      get "/api/v1/agent_runs/nonexistent", headers: headers
      expect(response).to have_http_status(:not_found)
    end
  end
end
