module Api
  module V1
    class ProductListingsController < BaseController
      before_action :set_listing, only: %i[show update destroy optimize]

      def index
        listings = ProductListing
          .includes(:latest_suggestion)
          .order(updated_at: :desc)
        render json: listings.map(&:as_api_json)
      end

      def show
        @listing.association(:latest_suggestion).reset
        render json: @listing.as_api_json
      end

      def create
        listing = ProductListing.create!(listing_params)
        render json: listing.as_api_json, status: :created
      end

      def update
        @listing.update!(listing_update_params)
        render json: @listing.as_api_json
      end

      def destroy
        @listing.destroy!
        head :no_content
      end

      def optimize
        if AgentRun.where(product_listing: @listing, status: "running").exists?
          return render json: {
            error: "optimization_in_progress",
            message: "An optimization is already running for this listing."
          }, status: :conflict
        end

        run = Agent::ProductOptimizationPipeline.new.run(@listing)

        if run.status == "failed"
          return render json: {
            error: "optimization_failed",
            message: run.error_message || "Pipeline failed without a message."
          }, status: :unprocessable_entity
        end

        render json: run.as_api_json
      rescue => e
        render json: { error: "optimization_failed", message: e.message }, status: :unprocessable_entity
      end

      def import_csv
        csv_string = extract_csv
        return render json: { error: "bad_request", message: "No CSV body provided." }, status: :bad_request if csv_string.blank?

        result = ProductListingCsvParser.new.parse(csv_string)

        if result.rows.empty? && result.errors.any?
          return render json: {
            error: "csv_parse_failed",
            message: "CSV could not be parsed.",
            errors: result.errors.map { |e| { row: e.row, errors: e.errors } }
          }, status: :unprocessable_entity
        end

        created_count = 0
        updated_count = 0

        ActiveRecord::Base.transaction do
          result.rows.each do |row|
            shopify_id = row[:shopify_product_id]
            existing   = shopify_id.present? ? ProductListing.find_by(shopify_product_id: shopify_id) : nil

            if existing
              existing.update!(row.except(:shopify_product_id))
              updated_count += 1
            else
              ProductListing.create!(row)
              created_count += 1
            end
          end
        end

        render json: {
          createdCount: created_count,
          updatedCount: updated_count,
          errorCount:   result.errors.length,
          format:       result.format,
          errors:       result.errors.map { |e| { row: e.row, errors: e.errors } }
        }, status: :created
      end

      private

      def set_listing
        @listing = ProductListing.find(params[:id])
      end

      def listing_params
        params.require(:listing).permit(
          :shopify_product_id, :title, :handle, :vendor, :product_type,
          :description, :price, :currency, :inventory_quantity,
          tags: [], raw_data: {}
        ).tap do |p|
          p[:tags]     ||= []
          p[:raw_data] ||= {}
        end
      end

      def listing_update_params
        params.require(:listing).permit(
          :shopify_product_id, :title, :handle, :vendor, :product_type,
          :description, :price, :currency, :inventory_quantity,
          tags: [], raw_data: {}
        )
      end

      def extract_csv
        content_type = request.content_type.to_s

        if content_type.include?("multipart/form-data")
          params[:file]&.read || params[:csv]&.read
        else
          request.body.read
        end
      end
    end
  end
end
