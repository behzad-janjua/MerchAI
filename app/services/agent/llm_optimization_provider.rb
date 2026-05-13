require "net/http"
require "json"

module Agent
  class LlmOptimizationProvider
    def initialize(config)
      @config = config
    end

    def generate(step_name:, prompt:, snapshot:, analysis:, prior_responses: {})
      api_url = @config.base_url.presence || ENV.fetch("LLM_API_URL", "")
      return nil if api_url.blank?

      body = build_body(step_name, prompt)
      response = post(api_url, body)
      return nil unless response

      text = extract_text(response)
      return nil if text.nil?

      usage = extract_usage(response, prompt, text)
      {
        response: text,
        draft: step_name == "final_synthesis" ? parse_draft(text) : nil,
        provider: @config.key,
        model: @config.model,
        input_tokens: usage[:input_tokens],
        output_tokens: usage[:output_tokens],
        estimated_cost: estimate_cost(usage[:input_tokens], usage[:output_tokens])
      }
    rescue => e
      Rails.logger.warn("[LlmOptimizationProvider] request failed: #{e.message}")
      nil
    end

    private

    def build_body(step_name, prompt)
      body = {
        model: @config.model,
        messages: [
          { role: "system", content: "You are a precise ecommerce merchandising assistant for Shopify product listings." },
          { role: "user", content: prompt }
        ]
      }
      body[:response_format] = { type: "json_object" } if step_name == "final_synthesis"
      body
    end

    def post(api_url, body)
      uri  = URI(api_url)
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = uri.scheme == "https"
      http.open_timeout = 10
      http.read_timeout = 60

      req = Net::HTTP::Post.new(uri)
      req["Content-Type"] = "application/json"
      api_key = resolved_api_key
      req["Authorization"] = "Bearer #{api_key}" if api_key.present?
      req.body = body.to_json

      res = http.request(req)
      res.is_a?(Net::HTTPSuccess) ? JSON.parse(res.body) : nil
    rescue Net::OpenTimeout, Net::ReadTimeout, Errno::ECONNREFUSED => e
      Rails.logger.warn("[LlmOptimizationProvider] connection error: #{e.message}")
      nil
    end

    def extract_text(body)
      choices = body["choices"]
      if choices.is_a?(Array)
        first = choices.first || {}
        content = first.dig("message", "content") || first["text"]
        return content if content.is_a?(String)
      end

      return body["output_text"] if body["output_text"].is_a?(String)
      return body["content"]     if body["content"].is_a?(String)
      nil
    end

    def extract_usage(body, prompt, response_text)
      usage = body["usage"] || {}
      {
        input_tokens:  (usage["prompt_tokens"] || usage["input_tokens"])&.to_i     || estimate_tokens(prompt),
        output_tokens: (usage["completion_tokens"] || usage["output_tokens"])&.to_i || estimate_tokens(response_text)
      }
    end

    def parse_draft(text)
      trimmed = text.strip
      json_str = if trimmed.start_with?("{")
        trimmed
      else
        start_i = trimmed.index("{")
        end_i   = trimmed.rindex("}")
        start_i && end_i ? trimmed[start_i..end_i] : nil
      end
      return nil unless json_str

      parsed = JSON.parse(json_str)
      return nil unless parsed.is_a?(Hash) && parsed["improvedDescription"].is_a?(String)

      {
        improved_title:                parsed["improvedTitle"]&.is_a?(String) ? parsed["improvedTitle"] : nil,
        improved_description:          parsed["improvedDescription"],
        tags:                          Array(parsed["tags"]).map(&:to_s),
        positioning_recommendations:   parsed["positioningRecommendations"]&.is_a?(String) ? parsed["positioningRecommendations"] : nil,
        seo_notes:                     parsed["seoNotes"]&.is_a?(String) ? parsed["seoNotes"] : nil,
        score:                         parsed["score"]&.is_a?(Numeric) ? parsed["score"] : nil,
        rationale:                     parsed["rationale"]&.is_a?(String) ? parsed["rationale"] : nil
      }
    rescue JSON::ParserError
      nil
    end

    def estimate_cost(input_tokens, output_tokens)
      input_cost  = (input_tokens  / 1000.0) * @config.input_cost_per1k.to_f
      output_cost = (output_tokens / 1000.0) * @config.output_cost_per1k.to_f
      (input_cost + output_cost).round(6)
    end

    def estimate_tokens(text)
      [(text.length / 4.0).ceil, 1].max
    end

    def resolved_api_key
      env_var = @config.api_key_env_var.presence
      (env_var ? ENV[env_var].presence : nil) || ENV.fetch("LLM_API_KEY", "")
    end
  end
end
