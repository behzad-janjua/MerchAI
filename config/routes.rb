Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :product_listings do
        post :optimize,    on: :member
        post :import_csv,  on: :collection
      end
      resources :agent_runs, only: [:show] do
        get :cost_summary, on: :collection
      end
    end
  end

  get "/health", to: proc { [200, { "Content-Type" => "application/json" }, ['{"ok":true}']] }

  root "dashboard#index"

  get "/listings/new", to: "dashboard#index", defaults: { new_listing: true }, as: :new_listing
  get "/listings/:id", to: "dashboard#index", as: :listing
  post "/listings", to: "dashboard#save", as: :save_listing
  post "/listings/import", to: "dashboard#import_csv", as: :import_listings
  post "/listings/:id/optimize", to: "dashboard#optimize", as: :optimize_listing
end
