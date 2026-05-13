require "rails_helper"

RSpec.describe AgentRun, type: :model do
  subject(:run) { build(:agent_run) }

  describe "validations" do
    it { is_expected.to be_valid }

    it "rejects an unknown status" do
      run.status = "unknown_status"
      expect(run).not_to be_valid
    end

    AgentRun::STATUSES.each do |status|
      it "accepts status '#{status}'" do
        run.status = status
        expect(run).to be_valid
      end
    end
  end

  describe "associations" do
    it { is_expected.to belong_to(:product_listing) }
    it { is_expected.to have_many(:agent_step_runs).dependent(:destroy) }
    it { is_expected.to have_one(:optimization_suggestion).dependent(:destroy) }
  end

  describe "#as_api_json" do
    it "returns camelCase keys" do
      run.save!
      json = run.as_api_json
      expect(json).to include(:productListingId, :errorMessage, :startedAt, :completedAt)
    end

    it "includes steps as an empty array by default" do
      run.save!
      expect(run.as_api_json[:steps]).to eq([])
    end
  end
end
