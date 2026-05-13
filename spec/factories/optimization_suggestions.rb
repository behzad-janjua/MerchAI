FactoryBot.define do
  factory :optimization_suggestion do
    association :product_listing
    association :agent_run
    improved_title       { "Improved Product Title" }
    improved_description { "This is a well-crafted description with buyer outcomes, concrete details, and clear value." }
    tags                 { ["improved", "tag"] }
    score                { 82.0 }
    rationale            { "Generated from merchandising rules." }
    accepted             { false }
  end
end
