require "rails_helper"

RSpec.describe ProductListingCsvParser do
  subject(:parser) { described_class.new }

  describe "#parse" do
    context "with Shopify export columns" do
      let(:csv) do
        [
          "Handle,Title,Body (HTML),Vendor,Type,Tags,Variant Price,Variant Inventory Qty",
          'linen-tote,Linen Tote,"<p>Durable everyday tote</p>",Merch Co,Bags,"tote, linen, gift",24.50,8'
        ].join("\n")
      end

      it "detects shopify format" do
        result = parser.parse(csv)
        expect(result.format).to eq("shopify")
      end

      it "parses the row with no errors" do
        result = parser.parse(csv)
        expect(result.errors).to be_empty
        expect(result.rows.length).to eq(1)
      end

      it "maps columns correctly" do
        row = parser.parse(csv).rows.first
        expect(row[:title]).to eq("Linen Tote")
        expect(row[:handle]).to eq("linen-tote")
        expect(row[:product_type]).to eq("Bags")
        expect(row[:tags]).to contain_exactly("tote", "linen", "gift")
        expect(row[:price]).to eq(24.5)
        expect(row[:inventory_quantity]).to eq(8)
      end
    end

    context "with simple template columns" do
      let(:csv) do
        [
          "title,description,tags,price,vendor,productType,handle",
          'Camp Mug,Enamel mug for weekend coffee,"mug|camp|gift",18,Merch Co,Drinkware,camp-mug'
        ].join("\n")
      end

      it "detects simple format" do
        expect(parser.parse(csv).format).to eq("simple")
      end

      it "maps all fields" do
        row = parser.parse(csv).rows.first
        expect(row[:title]).to eq("Camp Mug")
        expect(row[:vendor]).to eq("Merch Co")
        expect(row[:tags]).to contain_exactly("mug", "camp", "gift")
      end
    end

    context "with validation errors" do
      let(:csv) do
        [
          "title,description,tags,price",
          ",Missing title,gift,not-a-price"
        ].join("\n")
      end

      it "returns row-level errors without raising" do
        result = parser.parse(csv)
        expect(result.rows).to be_empty
        expect(result.errors.length).to eq(1)
        expect(result.errors[0].row).to eq(2)
        expect(result.errors[0].errors.join(" ")).to match(/title is required/)
        expect(result.errors[0].errors.join(" ")).to match(/price must be a valid number/)
      end
    end

    context "with an empty CSV" do
      it "returns an error instead of raising" do
        result = parser.parse("")
        expect(result.rows).to be_empty
        expect(result.errors.first.errors).to include("CSV is empty.")
      end
    end

    context "with pipe-delimited tags" do
      let(:csv) { "title,tags\nMug,coffee|gift|camping" }

      it "splits tags on pipes" do
        row = parser.parse(csv).rows.first
        expect(row[:tags]).to contain_exactly("coffee", "gift", "camping")
      end
    end

    context "with duplicate tags" do
      let(:csv) { "title,tags\nMug,\"coffee, coffee, gift\"" }

      it "deduplicates tags" do
        row = parser.parse(csv).rows.first
        expect(row[:tags]).to contain_exactly("coffee", "gift")
      end
    end
  end
end
