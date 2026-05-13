class ProductListing < ApplicationRecord
  has_many :agent_runs, dependent: :destroy
  has_many :optimization_suggestions, dependent: :destroy
  has_one  :latest_suggestion,
    -> { order(created_at: :desc) },
    class_name: "OptimizationSuggestion"

  validates :title, presence: true
  validates :currency, format: { with: /\A[A-Za-z]{3}\z/ }
  validates :price, numericality: { greater_than_or_equal_to: 0, allow_nil: true }

  before_validation :set_defaults

  def as_api_json
    suggestion = latest_suggestion
    {
      id: id,
      shopifyProductId: shopify_product_id,
      title: title,
      handle: handle,
      vendor: vendor,
      productType: product_type,
      description: description,
      tags: tags || [],
      price: price,
      currency: currency,
      inventoryQuantity: inventory_quantity,
      rawData: raw_data || {},
      latestSuggestion: suggestion ? suggestion.as_api_json : nil,
      createdAt: created_at,
      updatedAt: updated_at
    }
  end

  private

  def set_defaults
    self.currency ||= "USD"
    self.tags ||= []
    self.raw_data ||= {}
  end
end
