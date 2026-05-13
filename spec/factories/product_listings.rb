FactoryBot.define do
  factory :product_listing do
    sequence(:title) { |n| "Product #{n}" }
    vendor       { "Test Vendor" }
    product_type { "Apparel" }
    description  { "A short description." }
    tags         { ["tag1", "tag2"] }
    price        { 29.99 }
    currency     { "USD" }
    raw_data     { {} }

    trait :rich do
      title       { "Organic Cotton Tote Bag" }
      description { "A beautifully crafted tote bag made from 100% organic cotton. Perfect for everyday use, shopping, or as a thoughtful eco-friendly gift. Features a durable handle and spacious interior for all your essentials." }
      tags        { ["tote", "organic", "cotton", "gift", "eco", "everyday", "bag", "sustainable"] }
    end

    trait :minimal do
      description { nil }
      tags        { [] }
      price       { nil }
    end
  end
end
