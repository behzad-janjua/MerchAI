module Agent
  ProductSnapshot = Struct.new(
    :id, :shopify_product_id, :title, :handle, :vendor, :product_type,
    :description, :tags, :price, :currency, :inventory_quantity, :raw_data,
    keyword_init: true
  )

  class ProductSnapshotTool
    def execute(listing)
      ProductSnapshot.new(
        id: listing.id,
        shopify_product_id: listing.shopify_product_id,
        title: listing.title.to_s.strip,
        handle: listing.handle,
        vendor: listing.vendor,
        product_type: listing.product_type,
        description: listing.description.to_s.strip,
        tags: Array(listing.tags).map(&:strip).reject(&:blank?),
        price: listing.price,
        currency: listing.currency,
        inventory_quantity: listing.inventory_quantity,
        raw_data: listing.raw_data || {}
      )
    end
  end
end
