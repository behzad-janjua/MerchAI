module Api
  module V1
    class BaseController < ActionController::API
      rescue_from ActiveRecord::RecordNotFound,    with: :not_found
      rescue_from ActiveRecord::RecordInvalid,     with: :unprocessable
      rescue_from ActionController::ParameterMissing, with: :bad_request

      private

      def not_found(error)
        render json: { error: "not_found", message: error.message }, status: :not_found
      end

      def unprocessable(error)
        render json: { error: "validation_failed", message: error.message,
                       details: error.record.errors.as_json }, status: :unprocessable_entity
      end

      def bad_request(error)
        render json: { error: "bad_request", message: error.message }, status: :bad_request
      end
    end
  end
end
