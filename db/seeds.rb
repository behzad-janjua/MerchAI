LlmProviderConfig.find_or_create_by!(key: "gemini-free-demo") do |config|
  config.provider      = "openai-compatible"
  config.display_name  = "Gemini Free Demo"
  config.base_url      = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
  config.api_key_env_var = "GEMINI_API_KEY"
  config.model         = "gemini-2.0-flash"
  config.input_cost_per1k  = 0
  config.output_cost_per1k = 0
  config.enabled       = true
  config.is_default    = true
  config.notes         = "Google Gemini via OpenAI-compatible API. Free tier available."
end

puts "Seeded LLM provider configs."
