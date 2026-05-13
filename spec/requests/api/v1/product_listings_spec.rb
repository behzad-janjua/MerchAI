require "rails_helper"

RSpec.describe "Api::V1::ProductListings", type: :request do
  let(:headers) { { "Content-Type" => "application/json", "Accept" => "application/json" } }

  describe "GET /api/v1/product_listings" do
    it "returns an empty array when no listings exist" do
      get "/api/v1/product_listings", headers: headers
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq([])
    end

    it "returns existing listings" do
      create(:product_listing, title: "Tote Bag")
      get "/api/v1/product_listings", headers: headers
      body = JSON.parse(response.body)
      expect(body.length).to eq(1)
      expect(body.first["title"]).to eq("Tote Bag")
    end
  end

  describe "POST /api/v1/product_listings" do
    let(:params) do
      { listing: { title: "New Product", currency: "USD", tags: ["gift"] } }
    end

    it "creates a listing and returns 201" do
      post "/api/v1/product_listings", params: params.to_json, headers: headers
      expect(response).to have_http_status(:created)
      body = JSON.parse(response.body)
      expect(body["title"]).to eq("New Product")
      expect(body["tags"]).to eq(["gift"])
    end

    it "returns 422 when title is missing" do
      post "/api/v1/product_listings",
        params: { listing: { currency: "USD" } }.to_json,
        headers: headers
      expect(response).to have_http_status(:unprocessable_entity)
      body = JSON.parse(response.body)
      expect(body["error"]).to eq("validation_failed")
    end
  end

  describe "GET /api/v1/product_listings/:id" do
    let!(:listing) { create(:product_listing) }

    it "returns the listing" do
      get "/api/v1/product_listings/#{listing.id}", headers: headers
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["id"]).to eq(listing.id)
    end

    it "returns 404 for an unknown id" do
      get "/api/v1/product_listings/nonexistent", headers: headers
      expect(response).to have_http_status(:not_found)
      expect(JSON.parse(response.body)["error"]).to eq("not_found")
    end
  end

  describe "PATCH /api/v1/product_listings/:id" do
    let!(:listing) { create(:product_listing, title: "Old Title") }

    it "updates the listing" do
      patch "/api/v1/product_listings/#{listing.id}",
        params: { listing: { title: "New Title" } }.to_json,
        headers: headers
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["title"]).to eq("New Title")
    end
  end

  describe "DELETE /api/v1/product_listings/:id" do
    let!(:listing) { create(:product_listing) }

    it "deletes the listing and returns 204" do
      delete "/api/v1/product_listings/#{listing.id}", headers: headers
      expect(response).to have_http_status(:no_content)
      expect(ProductListing.find_by(id: listing.id)).to be_nil
    end
  end

  describe "POST /api/v1/product_listings/import_csv" do
    let(:shopify_csv) do
      [
        "Handle,Title,Body (HTML),Vendor,Type,Tags,Variant Price,Variant Inventory Qty",
        'camp-mug,Camp Mug,"Great for camping.",Merch Co,Drinkware,"mug,camp",12.00,5'
      ].join("\n")
    end

    it "imports listings from CSV" do
      post "/api/v1/product_listings/import_csv",
        params: shopify_csv,
        headers: { "Content-Type" => "text/csv", "Accept" => "application/json" }
      expect(response).to have_http_status(:created)
      body = JSON.parse(response.body)
      expect(body["createdCount"]).to eq(1)
      expect(body["errorCount"]).to eq(0)
    end

    it "returns 422 when CSV has only errors" do
      post "/api/v1/product_listings/import_csv",
        params: "",
        headers: { "Content-Type" => "text/csv", "Accept" => "application/json" }
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end
