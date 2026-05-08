class DashboardController < ApplicationController
  rescue_from MerchaiApiClient::ApiError, with: :api_error

  def index
    load_dashboard
  end

  def save
    listing = if params[:id].present?
      api.update_product_listing(params[:id], listing_input)
    else
      api.create_product_listing(listing_input)
    end

    redirect_to listing_path(listing.fetch("id")), notice: "Listing saved."
  end

  def optimize
    api.optimize_product_listing(params[:id])
    redirect_to listing_path(params[:id]), notice: "Optimization run completed."
  end

  def import_csv
    uploaded = params[:csv]

    unless uploaded.respond_to?(:read)
      redirect_to root_path, alert: "Choose a CSV file to import."
      return
    end

    result = api.import_csv(uploaded.read)
    message = "Imported #{result.fetch("createdCount")} new and #{result.fetch("updatedCount")} updated #{result.fetch("format")} listings."
    message += " #{result.fetch("errorCount")} row errors." if result.fetch("errorCount").positive?
    redirect_to root_path, notice: message
  end

  private

  def load_dashboard
    @listings = api.product_listings || []
    @selected_listing = selected_listing
    @form = form_for_listing(@selected_listing)
    @agent_run = latest_agent_run(@selected_listing)
    @cost_summary = api.cost_summary
  end

  def selected_listing
    return nil if params[:new_listing]

    selected_id = params[:id].presence || @listings.first&.fetch("id", nil)
    @listings.find { |listing| listing["id"] == selected_id }
  end

  def latest_agent_run(listing)
    run_id = listing&.dig("latestSuggestion", "agentRunId")
    run_id.present? ? api.agent_run(run_id) : nil
  rescue MerchaiApiClient::ApiError
    nil
  end

  def form_for_listing(listing)
    {
      "id" => listing&.fetch("id", nil),
      "title" => listing&.fetch("title", "") || "",
      "shopifyProductId" => listing&.fetch("shopifyProductId", "") || "",
      "handle" => listing&.fetch("handle", "") || "",
      "vendor" => listing&.fetch("vendor", "") || "",
      "productType" => listing&.fetch("productType", "") || "",
      "currency" => listing&.fetch("currency", "USD") || "USD",
      "price" => listing&.fetch("price", nil),
      "inventoryQuantity" => listing&.fetch("inventoryQuantity", nil),
      "tags" => Array(listing&.fetch("tags", [])).join(", "),
      "audience" => listing&.dig("rawData", "audience") || "",
      "description" => listing&.fetch("description", "") || ""
    }
  end

  def listing_input
    input = params.require(:listing).permit(
      :title,
      :shopifyProductId,
      :handle,
      :vendor,
      :productType,
      :description,
      :tags,
      :price,
      :currency,
      :inventoryQuantity,
      :audience
    )

    {
      title: input[:title].to_s.strip,
      shopifyProductId: optional(input[:shopifyProductId]),
      handle: optional(input[:handle]),
      vendor: optional(input[:vendor]),
      productType: optional(input[:productType]),
      description: optional(input[:description]),
      tags: input[:tags].to_s.split(",").map(&:strip).reject(&:blank?),
      price: decimal_or_nil(input[:price]),
      currency: input[:currency].to_s.strip.upcase.presence || "USD",
      inventoryQuantity: integer_or_nil(input[:inventoryQuantity]),
      rawData: {
        audience: input[:audience].to_s.strip
      }
    }
  end

  def optional(value)
    value.to_s.strip.presence
  end

  def decimal_or_nil(value)
    value.present? ? value.to_f : nil
  end

  def integer_or_nil(value)
    value.present? ? value.to_i : nil
  end

  def api
    @api ||= MerchaiApiClient.new
  end

  def api_error(error)
    @listings = []
    @selected_listing = nil
    @form = form_for_listing(nil)
    @agent_run = nil
    @cost_summary = nil
    flash.now[:alert] = error.message
    render :index, status: :bad_gateway
  end
end
