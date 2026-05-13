module Agent
  class StructuredListingAnalyzer
    MINIMUM_DESCRIPTION_LENGTH = 240
    IDEAL_TAG_COUNT = 8

    def analyze(snapshot)
      issues = []
      opportunities = []

      if snapshot.description.length < MINIMUM_DESCRIPTION_LENGTH
        issues << "Description is short and may not communicate benefits, materials, or use cases."
        opportunities << "Expand the description with buyer outcomes, concrete product details, and care or fit notes."
      end

      if snapshot.tags.length < IDEAL_TAG_COUNT
        issues << "Listing has fewer tags than recommended for merchandising and search discovery."
        opportunities << "Add intent, occasion, audience, and product-type tags."
      end

      if snapshot.title.split.length < 4
        issues << "Title may be too generic for search and browsing contexts."
        opportunities << "Clarify the product category and a primary differentiator in the title."
      end

      {
        score: calculate_score(snapshot),
        issues: issues,
        opportunities: opportunities,
        attributes_detected: {
          has_vendor: snapshot.vendor.present?,
          has_product_type: snapshot.product_type.present?,
          has_inventory: !snapshot.inventory_quantity.nil?,
          tag_count: snapshot.tags.length,
          description_length: snapshot.description.length
        }
      }
    end

    private

    def calculate_score(snapshot)
      score = 100
      score -= 25 if snapshot.description.length < MINIMUM_DESCRIPTION_LENGTH
      score -= 15 if snapshot.tags.length < IDEAL_TAG_COUNT
      score -= 10 if snapshot.title.split.length < 4
      score -= 5  unless snapshot.product_type.present?
      [score, 0].max
    end
  end
end
