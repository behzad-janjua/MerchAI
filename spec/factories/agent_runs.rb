FactoryBot.define do
  factory :agent_run do
    association :product_listing
    status      { "completed" }
    started_at  { 1.minute.ago }
    completed_at { Time.current }
    analysis    { { score: 75 } }
    metadata    { { pipeline: "product-listing-optimization" } }

    trait :running do
      status       { "running" }
      completed_at { nil }
    end

    trait :failed do
      status        { "failed" }
      error_message { "Something went wrong." }
      completed_at  { Time.current }
    end
  end
end
