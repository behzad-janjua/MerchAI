FactoryBot.define do
  factory :llm_provider_config do
    sequence(:key)  { |n| "provider-#{n}" }
    provider        { "openai-compatible" }
    display_name    { "Test Provider" }
    model           { "gpt-4o-mini" }
    base_url        { "https://api.openai.com/v1/chat/completions" }
    api_key_env_var { "LLM_API_KEY" }
    input_cost_per1k  { 0.001 }
    output_cost_per1k { 0.002 }
    enabled         { true }
    is_default      { false }

    trait :default do
      is_default { true }
    end
  end
end
