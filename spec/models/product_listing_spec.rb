require "rails_helper"

RSpec.describe ProductListing, type: :model do
  subject(:listing) { build(:product_listing) }

  describe "validations" do
    it { is_expected.to be_valid }

    it "requires a title" do
      listing.title = ""
      expect(listing).not_to be_valid
      expect(listing.errors[:title]).to be_present
    end

    it "requires a valid currency code" do
      listing.currency = "INVALID"
      expect(listing).not_to be_valid
    end

    it "accepts a 3-letter currency" do
      listing.currency = "GBP"
      expect(listing).to be_valid
    end

    it "rejects a negative price" do
      listing.price = -1
      expect(listing).not_to be_valid
    end

    it "allows a nil price" do
      listing.price = nil
      expect(listing).to be_valid
    end
  end

  describe "defaults" do
    it "defaults currency to USD" do
      listing.currency = nil
      listing.valid?
      expect(listing.currency).to eq("USD")
    end

    it "defaults tags to an empty array" do
      listing.tags = nil
      listing.valid?
      expect(listing.tags).to eq([])
    end
  end

  describe "associations" do
    it { is_expected.to have_many(:agent_runs).dependent(:destroy) }
    it { is_expected.to have_many(:optimization_suggestions).dependent(:destroy) }
  end

  describe "#latest_suggestion" do
    it "returns nil when there are no suggestions" do
      listing.save!
      expect(listing.latest_suggestion).to be_nil
    end

    it "returns the most recent suggestion" do
      listing.save!
      run1 = create(:agent_run, product_listing: listing)
      run2 = create(:agent_run, product_listing: listing)
      older = create(:optimization_suggestion, product_listing: listing, agent_run: run1, created_at: 2.hours.ago)
      newer = create(:optimization_suggestion, product_listing: listing, agent_run: run2, created_at: 1.hour.ago)
      expect(listing.latest_suggestion.id).to eq(newer.id)
    end
  end

  describe "#as_api_json" do
    it "returns camelCase keys" do
      listing.save!
      json = listing.as_api_json
      expect(json).to include(:shopifyProductId, :productType, :inventoryQuantity, :rawData)
    end

    it "includes latestSuggestion as nil when none exists" do
      listing.save!
      expect(listing.as_api_json[:latestSuggestion]).to be_nil
    end
  end
end
