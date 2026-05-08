require "json"
require "net/http"
require "uri"

class MerchaiApiClient
  ApiError = Class.new(StandardError)

  def initialize(base_url: ENV.fetch("MERCHAI_API_BASE_URL", "http://localhost:4000/api"))
    @base_uri = URI(base_url)
  end

  def product_listings
    request(:get, "/product-listings")
  end

  def create_product_listing(input)
    request(:post, "/product-listings", json: input)
  end

  def update_product_listing(id, input)
    request(:patch, "/product-listings/#{id}", json: input)
  end

  def optimize_product_listing(id)
    request(:post, "/product-listings/#{id}/optimize")
  end

  def import_csv(csv)
    request(:post, "/product-listings/import-csv", body: csv, content_type: "text/csv")
  end

  def agent_run(id)
    request(:get, "/agent-runs/#{id}")
  end

  def cost_summary
    request(:get, "/agent-runs/cost-summary")
  end

  private

  attr_reader :base_uri

  def request(method, path, json: nil, body: nil, content_type: "application/json")
    uri = base_uri + path
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = uri.scheme == "https"
    request = request_class(method).new(uri)
    request["Content-Type"] = content_type
    request.body = json ? JSON.generate(json) : body
    response = http.request(request)
    parsed = parse(response.body)

    unless response.is_a?(Net::HTTPSuccess)
      message = parsed.is_a?(Hash) ? parsed["message"] : nil
      raise ApiError, message || "API request failed with #{response.code}"
    end

    parsed
  end

  def request_class(method)
    {
      get: Net::HTTP::Get,
      post: Net::HTTP::Post,
      patch: Net::HTTP::Patch
    }.fetch(method)
  end

  def parse(body)
    return nil if body.nil? || body.empty?

    JSON.parse(body)
  end
end
